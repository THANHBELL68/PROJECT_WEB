import { api } from './api';
import type { Product } from '@/types/api';

export const productService = {
  async list(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return api<{ success: boolean; data: Product[]; count: number }>(`/api/products${query ? `?${query}` : ''}`);
  },
  async get(id: string) {
    return api<{ success: boolean; data: Product }>(`/api/products/${encodeURIComponent(id)}`);
  },
};
