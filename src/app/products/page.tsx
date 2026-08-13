// src/app/products/page.tsx
import { Suspense } from 'react';

// 🟢 CORRECT IMPORT: Main Products Page se import kar rahe hain
import ProductsPage from "../../Screens/Inner/product/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-gray-500">Loading products...</div>}>
      <ProductsPage />
    </Suspense>
  );
}