// app/order-confirmation/page.tsx

import { Suspense } from "react";
import OrderConfirmationPage from "@/Screens/order-confirmation/OrderConfirmationPage";

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
        </div>
        <div className="h-8 w-48 bg-gray-100 rounded mx-auto mb-2 animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 rounded mx-auto mb-6 animate-pulse" />
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderConfirmationPage />
    </Suspense>
  );
}