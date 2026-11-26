"use client";

import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { LoaderProps, loaderAnimationData } from "@/components/ui/Spinner/Loader.parts/support";


export function Loader({
  className = "",
  width = 274,
  height = 290,
  loop = true,
  autoplay = true,
}: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Lottie animation
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay,
      animationData: loaderAnimationData,
    });

    animationRef.current = animation;

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [loop, autoplay]);

  return (
    <div
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffc72c", // White background
        borderRadius: "12px",       // Rounded corners
        padding: "30px",            // Container spacing
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)", // Subtle shadow
      }}
      className={`loader-container ${className}`}
    >
      {/* Lottie Animation */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: typeof width === "number" ? `${width}px` : width,
          maxHeight: typeof height === "number" ? `${height}px` : height,
        }}
      />
    </div>
  );
}

export default Loader;