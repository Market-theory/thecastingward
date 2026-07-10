"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.replace("/");
      router.refresh();
    } else {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Wrong password");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-garnet-800 px-6">
      <form onSubmit={submit} className="w-full max-w-xs text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brass-500 text-3xl font-semibold text-garnet-900 shadow-lg">
          W
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">The Casting Ward</h1>
        <p className="mt-1 text-sm text-white/60">Internal talent search</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-6 w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-brass-400"
        />
        {error && <p className="mt-3 text-sm text-brass-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 w-full rounded-xl bg-brass-500 py-3 font-semibold text-garnet-900 transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
