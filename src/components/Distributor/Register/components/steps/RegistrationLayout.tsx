// components/distributor/registration/components/layout/RegistrationLayout.tsx

"use client";

import React from "react";
import { Logo } from "@/components/common/Logo";
import ConstellationBackground from "@/components/common/ConstellationBackground";

interface RegistrationLayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
}

export const RegistrationLayout: React.FC<RegistrationLayoutProps> = ({
    children,
    showHeader = true,
}) => {
    return (
<<<<<<< Updated upstream
        <div className="fixed inset-0 flex bg-[#FAF8F4] overflow-hidden">
=======
        <div className="relative min-h-screen w-full overflow-hidden bg-[#060d1a] flex">

            {/* 1. FULL SCREEN CONSTELLATION BACKGROUND */}
            <ConstellationBackground
                className="absolute inset-0 -z-10"
                starColor="#F9C744"
                connectionColor="#4FC3F7"
            />

            {/* 2. LEFT PANEL - Completely transparent now! */}
>>>>>>> Stashed changes
            <LeftPanel />

            {/* 3. RIGHT PANEL - PURE WHITE */}
            <RightPanel showHeader={showHeader}>{children}</RightPanel>
        </div>
    );
};

const LeftPanel = () => (
<<<<<<< Updated upstream
    <div className="hidden lg:flex lg:w-5/12 h-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-12 flex-col justify-between relative">
        {/* Background patterns */}
=======
    <div className="hidden lg:flex lg:w-5/12 min-h-screen h-screen sticky top-0 relative overflow-hidden bg-transparent p-12 flex-col justify-between flex-shrink-0 z-10">

        {/* Optional subtle dark fade at the bottom so text is 100% readable */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#060d1a]/80 to-transparent pointer-events-none" />

        {/* Decorative elements (kept very minimal) */}
>>>>>>> Stashed changes
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 50%, #F9C744 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
        </div>

        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#F9C744]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#F9C744]/5 rounded-full blur-3xl pointer-events-none" />

<<<<<<< Updated upstream
        <style>{`
            @keyframes pulse {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.5); }
            }
        `}</style>

=======
>>>>>>> Stashed changes
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-[#F9C744] rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `pulse 3s ease-in-out ${Math.random() * 3}s infinite`,
                    }}
                />
            ))}
        </div>

<<<<<<< Updated upstream
        {/* Top Section - Logo */}
        <div className="relative z-10 flex-shrink-0">
=======
        <style>{`
            @keyframes pulse {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.5); }
            }
        `}</style>

        {/* Header */}
        <div className="relative z-10">
>>>>>>> Stashed changes
            <div className="flex items-center gap-3">
                <div className="bg-black/30 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                    <Logo width={32} height={32} showText={false} />
                </div>
                <span className="text-white/60 text-xs tracking-[0.2em] font-light">
                    INDIEKONNECT
                </span>
            </div>
        </div>

<<<<<<< Updated upstream
        {/* Middle Section - Content (centered) */}
        <div className="relative z-10 max-w-sm mx-auto flex-1 flex items-center">
            <div className="space-y-8 w-full">
=======
        {/* Main Content */}
        <div className="relative z-10 max-w-sm mx-auto">
            <div className="space-y-8">
>>>>>>> Stashed changes
                <div className="w-16 h-1 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full" />

                <h2 className="text-white text-4xl font-bold leading-tight drop-shadow-md">
                    Become a<br />
                    <span className="text-[#F9C744]">Distributor</span>
                    <br />
                    <span className="text-2xl text-white/80 font-normal drop-shadow-sm">
                        Partner with us
                    </span>
                </h2>

                <div className="space-y-4">
                    <p className="text-white/80 text-sm leading-relaxed drop-shadow-sm">
                        Join our network of trusted distributors. Access premium
                        products, competitive pricing, and dedicated support.
                    </p>

                    <div className="space-y-3 text-xs text-white/70">
                        <div className="flex items-center gap-3 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                            <span className="drop-shadow-sm">Access to 500+ brands</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                            <span className="drop-shadow-sm">Competitive wholesale pricing</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                            <span className="drop-shadow-sm">Marketing & sales support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

<<<<<<< Updated upstream
        {/* Bottom Section - Stats */}
        <div className="relative z-10 flex items-center gap-8 text-xs flex-shrink-0">
=======
        {/* Footer Stats */}
        <div className="relative z-10 flex items-center gap-8 text-xs">
>>>>>>> Stashed changes
            <div>
                <p className="text-white font-semibold text-lg drop-shadow-md">500+</p>
                <p className="text-white/60 drop-shadow-sm">Brands Available</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
                <p className="text-white font-semibold text-lg drop-shadow-md">200+</p>
                <p className="text-white/60 drop-shadow-sm">Active Distributors</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
                <p className="text-white font-semibold text-lg drop-shadow-md">98%</p>
                <p className="text-white/60 drop-shadow-sm">Satisfaction Rate</p>
            </div>
        </div>
    </div>
);

interface RightPanelProps {
    children: React.ReactNode;
    showHeader: boolean;
}

const RightPanel: React.FC<RightPanelProps> = ({ children, showHeader }) => (
<<<<<<< Updated upstream
    <div className="flex-1 h-full overflow-y-auto py-6 lg:py-8 px-4">
=======
    <div className="flex-1 overflow-y-auto h-screen py-6 lg:py-8 px-4 relative z-10 bg-white shadow-2xl">
>>>>>>> Stashed changes
        <div className="max-w-2xl mx-auto">
            {showHeader && (
                <div className="lg:hidden text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <Logo width={40} height={40} showText={false} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#06101E]">
                        Distributor Registration
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Complete all steps to become a Brand Affiliate
                    </p>
                </div>
            )}
            {children}
<<<<<<< Updated upstream
            <div className="text-center text-xs text-gray-400 mt-6">
                {/* Footer content */}
            </div>
=======
            <div className="text-center text-xs text-gray-400 mt-6"></div>
>>>>>>> Stashed changes
        </div>
    </div>
);

export default RegistrationLayout;