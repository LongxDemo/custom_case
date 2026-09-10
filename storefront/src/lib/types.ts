export type CaseBackground = { id: string; name: string; colors: string[] };

export type LayerBase = { id: string; tx: number; ty: number; scale: number; rotation: number; z: number };

export type ImageLayer = LayerBase & { kind: 'image'; uri: string; width: number; height: number; radius?: number };
export type StickerLayer = LayerBase & { kind: 'sticker'; emoji?: string; uri?: string; size: number };
export type TextLayer = LayerBase & {
  kind: 'text'; text: string; color: string; fontSize: number;
  fontWeight: '400' | '600' | '700' | '800' | '900'; align: 'left' | 'center' | 'right';
};

export type Layer = ImageLayer | StickerLayer | TextLayer;
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type LayerSpec = DistributiveOmit<Layer, 'id'>;

export type Sticker = { id: string; emoji?: string; uri?: string };
export type StickerPack = { id: string; name: string; cover: string; stickers: Sticker[] };

export type Design = {
  id: string;
  modelId: string;
  background: CaseBackground;
  layers: Layer[];
};

export type Template = {
  id: string;
  name: string;
  tag?: string;
  accent: string;
  background: CaseBackground;
  layers: LayerSpec[];
};

export type PhoneModel = { id: string; brand: string; name: string; aspect: number };
export type Platform = 'ios' | 'android';
export const platformOf = (m: PhoneModel): Platform => (m.brand === 'iPhone' ? 'ios' : 'android');

// Aspect = body width / height from Apple's published specs (Samsung/Google/other
// brands are close estimates — see [[project-custom-case]] for the iPhone sourcing).
export const MODELS: Record<string, PhoneModel> = {
  ip17pm: { id: 'ip17pm', brand: 'iPhone', name: '17 Pro Max', aspect: 0.477 },
  ip17p: { id: 'ip17p', brand: 'iPhone', name: '17 Pro', aspect: 0.479 },
  ip17air: { id: 'ip17air', brand: 'iPhone', name: 'Air', aspect: 0.478 },
  ip17: { id: 'ip17', brand: 'iPhone', name: '17', aspect: 0.478 },
  ip16pm: { id: 'ip16pm', brand: 'iPhone', name: '16 Pro Max', aspect: 0.476 },
  ip16p: { id: 'ip16p', brand: 'iPhone', name: '16 Pro', aspect: 0.478 },
  ip16: { id: 'ip16', brand: 'iPhone', name: '16 / 16 Plus', aspect: 0.484 },
  ip15pm: { id: 'ip15pm', brand: 'iPhone', name: '15 Pro Max', aspect: 0.48 },
  ip15: { id: 'ip15', brand: 'iPhone', name: '15 / 15 Pro', aspect: 0.483 },
  ip14: { id: 'ip14', brand: 'iPhone', name: '14 / 13', aspect: 0.487 },
  ip12: { id: 'ip12', brand: 'iPhone', name: '12 / 11', aspect: 0.495 },
  ipse: { id: 'ipse', brand: 'iPhone', name: 'SE (2022)', aspect: 0.486 },
  s24u: { id: 's24u', brand: 'Samsung', name: 'S24 Ultra', aspect: 0.46 },
  s24p: { id: 's24p', brand: 'Samsung', name: 'S24+', aspect: 0.46 },
  s24: { id: 's24', brand: 'Samsung', name: 'Galaxy S24', aspect: 0.47 },
  s23u: { id: 's23u', brand: 'Samsung', name: 'S23 Ultra', aspect: 0.45 },
  s23: { id: 's23', brand: 'Samsung', name: 'Galaxy S23', aspect: 0.48 },
  a55: { id: 'a55', brand: 'Samsung', name: 'A55 / A54', aspect: 0.47 },
  zflip5: { id: 'zflip5', brand: 'Samsung', name: 'Z Flip 5', aspect: 0.84 },
  zfold5: { id: 'zfold5', brand: 'Samsung', name: 'Z Fold 5', aspect: 0.44 },
  pixel9p: { id: 'pixel9p', brand: 'Google', name: 'Pixel 9 Pro', aspect: 0.47 },
  pixel8pro: { id: 'pixel8pro', brand: 'Google', name: 'Pixel 8 Pro', aspect: 0.48 },
  pixel8: { id: 'pixel8', brand: 'Google', name: 'Pixel 8 / 8a', aspect: 0.47 },
  pixel7: { id: 'pixel7', brand: 'Google', name: 'Pixel 7', aspect: 0.48 },
  xiaomi14: { id: 'xiaomi14', brand: 'Xiaomi', name: 'Xiaomi 14', aspect: 0.46 },
  redmi13: { id: 'redmi13', brand: 'Xiaomi', name: 'Redmi Note 13', aspect: 0.46 },
  oneplus12: { id: 'oneplus12', brand: 'OnePlus', name: 'OnePlus 12', aspect: 0.46 },
  oppo: { id: 'oppo', brand: 'OPPO', name: 'Reno 11', aspect: 0.46 },
};

export const phoneModels: PhoneModel[] = Object.values(MODELS);

export const CANVAS_BASE = 320;
