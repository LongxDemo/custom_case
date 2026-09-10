import React from 'react';
import type { Layer } from '../lib/types';

export function layerBaseSize(l: Layer): { w: number; h: number } {
  if (l.kind === 'sticker') return { w: l.size, h: l.size };
  if (l.kind === 'image') return { w: l.width, h: l.height };
  return { w: 220, h: l.fontSize * 1.4 };
}

export function EditableLayer({
  layer,
  selected,
  scale,
  canvasRef,
  onSelect,
  onChange,
}: {
  layer: Layer;
  selected: boolean;
  scale: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<Layer>) => void;
}) {
  const base = layerBaseSize(layer);
  const dw = base.w * scale;
  const dh = base.h * scale;
  const halfDiag = Math.sqrt((dw / 2) ** 2 + (dh / 2) ** 2);
  const cornerAngle = Math.atan2(dh, dw);

  const dragState = React.useRef<{ startTx: number; startTy: number; startX: number; startY: number } | null>(null);
  const handleState = React.useRef<{ startScale: number; startRotation: number } | null>(null);

  const onBodyPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(layer.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startTx: layer.tx, startTy: layer.ty, startX: e.clientX, startY: e.clientY };
  };
  const onBodyPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const { startTx, startTy, startX, startY } = dragState.current;
    onChange(layer.id, { tx: startTx + (e.clientX - startX) / scale, ty: startTy + (e.clientY - startY) / scale });
  };
  const onBodyPointerUp = (e: React.PointerEvent) => {
    dragState.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const onHandlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleState.current = { startScale: layer.scale, startRotation: layer.rotation };
  };
  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (!handleState.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + layer.tx * scale;
    const cy = rect.top + rect.height / 2 + layer.ty * scale;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const newScale = Math.max(0.3, Math.min(6, dist / halfDiag));
    const newRotation = Math.atan2(dy, dx) - cornerAngle;
    onChange(layer.id, { scale: newScale, rotation: newRotation });
  };
  const onHandlePointerUp = (e: React.PointerEvent) => {
    handleState.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const transform = `translate(-50%, -50%) translate(${layer.tx * scale}px, ${layer.ty * scale}px) scale(${layer.scale}) rotate(${layer.rotation}rad)`;

  return (
    <div
      onPointerDown={onBodyPointerDown}
      onPointerMove={onBodyPointerMove}
      onPointerUp={onBodyPointerUp}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: dw,
        height: dh,
        marginLeft: -dw / 2,
        marginTop: -dh / 2,
        transform,
        transformOrigin: 'center',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
        outline: selected ? '1.5px dashed #FF3E9A' : 'none',
        outlineOffset: 3,
        borderRadius: 6,
      }}
    >
      <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        {layer.kind === 'sticker' &&
          (layer.uri ? (
            <img src={layer.uri} alt="" style={{ width: dw, height: dh, objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: dw * 0.9, lineHeight: 1, textAlign: 'center' }}>{layer.emoji}</div>
          ))}
        {layer.kind === 'image' && (
          <img src={layer.uri} alt="" style={{ width: dw, height: dh, borderRadius: (layer.radius ?? 0) * scale, objectFit: 'cover' }} />
        )}
        {layer.kind === 'text' && (
          <div
            style={{
              width: dw,
              fontSize: layer.fontSize * scale,
              fontWeight: layer.fontWeight as any,
              color: layer.color,
              textAlign: layer.align,
              lineHeight: 1.1,
              whiteSpace: 'pre-wrap',
            }}
          >
            {layer.text}
          </div>
        )}
      </div>

      {selected && (
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          style={{
            position: 'absolute',
            right: -13,
            bottom: -13,
            width: 26,
            height: 26,
            borderRadius: 13,
            background: '#FF3E9A',
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            cursor: 'nwse-resize',
            touchAction: 'none',
            transform: `scale(${1 / layer.scale})`,
          }}
        />
      )}
    </div>
  );
}
