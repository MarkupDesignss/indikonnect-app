import React from 'react'
import IndieKonnectDiverSections from './IndieKonnectDiverSections'
import IndieKonnectRecordBanner from './IndieKonnectRecordBanner'
import ExploreCollection from './ExploreCollection'
import DiveInFirst from './DiveInFirst'
import FAQSection from './FAQSection'
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
