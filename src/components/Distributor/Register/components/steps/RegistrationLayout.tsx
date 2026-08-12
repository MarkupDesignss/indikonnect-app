// components/distributor/registration/components/layout/RegistrationLayout.tsx

"use client";

import React from "react";
import { Logo } from "@/components/common/Logo";

interface RegistrationLayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
}

export const RegistrationLayout: React.FC<RegistrationLayoutProps> = ({
    children,
    showHeader = true,
}) => {
    return (
        <div className="min-h-screen flex bg-[#FAF8F4]">
            <LeftPanel />
            <RightPanel showHeader={showHeader}>{children}</RightPanel>
        </div>
    );
};

const LeftPanel = () => (
    <div className="hidden lg:flex lg:w-5/12 min-h-screen h-screen sticky top-0 relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-12 flex-col justify-between flex-shrink-0">
        {/* Rest of your left panel content remains the same */}
        <div className="absolute inset-0 opacity-[0.03]">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 50%, #F9C744 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
        </div>

        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#F9C744]/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#F9C744]/5 rounded-full blur-3xl" />

        <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.5); }
      }
    `}</style>

        <div className="absolute inset-0 opacity-10">
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

        <div className="relative z-10">
            <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                    <Logo width={32} height={32} showText={false} />
                </div>
                <span className="text-white/40 text-xs tracking-[0.2em] font-light">
                    INDIEKONNECT
                </span>
            </div>
        </div>

        <div className="relative z-10 max-w-sm mx-auto">
            <div className="space-y-8">
                <div className="w-16 h-1 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full" />

                <h2 className="text-white text-4xl font-bold leading-tight">
                    Become a<br />
                    <span className="text-[#F9C744]">Distributor</span>
                    <br />
                    <span className="text-2xl text-white/60 font-normal">
                        Partner with us
                    </span>
                </h2>

                <div className="space-y-4">
                    <p className="text-[#8291A6] text-sm leading-relaxed">
                        Join our network of trusted distributors. Access premium
                        products, competitive pricing, and dedicated support.
                    </p>

                    <div className="space-y-3 text-xs text-[#5C6B80]">
                        <div className="flex items-center gap-3 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                            <span>Access to 500+ brands</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                            <span>Competitive wholesale pricing</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                            <span>Marketing & sales support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-xs">
            <div>
                <p className="text-white font-semibold text-lg">500+</p>
                <p className="text-[#5C6B80]">Brands Available</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
                <p className="text-white font-semibold text-lg">200+</p>
                <p className="text-[#5C6B80]">Active Distributors</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
                <p className="text-white font-semibold text-lg">98%</p>
                <p className="text-[#5C6B80]">Satisfaction Rate</p>
            </div>
        </div>
    </div>
);

interface RightPanelProps {
    children: React.ReactNode;
    showHeader: boolean;
}

const RightPanel: React.FC<RightPanelProps> = ({ children, showHeader }) => (
    <div className="flex-1 overflow-y-auto h-screen py-6 lg:py-8 px-4">
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
            <div className="text-center text-xs text-gray-400 mt-6">
                <p>All information is secure and encrypted</p>
            </div>
        </div>
    </div>
);