import { Suspense } from "react";
import CheckoutPage from "@/Screens/CheckoutPage/CheckoutPage";
import Loding from "@/components/common/Loding";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center bg-white justify-center">
          <Loding />
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}