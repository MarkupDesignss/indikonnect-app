"use client";

import { ImagePlus, Pencil, UserRound, X } from "lucide-react";
import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../Sidebar"; // apna sahi path use karo

// ---- Design tokens (same as Sidebar) ----
const NAVY = "#0E1B3D";
const EMERALD = "#1f9d6b";

const inputClass =
    "h-[42px] w-full rounded-[10px] bg-[#f7f8fa] border border-[#e9edf2] px-[14px] text-[13px] text-[#475066] outline-none placeholder:text-[#98a2b3] focus:bg-white focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10 transition-all";

const labelClass =
    "mb-[8px] block text-[12.5px] font-semibold text-[#475066]";

const sectionClass =
    "rounded-[12px] border border-[#e9edf2] bg-white p-[22px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

// ============================================
// SHARED COMPONENTS
// ============================================

function SectionHeader({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="mb-[18px] flex items-center gap-2.5 border-b border-[#e9edf2] pb-[14px]">
            <span
                className="h-4 w-1 rounded-full"
                style={{ backgroundColor: NAVY }}
            />
            <div>
                <h3 className="text-[14px] font-semibold text-[#101828]">{title}</h3>
                {subtitle && (
                    <p className="mt-[2px] text-[11.5px] text-[#98a2b3]">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

function SaveButton({
    text = "Save",
    onClick,
    disabled = false,
}: {
    text?: string;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={
                !disabled
                    ? {
                        backgroundColor: NAVY,
                        boxShadow: `0 8px 20px -8px ${NAVY}66`,
                    }
                    : undefined
            }
            className={`h-[38px] min-w-[80px] rounded-[10px] px-[20px] text-[12.5px] font-semibold text-white transition-all ${disabled
                    ? "bg-[#c1c6d0] cursor-not-allowed"
                    : "hover:brightness-110"
                }`}
        >
            {text}
        </button>
    );
}

function GhostButton({
    text,
    onClick,
}: {
    text: string;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="h-[38px] min-w-[80px] rounded-[10px] border border-[#e9edf2] bg-white px-[20px] text-[12.5px] font-semibold text-[#475066] hover:bg-[#f7f8fa] transition-colors"
        >
            {text}
        </button>
    );
}

// ============================================
// PROFILE SUMMARY (Sidebar-style card)
// ============================================

function ProfileSummary() {
    return (
        <div className={sectionClass}>
            <div className="flex items-center gap-3">
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: NAVY }}
                >
                    <UserRound className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-[#101828]">
                        SAURABH KAINTH
                    </p>
                    <p className="truncate text-[11.5px] text-[#98a2b3]">
                        Saurabh@gmail.com
                    </p>
                </div>
                <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: EMERALD }}
                />
            </div>

            <div className="mt-[18px] space-y-[14px] border-t border-dashed border-[#e9edf2] pt-[16px]">
                <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#98a2b3]">
                        Account ID
                    </p>
                    <p className="mt-[3px] text-[13px] font-semibold text-[#475066]">
                        AIA990011
                    </p>
                </div>
                <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#98a2b3]">
                        Rank
                    </p>
                    <p className="mt-[3px] text-[13px] font-semibold text-[#475066]">
                        Silver
                    </p>
                </div>
                <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#98a2b3]">
                        Status
                    </p>
                    <p
                        className="mt-[3px] flex items-center gap-2 text-[13px] font-semibold"
                        style={{ color: EMERALD }}
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: EMERALD }}
                        />
                        Activated
                    </p>
                </div>
            </div>
        </div>
    );
}

// ============================================
// PROFILE IMAGE CARD
// ============================================

function ProfileImageCard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }
            if (!file.type.startsWith("image/")) {
                setError("Please upload an image file");
                return;
            }
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (imagePreview) alert("Profile image saved successfully!");
        else setError("Please upload an image first");
    };

    return (
        <div className={sectionClass}>
            <h3 className="text-center text-[13px] font-semibold text-[#101828]">
                UPDATE PROFILE IMAGE
            </h3>

            <div className="mt-[16px] flex justify-center">
                <div className="relative cursor-pointer" onClick={handleImageClick}>
                    <div className="flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-full border-2 border-[#e9edf2] bg-[#f7f8fa] hover:border-[#0E1B3D] transition-all">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-end justify-center bg-[#f7f8fa]">
                                <UserRound size={70} strokeWidth={1} className="text-[#98a2b3]" />
                            </div>
                        )}
                    </div>

                    <button
                        className="absolute right-0 top-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 bg-white shadow-md transition-all"
                        style={{ borderColor: NAVY }}
                    >
                        <Pencil size={14} style={{ color: NAVY }} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {error && (
                <p className="mt-2 text-center text-[10.5px] text-red-500">{error}</p>
            )}

            <p className="mt-2 text-center text-[10.5px] text-[#98a2b3]">
                Click on image to upload (Max 5MB)
            </p>

            <div className="mt-[18px] flex justify-center gap-[8px]">
                <GhostButton
                    text="Cancel"
                    onClick={() => {
                        setImagePreview(null);
                        setError(null);
                    }}
                />
                <SaveButton text="Save" onClick={handleSave} />
            </div>
        </div>
    );
}

// ============================================
// PROFILE FORM
// ============================================

function ProfileForm() {
    const [formData, setFormData] = useState({
        fullName: "Saurabh Kainth",
        email: "Saurabh@gmail.com",
        country: "India",
        phone: "9654787899",
        idNumber: "123456789",
        passportNumber: "123456789",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateFullName = (name: string) => {
        if (!name) return "Full name is required";
        if (name.length < 2) return "Name must be at least 2 characters";
        return null;
    };
    const validateEmail = (email: string) => {
        if (!email) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
        return null;
    };
    const validateCountry = (c: string) => (!c ? "Country is required" : null);
    const validatePhone = (phone: string) => {
        if (!phone) return "Phone number is required";
        if (!/^\d{10}$/.test(phone)) return "Phone must be exactly 10 digits";
        return null;
    };
    const validateIdNumber = (id: string) => {
        if (!id) return "Identification number is required";
        if (id.length < 4) return "Must be at least 4 characters";
        return null;
    };
    const validatePassport = (p: string) => {
        if (!p) return "Passport number is required";
        if (p.length < 4) return "Must be at least 4 characters";
        return null;
    };

    const handleFieldChange = (
        field: string,
        value: string,
        validationFn?: (val: string) => string | null,
    ) => {
        setFormData({ ...formData, [field]: value });
        setTouched({ ...touched, [field]: true });
        if (validationFn) {
            const error = validationFn(value);
            setErrors({ ...errors, [field]: error || "" });
        }
    };

    const handleBlur = (
        field: string,
        validationFn?: (val: string) => string | null,
    ) => {
        setTouched({ ...touched, [field]: true });
        if (validationFn) {
            const error = validationFn(formData[field as keyof typeof formData]);
            setErrors({ ...errors, [field]: error || "" });
        }
    };

    const validateAll = () => {
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};

        const validations = {
            fullName: validateFullName,
            email: validateEmail,
            country: validateCountry,
            phone: validatePhone,
            idNumber: validateIdNumber,
            passportNumber: validatePassport,
        };

        Object.keys(validations).forEach((key) => {
            const value = formData[key as keyof typeof formData];
            const error = validations[key as keyof typeof validations](value);
            if (error) newErrors[key] = error;
            newTouched[key] = true;
        });

        setErrors(newErrors);
        setTouched(newTouched);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        setIsSubmitting(true);
        const isValid = validateAll();
        if (isValid) {
            setTimeout(() => {
                alert("Profile saved successfully!");
                setIsSubmitting(false);
            }, 500);
        } else {
            setIsSubmitting(false);
            alert("Please fix all errors before saving.");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <section className={sectionClass}>
            <SectionHeader title="Profile" subtitle="Manage your personal information" />

            <div className="space-y-[16px]">
                <div>
                    <label className={labelClass}>
                        Full Name<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                        value={formData.fullName}
                        onChange={(e) =>
                            handleFieldChange("fullName", e.target.value, validateFullName)
                        }
                        onBlur={() => handleBlur("fullName", validateFullName)}
                        onKeyDown={handleKeyDown}
                        className={`${inputClass} ${touched.fullName && errors.fullName
                                ? "border-red-500 ring-2 ring-red-500/10"
                                : ""
                            }`}
                    />
                    {touched.fullName && errors.fullName && (
                        <p className="mt-1 text-[10.5px] text-red-500">{errors.fullName}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        Email Address<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="flex gap-[10px]">
                        <div className="flex-1">
                            <input
                                value={formData.email}
                                onChange={(e) =>
                                    handleFieldChange("email", e.target.value, validateEmail)
                                }
                                onBlur={() => handleBlur("email", validateEmail)}
                                onKeyDown={handleKeyDown}
                                className={`${inputClass} ${touched.email && errors.email
                                        ? "border-red-500 ring-2 ring-red-500/10"
                                        : ""
                                    }`}
                            />
                            {touched.email && errors.email && (
                                <p className="mt-1 text-[10.5px] text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                const err = validateEmail(formData.email);
                                if (!err) alert("Email is valid!");
                                else {
                                    setErrors({ ...errors, email: err });
                                    setTouched({ ...touched, email: true });
                                }
                            }}
                            className="h-[42px] rounded-[10px] px-[18px] text-[12.5px] font-semibold text-white transition-all"
                            style={{
                                backgroundColor: NAVY,
                                boxShadow: `0 8px 20px -8px ${NAVY}66`,
                            }}
                        >
                            Check Email
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                        <label className={labelClass}>
                            Country<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            value={formData.country}
                            onChange={(e) =>
                                handleFieldChange("country", e.target.value, validateCountry)
                            }
                            onBlur={() => handleBlur("country", validateCountry)}
                            onKeyDown={handleKeyDown}
                            className={`${inputClass} ${touched.country && errors.country
                                    ? "border-red-500 ring-2 ring-red-500/10"
                                    : ""
                                }`}
                        />
                        {touched.country && errors.country && (
                            <p className="mt-1 text-[10.5px] text-red-500">
                                {errors.country}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Phone Number<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="flex gap-[10px]">
                            <input
                                value="+91"
                                disabled
                                className="h-[42px] w-[52px] rounded-[10px] bg-[#f2f4f7] border border-[#e9edf2] text-center text-[13px] font-semibold text-[#475066] outline-none"
                            />
                            <div className="flex-1">
                                <input
                                    value={formData.phone}
                                    onChange={(e) =>
                                        handleFieldChange("phone", e.target.value, validatePhone)
                                    }
                                    onBlur={() => handleBlur("phone", validatePhone)}
                                    onKeyDown={handleKeyDown}
                                    className={`${inputClass} ${touched.phone && errors.phone
                                            ? "border-red-500 ring-2 ring-red-500/10"
                                            : ""
                                        }`}
                                />
                                {touched.phone && errors.phone && (
                                    <p className="mt-1 text-[10.5px] text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                        <label className={labelClass}>
                            Identification Number<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            value={formData.idNumber}
                            onChange={(e) =>
                                handleFieldChange("idNumber", e.target.value, validateIdNumber)
                            }
                            onBlur={() => handleBlur("idNumber", validateIdNumber)}
                            onKeyDown={handleKeyDown}
                            className={`${inputClass} ${touched.idNumber && errors.idNumber
                                    ? "border-red-500 ring-2 ring-red-500/10"
                                    : ""
                                }`}
                        />
                        {touched.idNumber && errors.idNumber && (
                            <p className="mt-1 text-[10.5px] text-red-500">
                                {errors.idNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Passport Number<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            value={formData.passportNumber}
                            onChange={(e) =>
                                handleFieldChange(
                                    "passportNumber",
                                    e.target.value,
                                    validatePassport,
                                )
                            }
                            onBlur={() => handleBlur("passportNumber", validatePassport)}
                            onKeyDown={handleKeyDown}
                            className={`${inputClass} ${touched.passportNumber && errors.passportNumber
                                    ? "border-red-500 ring-2 ring-red-500/10"
                                    : ""
                                }`}
                        />
                        {touched.passportNumber && errors.passportNumber && (
                            <p className="mt-1 text-[10.5px] text-red-500">
                                {errors.passportNumber}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                    <ImageUploadBox label="Identification Card Image" />
                    <ImageUploadBox label="Passport Image" />
                </div>

                <ImageUploadBox label="Selfie Image" large />

                <div className="flex justify-end pt-[4px]">
                    <SaveButton onClick={handleSave} disabled={isSubmitting} />
                </div>
            </div>
        </section>
    );
}

// ============================================
// IMAGE UPLOAD BOX
// ============================================

function ImageUploadBox({
    label,
    large = false,
}: {
    label: string;
    large?: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <label className={labelClass}>{label}</label>
            <div
                onClick={handleClick}
                className={`relative flex ${large ? "h-[120px]" : "h-[110px]"
                    } items-center justify-center rounded-[10px] border-2 border-dashed border-[#e9edf2] bg-[#f7f8fa] hover:border-[#0E1B3D] hover:bg-[#f2f4f7] transition-all cursor-pointer`}
            >
                {imagePreview ? (
                    <img
                        src={imagePreview}
                        alt={label}
                        className="h-full w-full rounded-[10px] object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <ImagePlus size={26} className="text-[#98a2b3]" />
                        <p className="mt-2 text-[12px] font-semibold text-[#475066]">
                            Click to upload
                        </p>
                        <p className="text-[10.5px] text-[#98a2b3]">JPG, PNG (Max 5MB)</p>
                    </div>
                )}
                <button
                    className="absolute top-2 right-2 z-10 rounded-lg bg-white p-1.5 shadow-md hover:shadow-lg transition-all"
                    style={{ border: `1px solid ${NAVY}` }}
                >
                    <Pencil size={13} style={{ color: NAVY }} />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            {error && <p className="mt-1 text-[10.5px] text-red-500">{error}</p>}
        </div>
    );
}

// ============================================
// BENEFICIARY PROFILE
// ============================================

function BeneficiaryProfile() {
    const [beneficiaryName, setBeneficiaryName] = useState("Saurabh Kainth");
    const [error, setError] = useState<string | null>(null);

    const validateName = (name: string) => {
        if (!name) return "Full name is required";
        if (name.length < 2) return "Name must be at least 2 characters";
        return null;
    };

    const handleSave = () => {
        const err = validateName(beneficiaryName);
        if (err) setError(err);
        else {
            setError(null);
            alert("Beneficiary profile saved!");
        }
    };

    return (
        <section className={sectionClass}>
            <SectionHeader title="Beneficiary Profile" />
            <p className="-mt-[8px] mb-[16px] text-[11.5px] text-[#98a2b3]">
                Saurabh@gmail.com
            </p>

            <div>
                <label className={labelClass}>
                    Full Name<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                    value={beneficiaryName}
                    onChange={(e) => {
                        setBeneficiaryName(e.target.value);
                        setError(validateName(e.target.value));
                    }}
                    className={`${inputClass} ${error ? "border-red-500 ring-2 ring-red-500/10" : ""
                        }`}
                />
                {error && <p className="mt-1 text-[10.5px] text-red-500">{error}</p>}
                <div className="flex justify-end pt-[14px]">
                    <SaveButton onClick={handleSave} />
                </div>
            </div>
        </section>
    );
}

// ============================================
// BANK / WALLET DETAILS
// ============================================

function BankWalletDetails() {
    const [bankDetails, setBankDetails] = useState({
        swiftCode: "",
        bankName: "",
        bankAddress: "",
        accountName: "",
        accountNumber: "",
        usdtAddress: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState({
        bank: "",
        accountNumber: "",
        confirmAccountNumber: "",
    });
    const [popupErrors, setPopupErrors] = useState<Record<string, string>>({});

    const validateField = (value: string, fieldName: string) => {
        if (!value) return `${fieldName} is required`;
        if (value.length < 3) return `${fieldName} must be at least 3 characters`;
        return null;
    };

    const handleChange = (field: string, value: string) => {
        setBankDetails({ ...bankDetails, [field]: value });
        const err = validateField(value, field.replace(/([A-Z])/g, " $1").trim());
        setErrors({ ...errors, [field]: err || "" });
    };

    const handleSave = () => {
        const newErrors: Record<string, string> = {};
        Object.keys(bankDetails).forEach((key) => {
            const value = bankDetails[key as keyof typeof bankDetails];
            const err = validateField(value, key.replace(/([A-Z])/g, " $1").trim());
            if (err) newErrors[key] = err;
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            alert("Bank details saved successfully!");
        }
    };

    const validatePopup = () => {
        const newErrors: Record<string, string> = {};
        if (!popupData.bank) newErrors.bank = "Please select a bank";
        if (!popupData.accountNumber)
            newErrors.accountNumber = "Account number is required";
        if (popupData.accountNumber.length < 8)
            newErrors.accountNumber = "Account number must be at least 8 digits";
        if (!popupData.confirmAccountNumber)
            newErrors.confirmAccountNumber = "Please confirm account number";
        if (popupData.accountNumber !== popupData.confirmAccountNumber) {
            newErrors.confirmAccountNumber = "Account numbers do not match";
        }
        setPopupErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePopupSubmit = () => {
        if (validatePopup()) {
            setShowPopup(false);
            alert("Bank account change request submitted successfully!");
            setPopupData({ bank: "", accountNumber: "", confirmAccountNumber: "" });
            setPopupErrors({});
        }
    };

    return (
        <section className={sectionClass}>
            <SectionHeader title="Bank / Wallet Details" />

            <div className="space-y-[16px]">
                {(
                    [
                        ["swiftCode", "Bank SWIFT Code"],
                        ["bankName", "Bank Name"],
                        ["bankAddress", "Bank Address"],
                        ["accountName", "Account Name"],
                        ["accountNumber", "Account Number / IBAN"],
                        ["usdtAddress", "USDT Wallet Address"],
                    ] as const
                ).map(([key, label]) => (
                    <div key={key}>
                        <label className={labelClass}>{label}</label>
                        <input
                            value={bankDetails[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className={`${inputClass} ${errors[key] ? "border-red-500 ring-2 ring-red-500/10" : ""
                                }`}
                        />
                        {errors[key] && (
                            <p className="mt-1 text-[10.5px] text-red-500">{errors[key]}</p>
                        )}
                    </div>
                ))}

                <div className="flex justify-end gap-[10px] pt-[4px]">
                    <GhostButton text="Cancel" onClick={() => setShowPopup(true)} />
                    <SaveButton onClick={handleSave} />
                </div>
            </div>

            {showPopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                    onClick={() => setShowPopup(false)}
                >
                    <div
                        className="w-full max-w-[440px] mx-4 rounded-[12px] border border-[#e9edf2] bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-[#e9edf2] pb-3">
                            <h3 className="text-[16px] font-bold text-[#101828]">
                                Change Bank Account
                            </h3>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#98a2b3] hover:bg-[#f7f8fa] hover:text-[#101828] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-[12.5px] font-semibold text-[#475066]">
                                    Current Bank Account
                                </label>
                                <div className="rounded-[10px] border border-[#e9edf2] bg-[#f7f8fa] p-3 text-[13px] font-medium text-[#475066]">
                                    HDFC Bank - ****7890
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[12.5px] font-semibold text-[#475066]">
                                    New Bank Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={popupData.bank}
                                    onChange={(e) => {
                                        setPopupData({ ...popupData, bank: e.target.value });
                                        if (popupErrors.bank)
                                            setPopupErrors({ ...popupErrors, bank: "" });
                                    }}
                                    className={`h-[42px] w-full rounded-[10px] border ${popupErrors.bank ? "border-red-500" : "border-[#e9edf2]"
                                        } bg-[#f7f8fa] px-3 text-[13px] text-[#475066] outline-none focus:bg-white focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10 transition-all`}
                                >
                                    <option value="">Select Bank</option>
                                    <option value="hdfc">HDFC Bank</option>
                                    <option value="sbi">State Bank of India</option>
                                    <option value="icici">ICICI Bank</option>
                                    <option value="axis">Axis Bank</option>
                                    <option value="kotak">Kotak Mahindra Bank</option>
                                    <option value="yes">Yes Bank</option>
                                </select>
                                {popupErrors.bank && (
                                    <p className="mt-1 text-[10.5px] text-red-500">
                                        {popupErrors.bank}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[12.5px] font-semibold text-[#475066]">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter account number"
                                    value={popupData.accountNumber}
                                    onChange={(e) => {
                                        setPopupData({
                                            ...popupData,
                                            accountNumber: e.target.value,
                                        });
                                        if (popupErrors.accountNumber)
                                            setPopupErrors({ ...popupErrors, accountNumber: "" });
                                    }}
                                    className={`h-[42px] w-full rounded-[10px] border ${popupErrors.accountNumber
                                            ? "border-red-500"
                                            : "border-[#e9edf2]"
                                        } bg-[#f7f8fa] px-3 text-[13px] text-[#475066] outline-none placeholder:text-[#98a2b3] focus:bg-white focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10 transition-all`}
                                />
                                {popupErrors.accountNumber && (
                                    <p className="mt-1 text-[10.5px] text-red-500">
                                        {popupErrors.accountNumber}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[12.5px] font-semibold text-[#475066]">
                                    Confirm Account Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Re-enter account number"
                                    value={popupData.confirmAccountNumber}
                                    onChange={(e) => {
                                        setPopupData({
                                            ...popupData,
                                            confirmAccountNumber: e.target.value,
                                        });
                                        if (popupErrors.confirmAccountNumber)
                                            setPopupErrors({
                                                ...popupErrors,
                                                confirmAccountNumber: "",
                                            });
                                    }}
                                    className={`h-[42px] w-full rounded-[10px] border ${popupErrors.confirmAccountNumber
                                            ? "border-red-500"
                                            : "border-[#e9edf2]"
                                        } bg-[#f7f8fa] px-3 text-[13px] text-[#475066] outline-none placeholder:text-[#98a2b3] focus:bg-white focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10 transition-all`}
                                />
                                {popupErrors.confirmAccountNumber && (
                                    <p className="mt-1 text-[10.5px] text-red-500">
                                        {popupErrors.confirmAccountNumber}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-[10px] border border-[#e9edf2] bg-[#f7f8fa] p-3">
                                <p className="text-[11.5px] text-[#98a2b3]">
                                    <span className="font-semibold text-[#475066]">Note:</span>{" "}
                                    Changing bank account may take 24-48 hours to reflect in your
                                    profile.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <GhostButton
                                    text="Cancel"
                                    onClick={() => {
                                        setShowPopup(false);
                                        setPopupData({
                                            bank: "",
                                            accountNumber: "",
                                            confirmAccountNumber: "",
                                        });
                                        setPopupErrors({});
                                    }}
                                />
                                <SaveButton text="Submit" onClick={handlePopupSubmit} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

// ============================================
// ADDRESS
// ============================================

function AddressSection() {
    const [address, setAddress] = useState({
        street1: "",
        street2: "",
        city: "",
        state: "",
        postcode: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (value: string, fieldName: string) => {
        if (!value) return `${fieldName} is required`;
        if (value.length < 2) return `${fieldName} must be at least 2 characters`;
        return null;
    };

    const handleChange = (field: string, value: string) => {
        setAddress({ ...address, [field]: value });
        const err = validateField(
            value,
            field.charAt(0).toUpperCase() + field.slice(1),
        );
        setErrors({ ...errors, [field]: err || "" });
    };

    const handleSave = () => {
        const newErrors: Record<string, string> = {};
        Object.keys(address).forEach((key) => {
            const value = address[key as keyof typeof address];
            const err = validateField(
                value,
                key.charAt(0).toUpperCase() + key.slice(1),
            );
            if (err) newErrors[key] = err;
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            alert("Address saved successfully!");
        }
    };

    return (
        <section className={sectionClass}>
            <SectionHeader title="Address" />

            <div className="space-y-[16px]">
                <div>
                    <label className={labelClass}>Street Address 1</label>
                    <input
                        value={address.street1}
                        onChange={(e) => handleChange("street1", e.target.value)}
                        className={`${inputClass} ${errors.street1 ? "border-red-500 ring-2 ring-red-500/10" : ""
                            }`}
                    />
                    {errors.street1 && (
                        <p className="mt-1 text-[10.5px] text-red-500">{errors.street1}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Street Address 2</label>
                    <input
                        value={address.street2}
                        onChange={(e) => handleChange("street2", e.target.value)}
                        className={`${inputClass} ${errors.street2 ? "border-red-500 ring-2 ring-red-500/10" : ""
                            }`}
                    />
                    {errors.street2 && (
                        <p className="mt-1 text-[10.5px] text-red-500">{errors.street2}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>City</label>
                    <input
                        value={address.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className={`${inputClass} ${errors.city ? "border-red-500 ring-2 ring-red-500/10" : ""
                            }`}
                    />
                    {errors.city && (
                        <p className="mt-1 text-[10.5px] text-red-500">{errors.city}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                        <label className={labelClass}>State / Province</label>
                        <select
                            value={address.state}
                            onChange={(e) => handleChange("state", e.target.value)}
                            className={`${inputClass} ${errors.state ? "border-red-500 ring-2 ring-red-500/10" : ""
                                }`}
                        >
                            <option value="">Select</option>
                            <option value="California">California</option>
                            <option value="Texas">Texas</option>
                            <option value="New York">New York</option>
                            <option value="Florida">Florida</option>
                        </select>
                        {errors.state && (
                            <p className="mt-1 text-[10.5px] text-red-500">{errors.state}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Postcode</label>
                        <input
                            value={address.postcode}
                            onChange={(e) => handleChange("postcode", e.target.value)}
                            className={`${inputClass} ${errors.postcode ? "border-red-500 ring-2 ring-red-500/10" : ""
                                }`}
                        />
                        {errors.postcode && (
                            <p className="mt-1 text-[10.5px] text-red-500">
                                {errors.postcode}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-[4px]">
                    <SaveButton onClick={handleSave} />
                </div>
            </div>
        </section>
    );
}

// ============================================
// SECURITY
// ============================================

function SecuritySection() {
    const [security, setSecurity] = useState({
        password: "",
        confirmPassword: "",
        pin: "",
        confirmPin: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validatePassword = (value: string) => {
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
    };
    const validateConfirmPassword = (value: string) => {
        if (!value) return "Please confirm your password";
        if (value !== security.password) return "Passwords do not match";
        return null;
    };
    const validatePin = (value: string) => {
        if (!value) return "PIN is required";
        if (!/^\d{4}$/.test(value)) return "PIN must be exactly 4 digits";
        return null;
    };
    const validateConfirmPin = (value: string) => {
        if (!value) return "Please confirm your PIN";
        if (value !== security.pin) return "PINs do not match";
        return null;
    };

    const handleChange = (
        field: string,
        value: string,
        validationFn?: (val: string) => string | null,
    ) => {
        setSecurity({ ...security, [field]: value });
        if (validationFn) {
            const err = validationFn(value);
            setErrors({ ...errors, [field]: err || "" });
        }
    };

    const handleSave = () => {
        const newErrors: Record<string, string> = {};
        const passErr = validatePassword(security.password);
        if (passErr) newErrors.password = passErr;
        const confirmErr = validateConfirmPassword(security.confirmPassword);
        if (confirmErr) newErrors.confirmPassword = confirmErr;
        const pinErr = validatePin(security.pin);
        if (pinErr) newErrors.pin = pinErr;
        const confirmPinErr = validateConfirmPin(security.confirmPin);
        if (confirmPinErr) newErrors.confirmPin = confirmPinErr;
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            alert("Security settings saved successfully!");
        }
    };

    return (
        <section className={sectionClass}>
            <SectionHeader title="Security" />

            <div className="space-y-[16px]">
                <div>
                    <label className={labelClass}>New Password</label>
                    <input
                        type="password"
                        value={security.password}
                        onChange={(e) =>
                            handleChange("password", e.target.value, validatePassword)
                        }
                        placeholder="Enter new password"
                        className={`${inputClass} ${errors.password ? "border-red-500 ring-2 ring-red-500/10" : ""
                            }`}
                    />
                    {errors.password && (
                        <p className="mt-1 text-[10.5px] text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <input
                        type="password"
                        value={security.confirmPassword}
                        onChange={(e) =>
                            handleChange(
                                "confirmPassword",
                                e.target.value,
                                validateConfirmPassword,
                            )
                        }
                        placeholder="Confirm new password"
                        className={`${inputClass} ${errors.confirmPassword
                                ? "border-red-500 ring-2 ring-red-500/10"
                                : ""
                            }`}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-[10.5px] text-red-500">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>New PIN</label>
                    <input
                        type="password"
                        maxLength={4}
                        value={security.pin}
                        onChange={(e) => handleChange("pin", e.target.value, validatePin)}
                        placeholder="Enter new PIN (4 digits)"
                        className={`${inputClass} ${errors.pin ? "border-red-500 ring-2 ring-red-500/10" : ""
                            }`}
                    />
                    {errors.pin && (
                        <p className="mt-1 text-[10.5px] text-red-500">{errors.pin}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Confirm New PIN</label>
                    <input
                        type="password"
                        maxLength={4}
                        value={security.confirmPin}
                        onChange={(e) =>
                            handleChange("confirmPin", e.target.value, validateConfirmPin)
                        }
                        placeholder="Confirm new PIN"
                        className={`${inputClass} ${errors.confirmPin ? "border-red-500 ring-2 ring-red-500/10" : ""
                            }`}
                    />
                    {errors.confirmPin && (
                        <p className="mt-1 text-[10.5px] text-red-500">
                            {errors.confirmPin}
                        </p>
                    )}
                </div>

                <div className="flex justify-end pt-[4px]">
                    <SaveButton onClick={handleSave} />
                </div>
            </div>
        </section>
    );
}

// ============================================
// PAGE — same shell as WeeklyCommissionPage
// ============================================

export default function DistributorProfilePage() {
    return (
        <div
            className="min-h-screen w-full bg-white"
            style={{ fontFamily: "'Lato', sans-serif" }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
      `}</style>

            <div className="w-full h-full">
                <div className="w-full bg-white">
                    <DashboardHeader distributorId="AIA603525" />

                    <div className="flex min-h-[calc(100vh-72px)] relative">
                        <Sidebar />

                        <div className="min-w-0 flex-1 bg-[#fafcff] px-8 pt-6 pb-8">
                            {/* Page Header */}
                            <div className="mb-[22px] flex items-center gap-3">
                                <span
                                    className="h-6 w-1.5 rounded-full"
                                    style={{ backgroundColor: NAVY }}
                                />
                                <div>
                                    <h1 className="text-[20px] font-semibold text-[#101828]">
                                        My Profile
                                    </h1>
                                    <p className="text-[12px] text-[#98a2b3]">
                                        Manage your account, security and bank details
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-[220px_minmax(0,1fr)_300px] gap-[14px]">
                                {/* LEFT */}
                                <div className="space-y-[14px]">
                                    <ProfileSummary />
                                    <ProfileImageCard />
                                </div>

                                {/* CENTER */}
                                <div className="min-w-0">
                                    <ProfileForm />
                                </div>

                                {/* RIGHT */}
                                <div className="space-y-[14px]">
                                    <BeneficiaryProfile />
                                    <BankWalletDetails />
                                </div>
                            </div>

                            {/* Bottom sections */}
                            <div className="ml-[234px] mt-[14px] grid grid-cols-[minmax(0,1fr)_300px] gap-[14px]">
                                <AddressSection />
                                <SecuritySection />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}