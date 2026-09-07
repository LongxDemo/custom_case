import { CaseBackground, PhoneModel, StickerPack, Template } from './types';

export const BASE_PRICE_CENTS = 1990; // $19.90 per case

// Camera cutout is a normalized (0..1) guide rectangle drawn on the case preview.
// iPhone Pro = square top-left cluster · iPhone = smaller cluster ·
// Samsung = tall vertical strip top-left · Pixel = wide horizontal bar.
const IP_PRO_CAM = { x: 0.05, y: 0.04, w: 0.36, h: 0.26 };
const IP_CAM = { x: 0.05, y: 0.04, w: 0.3, h: 0.2 };
const SS_CAM = { x: 0.06, y: 0.05, w: 0.16, h: 0.26 };
const PIXEL_CAM = { x: 0.08, y: 0.07, w: 0.84, h: 0.12 };
const OTHER_CAM = { x: 0.06, y: 0.05, w: 0.28, h: 0.24 };

export type Platform = 'ios' | 'android';
/** iPhone → iOS, everything else → Android. */
export const platformOf = (m: PhoneModel): Platform => (m.brand === 'iPhone' ? 'ios' : 'android');

export const phoneModels: PhoneModel[] = [
  // iPhone
  { id: 'ip17pm', brand: 'iPhone', name: '17 Pro Max', aspect: 0.46, camera: IP_PRO_CAM },
  { id: 'ip17p', brand: 'iPhone', name: '17 Pro', aspect: 0.46, camera: IP_PRO_CAM },
  { id: 'ip17air', brand: 'iPhone', name: 'Air', aspect: 0.48, camera: IP_CAM },
  { id: 'ip17', brand: 'iPhone', name: '17', aspect: 0.47, camera: IP_CAM },
  { id: 'ip16pm', brand: 'iPhone', name: '16 Pro Max', aspect: 0.46, camera: IP_PRO_CAM },
  { id: 'ip16p', brand: 'iPhone', name: '16 Pro', aspect: 0.46, camera: IP_PRO_CAM },
  { id: 'ip16', brand: 'iPhone', name: '16 / 16 Plus', aspect: 0.48, camera: IP_CAM },
  { id: 'ip15pm', brand: 'iPhone', name: '15 Pro Max', aspect: 0.49, camera: IP_PRO_CAM },
  { id: 'ip15', brand: 'iPhone', name: '15 / 15 Pro', aspect: 0.49, camera: IP_CAM },
  { id: 'ip14', brand: 'iPhone', name: '14 / 13', aspect: 0.49, camera: IP_CAM },
  { id: 'ip12', brand: 'iPhone', name: '12 / 11', aspect: 0.49, camera: IP_CAM },
  { id: 'ipse', brand: 'iPhone', name: 'SE (2022)', aspect: 0.49, camera: { x: 0.05, y: 0.04, w: 0.2, h: 0.12 } },
  // Samsung
  { id: 's24u', brand: 'Samsung', name: 'Galaxy S24 Ultra', aspect: 0.46, camera: SS_CAM },
  { id: 's24p', brand: 'Samsung', name: 'Galaxy S24+', aspect: 0.46, camera: SS_CAM },
  { id: 's24', brand: 'Samsung', name: 'Galaxy S24', aspect: 0.47, camera: SS_CAM },
  { id: 's23u', brand: 'Samsung', name: 'Galaxy S23 Ultra', aspect: 0.45, camera: SS_CAM },
  { id: 's23', brand: 'Samsung', name: 'Galaxy S23', aspect: 0.48, camera: SS_CAM },
  { id: 'a55', brand: 'Samsung', name: 'Galaxy A55 / A54', aspect: 0.47, camera: SS_CAM },
  // Case fits the phone closed (folded), which is nearly square — not the unfolded tall shape.
  { id: 'zflip5', brand: 'Samsung', name: 'Galaxy Z Flip 5', aspect: 0.84, camera: SS_CAM },
  { id: 'zfold5', brand: 'Samsung', name: 'Galaxy Z Fold 5', aspect: 0.44, camera: SS_CAM },
  // Google
  { id: 'pixel9p', brand: 'Google', name: 'Pixel 9 Pro', aspect: 0.47, camera: PIXEL_CAM },
  { id: 'pixel8pro', brand: 'Google', name: 'Pixel 8 Pro', aspect: 0.48, camera: PIXEL_CAM },
  { id: 'pixel8', brand: 'Google', name: 'Pixel 8 / 8a', aspect: 0.47, camera: PIXEL_CAM },
  { id: 'pixel7', brand: 'Google', name: 'Pixel 7', aspect: 0.48, camera: PIXEL_CAM },
  // Others
  { id: 'xiaomi14', brand: 'Xiaomi', name: 'Xiaomi 14', aspect: 0.46, camera: OTHER_CAM },
  { id: 'redmi13', brand: 'Xiaomi', name: 'Redmi Note 13', aspect: 0.46, camera: OTHER_CAM },
  { id: 'oneplus12', brand: 'OnePlus', name: 'OnePlus 12', aspect: 0.46, camera: OTHER_CAM },
  { id: 'oppo', brand: 'OPPO', name: 'Reno 11', aspect: 0.46, camera: OTHER_CAM },
];

export const backgrounds: CaseBackground[] = [
  { id: 'bubblegum', name: 'Bubblegum', colors: ['#FF7EC0', '#FF3E9A'] },
  { id: 'cotton', name: 'Cotton Candy', colors: ['#FFD6EC', '#C8B6FF'] },
  { id: 'sunset', name: 'K-Sunset', colors: ['#FFC3A0', '#FF5470'] },
  { id: 'midnight', name: 'Midnight Stan', colors: ['#2B1B3D', '#141018'] },
  { id: 'mint', name: 'Fresh Mint', colors: ['#B8F2E6', '#8ED1C6'] },
  { id: 'cream', name: 'Cream', colors: ['#FFF5FA', '#FFE9F4'] },
  { id: 'lilac', name: 'Lilac Dream', colors: ['#E4C1F9', '#B892FF'] },
  { id: 'solidpink', name: 'Hot Pink', colors: ['#FF3E9A', '#FF3E9A'] },
];

export const stickerPacks: StickerPack[] = [
  {
    id: 'hearts',
    name: 'Love',
    cover: '💗',
    stickers: [
      { id: 'h1', emoji: '💗' }, { id: 'h2', emoji: '💖' }, { id: 'h3', emoji: '❤️' },
      { id: 'h4', emoji: '🖤' }, { id: 'h5', emoji: '💕' }, { id: 'h6', emoji: '💝' },
      { id: 'h7', emoji: '😍' }, { id: 'h8', emoji: '🥰' }, { id: 'h9', emoji: '😘' },
    ],
  },
  {
    id: 'kpop',
    name: 'K-Pop',
    cover: '🎤',
    stickers: [
      { id: 'k1', emoji: '🎤' }, { id: 'k2', emoji: '🎧' }, { id: 'k3', emoji: '🎶' },
      { id: 'k4', emoji: '💿' }, { id: 'k5', emoji: '⭐' }, { id: 'k6', emoji: '🌟' },
      { id: 'k7', emoji: '👑' }, { id: 'k8', emoji: '💫' }, { id: 'k9', emoji: '🔥' },
    ],
  },
  {
    id: 'cute',
    name: 'Cutie',
    cover: '🐰',
    stickers: [
      { id: 'c1', emoji: '🐰' }, { id: 'c2', emoji: '🎀' }, { id: 'c3', emoji: '🌸' },
      { id: 'c4', emoji: '🍓' }, { id: 'c5', emoji: '🧸' }, { id: 'c6', emoji: '🍰' },
      { id: 'c7', emoji: '🦋' }, { id: 'c8', emoji: '🌈' }, { id: 'c9', emoji: '☁️' },
    ],
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    cover: '✨',
    stickers: [
      { id: 's1', emoji: '✨' }, { id: 's2', emoji: '💎' }, { id: 's3', emoji: '🌟' },
      { id: 's4', emoji: '⚡' }, { id: 's5', emoji: '🪩' }, { id: 's6', emoji: '💐' },
      { id: 's7', emoji: '🌷' }, { id: 's8', emoji: '🍭' }, { id: 's9', emoji: '🫧' },
    ],
  },
];

export const templates: Template[] = [
  {
    id: 't-stan',
    name: 'Stan 4 Life',
    tag: 'Trending',
    accent: '#FF3E9A',
    background: backgrounds[3],
    layers: [
      { kind: 'text', text: 'STAN\n4 LIFE', color: '#FF3E9A', fontSize: 46, fontWeight: '900', align: 'center', tx: 0, ty: -40, scale: 1, rotation: 0, z: 2 },
      { kind: 'sticker', emoji: '🖤', size: 60, tx: -70, ty: 90, scale: 1, rotation: -0.2, z: 1 },
      { kind: 'sticker', emoji: '⭐', size: 44, tx: 80, ty: -140, scale: 1, rotation: 0.3, z: 1 },
    ],
  },
  {
    id: 't-love',
    name: 'Love Print Stan',
    tag: 'Casey pick',
    accent: '#FF7EC0',
    background: backgrounds[0],
    layers: [
      { kind: 'text', text: 'love.\nprint.\nstan.', color: '#FFFFFF', fontSize: 40, fontWeight: '800', align: 'left', tx: -30, ty: 0, scale: 1, rotation: 0, z: 2 },
      { kind: 'sticker', emoji: '💗', size: 52, tx: 80, ty: -150, scale: 1, rotation: 0.1, z: 1 },
      { kind: 'sticker', emoji: '🐰', size: 64, tx: 70, ty: 150, scale: 1, rotation: 0, z: 1 },
    ],
  },
  {
    id: 't-bunny',
    name: 'Bunny Blush',
    tag: 'New',
    accent: '#C8B6FF',
    background: backgrounds[1],
    layers: [
      { kind: 'sticker', emoji: '🐰', size: 120, tx: 0, ty: -30, scale: 1, rotation: 0, z: 2 },
      { kind: 'text', text: 'be a cutie', color: '#D6006E', fontSize: 30, fontWeight: '800', align: 'center', tx: 0, ty: 110, scale: 1, rotation: 0, z: 2 },
      { kind: 'sticker', emoji: '🎀', size: 40, tx: -80, ty: -150, scale: 1, rotation: -0.3, z: 1 },
    ],
  },
  {
    id: 't-idol',
    name: 'Idol Frame',
    tag: 'Photo',
    accent: '#FF5470',
    background: backgrounds[2],
    layers: [
      { kind: 'text', text: '♡ my bias ♡', color: '#FFFFFF', fontSize: 26, fontWeight: '800', align: 'center', tx: 0, ty: 150, scale: 1, rotation: 0, z: 3 },
      { kind: 'sticker', emoji: '📸', size: 50, tx: 0, ty: -160, scale: 1, rotation: 0, z: 2 },
    ],
  },
];
