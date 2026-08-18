import Header from '@/components/common/Header'
import Footer from '@/components/Footer/Footer'
import { useGetContentsQuery } from '@/lib/redux/api/Home/contentApi'
import React from 'react'


const Footerpolicy = () => {
  return (
    <div>
      <Header />
  <div>
    <p>
      hello 
    </p>
  </div>
      <Footer />
    </div>
  )
}

export default Footerpolicy
