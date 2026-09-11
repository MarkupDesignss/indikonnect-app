"use client";

import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";

const EMERALD = "#1f9d6b";
const AMBER = "#B8935A";
const RED = "#DC2626";

const FontImport = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
    `}</style>
);

// Format ISO / "YYYY-MM-DD HH:mm:ss" to "21 Aug 2026"
function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr.replace(" ", "T"));
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

// Format with time → "21 Aug 2026, 11:45 AM"
function formatDateTime(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr.replace(" ", "T"));
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return "—";
    }
}

// Mask a string keeping only last N chars
function maskLast(value: string | number | null | undefined, lastN = 4) {
    if (value === null || value === undefined || value === "") return "—";
    const s = String(value);
    if (s.length <= lastN) return `XXXX ${s}`;
    return `XXXX XXXX ${s.slice(-lastN)}`;
}

// Mask phone: +9196541XXXXX → +91 96541 XXXXX
function maskPhone(phone: string | null | undefined) {
    if (!phone) return "—";
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.length < 6) return phone;
    return `${cleaned.slice(0, cleaned.length - 4)}XXXX`;
}

const KycStatus = () => {
    const { data, isLoading, isError, refetch } = useGetUserProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    // -------- Loading --------
    if (isLoading) {
        return (
            <div
                style={{ fontFamily: "'Lato', sans-serif" }}
                className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-8"
            >
                <FontImport />
                <div className="h-6 w-40 animate-pulse rounded bg-[#f2f4f7]" />
                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#f2f4f7]" />
                <div className="mt-8 h-64 animate-pulse rounded-[16px] bg-[#f7f8fa]" />
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="h-52 animate-pulse rounded-[16px] bg-[#f7f8fa]" />
                    <div className="h-52 animate-pulse rounded-[16px] bg-[#f7f8fa]" />
                </div>
            </div>
        );
    }

    // -------- Error --------
    if (isError || !data?.user) {
        return (
            <div
                style={{ fontFamily: "'Lato', sans-serif" }}
                className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-8"
            >
                <FontImport />
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-[#DC2626]" />
                    <p className="mt-4 text-[14px] font-semibold text-[#101828]">
                        Failed to load KYC status
                    </p>
                    <p className="mt-1 text-[13px] text-[#667085]">
                        Something went wrong while fetching your profile.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-5 rounded-[8px] bg-[#0E1B3D] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#1a2a54]"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // -------- Extract user & business profile --------
    const user = data.user;
    const bp = user.business_profile ?? {};

    // Determine overall KYC status
    const kycStatus: string = (bp.kyc_status || "").toLowerCase();
    const aadhaarVerified = !!bp.aadhaar_verified;
    const panVerified = !!bp.pan_verified;
    const bankVerified = !!bp.bank_verified;

    // Status meta
    const STATUS_META: Record<
        string,
        { label: string; color: string; bg: string; Icon: any; description: string; successMsg: string; successTitle: string }
    > = {
        verified: {
            label: "Completed",
            color: EMERALD,
            bg: "#eaf7f0",
            Icon: CheckCircle2,
            description:
                "Your KYC verification is complete. Thank you — your details have been verified successfully.",
            successTitle: "Great! Your KYC is completed",
            successMsg:
                "All your details have been verified successfully. You now have full access to all features.",
        },
        pending: {
            label: "Under Review",
            color: AMBER,
            bg: "#f8f1e4",
            Icon: Clock,
            description:
                "Your KYC verification is currently under review. This usually takes 24–48 hours.",
            successTitle: "KYC under review",
            successMsg:
                "We're reviewing your submitted documents. You'll be notified once the verification is complete.",
        },
        rejected: {
            label: "Rejected",
            color: RED,
            bg: "#fef2f2",
            Icon: XCircle,
            description:
                bp.rejection_reason
                    ? `Your KYC was rejected. Reason: ${bp.rejection_reason}`
                    : "Your KYC verification was rejected. Please re-submit with correct details.",
            successTitle: "KYC rejected",
            successMsg:
                bp.rejection_reason
                    ? `Reason: ${bp.rejection_reason}`
                    : "Please contact support or re-submit your KYC documents.",
        },
    };

    const status = STATUS_META[kycStatus] || STATUS_META.pending;
    const StatusIcon = status.Icon;

    // Build timeline dynamically based on available timestamps
    const timeline = [
        {
            label: "Submitted",
            date: formatDate(bp.submitted_at),
            done: !!bp.submitted_at,
        },
        {
            label: "Under review",
            date: formatDate(bp.submitted_at),
            done: !!bp.submitted_at,
        },
        {
            label: "In verification",
            date: formatDate(bp.aadhaar_verified_at || bp.pan_verified_at),
            done: aadhaarVerified || panVerified,
        },
        {
            label: status.label,
            date: formatDate(bp.reviewed_at || bp.updated_at || bp.submitted_at),
            done: kycStatus === "verified" || kycStatus === "rejected",
        },
    ];

    // Document rows
    const documents = [
        {
            label: "Aadhaar proof",
            status: aadhaarVerified ? "Verified" : "Pending",
            verified: aadhaarVerified,
            notApplicable: false,
        },
        {
            label: "PAN card",
            status: panVerified ? "Verified" : "Pending",
            verified: panVerified,
            notApplicable: false,
        },
        {
            label: "Bank account",
            status: bankVerified ? "Verified" : "Pending",
            verified: bankVerified,
            notApplicable: false,
        },
        {
            label: "Address proof",
            status: bp.location_consent ? "Verified" : "Not applicable",
            verified: !!bp.location_consent,
            notApplicable: !bp.location_consent,
        },
    ];

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-8"
        >
            <FontImport />

            <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828]">KYC status</h1>
            <p className="mt-1 text-[13.5px] text-[#667085]">
                Track and manage your KYC verification status.
            </p>

            {/* Main Status Card */}
            <div className="mt-8 rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-8">
                    <div>
                        <p className="text-[13.5px] font-semibold text-[#667085]">Overall KYC status</p>
                        <div className="mt-2 flex items-center gap-4">
                            <div
                                className="flex h-14 w-14 items-center justify-center rounded-full"
                                style={{ backgroundColor: status.bg }}
                            >
                                <StatusIcon className="h-7 w-7" style={{ color: status.color }} />
                            </div>
                            <h2 className="text-[26px] font-black" style={{ color: status.color }}>
                                {status.label}
                            </h2>
                        </div>
                        <p className="mt-4 max-w-[300px] text-[13px] text-[#667085]">
                            {status.description}
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-wrap items-center gap-3">
                        {timeline.map((item, index) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: item.done ? status.color : "#e7e9ee",
                                        }}
                                    >
                                        <CheckCircle2
                                            className="h-5 w-5"
                                            style={{ color: item.done ? "#ffffff" : "#98a2b3" }}
                                        />
                                    </div>
                                    <p className="mt-1 whitespace-nowrap text-[12px] font-semibold text-[#101828]">
                                        {item.label}
                                    </p>
                                    <p className="text-[11px] text-[#98a2b3]">{item.date}</p>
                                </div>
                                {index !== timeline.length - 1 && (
                                    <div
                                        className="h-[2px] w-10 rounded-full"
                                        style={{
                                            backgroundColor: timeline[index + 1].done
                                                ? status.color
                                                : "#e7e9ee",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success / Status Message */}
                <div className="mt-8 rounded-[14px] p-4" style={{ backgroundColor: status.bg }}>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                            <StatusIcon className="h-5 w-5" style={{ color: status.color }} />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold" style={{ color: status.color }}>
                                {status.successTitle}
                            </p>
                            <p className="mt-1 text-[13px] text-[#475066]">{status.successMsg}</p>
                        </div>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="mt-6 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#98a2b3]" />
                    <p className="text-[12px] text-[#98a2b3]">
                        Last updated: {formatDateTime(bp.updated_at || user.updated_at)}
                    </p>
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
                            <p className="text-[13.5px] font-semibold text-[#101828]">
                                KYC{String(user.id).padStart(10, "0")}
                            </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">Full name</p>
                            <p className="text-[13.5px] font-semibold text-[#101828] capitalize">
                                {user.full_name || "—"}
                            </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">Aadhaar number</p>
                            <p className="text-[13.5px] font-semibold text-[#101828]">
                                {maskLast(user.aadhaar_last4)}
                            </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">Mobile number</p>
                            <p className="text-[13.5px] font-semibold text-[#101828]">
                                {maskPhone(user.phone)}
                            </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[13.5px] text-[#667085]">PAN number</p>
                            <p className="text-[13.5px] font-semibold text-[#101828]">
                                {maskLast(user.pan_last4)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-[13.5px] font-semibold text-[#101828]">KYC status</p>
                        <p
                            className="text-[13.5px] font-semibold capitalize"
                            style={{ color: status.color }}
                        >
                            {status.label}
                        </p>
                    </div>
                </div>

                {/* Document Verification Status */}
                <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                    <h3 className="text-[16px] font-bold text-[#101828]">
                        Document verification status
                    </h3>
                    <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-3">
                        {documents.map((doc) => (
                            <div key={doc.label} className="flex items-center justify-between">
                                <p className="text-[13.5px] text-[#667085]">{doc.label}</p>
                                <p
                                    className="text-[13.5px] font-semibold"
                                    style={{
                                        color: doc.notApplicable
                                            ? "#98a2b3"
                                            : doc.verified
                                            ? EMERALD
                                            : AMBER,
                                    }}
                                >
                                    {doc.status}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-[13.5px] font-semibold text-[#101828]">Bank name</p>
                        <p className="text-[13.5px] font-semibold text-[#101828]">
                            {bp.bank_name || "—"}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-[13.5px] font-semibold text-[#101828]">Account type</p>
                        <p className="text-[13.5px] font-semibold capitalize text-[#101828]">
                            {bp.account_type || "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycStatus;