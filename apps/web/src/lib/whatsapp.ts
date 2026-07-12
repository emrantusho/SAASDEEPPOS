const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const WHATSAPP_API = "https://graph.facebook.com/v18.0";

async function sendWhatsAppMessage(
  to: string,
  template: string,
  components: Record<string, string>[]
) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.warn("WhatsApp not configured, skipping message");
    return;
  }

  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: "bn" },
      components: components.map((c) => ({
        type: "body",
        parameters: Object.entries(c).map(([k, v]) => ({
          type: "text",
          parameter_name: k,
          text: v,
        })),
      })),
    },
  };

  const res = await fetch(
    `${WHATSAPP_API}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp API error:", err);
  }
}

export async function sendOrderConfirmation(
  phone: string,
  orderId: number,
  items: { name: string; quantity: number; price: number }[],
  total: number
) {
  const itemList = items
    .slice(0, 3)
    .map((i) => `${i.name} x${i.quantity}`)
    .join(", ");
  const summary =
    items.length > 3
      ? `${itemList} ও আরও ${items.length - 3}টি আইটেম`
      : itemList;

  await sendWhatsAppMessage(phone, "order_confirmation", [
    {
      order_id: `#${orderId}`,
      items: summary,
      total: `৳${(total / 100).toFixed(2)}`,
    },
  ]);
}

export async function sendOrderStatusUpdate(
  phone: string,
  orderId: number,
  status: string
) {
  const statusMap: Record<string, string> = {
    pending: "অপেক্ষমাণ",
    confirmed: "নিশ্চিত করা হয়েছে",
    preparing: "প্রস্তুত করা হচ্ছে",
    ready: "প্রস্তুত",
    delivered: "ডেলিভারি সম্পন্ন",
    cancelled: "বাতিল করা হয়েছে",
  };

  const bnStatus = statusMap[status] || status;

  await sendWhatsAppMessage(phone, "order_status_update", [
    {
      order_id: `#${orderId}`,
      status: bnStatus,
    },
  ]);
}
