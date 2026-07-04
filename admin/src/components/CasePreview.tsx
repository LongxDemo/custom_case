import { CANVAS_BASE, MODELS } from '../lib/types';
import type { CaseBackground, Layer } from '../lib/types';

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
      <img src={layer.uri} style={{ ...base, width: s, height: s, objectFit: 'contain' }} />
    ) : (
      <div style={{ ...base, fontSize: s * 0.9, lineHeight: 1 }}>{layer.emoji}</div>
    );
  }
  if (layer.kind === 'image') {
    return (
      <img
        src={layer.uri}
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
