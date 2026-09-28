
import FooterPolicyClient from './FooterPolicyClient'

export function generateStaticParams() {
  return [
    { slug: 'return-refund-policy' },
    { slug: 'privacy-policy' },
    { slug: 'terms-of-use' },
    { slug: 'cookie-preferences' },
    { slug: 'FAQs' },
  ]
}

export default function Page() {
  return <FooterPolicyClient />
}
