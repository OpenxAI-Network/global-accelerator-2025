"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // stored in user metadata
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push("/"); // redirect to home
  };

  return (
    <section className="min-h-screen bg-[#0B1623] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111C2E] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Your Account
        </h1>
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0F1A2A] text-white border border-gray-600 focus:border-indigo-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>
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
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </section>
  );
}
