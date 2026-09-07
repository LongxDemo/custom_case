/**
 * Core data model. These shapes mirror what will live in Supabase so the
 * switch from local/mock mode to the real backend is a drop-in.
 */

export type PhoneModel = {
  id: string;
  brand: string;
  name: string;
  /** case aspect ratio = width / height, used to size the design canvas */
  aspect: number;
  /** normalized camera cutout rectangle (0..1) drawn on the case preview */
  camera?: { x: number; y: number; w: number; h: number };
};

export type Sticker = {
  id: string;
  /** emoji glyph for MVP; image stickers (uri) can be added by admin later */
  emoji?: string;
  uri?: string;
  label?: string;
};

export type StickerPack = {
  id: string;
  name: string;
  cover: string; // emoji shown on the pack chip
  stickers: Sticker[];
};

export type CaseBackground = {
  id: string;
  name: string;
  /** solid color or 2-stop gradient */
  colors: string[];
};

/** A single editable element placed on the case. */
export type LayerBase = {
  id: string;
  /** translation from canvas center, in canvas points at base size */
  tx: number;
  ty: number;
  scale: number;
  rotation: number; // radians
  z: number;
};

export type ImageLayer = LayerBase & {
  kind: 'image';
  uri: string;
  width: number; // base render width in canvas points
  height: number;
  radius?: number;
};

export type StickerLayer = LayerBase & {
  kind: 'sticker';
  emoji?: string;
  uri?: string;
  size: number; // base font/render size
};

export type TextLayer = LayerBase & {
  kind: 'text';
  text: string;
  color: string;
  fontSize: number;
  fontWeight: '400' | '600' | '700' | '800' | '900';
  align: 'left' | 'center' | 'right';
};

export type Layer = ImageLayer | StickerLayer | TextLayer;

/** Omit that distributes across union members (keeps the discriminated kinds). */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type LayerSpec = DistributiveOmit<Layer, 'id'>;

export type Design = {
  id: string;
  modelId: string;
  background: CaseBackground;
  layers: Layer[];
  updatedAt: number;
  /** captured preview image uri (set on save/export) */
  previewUri?: string;
};

export type Template = {
  id: string;
  name: string;
  tag?: string;
  background: CaseBackground;
  /** layers without ids/positions resolved — cloned into a fresh design */
  layers: LayerSpec[];
  accent: string; // card tint for the gallery
  /** present when loaded from Supabase; absent for the bundled catalog defaults */
  usesCount?: number;
  active?: boolean;
};

export type CartItem = {
  id: string;
  design: Design;
  modelId: string;
  quantity: number;
  priceCents: number;
  fulfillment: 'ship' | 'pickup';
};
