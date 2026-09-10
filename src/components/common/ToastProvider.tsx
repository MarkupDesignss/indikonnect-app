"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        zIndex: 2147483647,
      }}
      toastOptions={{
        duration: 3000,

        style: {
          background: "#ffffff",
          color: "#1f2937",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 500,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          zIndex: 2147483647,
        },

        success: {
          duration: 3000,
          style: {
            background: "#10B981",
            color: "#ffffff",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 2147483647,
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#10B981",
          },
        },

        error: {
          duration: 3000,
          style: {
            background: "#EF4444",
            color: "#ffffff",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 2147483647,
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#EF4444",
          },
        },
      }}
    />
  );
}