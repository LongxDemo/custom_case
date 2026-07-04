import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Layer } from '../data/types';
import { colors } from '../theme';
import { layerBaseSize } from './CasePreview';

type Props = {
  layer: Layer;
  selected: boolean;
  /** display scale = canvas width / CANVAS_BASE */
  scale: number;
  /** canvas top-left in window coords + size, for the resize/rotate handle math */
  canvasOrigin: { x: number; y: number };
  canvasW: number;
  canvasH: number;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<Layer>) => void;
};

export function EditableLayer({ layer, selected, scale, canvasOrigin, canvasW, canvasH, onSelect, onChange }: Props) {
  const tx = useSharedValue(layer.tx);
  const ty = useSharedValue(layer.ty);
  const sc = useSharedValue(layer.scale);
  const rot = useSharedValue(layer.rotation);

  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startSc = useSharedValue(1);
  const startRot = useSharedValue(0);

  // canvas origin must live in shared values to be readable inside gesture worklets
  const originX = useSharedValue(canvasOrigin.x);
  const originY = useSharedValue(canvasOrigin.y);

  React.useEffect(() => {
    tx.value = layer.tx;
    ty.value = layer.ty;
    sc.value = layer.scale;
    rot.value = layer.rotation;
  }, [layer.tx, layer.ty, layer.scale, layer.rotation]);

  React.useEffect(() => {
    originX.value = canvasOrigin.x;
    originY.value = canvasOrigin.y;
  }, [canvasOrigin.x, canvasOrigin.y]);

  // Text is measured from its real rendered glyphs so its touch area hugs the
  // text (a fixed box would cover — and steal taps from — layers beneath it).
  const [textSize, setTextSize] = React.useState<{ w: number; h: number } | null>(null);

  const base = layerBaseSize(layer);
  const dw = layer.kind === 'text' ? textSize?.w ?? base.w * scale : base.w * scale;
  const dh = layer.kind === 'text' ? textSize?.h ?? base.h * scale : base.h * scale;
  const halfDiag = Math.sqrt((dw / 2) ** 2 + (dh / 2) ** 2); // corner distance at layer-scale 1 (screen px)
  const cornerAngle = Math.atan2(dh, dw);

  // Gestures MUST be memoized: rebuilding them every render (which happens when
  // a drag selects the layer) replaces the active gesture mid-drag and makes web
  // cancel/hitch it. Deps exclude `selected` so selecting never rebuilds them.
  const { body, handle } = React.useMemo(() => {
    // Move
    const pan = Gesture.Pan()
      .minDistance(0)
      .onStart(() => {
        startTx.value = tx.value;
        startTy.value = ty.value;
        runOnJS(onSelect)(layer.id); // idempotent in the store — no re-render if already selected
      })
      .onUpdate((e) => {
        tx.value = startTx.value + e.translationX / scale;
        ty.value = startTy.value + e.translationY / scale;
      })
      .onEnd(() => runOnJS(onChange)(layer.id, { tx: tx.value, ty: ty.value }));

    // Pinch + rotate (native / touch)
    const pinch = Gesture.Pinch()
      .onStart(() => { startSc.value = sc.value; })
      .onUpdate((e) => { sc.value = Math.max(0.3, Math.min(6, startSc.value * e.scale)); })
      .onEnd(() => runOnJS(onChange)(layer.id, { scale: sc.value }));

    const rotation = Gesture.Rotation()
      .onStart(() => { startRot.value = rot.value; })
      .onUpdate((e) => { rot.value = startRot.value + e.rotation; })
      .onEnd(() => runOnJS(onChange)(layer.id, { rotation: rot.value }));

    // Corner handle: single-pointer resize + rotate (works with a mouse)
    const handleG = Gesture.Pan()
      .onUpdate((e) => {
        const cx = originX.value + canvasW / 2 + tx.value * scale;
        const cy = originY.value + canvasH / 2 + ty.value * scale;
        const dx = e.absoluteX - cx;
        const dy = e.absoluteY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        sc.value = Math.max(0.3, Math.min(6, dist / halfDiag));
        rot.value = Math.atan2(dy, dx) - cornerAngle;
      })
      .onEnd(() => runOnJS(onChange)(layer.id, { scale: sc.value, rotation: rot.value }));

    return { body: Gesture.Simultaneous(pan, pinch, rotation), handle: handleG };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.id, scale, halfDiag, cornerAngle, canvasW, canvasH, onSelect, onChange]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value * scale },
      { translateY: ty.value * scale },
      { scale: sc.value },
      { rotate: `${rot.value}rad` },
    ],
  }));

  // keep the handle a constant screen size regardless of layer scale
  const handleStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 / sc.value }] }));

  return (
    <GestureDetector gesture={body}>
      <Animated.View
        style={[
          styles.wrap,
          webDrag,
          { width: dw, height: dh, marginLeft: -dw / 2, marginTop: -dh / 2 },
          aStyle,
          selected && styles.selected,
        ]}
      >
        {/* content ignores pointers so drags always reach the wrapper (fixes web image drag) */}
        <View pointerEvents="none" style={[styles.content, webDrag]}>
          {layer.kind === 'sticker' &&
            (layer.uri ? (
              <Image source={{ uri: layer.uri }} style={{ width: dw, height: dh }} contentFit="contain" />
            ) : (
              <Text style={{ fontSize: dw * 0.9, lineHeight: dh * 1.05, textAlign: 'center' }}>{layer.emoji}</Text>
            ))}

          {layer.kind === 'image' && (
            <Image
              source={{ uri: layer.uri }}
              style={{ width: dw, height: dh, borderRadius: (layer.radius ?? 0) * scale }}
              contentFit="cover"
            />
          )}

          {layer.kind === 'text' && (
            <Text
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width && (Math.abs(width - (textSize?.w ?? 0)) > 0.5 || Math.abs(height - (textSize?.h ?? 0)) > 0.5)) {
                  setTextSize({ w: width, h: height });
                }
              }}
              style={{
                fontSize: layer.fontSize * scale,
                fontWeight: layer.fontWeight,
                color: layer.color,
                textAlign: layer.align,
                lineHeight: layer.fontSize * scale * 1.1,
              }}
            >
              {layer.text}
            </Text>
          )}
        </View>

        {selected && (
          <GestureDetector gesture={handle}>
            <Animated.View style={[styles.handle, { left: dw - 13, top: dh - 13 }, handleStyle]}>
              <Ionicons name="resize" size={15} color={colors.white} />
            </Animated.View>
          </GestureDetector>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

// web-only: stop the browser hijacking drags with text-selection / scroll / image-ghost
const webDrag: any = Platform.OS === 'web' ? { userSelect: 'none', cursor: 'grab', touchAction: 'none' } : null;

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: '50%', top: '50%', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', justifyContent: 'center' },
  selected: { borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 6 },
  handle: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});
