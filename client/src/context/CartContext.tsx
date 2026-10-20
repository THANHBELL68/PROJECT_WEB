'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { orderService } from '@/services/orderService';
import { useAuth } from './AuthContext';

type CartContextValue = { count: number; syncing: boolean; refresh: () => Promise<void>; add: (variantId: string | number) => Promise<void> };
const CartContext = createContext<CartContextValue | null>(null);
const GUEST_CART_KEY = 'aether.guest-cart';

function readGuestCart(): { variantId: string; quantity: number }[] {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? '[]'); } catch { return []; }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, loading: authLoading } = useAuth();
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(true);
  const syncInFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    if (token) {
      try { const response = await orderService.cart(token); setCount(response.data.count); }
      catch { setCount(0); }
    } else {
      setCount(readGuestCart().reduce((sum, item) => sum + item.quantity, 0));
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (authLoading) { setSyncing(true); return; }
    if (syncInFlight.current) return;
    syncInFlight.current = true;
    const sync = async () => {
      setSyncing(true);
      try {
        if (token) {
          const pending = readGuestCart();
          for (const item of pending) {
            try {
              await orderService.addItem(token, item.variantId, item.quantity);
              const remaining = readGuestCart().filter((row) => row.variantId !== item.variantId);
              localStorage.setItem(GUEST_CART_KEY, JSON.stringify(remaining));
            } catch {
              break;
            }
          }
        }
        await refresh();
      } finally {
        syncInFlight.current = false;
        setSyncing(false);
      }
    };
    void sync();
  }, [token, authLoading, refresh]);

  const add = useCallback(async (variantId: string | number) => {
    if (token) {
      const response = await orderService.addItem(token, variantId, 1);
      setCount(response.data.count);
    } else {
      const cart = readGuestCart();
      const id = String(variantId);
      const existing = cart.find((item) => item.variantId === id);
      if (existing) existing.quantity += 1;
      else cart.push({ variantId: id, quantity: 1 });
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      setCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    }
  }, [token]);

  const value = useMemo(() => ({ count, syncing, refresh, add }), [count, syncing, refresh, add]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
