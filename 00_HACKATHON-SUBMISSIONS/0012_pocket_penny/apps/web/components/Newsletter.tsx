"use client";

import { useState } from "react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-white" id="newsletter">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold">Stay Updated</h2>
        <p className="mb-8 text-xl text-blue-100">
          Get the latest financial tips, market insights, and platform updates delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 rounded-lg border-2 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={isSubmitted}
            className="rounded-lg bg-orange-500 px-6 py-3 font-semibold transition-all duration-300 hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitted ? "Subscribed! ✓" : "Subscribe"}
          </button>
        </form>

        <p className="mt-4 text-sm text-blue-200">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  );
};
