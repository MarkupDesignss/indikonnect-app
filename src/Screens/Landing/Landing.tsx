// app/page.js (no "use client" needed)
import Banner from "@/components/home/Banner";
import Header from "../../components/Header";
import ChapterOne from "@/components/home/ChapterOne";
import ChapterTwo from "@/components/home/ChapterTow";
import CollectionsSection from "@/components/home/CollectionsSection";
import StandardSection from "@/components/home/StandardSection";
import ValuesSection from "@/components/home/ValuesSection";
import LevelsSection from "@/components/home/LevelsSection";
import Testimonials from "@/components/home/Testimonials";
import ComplianceSection from "@/components/home/ComplianceSection";
import LandingHeroSection from "@/components/home/LandingHeroSection";
import Newsletter from "@/components/product/Newsletter";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Banner />
      <ChapterOne />
      <ChapterTwo />
      <CollectionsSection />
      <StandardSection />
      <ValuesSection />
      <LevelsSection />
      <Testimonials />
      <ComplianceSection />
      <LandingHeroSection />
      <Newsletter />
      <Footer />
    </main>
  );
}