"use client";

import { useRef, useState } from "react";
import { Check, FileCheck2, ShieldCheck, UploadCloud, X } from "lucide-react";

const STEPS = ["Proof of identity", "Proof of address", "Upload document"];

const ADDRESS_FIELDS = [
    { key: "flat", label: "House / flat number", placeholder: "e.g. Flat 12B" },
    { key: "street", label: "Street", placeholder: "e.g. MG Road" },
    { key: "landmark", label: "Landmark", placeholder: "e.g. Near City Hospital" },
    { key: "pincode", label: "Area pincode", placeholder: "e.g. 110001" },
];

const KycForm = () => {
    const [step, setStep] = useState(0); // 0 = address, 1 = upload
    const [values, setValues] = useState({});
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const activeStepper = step === 0 ? 1 : 2;

    const handleChange = (key) => (e) =>
        setValues((prev) => ({ ...prev, [key]: e.target.value }));

    const handleFiles = (fileList) => {
        const picked = fileList?.[0];
        if (picked) setFile(picked);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="mx-auto w-full max-w-[980px]"
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
      `}</style>

            <div className="rounded-[20px] border border-[#e7e9ee] bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(14,27,61,0.18)] sm:p-10">
                {/* Header */}
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h1 className="text-[24px] font-black tracking-[-0.01em] text-[#101828]">
                        KYC verification
                        <span className="mx-2 font-light text-[#c1c6d0]">/</span>
                        <span className="font-normal text-[#667085]">Document upload</span>
                    </h1>
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-[#8a6a2f]">
                        <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
                        256-bit encrypted
                    </div>
                </div>

                {/* Stepper */}
                <div className="mt-10 flex items-center">
                    {STEPS.map((label, i) => {
                        const index = i + 1;
                        const isComplete = index < activeStepper;
                        const isActive = index === activeStepper;
                        return (
                            <div key={label} className="flex flex-1 items-center last:flex-none">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={[
                                            "flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-colors",
                                            isComplete
                                                ? "bg-[#0E1B3D] text-white"
                                                : isActive
                                                    ? "border-[2.5px] border-[#0E1B3D] bg-white text-[#0E1B3D]"
                                                    : "border-[2px] border-[#e2e5ec] bg-white text-[#b0b6c3]",
                                        ].join(" ")}
                                    >
                                        {isComplete ? <Check className="h-4 w-4" strokeWidth={3} /> : index}
                                    </div>
                                    <p
                                        className={[
                                            "mt-2 whitespace-nowrap text-[12.5px] font-semibold",
                                            isComplete || isActive ? "text-[#0E1B3D]" : "text-[#a4aab8]",
                                        ].join(" ")}
                                    >
                                        {label}
                                    </p>
                                </div>
                                {index !== STEPS.length && (
                                    <div
                                        className={[
                                            "mx-3 h-[2px] flex-1 rounded-full",
                                            index < activeStepper ? "bg-[#0E1B3D]" : "bg-[#e7e9ee]",
                                        ].join(" ")}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Main content */}
                <div className="mt-12 flex flex-col gap-10 lg:flex-row">
                    {/* Left form */}
                    <div className="flex-1">
                        {step === 0 ? (
                            <>
                                <h3 className="text-[17px] font-bold text-[#101828]">Proof of address</h3>
                                <p className="mt-1 text-[13.5px] text-[#667085]">
                                    Use the address exactly as it appears on your ID document.
                                </p>

                                <div className="mt-6 space-y-5">
                                    {ADDRESS_FIELDS.map((f) => (
                                        <div key={f.key}>
                                            <label className="text-[13.5px] font-semibold text-[#101828]">
                                                {f.label}
                                                <span className="ml-0.5 text-[#c0392b]">*</span>
                                            </label>
                                            <input
                                                value={values[f.key] || ""}
                                                onChange={handleChange(f.key)}
                                                placeholder={f.placeholder}
                                                className="mt-2 w-full rounded-[10px] border border-[#e2e5ec] bg-white px-4 py-3 text-[14px] text-[#101828] outline-none transition-colors placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10"
                                            />
                                        </div>
                                    ))}

                                    <div className="mt-8 flex gap-3">
                                        <button className="rounded-[10px] border border-[#e2e5ec] bg-white px-6 py-2.5 text-[14px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/30">
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="rounded-[10px] bg-[#0E1B3D] px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#132550] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/40"
                                        >
                                            Save &amp; continue
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-[17px] font-bold text-[#101828]">Upload ID proof</h3>
                                <p className="mt-1 text-[13.5px] text-[#667085]">
                                    Upload a clear, unedited copy of a government-issued document.
                                </p>

                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        handleFiles(e.dataTransfer.files);
                                    }}
                                    className={[
                                        "mt-5 rounded-[14px] border-2 border-dashed p-9 text-center transition-colors",
                                        isDragging
                                            ? "border-[#0E1B3D] bg-[#eef0f7]"
                                            : "border-[#dfe2ea] bg-[#fafbfc]",
                                    ].join(" ")}
                                >
                                    {file ? (
                                        <div className="flex items-center justify-between rounded-[10px] border border-[#e2e5ec] bg-white px-4 py-3 text-left">
                                            <div className="flex items-center gap-3">
                                                <FileCheck2 className="h-5 w-5 shrink-0 text-[#0E1B3D]" />
                                                <div>
                                                    <p className="text-[13.5px] font-semibold text-[#101828]">{file.name}</p>
                                                    <p className="text-[12px] text-[#8a92a6]">{formatSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFile(null)}
                                                aria-label="Remove file"
                                                className="rounded-full p-1.5 text-[#8a92a6] transition-colors hover:bg-[#f2f4f7] hover:text-[#101828]"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="mx-auto h-8 w-8 text-[#8a92a6]" strokeWidth={1.6} />
                                            <p className="mt-3 text-[14px] font-semibold text-[#101828]">
                                                Choose a file or drag it here
                                            </p>
                                            <button
                                                onClick={() => inputRef.current?.click()}
                                                className="mt-4 rounded-full bg-[#eef0f4] px-6 py-2 text-[13px] font-semibold text-[#101828] transition-colors hover:bg-[#e2e5ec]"
                                            >
                                                Browse file
                                            </button>
                                            <input
                                                ref={inputRef}
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.pdf"
                                                className="hidden"
                                                onChange={(e) => handleFiles(e.target.files)}
                                            />
                                            <p className="mt-3 text-[12px] text-[#8a92a6]">No file selected</p>
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 rounded-[12px] bg-[#f7f8fa] p-4">
                                    <p className="text-[13.5px] font-semibold text-[#101828]">
                                        Make sure the document clearly shows your photo, full name, date of birth and date of issue.
                                    </p>
                                    <ul className="mt-2 space-y-1 pl-4 text-[13px] text-[#667085]">
                                        <li className="list-disc">For passports, include the front page and signature page.</li>
                                        <li className="list-disc">Supported formats: PNG, JPG, PDF — up to 5 MB.</li>
                                    </ul>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setStep(0)}
                                        className="rounded-[10px] border border-[#e2e5ec] bg-white px-6 py-2.5 text-[14px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/30"
                                    >
                                        Back
                                    </button>
                                    <button
                                        disabled={!file}
                                        className="rounded-[10px] bg-[#0E1B3D] px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#132550] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/40 disabled:cursor-not-allowed disabled:bg-[#c1c6d0]"
                                    >
                                        Submit documents
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right preview */}
                    <div className="w-full shrink-0 lg:w-[300px]">
                        <div className="rounded-[18px] bg-gradient-to-br from-[#0E1B3D] to-[#1B2C5C] p-6">
                            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#B8935A]">
                                Document preview
                            </p>
                            <div className="mt-5 flex flex-col items-center justify-center rounded-[14px] bg-white/[0.06] py-10">
                                <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                                    <rect x="1" y="1" width="118" height="78" rx="10" stroke="#B8935A" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" />
                                    <circle cx="30" cy="34" r="14" fill="rgba(255,255,255,0.18)" />
                                    <rect x="54" y="24" width="52" height="6" rx="3" fill="rgba(255,255,255,0.22)" />
                                    <rect x="54" y="36" width="38" height="6" rx="3" fill="rgba(255,255,255,0.14)" />
                                    <rect x="16" y="58" width="88" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
                                </svg>
                            </div>
                            <p className="mt-5 text-[12.5px] leading-relaxed text-white/70">
                                Your document is only used to verify your identity and is stored securely.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycForm;