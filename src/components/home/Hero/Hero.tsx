"use client";

import Image from "next/image";
import Link from "next/link";
import Banner from "../../../../public/images/taj.jpeg";
import { COLORS } from "@/src/lib/constants/colors";

export function Hero() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* 1. The Sharp Background Image */}
            <Image
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
                src={Banner}
                alt="Description of the image"
            />

            {/* 2. The Text + Blur Container */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2, // Ensures this sits ON TOP of the image

                    // --- THE BLUR EFFECT ---
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)", // Essential for Safari

                    // --- OPTIONAL DARK OVERLAY ---
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                }}
            >
                <span
                    style={{
                        color: "white",
                        position: "absolute",
                        top: "20%",

                        transform: "translate(-50%, -50%)",
                        fontFamily: "Cormorant, serif",
                        fontSize: "150px",
                        fontWeight: "300",
                        height: "77.625px",
                        letterSpacing: "-0.32px",
                        lineHeight: "77.625px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        transform: "matrix(1, 0, 0, 1, 0, 0)",
                        transition: "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)",

                        WebkitFontSmoothing: "antialiased",
                    }}
                >
                    Art of
                </span>
                <span
                    style={{
                        color: COLORS.brand.gold,
                        position: "absolute",
                        top: "32%",
                        fontFamily: "Cormorant, serif",
                        fontSize: "150px",
                        fontWeight: "300",
                        height: "77.625px",
                        letterSpacing: "-0.32px",
                        lineHeight: "77.625px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        fontStyle: "italic",

                        WebkitFontSmoothing: "antialiased",
                    }}
                >
                    Opportunity
                </span>
                <p
                    style={{
                        color: "rgba(255, 255, 255, 0.85)",
                        display: "block",
                        fontFamily: "Jost, system-ui, sans-serif",
                        marginTop: "50px",
                        fontSize: "16px",
                        fontWeight: "300",
                        height: "81.5625px",
                        lineHeight: "27.2px",
                        marginBlockEnd: "34px",
                        textAlign: "center", // Added because centered text usually looks best here
                        maxWidth: "500px", // Added to keep the lines from getting too wide
                    }}
                >
                    A modern Indian movement built on Connection, Opportunity, Growth, and
                    Trust, where the spirit of 1.4 billion meets the power of
                    entrepreneurship.
                </p>
                <div style={{ flexDirection: "row", display: "flex", gap: "20px" }}>
                    <Link
                        href="/join"
                        style={{
                            // Layout & Display
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center", // Ensures text is perfectly centered
                            columnGap: "10px",
                            rowGap: "10px",
                            cursor: "pointer",

                            // Dimensions


                            paddingTop: "16px",
                            paddingBottom: "16px",
                            paddingLeft: "34px",
                            paddingRight: "34px",

                            // Color & Background
                            backgroundColor: "rgb(255, 199, 44)",
                            color: "rgb(10, 34, 64)",
                            backgroundImage: "none",
                            backgroundAttachment: "scroll",
                            backgroundClip: "border-box",
                            backgroundOrigin: "padding-box",
                            backgroundPositionX: "0%",
                            backgroundPositionY: "0%",
                            backgroundRepeat: "repeat",
                            backgroundSize: "auto",

                            // Border (Straight edges, no border-radius!)
                            borderTopColor: "rgb(255, 199, 44)",
                            borderRightColor: "rgb(255, 199, 44)",
                            borderBottomColor: "rgb(255, 199, 44)",
                            borderLeftColor: "rgb(255, 199, 44)",
                            borderTopStyle: "solid",
                            borderRightStyle: "solid",
                            borderBottomStyle: "solid",
                            borderLeftStyle: "solid",
                            borderTopWidth: "1px",
                            borderRightWidth: "1px",
                            borderBottomWidth: "1px",
                            borderLeftWidth: "1px",
                            borderImageSource: "none",
                            borderImageSlice: "100%",
                            borderImageWidth: "1",
                            borderImageOutset: "0",
                            borderImageRepeat: "stretch",

                            // Typography
                            textAlign: "center",
                            textDecoration: "none", // Use none to remove underline
                            textDecorationColor: "rgb(10, 34, 64)",
                            textDecorationLine: "none",
                            textDecorationStyle: "solid",
                            textDecorationThickness: "auto",
                            textTransform: "uppercase",
                            fontFamily: "Jost, sans-serif",
                            fontSize: "12px",
                            fontWeight: "500",
                            lineHeight: "20.4px",
                            letterSpacing: "2.64px",

                            // Interactions & Performance
                            transform: "none",
                            willChange: "transform",
                            transitionBehavior: "normal",
                            transitionDelay: "0s",
                            transitionDuration: "0.4s",
                            transitionProperty: "all",
                            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                            WebkitFontSmoothing: "antialiased",
                        }}
                        // Hover effect to match the transition property
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#e6b52a"; // Slightly darker yellow on hover
                            e.currentTarget.style.transform = "scale(1.05)"; // Slight pop effect
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgb(255, 199, 44)";
                            e.currentTarget.style.transform = "none";
                        }}
                    >
                        JOIN THE MOVEMENT →
                    </Link>
                    <Link
                        href="/join"
                        style={{
                            // Layout & Display
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center", // Ensures text is perfectly centered
                            columnGap: "10px",
                            rowGap: "10px",
                            cursor: "pointer",
                            fontWeight: "500",
                            // Dimensions


                            paddingTop: "16px",
                            paddingBottom: "16px",
                            paddingLeft: "34px",
                            paddingRight: "34px",

                            // Color & Background

                            color: '#FFF',
                            backgroundImage: "none",
                            backgroundAttachment: "scroll",
                            backgroundClip: "border-box",
                            backgroundOrigin: "padding-box",
                            backgroundPositionX: "0%",
                            backgroundPositionY: "0%",
                            backgroundRepeat: "repeat",
                            backgroundSize: "auto",

                            // Border (Straight edges, no border-radius!)

                            borderBottomColor: '#fff',



                            borderBottomWidth: "1.5px",




                            // Typography
                            textAlign: "center",

                            textTransform: "uppercase",
                            fontFamily: "Jost, sans-serif",
                            fontSize: "12px",

                            lineHeight: "20.4px",
                            letterSpacing: "2.64px",

                            // Interactions & Performance
                            transform: "none",
                            willChange: "transform",
                            transitionBehavior: "normal",
                            transitionDelay: "0s",
                            transitionDuration: "0.4s",
                            transitionProperty: "all",
                            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                            WebkitFontSmoothing: "antialiased",
                        }}

                    >
                        SHOP THE COLLECTIONS →
                       
                    </Link>
                </div>
            </div>
         <div style={{backgroundColor:'red'}}></div>
        </div>
    );
}
