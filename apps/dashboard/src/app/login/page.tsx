"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    if (!supabase || !isSupabaseConfigured) {
      setMsg("Supabase not configured — entering local studio mode.");
      setTimeout(() => router.push("/command-center"), 800);
      setLoading(false);
      return;
    }
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Check your email to confirm, or continue if confirmations are disabled.");
      }
      router.push("/command-center");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--red)] grid place-items-center">
            <Radio size={20} />
          </div>
          <div>
            <p className="font-bold text-lg">
              TIKCAST <span className="text-[var(--red)]">LIVE</span>
            </p>
            <p className="text-[11px] text-[var(--muted)] tracking-widest">STUDIO LOGIN</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--cyan)] text-black font-bold py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        {msg && <p className="mt-3 text-sm text-cyan-200">{msg}</p>}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-[var(--muted)] hover:text-white"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <Link
          href="/command-center"
          className="block mt-4 text-center text-sm font-bold text-[var(--red)]"
        >
          Skip → open Command Center
        </Link>
      </div>
    </div>
  );
}
