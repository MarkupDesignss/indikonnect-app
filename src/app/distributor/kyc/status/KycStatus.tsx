"use client";

import { CheckCircle2, Clock } from "lucide-react";

const NAVY = "#0E1B3D";
const EMERALD = "#1f9d6b";

const FontImport = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        /* In production, prefer next/font/google over a runtime @import for this. */
    `}</style>
);

const TIMELINE = [
    { label: "Submitted", date: "21 Aug 2026" },
    { label: "Under review", date: "21 Aug 2026" },
    { label: "In verification", date: "21 Aug 2026" },
    { label: "Completed", date: "21 Aug 2026" },
];

const KycStatus = () => {
    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-8"
        >
            <FontImport />

            <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828]">KYC status</h1>
            <p className="mt-1 text-[13.5px] text-[#667085]">Track and manage your KYC verification status.</p>

            {/* Main Status Card */}
            <div className="mt-8 rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                {/* Top Section */}
                <div className="flex flex-wrap items-start justify-between gap-8">
                    <div>
                        <p className="text-[13.5px] font-semibold text-[#667085]">Overall KYC status</p>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#eaf7f0" }}>
                                <CheckCircle2 className="h-7 w-7" style={{ color: EMERALD }} />
                            </div>
                            <h2 className="text-[26px] font-black" style={{ color: EMERALD }}>
                                Completed
                            </h2>
                        </div>
                        <p className="mt-4 max-w-[300px] text-[13px] text-[#667085]">
                            Your KYC verification is complete. Thank you — your details have been verified successfully.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-wrap items-center gap-3">
                        {TIMELINE.map((item, index) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: EMERALD }}>
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="mt-1 whitespace-nowrap text-[12px] font-semibold text-[#101828]">{item.label}</p>
                                    <p className="text-[11px] text-[#98a2b3]">{item.date}</p>
                                </div>
                                {index !== TIMELINE.length - 1 && (
                                    <div className="h-[2px] w-10 rounded-full" style={{ backgroundColor: EMERALD }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success Message */}
                <div className="mt-8 rounded-[14px] p-4" style={{ backgroundColor: "#eaf7f0" }}>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                            <CheckCircle2 className="h-5 w-5" style={{ color: EMERALD }} />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold" style={{ color: EMERALD }}>
                                Great! Your KYC is completed
                            </p>
                            <p className="mt-1 text-[13px] text-[#475066]">
                                All your details have been verified successfully. You now have full access to all features.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="mt-6 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#98a2b3]" />
                    <p className="text-[12px] text-[#98a2b3]">Last updated: 21 Aug 2026, 11:45 AM</p>
                </div>
            </div>

            {/* Bottom Cards */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* KYC Details */}
                <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                    <h3 className="text-[16px] font-bold text-[#101828]">KYC details</h3>
                    <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-3">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">Application ID</p>
                            <p className="text-[13.5px] font-semibold text-[#101828]">KYC0123456789</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">Full name</p>
                            <p className="text-[13.5px] font-semibold text-[#101828]">Saurabh Kainth</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">Aadhaar number</p>
                            <p className="text-[13.5px] font-semibold text-[#101828]">XXXX XXXX 1234</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">Mobile number</p>
                            <p className="text-[13.5px] font-semibold text-[#101828]">+91 96541 XXXXX</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-[13.5px] font-semibold text-[#101828]">KYC status</p>
                        <p className="text-[13.5px] font-semibold" style={{ color: EMERALD }}>
                            Completed
                        </p>
                    </div>
                </div>

                {/* Document Verification Status */}
                <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                    <h3 className="text-[16px] font-bold text-[#101828]">Document verification status</h3>
                    <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[13.5px] text-[#667085]">Aadhaar proof</p>
                            <p className="text-[13.5px] font-semibold" style={{ color: EMERALD }}>
                                Verified
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[13.5px] text-[#667085]">Address proof</p>
                            <p className="text-[13.5px] font-semibold" style={{ color: EMERALD }}>
                                Verified
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[13.5px] text-[#667085]">Driving license</p>
                            <p className="text-[13.5px] font-semibold text-[#98a2b3]">Not applicable</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-[13.5px] font-semibold text-[#101828]">PAN number</p>
                        <p className="text-[13.5px] font-semibold text-[#98a2b3]">Not applicable</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycStatus;