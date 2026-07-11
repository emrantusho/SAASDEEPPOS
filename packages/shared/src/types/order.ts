export interface OrderLineItem {
  productId: string;
  variantId?: string;
  title: string;
  quantity: number;
  price: number;
  image: string | null;
}

export interface OrderSubmitData {
  items: OrderLineItem[];
  total: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod: string;
  shippingAddress?: Record<string, string>;
}
