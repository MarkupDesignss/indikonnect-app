"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#ffffff",
          color: "#1f2937",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        },
        success: {
          duration: 3000,
          style: {
            background: "#10B981",
            color: "#ffffff",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
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
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
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