import { create } from 'zustand';
import { backgrounds, phoneModels, templates } from '../data/catalog';
import { CaseBackground, Design, Layer, Template } from '../data/types';

let counter = 0;
const uid = (p = 'l') => `${p}_${Date.now().toString(36)}_${(counter++).toString(36)}`;

function blankDesign(modelId: string): Design {
  return {
    id: uid('d'),
    modelId,
    background: backgrounds[5], // cream
    layers: [],
    updatedAt: Date.now(),
  };
}

function fromTemplate(t: Template, modelId: string): Design {
  return {
    id: uid('d'),
    modelId,
    background: t.background,
    layers: t.layers.map((l, i) => ({ ...l, id: uid(), z: l.z ?? i + 1 })) as Layer[],
    updatedAt: Date.now(),
  };
}

type DesignState = {
  design: Design;
  selectedId: string | null;
  startBlank: (modelId?: string) => void;
  startFromTemplate: (templateId: string, modelId?: string) => void;
  setModel: (modelId: string) => void;
  setBackground: (bg: CaseBackground) => void;
  select: (id: string | null) => void;
  addSticker: (emoji: string) => void;
  addText: (text?: string) => void;
  addImage: (uri: string, width: number, height: number) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  bringToFront: (id: string) => void;
  setPreview: (uri: string) => void;
};

const nextZ = (layers: Layer[]) => (layers.length ? Math.max(...layers.map((l) => l.z)) + 1 : 1);

export const useDesign = create<DesignState>((set, get) => ({
  design: blankDesign(phoneModels[0].id),
  selectedId: null,

  startBlank: (modelId) => set({ design: blankDesign(modelId ?? get().design.modelId), selectedId: null }),

  startFromTemplate: (templateId, modelId) => {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;
    set({ design: fromTemplate(t, modelId ?? get().design.modelId), selectedId: null });
  },

  setModel: (modelId) =>
    set((s) => ({ design: { ...s.design, modelId, updatedAt: Date.now() } })),

  setBackground: (bg) =>
    set((s) => ({ design: { ...s.design, background: bg, updatedAt: Date.now() } })),

  select: (id) => {
    if (get().selectedId === id) return; // idempotent — avoid re-renders mid-drag
    set({ selectedId: id });
  },

  addSticker: (emoji) =>
    set((s) => {
      const layer: Layer = {
        id: uid(), kind: 'sticker', emoji, size: 64,
        tx: 0, ty: 0, scale: 1, rotation: 0, z: nextZ(s.design.layers),
      };
      return { design: { ...s.design, layers: [...s.design.layers, layer], updatedAt: Date.now() }, selectedId: layer.id };
    }),

  addText: (text = 'Tap to edit') =>
    set((s) => {
      const layer: Layer = {
        id: uid(), kind: 'text', text, color: '#FFFFFF', fontSize: 30, fontWeight: '800', align: 'center',
        tx: 0, ty: 0, scale: 1, rotation: 0, z: nextZ(s.design.layers),
      };
      return { design: { ...s.design, layers: [...s.design.layers, layer], updatedAt: Date.now() }, selectedId: layer.id };
    }),

  addImage: (uri, width, height) =>
    set((s) => {
      const maxW = 160;
      const ratio = height / width;
      const w = Math.min(width, maxW);
      const layer: Layer = {
        id: uid(), kind: 'image', uri, width: w, height: w * ratio, radius: 12,
        tx: 0, ty: 0, scale: 1, rotation: 0, z: nextZ(s.design.layers),
      };
      return { design: { ...s.design, layers: [...s.design.layers, layer], updatedAt: Date.now() }, selectedId: layer.id };
    }),

  updateLayer: (id, patch) =>
    set((s) => ({
      design: {
        ...s.design,
        layers: s.design.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
        updatedAt: Date.now(),
      },
    })),

  removeLayer: (id) =>
    set((s) => ({
      design: { ...s.design, layers: s.design.layers.filter((l) => l.id !== id), updatedAt: Date.now() },
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  duplicateLayer: (id) =>
    set((s) => {
      const src = s.design.layers.find((l) => l.id === id);
      if (!src) return s;
      const copy = { ...src, id: uid(), tx: src.tx + 20, ty: src.ty + 20, z: nextZ(s.design.layers) } as Layer;
      return { design: { ...s.design, layers: [...s.design.layers, copy], updatedAt: Date.now() }, selectedId: copy.id };
    }),

  bringToFront: (id) =>
    set((s) => ({
      design: {
        ...s.design,
        layers: s.design.layers.map((l) => (l.id === id ? { ...l, z: nextZ(s.design.layers) } : l)),
      },
    })),

  setPreview: (uri) => set((s) => ({ design: { ...s.design, previewUri: uri } })),
}));
