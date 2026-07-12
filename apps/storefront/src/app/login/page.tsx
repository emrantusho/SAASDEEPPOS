"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/auth/auth-context";
import { useT } from "@/lib/use-locale";
import { formatPhone, validateBDPhone } from "@/lib/phone-utils";
import { ArrowLeft, ArrowRight, Smartphone, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOtp, isLoggedIn } = useCustomerAuth();
  const t = useT();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formatted = formatPhone(phone);
    const validation = validateBDPhone(formatted);
    if (!validation.valid) {
      setError(validation.error || "Invalid phone number");
      return;
    }

    setLoading(true);
    const success = await login(formatted);
    setLoading(false);
    if (success) {
      setPhone(formatted);
      setStep(2);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setLoading(true);
    const success = await verifyOtp(phone, otp);
    setLoading(false);
    if (success) {
      router.push("/");
    }
  };

  if (isLoggedIn) {
    router.push("/");
    return null;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {step === 1 ? (
              <Smartphone className="h-6 w-6 text-primary" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === 1 ? "Login" : "Verify OTP"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 1
              ? "Enter your phone number to receive a code"
              : `Enter the 6-digit code sent to ${phone}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801XXXXXXXXX"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send OTP"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : "Verify & Login"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(""); setError(""); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Change phone number
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip & continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
