// components/distributor/registration/LegalModal.tsx

"use client";

import React, { useEffect } from "react";
import { X, FileText } from "lucide-react";
import { LEGAL_DOCS, LegalType } from "./legalContent"

interface LegalModalProps {
    isOpen: boolean;
    type: LegalType | null;
    onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
    isOpen,
    type,
    onClose,
}) => {
    // Lock body scroll + handle ESC key
    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        const prevPosition = document.body.style.position;
        const prevTop = document.body.style.top;
        const prevWidth = document.body.style.width;

        const scrollY = window.scrollY;
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollY}px`;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.position = prevPosition;
            document.body.style.top = prevTop;
            document.body.style.width = prevWidth;
            window.scrollTo(0, scrollY);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !type) return null;

    const doc = LEGAL_DOCS[type];
    if (!doc) return null;

    return (
        <div
            // Backdrop with blur
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(6, 16, 30, 0.6)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
            }}
            onClick={(e) => {
                // Click on backdrop → close
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
        >
            {/* Modal Panel */}
            <div
                className="bg-white rounded-[20px] sm:rounded-[28px] shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] w-full max-w-2xl flex flex-col overflow-hidden"
                style={{
                    maxHeight: "90vh",
                    animation: "legalModalIn 0.2s ease-out",
                }}
            >
                {/* Header (sticky) */}
                <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 bg-white flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F9C744] via-[#E6B33D] to-[#C9922A] flex items-center justify-center shadow-md flex-shrink-0 text-[#06101E]">
                            {doc.icon}
                        </div>
                        <div className="min-w-0">
                            <h3
                                id="legal-modal-title"
                                className="text-base sm:text-lg font-bold text-[#06101E] truncate"
                            >
                                {doc.title}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                Last updated: {doc.lastUpdated}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#06101E] hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div
                    className="px-5 sm:px-7 py-5 sm:py-7 overflow-y-auto"
                    style={{ overscrollBehavior: "contain" }}
                >
                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 pb-6 border-b border-gray-100">
                        {doc.subtitle}
                    </p>

                    <div className="space-y-7 sm:space-y-8">
                        {doc.sections.map((section, idx) => (
                            <section key={idx}>
                                <h4 className="text-sm sm:text-base font-bold text-[#06101E] mb-2.5 flex items-start gap-2">
                                    <span className="inline-block w-1.5 h-5 bg-gradient-to-b from-[#F9C744] to-[#C9922A] rounded-full flex-shrink-0 mt-0.5" />
                                    {section.heading}
                                </h4>
                                <div className="space-y-2.5 pl-0 sm:pl-4">
                                    {section.body.map((para, pIdx) => (
                                        <p
                                            key={pIdx}
                                            className="text-xs sm:text-sm text-gray-600 leading-relaxed"
                                        >
                                            {para}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-8 pt-5 border-t border-gray-100 text-center">
                        <p className="text-[11px] sm:text-xs text-gray-400">
                            © {new Date().getFullYear()} IndieKonnect. All
                            rights reserved.
                        </p>
                    </div>
                </div>

                {/* Footer (sticky) */}
                <div className="flex justify-end gap-3 px-5 sm:px-7 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-[#F9C744] hover:bg-[#E6B33D] text-[#06101E] font-semibold px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Inline keyframes for modal entrance */}
            <style jsx global>{`
                @keyframes legalModalIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};