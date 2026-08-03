'use client';

import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/home/Hero/Hero';
import { useAuth } from '@/lib/store/hooks/useAuth';

export default function Home() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="min-h-screen">
            <Header />
            <Hero />

            {/* Additional sections can go here */}
            {/* Featured Products */}
            {/* Why Choose Us */}
            {/* Testimonials */}
            {/* Footer */}
        </div>
    );
}