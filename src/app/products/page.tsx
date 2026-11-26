// src/app/products/page.tsx
import { Suspense } from 'react';

// 🟢 CORRECT IMPORT: Main Products Page se import kar rahe hain
import ProductsPage from "@/features/products/screens/page";
import Loding from '@/components/common/Loding';

export default function Page() {
  return (
    <Suspense fallback={<Loding logoUrl={null} />}>
      <ProductsPage />
    </Suspense>
  );
}