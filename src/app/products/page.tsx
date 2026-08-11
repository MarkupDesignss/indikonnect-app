import { Suspense } from 'react';
import Product from "../../Screens/Inner/product/page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <Product />
    </Suspense>
  );
}