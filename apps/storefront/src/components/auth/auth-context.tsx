"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { toast } from "sonner";

const POS_API = process.env.NEXT_PUBLIC_POS_API_URL || "https://saasdeep-pos.vercel.app";
const USER_ID = process.env.NEXT_PUBLIC_POS_USER_ID || "";

interface Customer {
  id: number;
  name: string;
  phone: string;
  token: string;
}

interface CustomerAuthContextValue {
  customer: Customer | null;
  token: string | null;
  login: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);
const STORAGE_KEY = "storefront_customer_token";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setToken(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
      } catch {}
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetch(`${POS_API}/api/public/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, "X-User-Id": USER_ID },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.id) setCustomer(data);
        })
        .catch(() => {});
    }
  }, [token]);

  const login = useCallback(async (phone: string): Promise<boolean> => {
    try {
      const res = await fetch(`${POS_API}/api/public/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, userId: USER_ID }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to send OTP");
        return false;
      }
      toast.success("OTP sent successfully");
      return true;
    } catch (err) {
      toast.error("Network error");
      return false;
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    try {
      const res = await fetch(`${POS_API}/api/public/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, userId: USER_ID }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Invalid OTP");
        return false;
      }
      setToken(json.token);
      setCustomer(json.customer || { id: json.id, phone, name: "", token: json.token });
      toast.success("Logged in successfully");
      return true;
    } catch (err) {
      toast.error("Network error");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCustomer(null);
    toast.success("Logged out");
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{ customer, token, login, verifyOtp, logout, isLoggedIn: !!token }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
