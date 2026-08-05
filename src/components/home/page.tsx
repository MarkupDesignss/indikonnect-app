'use client';



import Footer from '../layout/Footer/Footer';
import Header from '../layout/Header/Header';
import BrandShowcase from './Feature/BrandShowcase';
import FeaturedProducts from './Feature/FeaturedProducts';
import { Banner } from './Hero/Banner';
export default function Home() {
    return (
        <div>
            <Header />
            <Banner />
            <BrandShowcase />
            <FeaturedProducts />
            <Footer />

        </div>
    );
}

