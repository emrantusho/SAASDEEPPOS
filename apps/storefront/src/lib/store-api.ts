const POS_API = process.env.NEXT_PUBLIC_POS_API_URL || "https://saasdeep-pos.vercel.app";

export interface StoreSettings {
  store_name: string;
  store_description: string;
  logo_url: string;
  favicon_url: string;
  footer_text: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  currency: string;
  locale: string;
  payment_methods: string[];
  delivery_fee: number;
  free_delivery_min: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  in_stock: number;
  category: string | null;
  images: Array<{ url: string; altText?: string }>;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface OrderTracking {
  id: number;
  status: string;
  total_amount: number;
  order_type: string;
  customer_name: string | null;
  customer_phone: string | null;
  table_number: string | null;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  items: Array<{
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
  }>;
}

const USER_ID = process.env.NEXT_PUBLIC_POS_USER_ID || "";

function apiUrl(path: string, params?: Record<string, string>) {
  const url = new URL(`${POS_API}/api/public${path}`);
  url.searchParams.set("userId", USER_ID);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getStoreSettings(): Promise<StoreSettings> {
  return fetchJson<StoreSettings>(apiUrl("/store"));
}

export async function getProducts(featured?: boolean, category?: string, q?: string): Promise<Product[]> {
  return fetchJson<Product[]>(apiUrl("/products", {
    ...(featured ? { featured: "true" } : {}),
    ...(category ? { category } : {}),
    ...(q ? { q } : {}),
  }));
}

export async function getProduct(idOrSlug: string): Promise<Product> {
  return fetchJson<Product>(apiUrl(`/products/${encodeURIComponent(idOrSlug)}`));
}

export async function getCategories(): Promise<Category[]> {
  return fetchJson<Category[]>(apiUrl("/categories"));
}

export async function getOrder(id: number): Promise<OrderTracking> {
  return fetchJson<OrderTracking>(`${POS_API}/api/public/orders/${id}?userId=${USER_ID}`);
}

export async function submitOrder(data: {
  items: Array<{ productId: number; quantity: number; price: number }>;
  total: number;
  currency: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
  orderType?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  notes?: string;
}): Promise<{ success: boolean; orderId?: number; status?: string; error?: string }> {
  try {
    const res = await fetch(`${POS_API}/api/public/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, userId: USER_ID }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || "Checkout failed" };
    return { success: true, orderId: json.orderId, status: json.status };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
