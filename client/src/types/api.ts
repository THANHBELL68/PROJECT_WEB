export type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export type User = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  roles: { code: string; name: string }[];
  permissions: string[];
};

export type ProductVariant = {
  id: number | string;
  sku: string;
  price: number | string;
  stock?: number;
  is_active?: boolean;
  sizes?: { id: number; name: string } | null;
  colors?: { id: number; name: string; hex_code?: string | null } | null;
  materials?: { id: number; name: string } | null;
};

export type Product = {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number | string;
  is_featured?: boolean;
  categories?: { id: number; name: string; slug: string };
  product_variants?: ProductVariant[];
  product_images?: { url: string; alt_text?: string | null; is_primary?: boolean }[];
};

export type CartItem = {
  id: number | string;
  variant_id: number | string;
  quantity: number;
  product_id: number | string;
  product_name: string;
  slug: string;
  sku: string;
  unit_price: string;
  variant_label: string;
  available_stock: number;
  line_total: string;
};

export type Cart = { cartId: string; items: CartItem[]; count: number; subtotal: number };

export type OrderSummary = {
  id: string;
  order_code: string;
  status: string;
  payment_method: string;
  payment_status?: string;
  total_amount?: string;
  item_count?: number;
  created_at?: string;
};
