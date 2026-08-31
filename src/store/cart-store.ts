"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  wood?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.id === item.id);
        const items = existing
          ? get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [...get().items, { ...item, quantity }];
        set({ items, isOpen: true });
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      updateQty: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "rax-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.price * i.quantity, 0));

export { FREE_SHIPPING_THRESHOLD };

export const useUiStore = create<{
  searchOpen: boolean;
  mobileOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}>((set) => ({
  searchOpen: false,
  mobileOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openMobile: () => set({ mobileOpen: true }),
  closeMobile: () => set({ mobileOpen: false }),
}));
