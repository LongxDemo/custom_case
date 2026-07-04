import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { phoneModels } from '../data/catalog';
import { CaseBackground, Layer } from '../data/types';
import { colors } from '../theme';

/** Base coordinate system all layer positions are authored in. */
export const CANVAS_BASE = 320;

export function layerBaseSize(l: Layer): { w: number; h: number } {
  if (l.kind === 'sticker') return { w: l.size, h: l.size };
  if (l.kind === 'image') return { w: l.width, h: l.height };
  // text is auto-sized; approximate for hit area
  return { w: 220, h: l.fontSize * 1.4 };
}

export function LayerView({ layer, scale = 1 }: { layer: Layer; scale?: number }) {
  const common = {
    position: 'absolute' as const,
    left: '50%' as const,
    top: '50%' as const,
    transform: [
      { translateX: layer.tx * scale },
      { translateY: layer.ty * scale },
      { scale: layer.scale },
      { rotate: `${layer.rotation}rad` },
    ],
  };

  if (layer.kind === 'sticker') {
    const s = layer.size * scale;
    return (
      <View style={[common, { marginLeft: -s / 2, marginTop: -s / 2 }]}>
        {layer.uri ? (
          <Image source={{ uri: layer.uri }} style={{ width: s, height: s }} contentFit="contain" />
        ) : (
          <Text style={{ fontSize: s * 0.9, lineHeight: s * 1.05 }}>{layer.emoji}</Text>
        )}
      </View>
    );
  }

  if (layer.kind === 'image') {
    const w = layer.width * scale;
    const h = layer.height * scale;
    return (
      <View style={[common, { marginLeft: -w / 2, marginTop: -h / 2 }]}>
        <Image
          source={{ uri: layer.uri }}
          style={{ width: w, height: h, borderRadius: (layer.radius ?? 0) * scale }}
          contentFit="cover"
        />
      </View>
    );
  }

  // text
  const w = 240 * scale;
  return (
    <View style={[common, { width: w, marginLeft: -w / 2, marginTop: -(layer.fontSize * scale) }]}>
      <Text
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
    </View>
  );
}

export function CasePreview({
  background,
  layers,
  modelId,
  width,
  showCamera = true,
  rounded,
}: {
  background: CaseBackground;
  layers: Layer[];
  modelId: string;
  width: number;
  showCamera?: boolean;
  rounded?: number;
}) {
  const model = phoneModels.find((m) => m.id === modelId) ?? phoneModels[0];
  const height = width / model.aspect;
  const scale = width / CANVAS_BASE;
  const radius = rounded ?? width * 0.14;
  const cam = model.camera;

  const ordered = [...layers].sort((a, b) => a.z - b.z);

  return (
    <View style={[styles.shell, { width, height, borderRadius: radius }]}>
      <LinearGradient
        colors={background.colors.length > 1 ? (background.colors as [string, string]) : [background.colors[0], background.colors[0]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {ordered.map((l) => (
        <LayerView key={l.id} layer={l} scale={scale} />
      ))}
      {showCamera && cam ? (
        <View
          style={{
            position: 'absolute',
            left: cam.x * width,
            top: cam.y * height,
            width: cam.w * width,
            height: cam.h * height,
            borderRadius: Math.min(cam.w * width, cam.h * height) * 0.4,
            backgroundColor: 'rgba(20,16,24,0.28)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.35)',
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    backgroundColor: colors.blush,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});
