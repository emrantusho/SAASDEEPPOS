"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function OrderLookupPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/order/${orderId.trim()}`);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">Track Your Order</h1>
      <p className="text-muted-foreground mb-6">Enter your order number to track it</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order #"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
