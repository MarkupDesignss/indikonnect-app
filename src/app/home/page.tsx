"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import Indie from "@/components/common/IndieKonnectHome/Home";

export default function HomePage() {
    const { hasToken } = useTokenCheck();
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // ✅ Token nahi hai to landing pe wapas
    useEffect(() => {
        if (!isClient || hasToken === null) return;

        if (hasToken !== true) {
            router.replace("/");
        }
    }, [isClient, hasToken, router]);

    if (!isClient || hasToken === null || hasToken !== true) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9C744]" />
            </div>
        );
    }

    return <Indie />;
}