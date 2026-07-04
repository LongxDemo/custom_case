import { create } from 'zustand';
import { BASE_PRICE_CENTS } from '../data/catalog';
import { CartItem, Design } from '../data/types';

let n = 0;
const cid = () => `c_${Date.now().toString(36)}_${(n++).toString(36)}`;

type CartState = {
  items: CartItem[];
  add: (design: Design, fulfillment: 'ship' | 'pickup') => void;
  remove: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotalCents: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],

  add: (design, fulfillment) =>
    set((s) => ({
      items: [
        ...s.items,
        { id: cid(), design, modelId: design.modelId, quantity: 1, priceCents: BASE_PRICE_CENTS, fulfillment },
      ],
    })),

  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  setQty: (id, quantity) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)),
    })),

  clear: () => set({ items: [] }),

  count: () => get().items.reduce((a, i) => a + i.quantity, 0),

  subtotalCents: () => get().items.reduce((a, i) => a + i.priceCents * i.quantity, 0),
}));

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
