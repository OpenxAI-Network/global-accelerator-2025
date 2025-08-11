"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const { error } = await res.json();
      setErrorMsg(error);
      return;
    }

    // Middleware will now have cookies and can redirect
    router.push("/");
  };

  return (
    <section className="min-h-screen bg-[#0B1623] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111C2E] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0F1A2A] text-white border border-gray-600 focus:border-indigo-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0F1A2A] text-white border border-gray-600 focus:border-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
          >
            Log In
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </div>
    </section>
  );
}
