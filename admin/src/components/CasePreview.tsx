import { CANVAS_BASE, MODELS } from '../lib/types';
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
  width: number;
}) {
  const model = (modelId && MODELS[modelId]) || MODELS.ip15pm;
  const height = width / model.aspect;
  const scale = width / CANVAS_BASE;
  const radius = width * 0.14;
  const colors = background?.colors?.length ? background.colors : ['#FFF5FA', '#FFE9F4'];
  const ordered = [...(layers || [])].sort((a, b) => a.z - b.z);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        position: 'relative',
        overflow: 'hidden',
        border: '3px solid rgba(255,255,255,0.6)',
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[colors.length - 1]})`,
        boxShadow: '0 12px 24px rgba(214,0,110,0.18)',
      }}
    >
      {ordered.map((l) => (
        <LayerView key={l.id} layer={l} scale={scale} />
      ))}
      <CameraModule style={camStyleFor(model)} width={width} height={height} />
      {/* glossy printed-case sheen — matches the mobile app's case preview */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(135deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 68%)',
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
   Mirrors mobile/src/components/CasePreview.tsx — same brand→layout mapping and the
   same "metallic ring + glass + specular highlight" look, rebuilt with CSS gradients
   since the admin dashboard renders previews as plain <div> trees. */

type CamStyle = 'ip17-pro' | 'ip17-air' | 'ip-square' | 'ip-vert' | 'ip-dual' | 'ip-single' | 'samsung' | 'pixel' | 'generic';
type Tone = 'cool' | 'glossy' | 'matte';

function camStyleFor(model: PhoneModel): CamStyle {
  if (model.brand === 'Google') return 'pixel';
  if (model.brand === 'Samsung') return 'samsung';
  if (model.brand === 'iPhone') {
    const n = model.name;
    if (n.startsWith('17 Pro')) return 'ip17-pro';
    if (n === 'Air') return 'ip17-air';
    if (n === '17') return 'ip-vert';
    if (n.includes('Pro')) return 'ip-square';
    if (n.startsWith('16')) return 'ip-vert';
    if (n.startsWith('SE')) return 'ip-single';
    return 'ip-dual';
  }
  return 'generic';
}

const RING_TINT: Record<Tone, string> = {
  cool: 'linear-gradient(135deg, #d8dbe6, #565a68 55%, #aeb2c2)',
  glossy: 'linear-gradient(135deg, #5a5a64, #08080c 55%, #46464e)',
  matte: 'linear-gradient(135deg, #9aa0ac, #42454e 55%, #868c98)',
};

const PLATE_TINT: Record<Tone, string> = {
  cool: 'linear-gradient(160deg, rgba(255,255,255,0.30), rgba(18,16,26,0.24))',
  glossy: 'linear-gradient(160deg, rgba(70,70,80,0.28), rgba(6,6,10,0.34))',
  matte: 'linear-gradient(160deg, rgba(120,124,136,0.26), rgba(28,30,38,0.26))',
};

function Lens({ size, left, top, tone = 'cool' }: { size: number; left: number; top: number; tone?: Tone }) {
  const ringW = Math.max(1.2, size * 0.15);
  const glassSize = size - ringW * 2;
  return (
    <div style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: RING_TINT[tone] }}>
      <div
        style={{
          position: 'absolute',
          left: ringW,
          top: ringW,
          width: glassSize,
          height: glassSize,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #02030a, #1a2036 45%, #04050c)',
        }}
      />
      {size >= 14 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: size * 0.2,
              top: size * 0.16,
              width: size * 0.36,
              height: size * 0.2,
              borderRadius: size * 0.18,
              background: 'rgba(255,255,255,0.5)',
              transform: 'rotate(-24deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: size * 0.58,
              top: size * 0.56,
              width: size * 0.16,
              height: size * 0.16,
              borderRadius: '50%',
              background: 'rgba(130,160,255,0.45)',
            }}
          />
        </>
      )}
    </div>
  );
}

function Plate({ l, t, w, h, r, tone = 'cool' }: { l: number; t: number; w: number; h: number; r: number; tone?: Tone }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        height: h,
        borderRadius: r,
        overflow: 'hidden',
        boxShadow: `0 ${Math.max(2, h * 0.09)}px ${Math.max(4, h * 0.2)}px rgba(10,8,18,0.3)`,
        background: PLATE_TINT[tone],
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 1.5, background: 'rgba(255,255,255,0.45)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1.5, background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1.5, background: 'rgba(0,0,0,0.2)' }} />
    </div>
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
        border: `${Math.max(1, size * 0.1)}px solid rgba(190,190,212,0.7)`,
        background: 'linear-gradient(135deg, #fffaf2, #e7e2df)',
      }}
    >
      {size >= 12 && (
        <div
          style={{
            position: 'absolute',
            left: size * 0.16,
            top: size * 0.12,
            width: size * 0.4,
            height: size * 0.22,
            borderRadius: size * 0.2,
            background: 'rgba(255,255,255,0.75)',
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
        background: '#0e0c14',
        border: `${Math.max(0.8, size * 0.14)}px solid rgba(255,255,255,0.2)`,
      }}
    />
  );
}

function CameraModule({ style, width: W, height: H }: { style: CamStyle; width: number; height: number }) {
  if (style === 'ip17-pro') {
    const bx = W * 0.05, by = H * 0.035, bw = W * 0.9, bh = W * 0.22;
    const s = bh * 0.9, sx = bx + bh * 0.14, sy = by + (bh - s) / 2, ld = s * 0.4;
    const rx = bx + bw * 0.7;
    return (
      <>
        <Plate l={bx} t={by} w={bw} h={bh} r={bh * 0.4} />
        <div style={{ position: 'absolute', left: sx, top: sy, width: s, height: s, borderRadius: s * 0.28, background: 'rgba(10,8,14,0.26)', border: '1.5px solid rgba(255,255,255,0.22)' }} />
        <Lens size={ld} left={sx + s * 0.08} top={sy + s * 0.08} />
        <Lens size={ld} left={sx + s * 0.08} top={sy + s * 0.5} />
        <Lens size={ld} left={sx + s * 0.5} top={sy + s * 0.29} />
        <Flash size={s * 0.32} left={rx} top={by + bh * 0.16} />
        <Lens size={s * 0.26} left={rx + s * 0.02} top={by + bh * 0.52} />
        <Dot size={s * 0.12} left={rx + s * 0.44} top={by + bh * 0.42} />
      </>
    );
  }
  if (style === 'ip17-air') {
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
        <div style={{ position: 'absolute', left: bx + bw * 0.78, top: by + bh * 0.28, width: ld * 1.3, height: ld * 0.5, borderRadius: ld * 0.25, background: '#15121c', border: '1px solid rgba(150,150,180,0.7)' }} />
      </>
    );
  }
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
