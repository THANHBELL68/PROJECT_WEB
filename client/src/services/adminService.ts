import { api, jsonBody } from './api';
import type { ApiEnvelope, OrderSummary } from '@/types/api';

export const adminService = {
  orders(token: string, params = '') { return api<ApiEnvelope<OrderSummary[]>>(`/api/admin/orders${params}`, {}, token); },
  order(token: string, id: string) { return api<ApiEnvelope<Record<string, unknown>>>(`/api/admin/orders/${id}`, {}, token); },
  confirm(token: string, id: string) { return api(`/api/admin/orders/${id}/confirm`, { method: 'POST' }, token); },
  cancel(token: string, id: string, reason: string) { return api(`/api/admin/orders/${id}/cancel`, jsonBody({ reason }), token); },
  updateStatus(token: string, id: string, status: string) { return api(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token); },
  inventory(token: string) { return api<ApiEnvelope<Record<string, unknown>[]>>('/api/admin/stock/inventory', {}, token); },
  stockDocuments(token: string) { return api<ApiEnvelope<Record<string, unknown>[]>>('/api/admin/stock/documents', {}, token); },
  createStockDocument(token: string, payload: unknown) { return api('/api/admin/stock/documents', jsonBody(payload), token); },
  products(token: string) { return api<ApiEnvelope<Record<string, unknown>[]>>('/api/admin/products', {}, token); },
  createProduct(token: string, payload: unknown) { return api('/api/admin/products', jsonBody(payload), token); },
  updateProduct(token: string, id: string, payload: unknown) { return api(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token); },
  updateVariant(token: string, id: string, payload: unknown) { return api(`/api/admin/products/variants/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token); },
  hideProduct(token: string, id: string) { return api(`/api/admin/products/${id}`, { method: 'DELETE' }, token); },
};
