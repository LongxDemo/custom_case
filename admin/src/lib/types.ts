export type CaseBackground = { id: string; name: string; colors: string[] };

export type Layer =
  | { id: string; kind: 'image'; uri: string; width: number; height: number; radius?: number; tx: number; ty: number; scale: number; rotation: number; z: number }
  | { id: string; kind: 'sticker'; emoji?: string; uri?: string; size: number; tx: number; ty: number; scale: number; rotation: number; z: number }
  | { id: string; kind: 'text'; text: string; color: string; fontSize: number; fontWeight: string; align: 'left' | 'center' | 'right'; tx: number; ty: number; scale: number; rotation: number; z: number };

export type DesignRow = {
  id: string;
  user_id: string | null;
  model_id: string | null;
  background: CaseBackground | null;
  layers: Layer[];
  preview_url: string | null;
  // Set when submitted via the storefront's "send to Casey" flow (no checkout).
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  note: string | null;
  status: 'new' | 'contacted' | 'done' | null;
  created_at: string;
};

export type OrderRow = {
  id: string;
  order_no: string;
  email: string | null;
  full_name: string | null;
  fulfillment: string;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  created_at: string;
};

export type TemplateRow = {
  id: string;
  name: string;
  tag: string | null;
  accent: string | null;
  background: CaseBackground;
  layers: Layer[];
  active: boolean;
  featured: boolean;
  sort: number;
  uses_count: number;
  created_at: string;
};

export type FrontPage = {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  banner_text: string | null;
  featured_template_ids: string[];
  updated_at: string;
};

export type PhoneModel = { id: string; brand: string; name: string; aspect: number; camera?: { x: number; y: number; w: number; h: number } };

export const MODELS: Record<string, PhoneModel> = {
  // Aspect = body width / height from Apple's published specs.
  ip17pm: { id: 'ip17pm', brand: 'iPhone', name: '17 Pro Max', aspect: 0.477 }, // 78.0 / 163.4
  ip17p: { id: 'ip17p', brand: 'iPhone', name: '17 Pro', aspect: 0.479 }, // 71.9 / 150.0
  ip17air: { id: 'ip17air', brand: 'iPhone', name: 'Air', aspect: 0.478 }, // 74.7 / 156.2
  ip17: { id: 'ip17', brand: 'iPhone', name: '17', aspect: 0.478 }, // 71.5 / 149.6
  ip16pm: { id: 'ip16pm', brand: 'iPhone', name: '16 Pro Max', aspect: 0.476 }, // 77.6 / 163.0
  ip16p: { id: 'ip16p', brand: 'iPhone', name: '16 Pro', aspect: 0.478 }, // 71.5 / 149.6
  ip16: { id: 'ip16', brand: 'iPhone', name: '16 / 16 Plus', aspect: 0.484 }, // avg 71.6/147.6, 77.8/160.9
  ip15pm: { id: 'ip15pm', brand: 'iPhone', name: '15 Pro Max', aspect: 0.48 }, // 76.7 / 159.9
  ip15: { id: 'ip15', brand: 'iPhone', name: '15 / 15 Pro', aspect: 0.483 }, // avg 71.6/147.6, 70.6/146.6
  ip14: { id: 'ip14', brand: 'iPhone', name: '14 / 13', aspect: 0.487 }, // 71.5 / 146.7
  ip12: { id: 'ip12', brand: 'iPhone', name: '12 / 11', aspect: 0.495 }, // avg 71.5/146.7, 75.7/150.9
  ipse: { id: 'ipse', brand: 'iPhone', name: 'SE (2022)', aspect: 0.486 }, // 67.3 / 138.4 (iPhone 8 body)
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

export const CANVAS_BASE = 320;
