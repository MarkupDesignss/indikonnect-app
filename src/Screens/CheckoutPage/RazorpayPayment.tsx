"use client";

import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function RazorpayPayment({
  amount,
  customerName,
  customerEmail,
  customerPhone,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);


      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/razorpay/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Unable to create order"
        );
      }

      const {
        order_id,
        amount: razorpayAmount,
        currency,
        key_id,
      } = orderData.data;

    
      const options = {
        key: key_id,

        amount: razorpayAmount,

        currency,

        name: "Your Store Name",

        description: "Order Payment",

        order_id,

        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },

        theme: {
          color: "#000000",
        },

        handler: async function (response: any) {
          console.log(
            "Razorpay Response:",
            response
          );


          try {
            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/payment/razorpay/verify`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              alert(
                verifyData.message ||
                  "Payment verification failed"
              );

              return;
            }
            console.log(
              "Payment successful:",
              verifyData
            );

            alert("Payment successful!");

            // Redirect to order confirmation
            // router.push(`/order-confirmation/${orderId}`);

          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            alert(
              "Payment verification failed"
            );
          }
        },

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay checkout closed"
            );

            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        alert(
          "Razorpay SDK is not loaded yet."
        );

        return;
      }

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "Payment Failed:",
            response.error
          );

          alert(
            response.error?.description ||
              "Payment failed"
          );

          setLoading(false);
        }
      );

      razorpay.open();

    } catch (error: any) {
      console.error(
        "Razorpay Error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : `Pay ₹${amount}`}
      </button>
    </>
  );
}