"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "same-origin",
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      let message = "Onjuist wachtwoord";
      try {
        const data = (await res.json()) as { error?: string };
        if (typeof data.error === "string" && data.error) {
          message = data.error;
        }
      } catch {
        /* use default */
      }
      setError(message);
    } catch {
      setError("Kon niet inloggen. Probeer het opnieuw.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#FAFAF7" }}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl border bg-white px-8 py-10 shadow-sm"
        style={{ borderColor: "#e8e6e1" }}
      >
        <p
          className="mb-6 text-center text-lg font-semibold tracking-tight text-[#1a1a1a]"
          style={{ fontFamily: "var(--font-dm-serif), serif" }}
        >
          PerfectSupplement
        </p>
        <h1
          className="mb-8 text-center text-2xl font-semibold text-[#1a1a1a]"
          style={{ fontFamily: "var(--font-dm-serif), serif" }}
        >
          Admin Dashboard
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full rounded-lg border border-[#e8e6e1] bg-white px-4 py-3 text-[#1a1a1a] outline-none ring-0 placeholder:text-[#999] focus:border-[#1a1a1a]"
          />
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg py-3 text-center text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            {pending ? "Bezig…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
