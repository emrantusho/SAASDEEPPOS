"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const POS_API =
  process.env.NEXT_PUBLIC_POS_API_URL || "https://saasdeep-pos.vercel.app";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw.split("").map((c) => c.charCodeAt(0)));
}

export function PushSubscribe({ userId }: { userId?: string }) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as string,
      });

      const subJSON = sub.toJSON();

      await fetch(`${POS_API}/api/public/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          p256dh: subJSON.keys!.p256dh,
          auth: subJSON.keys!.auth,
          userId,
        }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleSubscribe}
      disabled={subscribed || loading}
      className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      {subscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Notifications Enabled
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          {loading ? "Enabling..." : "Enable Notifications"}
        </>
      )}
    </button>
  );
}
