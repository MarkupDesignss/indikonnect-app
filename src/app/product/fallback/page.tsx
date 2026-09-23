"use client";

import { useEffect, useState } from "react";
import ProductDetail from "@/components/product/productDetail";
import Loader from "@/components/ui/Spinner/Loader";

/**
 * ============================================================
 * Product Fallback Page
 * ============================================================
 *
 * Yeh page un sab product URLs ko handle karta hai
 * jinki HTML file static export mein nahi bani.
 *
 * How it works:
 *   1. User visits /product/<slug>/
 *   2. Apache: /product/<slug>/index.html exist nahi karta
 *   3. .htaccess rewrite: /product/fallback/index.html
 *   4. Yeh page URL se slug nikalta hai
 *   5. ProductDetail component API call karta hai
 *   6. Product render ho jata hai
 *
 * Result: Naya product aane pe rebuild nahi chahiye.
 */
export default function ProductFallbackPage() {
    const [slug, setSlug] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const path = window.location.pathname;
            const parts = path.split("/").filter(Boolean);

            // Find "product" segment
            const productIdx = parts.indexOf("product");

            if (productIdx !== -1 && parts[productIdx + 1]) {
                const extracted = parts[productIdx + 1];

                // Skip if it's "fallback" itself
                if (extracted === "fallback") {
                    setError("No product slug in URL");
                    return;
                }

                setSlug(extracted);
            } else {
                setError("Invalid product URL");
            }
        } catch (err) {
            setError("Failed to parse URL");
        }
    }, []);

    // Loading state
    if (!slug && !error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <Loader width={200} height={200} />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="max-w-md px-4 text-center">
                    <div className="mb-4 text-6xl">🔍</div>
                    <h2 className="mb-3 text-2xl font-bold">Invalid Product URL</h2>
                    <p className="mb-6 text-sm text-[#777]">{error}</p>
                    <a
                        href="/products"
                        className="inline-block rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white"
                    >
                        Browse Products
                    </a>
                </div>
            </div>
        );
    }

    return <ProductDetail productSlug={slug!} />;
}