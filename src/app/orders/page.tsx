import { Suspense } from "react";
import Myorder from "@/features/orders/screens/page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <Myorder />
    </Suspense>
  );
}