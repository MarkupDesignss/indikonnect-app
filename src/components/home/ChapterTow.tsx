"use client";

import { COLORS } from "@/lib/constants/colors";
import {
    getFont,
    FONT_WEIGHT,
} from "@/lib/constants/font-family";

export default function ChapterTwo() {
    return (
        <section
            className="relative overflow-hidden py-12 lg:py-18"
            style={{
                background: "#F8F5EE",
            }}
        >
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                {/* Chapter */}

                <div className="flex items-center gap-5 mb-8">

                    <div
                        className="w-10 h-[2px]"
                        style={{
                            background: COLORS.brand.gold,
                        }}
                    />

                    <span
                        className="uppercase tracking-[4px] text-[13px]"
                        style={{
                            color: "#B98A16",
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.medium,
                        }}
                    >
                        Chapter Two • The Meaning
                    </span>

                </div>

                {/* Heading */}

                <h2
                    className="max-w-[900px] leading-[0.92]"
                    style={{
                        fontFamily: getFont("cormorant"),
                        fontWeight: FONT_WEIGHT.regular,
                        fontSize: "clamp(40px,7vw,65px)",
                        color: "#111111",
                    }}
                >
                    So we built a{" "}

                    <span
                        style={{
                            color: "#c8940a",
                            fontStyle: "italic",
                        }}
                    >
                        doorway
                    </span>

                    ,<br />

                    and gave it a name.
                </h2>

                {/* Description */}

                <p
                    className="mt-8 max-w-[760px] text-[24px] leading-[1.5]"
                    style={{
                        color: "#575757",
                        fontFamily: getFont("jost"),
                        fontWeight: FONT_WEIGHT.regular,
                    }}
                >
                    Two ideas, one identity. The independent spirit of India,
                    bridged to the aspirations of every entrepreneur who dares
                    to rise.
                </p>

                {/* Cards */}

                <div className="mt-24 grid lg:grid-cols-[1fr_auto_1fr] gap-16 items-stretch">
                    {/* ================= LEFT CARD ================= */}

                    <div
                        className="relative rounded-[8px] overflow-hidden p-14 lg:p-16 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_80px_rgba(0,0,0,.15)]"
                        style={{
                            background: "#0a2240",
                            minHeight: "340px",
                        }}
                    >
                        <div>

                            <span
                                className="uppercase tracking-[4px] text-[13px]"
                                style={{
                                    color: "rgba(255,255,255,.65)",
                                    fontFamily: getFont("jost"),
                                    fontWeight: FONT_WEIGHT.medium,
                                }}
                            >
                                Part One
                            </span>

                            <h3
                                className="mt-3 italic"
                                style={{
                                    fontFamily: getFont("cormorant"),
                                    fontSize: "60px",
                                    lineHeight: 1,
                                    color: "#F5F2EC",
                                    fontWeight: FONT_WEIGHT.regular,
                                }}
                            >
                                Indie
                            </h3>

                        </div>

                        <p
                            className="max-w-[430px] text-[20px] leading-[1.5]"
                            style={{
                                color: "rgba(255,255,255,.88)",
                                fontFamily: getFont("jost"),
                            }}
                        >
                            The independent spirit of India. Its culture,
                            its people, and an ambition that has never
                            asked permission to exist.
                        </p>
                    </div>

                    {/* ================= CENTER ICON ================= */}

                    <div className="hidden lg:flex items-center justify-center">

                        <div
                            className="w-2 h-2 rotate-45"
                            style={{
                                background: COLORS.brand.gold,
                            }}
                        />

                    </div>

                    {/* ================= RIGHT CARD ================= */}

                    <div
                        className="relative rounded-[8px] overflow-hidden p-14 lg:p-16 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_80px_rgba(0,0,0,.15)]"
                        style={{
                            background: COLORS.brand.gold,
                            minHeight: "340px",
                        }}
                    >
                        <div>

                            <span
                                className="uppercase tracking-[4px] text-[13px]"
                                style={{
                                    color: "rgba(17,17,17,.55)",
                                    fontFamily: getFont("jost"),
                                    fontWeight: FONT_WEIGHT.medium,
                                }}
                            >
                                Part Two
                            </span>

                            <h3
                                className="mt-3 italic"
                                style={{
                                    fontFamily: getFont("cormorant"),
                                    fontSize: "60px",
                                    lineHeight: 1,
                                    color: "#243A56",
                                    fontWeight: FONT_WEIGHT.regular,
                                }}
                            >
                                Konnect
                            </h3>

                        </div>

                        <p
                            className="max-w-[430px] text-[20px] leading-[1.5]"
                            style={{
                                color: "#3D3D3D",
                                fontFamily: getFont("jost"),
                            }}
                        >
                            The bridge of opportunity. Our mission to close
                            the distance between world-class products and
                            the aspiring Indian entrepreneur.
                        </p>
                    </div>

                    {/* Background Glow */}
                    <div
                        className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 -z-10 hidden lg:block"
                        style={{
                            width: "720px",
                            height: "720px",
                            background:
                                "radial-gradient(circle, rgba(255,199,44,0.14) 0%, rgba(255,199,44,0.06) 35%, rgba(255,255,255,0) 75%)",
                            filter: "blur(20px)",
                        }}
                    />
                </div>

                {/* ================= BRAND NAME AT BOTTOM ================= */}

                <div className="mt-20 pt-12 pb-8 border-[#E5D6B1]/30 text-center">
                    <h3
                        className="tracking-[8px]"
                        style={{
                            fontFamily: getFont("cormorant"),
                            fontWeight: FONT_WEIGHT.regular,
                            fontSize: "clamp(42px,4.5vw,72px)",
                            letterSpacing: "0.15em",
                        }}
                    >
                        <span className="text-[#111111]">INDIE</span>
                        <span className="text-[#C9A227]">KONNECT</span>
                    </h3>

                    <p
                        className="mt-4 max-w-[480px] mx-auto text-[28px] leading-[1.5]"
                        style={{
                            color: "black",
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.regular,
                        }}
                    >
                        The brand is the identity. An institution built not around
                        individuals, but a collective vision of excellence.
                    </p>
                </div>

            </div>

            {/* Bottom Decoration */}
            <div
                className="absolute bottom-0 left-0 w-full h-[1px]"
                style={{
                    background:
                        "linear-gradient(90deg,transparent,#E5D6B1,transparent)",
                }}
            />

            {/* Background Blur Circles */}
            <div
                className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
                style={{
                    background: COLORS.brand.gold,
                }}
            />

            <div
                className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
                style={{
                    background: "#D7C4A3",
                }}
            />
        </section>
    );
}