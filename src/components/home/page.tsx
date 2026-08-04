'use client';

import { Header } from '../../../src/components/layout/Header/Header';
import { Hero } from '../../../src/components/home/Hero/Hero'
import { FeaturedProducts } from '../../../src/components/home/Feature/Hero'
export default function Home() {
    return (
        <div>
            <Header />
            <Hero />
            <FeaturedProducts />
        </div>
    );
}

