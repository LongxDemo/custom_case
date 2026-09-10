import { CANVAS_BASE, MODELS, sizeForModel } from '../lib/types';
import type { CaseBackground, Layer, PhoneModel } from '../lib/types';

export function CasePreview({
  background,
  layers,
  modelId,
  width,
}: {
  background: CaseBackground | null;
  layers: Layer[];
  modelId: string | null;
  /** Render width for the WIDEST phone in the catalog — other models scale down proportionally (real relative size, not a fixed box). */
  width: number;
}) {
  const model = (modelId && MODELS[modelId]) || MODELS.ip15pm;
  const { width: renderWidth, height } = sizeForModel(model, width);
  const scale = renderWidth / CANVAS_BASE;
  const radius = renderWidth * 0.14;
  const colors = background?.colors?.length ? background.colors : ['#FFF5FA', '#FFE9F4'];
  const ordered = [...(layers || [])].sort((a, b) => a.z - b.z);

  return (
    <div
      style={{
        width: renderWidth,
        height,
        borderRadius: radius,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(155deg, ${colors[0]}, ${colors[colors.length - 1]})`,
        // Grounded product-photo shadow + a crisp 1px seam and thin edge
        // catch-light instead of a thick colored outline (reads as a sticker).
        boxShadow: [
          '0 24px 48px -18px rgba(20,10,20,0.45)',
          '0 8px 18px -10px rgba(20,10,20,0.3)',
          'inset 0 0 0 1px rgba(0,0,0,0.1)',
          'inset 0 1px 1px rgba(255,255,255,0.35)',
          'inset 0 -1px 2px rgba(0,0,0,0.18)',
        ].join(', '),
      }}
    >
      {ordered.map((l) => (
        <LayerView key={l.id} layer={l} scale={scale} />
      ))}
      <CameraModule style={camStyleFor(model)} width={renderWidth} height={height} tint={colors[0]} />
      {/* subtle printed-case sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(135deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 62%)',
        }}
      />
    </div>
  );
}

function LayerView({ layer, scale }: { layer: Layer; scale: number }) {
  const transform = `translate(-50%, -50%) translate(${layer.tx * scale}px, ${layer.ty * scale}px) scale(${layer.scale}) rotate(${layer.rotation}rad)`;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform,
    transformOrigin: 'center',
  };

  if (layer.kind === 'sticker') {
    const s = layer.size * scale;
    return layer.uri ? (
      <img src={layer.uri} alt="" style={{ ...base, width: s, height: s, objectFit: 'contain' }} />
    ) : (
      <div style={{ ...base, fontSize: s * 0.9, lineHeight: 1 }}>{layer.emoji}</div>
    );
  }
  if (layer.kind === 'image') {
    return (
      <img
        src={layer.uri}
        alt=""
        style={{ ...base, width: layer.width * scale, height: layer.height * scale, borderRadius: (layer.radius ?? 0) * scale, objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      style={{
        ...base,
        width: 240 * scale,
        color: layer.color,
        fontSize: layer.fontSize * scale,
        fontWeight: layer.fontWeight as any,
        textAlign: layer.align,
        lineHeight: 1.1,
        whiteSpace: 'pre-wrap',
      }}
    >
      {layer.text}
    </div>
  );
}

/* ───────────────────────── Realistic camera module (CSS) ─────────────────────────
   Mirrors storefront/src/components/CasePreview.tsx — same brand→layout mapping. */

// From the iPhone 17 generation, Apple moved to a full-width horizontal camera
// plateau (spanning nearly the whole back) instead of the square/pill module
// used on 11-16 — 'ip17-plateau' (triple lens, Pro/Pro Max) and 'ip17-bar'
// (dual lens, base 17); pre-17 iPhones keep the old cluster styles.
type CamStyle = 'ip17-plateau' | 'ip17-bar' | 'ip17-air' | 'ip-square' | 'ip-vert' | 'ip-dual' | 'ip-single' | 'samsung' | 'pixel' | 'generic';

function camStyleFor(model: PhoneModel): CamStyle {
  if (model.brand === 'Google') return 'pixel';
  if (model.brand === 'Samsung') return 'samsung';
  if (model.brand === 'iPhone') {
    const n = model.name;
    if (n.startsWith('17 Pro')) return 'ip17-plateau';
    if (n === 'Air') return 'ip17-air';
    if (n === '17') return 'ip17-bar';
    if (n.includes('Pro')) return 'ip-square';
    if (n.startsWith('16')) return 'ip-vert';
    if (n.startsWith('SE')) return 'ip-single';
    return 'ip-dual';
  }
  return 'generic';
}

// On a real printed/molded case, the camera cutout's rim and raised plateau
// are the SAME material as the rest of the case (see reference product
// photos: an orange case has an orange-tinted camera surround, not a
// separate silver/metal module) — only the lens glass itself, flash, and
// sensor dot stay their real (dark/white/dark) colors. `tint` is the case's
// own background color, mixed lighter/darker for the raised-edge shading.
function ringGradient(tint: string) {
  return `linear-gradient(135deg, color-mix(in srgb, ${tint} 70%, white), color-mix(in srgb, ${tint} 55%, black) 55%, color-mix(in srgb, ${tint} 75%, white))`;
}
function plateGradient(tint: string) {
  return `linear-gradient(160deg, color-mix(in srgb, ${tint} 88%, white), color-mix(in srgb, ${tint} 78%, black))`;
}

function Lens({ size, left, top, tint }: { size: number; left: number; top: number; tint: string }) {
  // Thin precise ring (not a thick "googly eye" outline) around a near-black
  // glass disc, with a single small, tight specular catch-light.
  const ringW = Math.max(1, size * 0.1);
  const glassSize = size - ringW * 2;
  return (
    <div style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: ringGradient(tint), boxShadow: '0 0.5px 1px rgba(0,0,0,0.4)' }}>
      <div
        style={{
          position: 'absolute',
          left: ringW,
          top: ringW,
          width: glassSize,
          height: glassSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, #1c2333 0%, #05060c 55%, #010102 100%)',
        }}
      />
      {size >= 12 && (
        <div
          style={{
            position: 'absolute',
            left: size * 0.28,
            top: size * 0.24,
            width: size * 0.2,
            height: size * 0.12,
            borderRadius: size * 0.1,
            background: 'rgba(255,255,255,0.4)',
            transform: 'rotate(-30deg)',
          }}
        />
      )}
    </div>
  );
}

function Plate({ l, t, w, h, r, tint }: { l: number; t: number; w: number; h: number; r: number; tint: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        height: h,
        borderRadius: r,
        background: plateGradient(tint),
        // Crisp thin seam + soft contact shadow reads as a precise molded
        // edge instead of a raised sticker with fat highlight strokes.
        boxShadow: [
          `0 ${Math.max(1.5, h * 0.05)}px ${Math.max(3, h * 0.12)}px rgba(10,8,18,0.28)`,
          'inset 0 0 0 1px rgba(0,0,0,0.12)',
          'inset 0 1px 0.5px rgba(255,255,255,0.3)',
        ].join(', '),
      }}
    />
  );
}

function Flash({ size, left, top }: { size: number; left: number; top: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `${Math.max(0.6, size * 0.06)}px solid rgba(180,180,200,0.5)`,
        background: 'radial-gradient(circle at 35% 30%, #fffdf9, #e7e2df)',
      }}
    >
      {size >= 12 && (
        <div
          style={{
            position: 'absolute',
            left: size * 0.16,
            top: size * 0.12,
            width: size * 0.36,
            height: size * 0.18,
            borderRadius: size * 0.18,
            background: 'rgba(255,255,255,0.7)',
            transform: 'rotate(-18deg)',
          }}
        />
      )}
    </div>
  );
}

function Dot({ size, left, top }: { size: number; left: number; top: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#0b0a10',
        border: `${Math.max(0.6, size * 0.08)}px solid rgba(255,255,255,0.14)`,
      }}
    />
  );
}

export function CameraModule({ style, width: W, height: H, tint }: { style: CamStyle; width: number; height: number; tint: string }) {
  if (style === 'ip17-plateau') {
    const bx = W * 0.05, by = H * 0.035, bw = W * 0.9, bh = W * 0.22;
    const s = bh * 0.9, sx = bx + bh * 0.14, sy = by + (bh - s) / 2, ld = s * 0.4;
    const rx = bx + bw * 0.7;
    return (
      <>
        <Plate l={bx} t={by} w={bw} h={bh} r={bh * 0.4} tint={tint} />
        <div style={{ position: 'absolute', left: sx, top: sy, width: s, height: s, borderRadius: s * 0.28, background: 'rgba(10,8,14,0.16)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)' }} />
        <Lens size={ld} left={sx + s * 0.08} top={sy + s * 0.08} tint={tint} />
        <Lens size={ld} left={sx + s * 0.08} top={sy + s * 0.5} tint={tint} />
        <Lens size={ld} left={sx + s * 0.5} top={sy + s * 0.29} tint={tint} />
        <Flash size={s * 0.32} left={rx} top={by + bh * 0.16} />
        <Lens size={s * 0.26} left={rx + s * 0.02} top={by + bh * 0.52} tint={tint} />
        <Dot size={s * 0.12} left={rx + s * 0.44} top={by + bh * 0.42} />
      </>
    );
  }
  if (style === 'ip17-bar') {
    const bx = W * 0.05, by = H * 0.035, bw = W * 0.8, bh = W * 0.16, ld = bh * 0.68;
    return (
      <>
        <Plate l={bx} t={by} w={bw} h={bh} r={bh * 0.46} tint={tint} />
        <Lens size={ld} left={bx + bh * 0.16} top={by + (bh - ld) / 2} tint={tint} />
        <Lens size={ld} left={bx + bh * 0.16 + ld * 1.15} top={by + (bh - ld) / 2} tint={tint} />
        <Flash size={bh * 0.32} left={bx + bw * 0.72} top={by + bh * 0.34} />
        <Dot size={bh * 0.14} left={bx + bw * 0.85} top={by + bh * 0.43} />
      </>
    );
  }
  if (style === 'ip17-air') {
    const pw = W * 0.55, ph = W * 0.17, px = W * 0.05, py = H * 0.045, ld = ph * 0.72;
    return (
      <>
        <Plate l={px} t={py} w={pw} h={ph} r={ph * 0.5} tint={tint} />
        <Lens size={ld} left={px + ph * 0.16} top={py + ph * 0.14} tint={tint} />
        <Flash size={ph * 0.34} left={px + pw * 0.68} top={py + ph * 0.32} />
        <Dot size={ph * 0.16} left={px + pw * 0.86} top={py + ph * 0.42} />
      </>
    );
  }
  if (style === 'ip-vert') {
    const s = W * 0.27, px = W * 0.05, py = H * 0.045, sh = s * 1.12, ld = s * 0.46;
    const lx = px + s * 0.13;
    return (
      <>
        <Plate l={px} t={py} w={s} h={sh} r={s * 0.34} tint={tint} />
        <Lens size={ld} left={lx} top={py + s * 0.12} tint={tint} />
        <Lens size={ld} left={lx} top={py + sh - ld - s * 0.12} tint={tint} />
        <Flash size={s * 0.2} left={px + s * 0.64} top={py + s * 0.22} />
      </>
    );
  }
  if (style === 'ip-square') {
    // Reference case silhouettes show the Pro cutout only modestly bigger
    // than the base-model square, not dramatically larger.
    const s = W * 0.32, px = W * 0.06, py = H * 0.045, ld = s * 0.4;
    return (
      <>
        <Plate l={px} t={py} w={s} h={s} r={s * 0.28} tint={tint} />
        <Lens size={ld} left={px + s * 0.08} top={py + s * 0.08} tint={tint} />
        <Lens size={ld} left={px + s * 0.08} top={py + s * 0.5} tint={tint} />
        <Lens size={ld} left={px + s * 0.5} top={py + s * 0.29} tint={tint} />
        <Dot size={ld * 0.3} left={px + s * 0.74} top={py + s * 0.16} />
        <Flash size={ld * 0.4} left={px + s * 0.64} top={py + s * 0.48} />
      </>
    );
  }
  if (style === 'ip-dual') {
    const s = W * 0.27, px = W * 0.05, py = H * 0.04, sh = s * 1.12, ld = s * 0.48;
    return (
      <>
        <Plate l={px} t={py} w={s} h={sh} r={s * 0.32} tint={tint} />
        <Lens size={ld} left={px + s * 0.1} top={py + s * 0.1} tint={tint} />
        <Lens size={ld} left={px + s - ld - s * 0.1} top={py + sh - ld - s * 0.1} tint={tint} />
      </>
    );
  }
  if (style === 'ip-single') {
    const ld = W * 0.13;
    return <Lens size={ld} left={W * 0.06} top={H * 0.045} tint={tint} />;
  }
  if (style === 'samsung') {
    const ld = W * 0.11, lx = W * 0.07, ty = H * 0.05, gap = ld * 1.28;
    return (
      <>
        <Lens size={ld} left={lx} top={ty} tint={tint} />
        <Lens size={ld} left={lx} top={ty + gap} tint={tint} />
        <Lens size={ld} left={lx} top={ty + gap * 2} tint={tint} />
        <Lens size={ld * 0.4} left={lx + ld * 1.3} top={ty + gap * 0.4} tint={tint} />
      </>
    );
  }
  if (style === 'pixel') {
    const bx = W * 0.05, by = H * 0.075, bw = W * 0.9, bh = W * 0.13, ld = bh * 0.7;
    return (
      <>
        <Plate l={bx} t={by} w={bw} h={bh} r={bh * 0.5} tint={tint} />
        <Lens size={ld} left={bx + bw * 0.04} top={by + bh * 0.15} tint={tint} />
        <Lens size={ld} left={bx + bw * 0.04 + ld * 1.2} top={by + bh * 0.15} tint={tint} />
        <div style={{ position: 'absolute', left: bx + bw * 0.78, top: by + bh * 0.28, width: ld * 1.3, height: ld * 0.5, borderRadius: ld * 0.25, background: '#15121c', border: '1px solid rgba(150,150,180,0.7)' }} />
      </>
    );
  }
  const s = W * 0.3, px = W * 0.06, py = H * 0.04, ld = s * 0.4;
  return (
    <>
      <Plate l={px} t={py} w={s} h={s} r={s * 0.3} tint={tint} />
      <Lens size={ld} left={px + s * 0.12} top={py + s * 0.12} tint={tint} />
      <Lens size={ld} left={px + s * 0.5} top={py + s * 0.12} tint={tint} />
      <Lens size={ld} left={px + s * 0.12} top={py + s * 0.5} tint={tint} />
    </>
  );
}
