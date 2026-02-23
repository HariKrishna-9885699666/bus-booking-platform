"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Bus } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex">
      {/* Illustration / gradient side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[var(--primary,#e11d48)] via-rose-600 to-rose-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h2 className="text-3xl font-bold mb-4">Reset your password</h2>
          <p className="text-lg text-white/90 max-w-sm">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <Bus className="w-8 h-8 text-[var(--primary,#e11d48)] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-white group-hover:text-[var(--primary,#e11d48)] transition-colors">BusGo</span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">Forgot password</h1>
          <p className="text-zinc-400 mb-8">
            Remember your password?{" "}
            <Link href="/login" className="text-[var(--primary,#e11d48)] hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {submitted ? (
            <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <p className="font-medium">Reset link sent to your email</p>
              <p className="text-sm mt-1 text-emerald-400/80">
                Check your inbox for instructions to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary,#e11d48)] focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-[var(--primary,#e11d48)] text-white font-medium hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary,#e11d48)] focus:ring-offset-2 focus:ring-offset-zinc-950 transition"
              >
                Send reset link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
