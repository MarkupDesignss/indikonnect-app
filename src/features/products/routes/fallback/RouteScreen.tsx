"use client";

import { useHydrated } from "@/lib/hooks/useHydrated";
import ProductDetail from "@/features/products/components/productDetail";
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
    const hydrated = useHydrated();
    let slug: string | null = null;
    let error: string | null = null;
    if (hydrated) {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const productIdx = parts.indexOf("product");
        const extracted = productIdx >= 0 ? parts[productIdx + 1] : undefined;
        if (!extracted) error = "Invalid product URL";
        else if (extracted === "fallback") error = "No product slug in URL";
        else slug = extracted;
    }

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