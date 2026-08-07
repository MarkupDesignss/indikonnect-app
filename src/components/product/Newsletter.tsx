"use client";

import { useState, FormEvent } from "react";
import { NewsletterState } from "../../Screens/types/product";

export default function Newsletter(): JSX.Element {
  const [state, setState] = useState<NewsletterState>({
    email: "",
    isSubmitted: false,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (state.email) {
      setState({ email: "", isSubmitted: true });
      setTimeout(() => {
        setState((prev) => ({ ...prev, isSubmitted: false }));
      }, 3000);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setState((prev) => ({ ...prev, email: e.target.value }));
  };

  return (
    <section
      className="mt-12 md:mt-16 py-12 md:py-16 bg-gray-100 rounded-xl text-center"
      aria-label="Newsletter subscription"
    >
      <div className="max-w-md mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
          Inspiration, Delivered.
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Insights opportunities and product launches, straight to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="your@example.com"
              value={state.email}
              onChange={handleEmailChange}
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              aria-label="Email address"
              autoComplete="email"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
          {state.isSubmitted && (
            <div className="text-green-600 font-medium text-sm" role="alert">
              ✓ Subscribed successfully!
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
