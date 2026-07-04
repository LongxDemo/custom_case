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
  ip15pm: { id: 'ip15pm', brand: 'iPhone', name: '15 Pro Max', aspect: 0.49 },
  ip15: { id: 'ip15', brand: 'iPhone', name: '15 / 15 Pro', aspect: 0.49 },
  ip14: { id: 'ip14', brand: 'iPhone', name: '14 / 13', aspect: 0.49 },
  s24u: { id: 's24u', brand: 'Samsung', name: 'S24 Ultra', aspect: 0.46 },
  s24: { id: 's24', brand: 'Samsung', name: 'Galaxy S24', aspect: 0.47 },
  pixel8: { id: 'pixel8', brand: 'Google', name: 'Pixel 8 Pro', aspect: 0.48 },
};

export const CANVAS_BASE = 320;
