import { Suspense } from "react";
import CheckoutPage from "@/Screens/CheckoutPage/CheckoutPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading checkout...
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}