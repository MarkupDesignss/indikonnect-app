import React from 'react'
import IndieKonnectDiverSections from "@/features/promotion/screens/IndieKonnectDiverSections"
import IndieKonnectRecordBanner from "@/features/promotion/screens/IndieKonnectRecordBanner"
import ExploreCollection from "@/features/promotion/screens/ExploreCollection"
import DiveInFirst from "@/features/promotion/screens/DiveInFirst"
import FAQSection from "@/features/promotion/screens/FAQSection"
import Header from '@/components/common/Header'
import Footer from '@/components/Footer/Footer'

const Promotionmain = () => {
  return (
    <div>
      <Header />
      <IndieKonnectRecordBanner />
      <IndieKonnectDiverSections />
      <ExploreCollection />
      <DiveInFirst />
      <FAQSection />
      <Footer />
    </div>
  )
}

export default Promotionmain
