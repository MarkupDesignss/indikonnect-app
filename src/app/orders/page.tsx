import { Suspense } from "react";
import Myorder from "../../Screens/order/page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <Myorder />
    </Suspense>
  );
}