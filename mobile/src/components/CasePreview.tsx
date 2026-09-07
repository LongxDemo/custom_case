import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { phoneModels } from '../data/catalog';
import { CaseBackground, Layer, PhoneModel } from '../data/types';
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
      {showCamera ? <CameraModule style={camStyleFor(model)} width={width} height={height} /> : null}
      {/* glossy printed-case sheen — a soft diagonal highlight band over everything */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        locations={[0.32, 0.5, 0.68]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/* ─────────────────────────── Camera modules ───────────────────────────
   Realistic per-phone camera layouts. These are a visual keep-clear guide,
   not manufacturing die-lines — see camStyleFor for the family mapping. */

export type CamStyle = 'ip17-air' | 'ip-square' | 'ip-vert' | 'ip-dual' | 'ip-single' | 'samsung' | 'pixel' | 'generic';

export function camStyleFor(model: PhoneModel): CamStyle {
  if (model.brand === 'Google') return 'pixel';
  if (model.brand === 'Samsung') return 'samsung';
  if (model.brand === 'iPhone') {
    const n = model.name;
    if (n.startsWith('17 Pro')) return 'ip-square'; // compact top-left triangle cluster, matches brand art
    if (n === 'Air') return 'ip17-air'; // short pill, single lens
    if (n === '17') return 'ip-vert'; // rounded square, two lenses stacked vertically
    if (n.includes('Pro')) return 'ip-square'; // 14/15/16 Pro square triangle cluster
    if (n.startsWith('16')) return 'ip-vert'; // 16 base vertical dual
    if (n.startsWith('SE')) return 'ip-single';
    return 'ip-dual'; // 11–15 base / Plus diagonal dual
  }
  return 'generic';
}

/** Material finish per brand family — drives the metallic tint of rings & plates. */
type Tone = 'cool' | 'glossy' | 'matte';

const RING_TINT: Record<Tone, [string, string, string]> = {
  cool: ['#d8dbe6', '#565a68', '#aeb2c2'], // brushed titanium
  glossy: ['#5a5a64', '#08080c', '#46464e'], // polished black glass
  matte: ['#9aa0ac', '#42454e', '#868c98'], // soft-touch aluminum
};

const PLATE_TINT: Record<Tone, [string, string]> = {
  cool: ['rgba(255,255,255,0.30)', 'rgba(18,16,26,0.24)'],
  glossy: ['rgba(70,70,80,0.28)', 'rgba(6,6,10,0.34)'],
  matte: ['rgba(120,124,136,0.26)', 'rgba(28,30,38,0.26)'],
};

function Lens({ size, left, top, tone = 'cool' }: { size: number; left: number; top: number; tone?: Tone }) {
  // Plain camera hole: a flat dark circle with a thin rim, no glass/highlight detail.
  const ringW = Math.max(1, size * 0.08);
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#0b0a10',
        borderWidth: ringW,
        borderColor: RING_TINT[tone][1],
      }}
    />
  );
}

function Plate({ l, t, w, h, r, tone = 'cool' }: { l: number; t: number; w: number; h: number; r: number; tone?: Tone }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        height: h,
        borderRadius: r,
        shadowColor: '#0A0812',
        shadowOffset: { width: 0, height: Math.max(2, h * 0.09) },
        shadowOpacity: 0.3,
        shadowRadius: Math.max(4, h * 0.2),
        elevation: 6,
      }}
    >
      <View style={{ flex: 1, borderRadius: r, overflow: 'hidden' }}>
        <LinearGradient
          colors={PLATE_TINT[tone]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* raised-edge highlight (top/left catch light) */}
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 1.5, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
        {/* falling shadow edge (bottom/right recede) */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1.5, backgroundColor: 'rgba(0,0,0,0.2)' }} />
      </View>
    </View>
  );
}

function Flash({ size, left, top }: { size: number; left: number; top: number }) {
  return (
    <View style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: size / 2, overflow: 'hidden', borderWidth: Math.max(1, size * 0.1), borderColor: 'rgba(190,190,212,0.7)' }}>
      <LinearGradient
        colors={['#fffaf2', '#e7e2df']}
        start={{ x: 0.15, y: 0.05 }}
        end={{ x: 0.9, y: 0.95 }}
        style={StyleSheet.absoluteFill}
      />
      {size >= 12 && (
        <View
          style={{
            position: 'absolute',
            left: size * 0.16,
            top: size * 0.12,
            width: size * 0.4,
            height: size * 0.22,
            borderRadius: size * 0.2,
            backgroundColor: 'rgba(255,255,255,0.75)',
            transform: [{ rotate: '-18deg' }],
          }}
        />
      )}
    </View>
  );
}

function Dot({ size, left, top }: { size: number; left: number; top: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#0e0c14',
        borderWidth: Math.max(0.8, size * 0.14),
        borderColor: 'rgba(255,255,255,0.2)',
      }}
    />
  );
}

export function CameraModule({ style, width: W, height: H }: { style: CamStyle; width: number; height: number }) {
  if (style === 'ip17-air') {
    // short horizontal pill on the left: single lens + flash
    const pw = W * 0.44, ph = W * 0.19, px = W * 0.05, py = H * 0.04, ld = ph * 0.72;
    return (
      <>
        <Plate l={px} t={py} w={pw} h={ph} r={ph * 0.5} />
        <Lens size={ld} left={px + ph * 0.16} top={py + ph * 0.14} />
        <Flash size={ph * 0.34} left={px + pw * 0.6} top={py + ph * 0.32} />
        <Dot size={ph * 0.16} left={px + pw * 0.82} top={py + ph * 0.42} />
      </>
    );
  }
  if (style === 'ip-vert') {
    // rounded square, two lenses stacked vertically + flash
    const s = W * 0.27, px = W * 0.05, py = H * 0.04, sh = s * 1.12, ld = s * 0.46;
    const lx = px + s * 0.13;
    return (
      <>
        <Plate l={px} t={py} w={s} h={sh} r={s * 0.34} />
        <Lens size={ld} left={lx} top={py + s * 0.12} />
        <Lens size={ld} left={lx} top={py + sh - ld - s * 0.12} />
        <Flash size={s * 0.2} left={px + s * 0.64} top={py + s * 0.22} />
      </>
    );
  }
  if (style === 'ip-square') {
    const s = W * 0.42, px = W * 0.05, py = H * 0.035, ld = s * 0.4;
    return (
      <>
        <Plate l={px} t={py} w={s} h={s} r={s * 0.28} />
        <Lens size={ld} left={px + s * 0.08} top={py + s * 0.08} />
        <Lens size={ld} left={px + s * 0.08} top={py + s * 0.5} />
        <Lens size={ld} left={px + s * 0.5} top={py + s * 0.29} />
        <Lens size={ld * 0.34} left={px + s * 0.74} top={py + s * 0.14} />
      </>
    );
  }
  if (style === 'ip-dual') {
    const s = W * 0.27, px = W * 0.05, py = H * 0.04, sh = s * 1.12, ld = s * 0.48;
    return (
      <>
        <Plate l={px} t={py} w={s} h={sh} r={s * 0.32} />
        <Lens size={ld} left={px + s * 0.1} top={py + s * 0.1} />
        <Lens size={ld} left={px + s - ld - s * 0.1} top={py + sh - ld - s * 0.1} />
      </>
    );
  }
  if (style === 'ip-single') {
    const ld = W * 0.13;
    return <Lens size={ld} left={W * 0.06} top={H * 0.045} />;
  }
  if (style === 'samsung') {
    const ld = W * 0.11, lx = W * 0.07, ty = H * 0.05, gap = ld * 1.28;
    return (
      <>
        <Lens size={ld} left={lx} top={ty} tone="glossy" />
        <Lens size={ld} left={lx} top={ty + gap} tone="glossy" />
        <Lens size={ld} left={lx} top={ty + gap * 2} tone="glossy" />
        <Lens size={ld * 0.4} left={lx + ld * 1.3} top={ty + gap * 0.4} tone="glossy" />
      </>
    );
  }
  if (style === 'pixel') {
    const bx = W * 0.05, by = H * 0.075, bw = W * 0.9, bh = W * 0.13, ld = bh * 0.7;
    return (
      <>
        <Plate l={bx} t={by} w={bw} h={bh} r={bh * 0.5} tone="matte" />
        <Lens size={ld} left={bx + bw * 0.04} top={by + bh * 0.15} tone="matte" />
        <Lens size={ld} left={bx + bw * 0.04 + ld * 1.2} top={by + bh * 0.15} tone="matte" />
        <View style={{ position: 'absolute', left: bx + bw * 0.78, top: by + bh * 0.28, width: ld * 1.3, height: ld * 0.5, borderRadius: ld * 0.25, backgroundColor: '#15121c', borderWidth: 1, borderColor: 'rgba(150,150,180,0.7)' }} />
      </>
    );
  }
  // generic
  const s = W * 0.3, px = W * 0.06, py = H * 0.04, ld = s * 0.4;
  return (
    <>
      <Plate l={px} t={py} w={s} h={s} r={s * 0.3} />
      <Lens size={ld} left={px + s * 0.12} top={py + s * 0.12} />
      <Lens size={ld} left={px + s * 0.5} top={py + s * 0.12} />
      <Lens size={ld} left={px + s * 0.12} top={py + s * 0.5} />
    </>
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
