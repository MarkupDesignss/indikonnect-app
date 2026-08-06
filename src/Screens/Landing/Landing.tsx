"use client";

import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import BrandShowcase from "./Feature/BrandShowcase";
import FeaturedProducts from "./Feature/FeaturedProducts";
import { Banner } from "./Banner/Banner";
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
