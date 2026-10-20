import { api, jsonBody } from './api';
import type { ApiEnvelope, Cart, OrderSummary } from '@/types/api';

export const orderService = {
  cart(token: string) { return api<ApiEnvelope<Cart>>('/api/cart', {}, token); },
  addItem(token: string, variantId: string | number, quantity = 1) {
    return api<ApiEnvelope<Cart>>('/api/cart/items', jsonBody({ variantId: String(variantId), quantity }), token);
  },
  updateItem(token: string, itemId: string, quantity: number) {
    return api<ApiEnvelope<Cart>>(`/api/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }, token);
  },
  removeItem(token: string, itemId: string) {
    return api<ApiEnvelope<Cart>>(`/api/cart/items/${itemId}`, { method: 'DELETE' }, token);
  },
  checkout(token: string, payload: unknown) {
    return api<ApiEnvelope<{ id: string; orderCode: string; status: string; total: string }>>('/api/orders/checkout', jsonBody(payload), token);
  },
  orders(token: string) { return api<ApiEnvelope<OrderSummary[]>>('/api/orders', {}, token); },
};
