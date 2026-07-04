import type { DesignRow, FrontPage, OrderRow } from './lib/types';

export const mockFrontPage: FrontPage = {
  id: 1,
  hero_title: 'Design it. Print it. Love it.',
  hero_subtitle: '100% you, 100% Casey',
  hero_cta: 'Start designing',
  banner_text: 'Free shipping on 2+ cases 🎀',
  featured_template_ids: ['t-stan', 't-love', 't-bunny'],
  updated_at: new Date().toISOString(),
};

export const mockDesigns: DesignRow[] = [
  {
    id: 'd1', user_id: null, model_id: 'ip15pm', preview_url: null, created_at: new Date(Date.now() - 3600e3).toISOString(),
    background: { id: 'midnight', name: 'Midnight Stan', colors: ['#2B1B3D', '#141018'] },
    layers: [
      { id: 'a', kind: 'text', text: 'STAN\n4 LIFE', color: '#FF3E9A', fontSize: 46, fontWeight: '900', align: 'center', tx: 0, ty: -40, scale: 1, rotation: 0, z: 2 },
      { id: 'b', kind: 'sticker', emoji: '🖤', size: 60, tx: -70, ty: 90, scale: 1, rotation: -0.2, z: 1 },
    ],
  },
  {
    id: 'd2', user_id: 'u1', model_id: 's24u', preview_url: null, created_at: new Date(Date.now() - 7200e3).toISOString(),
    background: { id: 'bubblegum', name: 'Bubblegum', colors: ['#FF7EC0', '#FF3E9A'] },
    layers: [
      { id: 'a', kind: 'text', text: 'love.\nprint.\nstan.', color: '#FFFFFF', fontSize: 40, fontWeight: '800', align: 'left', tx: -30, ty: 0, scale: 1, rotation: 0, z: 2 },
      { id: 'b', kind: 'sticker', emoji: '🐰', size: 64, tx: 70, ty: 150, scale: 1, rotation: 0, z: 1 },
    ],
  },
  {
    id: 'd3', user_id: null, model_id: 'ip14', preview_url: null, created_at: new Date(Date.now() - 10800e3).toISOString(),
    background: { id: 'cotton', name: 'Cotton Candy', colors: ['#FFD6EC', '#C8B6FF'] },
    layers: [
      { id: 'a', kind: 'sticker', emoji: '🐰', size: 120, tx: 0, ty: -30, scale: 1, rotation: 0, z: 2 },
      { id: 'b', kind: 'text', text: 'be a cutie', color: '#D6006E', fontSize: 30, fontWeight: '800', align: 'center', tx: 0, ty: 110, scale: 1, rotation: 0, z: 2 },
    ],
  },
];

export const mockOrders: OrderRow[] = [
  { id: 'o1', order_no: 'CK-284910', email: 'mina@kpop.com', full_name: 'Mina L.', fulfillment: 'ship', status: 'paid', subtotal_cents: 3980, shipping_cents: 499, total_cents: 4479, created_at: new Date(Date.now() - 3600e3).toISOString() },
  { id: 'o2', order_no: 'CK-284911', email: 'jae@stan.com', full_name: 'Jae P.', fulfillment: 'pickup', status: 'printing', subtotal_cents: 1990, shipping_cents: 0, total_cents: 1990, created_at: new Date(Date.now() - 9000e3).toISOString() },
  { id: 'o3', order_no: 'CK-284912', email: 'soo@fan.com', full_name: 'Soo K.', fulfillment: 'ship', status: 'shipped', subtotal_cents: 5970, shipping_cents: 499, total_cents: 6469, created_at: new Date(Date.now() - 90000e3).toISOString() },
];
