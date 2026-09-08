"use client";

import {
    ChevronDown,
    Edit3, // (Agar use ho raha hai)
    ImagePlus,
    Pencil,
    UserRound,
    X,
} from "lucide-react";
import { useState, useRef, ChangeEvent, KeyboardEvent, FormEvent } from "react";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
// ✅ Ab hum common Sidebar import kar rahe hain
import Sidebar from "../Sidebar";

const inputClass =
    "h-[40px] w-full rounded-[6px] bg-[#eeeeee] px-[12px] text-[12px] text-[#555] outline-none placeholder:text-[#777] focus:ring-2 focus:ring-[#3964FE] transition-all";

const labelClass = "mb-[6px] block text-[12px] font-medium text-[#1e1e1e]";

const sectionClass = "rounded-[8px] border border-[#edf0f3] bg-white p-[20px]";

// ============================================
// PROFILE COMPONENTS - Full Validation
// ============================================

interface FieldProps {
    label: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    onChange?: (value: string) => void;
    onEnter?: () => void;
    validation?: (value: string) => string | null;
    type?: string;
    min?: string;
    max?: string;
}

function Field({
    label,
    value = "",
    placeholder = "",
    required = false,
    disabled = false,
    className = "",
    onChange,
    onEnter,
    validation,
    type = "text",
    min,
    max,
}: FieldProps) {
    const [error, setError] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState(value);
    const [touched, setTouched] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setTouched(true);

        if (validation) {
            const err = validation(newValue);
            setError(err);
        }

        if (onChange) {
            onChange(newValue);
        }
    };

    const handleBlur = () => {
        setTouched(true);
        if (validation && inputValue) {
            const err = validation(inputValue);
            setError(err);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
        }
    };

    const showError = touched && error;

    return (
        <div className={className}>
            <label className={labelClass}>
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            <input
                disabled={disabled}
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                type={type}
                min={min}
                max={max}
                className={`${inputClass} ${disabled ? "cursor-default text-[#777] bg-[#e8e8e8]" : "bg-[#eeeeee]"
                    } ${showError ? "border-2 border-red-500" : ""}`}
            />
            {showError && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
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
            className={`h-[34px] min-w-[60px] rounded-[6px] px-[18px] text-[12px] font-medium text-white shadow-md shadow-[#3964FE]/30 transition-all ${disabled
                    ? "bg-[#999] cursor-not-allowed"
                    : "bg-[#3964FE] hover:bg-[#2a4fd8] hover:shadow-lg hover:shadow-[#3964FE]/40"
                }`}
        >
            {text}
        </button>
    );
}

function ProfileSummary() {
    return (
        <div className="rounded-[8px] border border-[#edf0f3] bg-white p-[20px]">
            <div className="border-b border-dashed border-[#d9dce1] pb-[14px]">
                <p className="text-[14px] font-semibold text-[#252a30]">
                    SAURABH KAINTH
                </p>

                <p className="mt-[3px] text-[12px] text-[#777]">Saurabh@gmail.com</p>
            </div>

            <div className="mt-[14px] space-y-[14px]">
                <div>
                    <p className="text-[12px] font-medium text-[#20252c]">Account ID</p>
                    <p className="mt-[2px] text-[12px] text-[#666]">AIA990011</p>
                </div>

                <div>
                    <p className="text-[12px] font-medium text-[#20252c]">Rank</p>
                    <p className="mt-[2px] text-[12px] text-[#666]">Silver</p>
                </div>

                <div>
                    <p className="text-[12px] font-medium text-[#20252c]">Status</p>
                    <p className="mt-[2px] flex items-center gap-2 text-[12px] font-semibold text-[#08a957]">
                        <span className="h-2 w-2 rounded-full bg-[#08a957]" />
                        Activated
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProfileImageCard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

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
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (imagePreview) {
            alert("Profile image saved successfully!");
        } else {
            setError("Please upload an image first");
        }
    };

    return (
        <div className="rounded-[8px] border border-[#edf0f3] bg-white px-[20px] py-[16px]">
            <h3 className="text-center text-[13px] font-semibold text-[#292d33]">
                UPDATE PROFILE IMAGE
            </h3>

            <div className="mt-[14px] flex justify-center">
                <div className="relative cursor-pointer" onClick={handleImageClick}>
                    <div className="flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-full bg-[#dedede] hover:ring-4 hover:ring-[#3964FE]/30 transition-all">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-end justify-center bg-[#dedede]">
                                <UserRound size={70} strokeWidth={1} className="text-[#777]" />
                            </div>
                        )}
                    </div>

                    <button className="absolute right-0 top-0 flex h-[28px] w-[28px] items-center justify-center rounded-full border-2 border-[#3964FE] bg-white shadow-md hover:shadow-lg transition-all">
                        <Pencil size={14} className="text-[#3964FE]" />
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
                <p className="mt-2 text-center text-[10px] text-red-500">{error}</p>
            )}

            <p className="mt-2 text-center text-[10px] text-[#777]">
                Click on image to upload (Max 5MB)
            </p>

            <div className="mt-[16px] flex justify-center gap-[8px]">
                <button
                    onClick={() => {
                        setImagePreview(null);
                        setError(null);
                    }}
                    className="h-[28px] min-w-[70px] rounded-[6px] border-2 border-[#3964FE] bg-white px-4 text-[11px] font-medium text-[#3964FE] hover:bg-[#f0f4ff] transition-colors"
                >
                    Cancel
                </button>

                <button
                    onClick={handleSave}
                    className="h-[28px] min-w-[60px] rounded-[6px] bg-[#3964FE] px-4 text-[11px] font-medium text-white shadow-md shadow-[#3964FE]/30 hover:bg-[#2a4fd8] hover:shadow-lg transition-all"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

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

    const validateCountry = (country: string) => {
        if (!country) return "Country is required";
        return null;
    };

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

    const validatePassport = (passport: string) => {
        if (!passport) return "Passport number is required";
        if (passport.length < 4) return "Must be at least 4 characters";
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
            <h3 className="text-[14px] font-semibold text-[#20252b]">Profile</h3>

            <div className="mt-[16px] space-y-[14px]">
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
                        className={`${inputClass} ${touched.fullName && errors.fullName ? "border-2 border-red-500" : ""}`}
                    />
                    {touched.fullName && errors.fullName && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.fullName}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        Email Address<span className="text-red-500 ml-0.5">*</span>
                    </label>

                    <div className="flex gap-[8px]">
                        <div className="flex-1">
                            <input
                                value={formData.email}
                                onChange={(e) =>
                                    handleFieldChange("email", e.target.value, validateEmail)
                                }
                                onBlur={() => handleBlur("email", validateEmail)}
                                onKeyDown={handleKeyDown}
                                className={`h-[40px] w-full rounded-[6px] bg-[#eeeeee] px-[12px] text-[12px] text-[#555] outline-none focus:ring-2 focus:ring-[#3964FE] transition-all ${touched.email && errors.email ? "border-2 border-red-500" : ""}`}
                            />
                            {touched.email && errors.email && (
                                <p className="mt-1 text-[10px] text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                const err = validateEmail(formData.email);
                                if (!err) {
                                    alert("Email is valid!");
                                } else {
                                    setErrors({ ...errors, email: err });
                                    setTouched({ ...touched, email: true });
                                }
                            }}
                            className="h-[40px] rounded-[6px] bg-[#3964FE] px-[16px] text-[11px] font-medium text-white shadow-md shadow-[#3964FE]/30 hover:bg-[#2a4fd8] transition-all"
                        >
                            Check Email
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[14px]">
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
                            className={`${inputClass} ${touched.country && errors.country ? "border-2 border-red-500" : ""}`}
                        />
                        {touched.country && errors.country && (
                            <p className="mt-1 text-[10px] text-red-500">{errors.country}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Phone Number<span className="text-red-500 ml-0.5">*</span>
                        </label>

                        <div className="flex gap-[8px]">
                            <input
                                value="+91"
                                disabled
                                className="h-[40px] w-[40px] rounded-[6px] bg-[#e8e8e8] text-center text-[12px] text-[#777] outline-none"
                            />

                            <div className="flex-1">
                                <input
                                    value={formData.phone}
                                    onChange={(e) =>
                                        handleFieldChange("phone", e.target.value, validatePhone)
                                    }
                                    onBlur={() => handleBlur("phone", validatePhone)}
                                    onKeyDown={handleKeyDown}
                                    className={`h-[40px] w-full rounded-[6px] bg-[#eeeeee] px-[12px] text-[12px] text-[#555] outline-none focus:ring-2 focus:ring-[#3964FE] transition-all ${touched.phone && errors.phone ? "border-2 border-red-500" : ""}`}
                                />
                                {touched.phone && errors.phone && (
                                    <p className="mt-1 text-[10px] text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[14px]">
                    <div>
                        <label className={labelClass}>
                            Identification Number
                            <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            value={formData.idNumber}
                            onChange={(e) =>
                                handleFieldChange("idNumber", e.target.value, validateIdNumber)
                            }
                            onBlur={() => handleBlur("idNumber", validateIdNumber)}
                            onKeyDown={handleKeyDown}
                            className={`${inputClass} ${touched.idNumber && errors.idNumber ? "border-2 border-red-500" : ""}`}
                        />
                        {touched.idNumber && errors.idNumber && (
                            <p className="mt-1 text-[10px] text-red-500">{errors.idNumber}</p>
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
                            className={`${inputClass} ${touched.passportNumber && errors.passportNumber ? "border-2 border-red-500" : ""}`}
                        />
                        {touched.passportNumber && errors.passportNumber && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.passportNumber}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[14px]">
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

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <label className={labelClass}>{label}</label>

            <div
                onClick={handleClick}
                className={`relative flex ${large ? "h-[110px]" : "h-[100px]"
                    } items-center justify-center rounded-[6px] border-2 border-dashed border-[#dce0e5] bg-[#f8faff] hover:border-[#3964FE] hover:bg-[#f0f4ff] transition-all cursor-pointer`}
            >
                {imagePreview ? (
                    <img
                        src={imagePreview}
                        alt={label}
                        className="h-full w-full object-cover rounded-[6px]"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <ImagePlus size={28} className="text-[#8a92a6]" />
                        <p className="mt-2 text-[12px] text-[#8a92a6] font-medium">
                            Click to upload
                        </p>
                        <p className="text-[10px] text-[#b0b8c8]">JPG, PNG (Max 5MB)</p>
                    </div>
                )}

                <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-white shadow-md hover:shadow-lg transition-all z-10">
                    <Pencil size={14} className="text-[#3964FE]" />
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
        </div>
    );
}

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
        if (err) {
            setError(err);
        } else {
            setError(null);
            alert("Beneficiary profile saved!");
        }
    };

    return (
        <section className={sectionClass}>
            <h3 className="text-[14px] font-semibold text-[#20252b]">
                Beneficiary Profile
            </h3>

            <p className="mt-[6px] text-[12px] text-[#777]">Saurabh@gmail.com</p>

            <div className="mt-[16px]">
                <label className={labelClass}>
                    Full Name<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                    value={beneficiaryName}
                    onChange={(e) => {
                        setBeneficiaryName(e.target.value);
                        const err = validateName(e.target.value);
                        setError(err);
                    }}
                    className={`${inputClass} ${error ? "border-2 border-red-500" : ""}`}
                />
                {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
                <div className="flex justify-end pt-[4px]">
                    <SaveButton onClick={handleSave} />
                </div>
            </div>
        </section>
    );
}

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
            <h3 className="text-[14px] font-semibold text-[#20252b]">
                Bank/Wallet Details
            </h3>

            <div className="mt-[16px] space-y-[14px]">
                <div>
                    <label className={labelClass}>Bank SWIFT Code</label>
                    <input
                        value={bankDetails.swiftCode}
                        onChange={(e) => handleChange("swiftCode", e.target.value)}
                        className={`${inputClass} ${errors.swiftCode ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.swiftCode && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.swiftCode}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Bank Name</label>
                    <input
                        value={bankDetails.bankName}
                        onChange={(e) => handleChange("bankName", e.target.value)}
                        className={`${inputClass} ${errors.bankName ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.bankName && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.bankName}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Bank Address</label>
                    <input
                        value={bankDetails.bankAddress}
                        onChange={(e) => handleChange("bankAddress", e.target.value)}
                        className={`${inputClass} ${errors.bankAddress ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.bankAddress && (
                        <p className="mt-1 text-[10px] text-red-500">
                            {errors.bankAddress}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Account Name</label>
                    <input
                        value={bankDetails.accountName}
                        onChange={(e) => handleChange("accountName", e.target.value)}
                        className={`${inputClass} ${errors.accountName ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.accountName && (
                        <p className="mt-1 text-[10px] text-red-500">
                            {errors.accountName}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Account Number/IBAN</label>
                    <input
                        value={bankDetails.accountNumber}
                        onChange={(e) => handleChange("accountNumber", e.target.value)}
                        className={`${inputClass} ${errors.accountNumber ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.accountNumber && (
                        <p className="mt-1 text-[10px] text-red-500">
                            {errors.accountNumber}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>USDT Wallet Address</label>
                    <input
                        value={bankDetails.usdtAddress}
                        onChange={(e) => handleChange("usdtAddress", e.target.value)}
                        className={`${inputClass} ${errors.usdtAddress ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.usdtAddress && (
                        <p className="mt-1 text-[10px] text-red-500">
                            {errors.usdtAddress}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-[10px] pt-[4px]">
                    <button
                        onClick={() => setShowPopup(true)}
                        className="h-[34px] min-w-[70px] rounded-[6px] border-2 border-[#3964FE] bg-white px-[18px] text-[12px] font-medium text-[#3964FE] hover:bg-[#f0f4ff] transition-colors"
                    >
                        Cancel
                    </button>
                    <SaveButton onClick={handleSave} />
                </div>
            </div>

            {/* Popup Modal */}
            {showPopup && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onClick={() => setShowPopup(false)}
                >
                    <div
                        className="bg-white rounded-[12px] p-6 max-w-[420px] w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[18px] font-bold text-[#1a2332]">
                                Change Bank Account
                            </h3>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#f0f4ff] transition-colors text-[#8a92a6] hover:text-[#1a2332]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[13px] font-medium text-[#5a6276] block mb-1.5">
                                    Current Bank Account
                                </label>
                                <div className="bg-[#f5f6fa] rounded-[8px] p-3 text-[14px] text-[#1a2332] border border-[#e9edf2]">
                                    HDFC Bank - ****7890
                                </div>
                            </div>

                            <div>
                                <label className="text-[13px] font-medium text-[#5a6276] block mb-1.5">
                                    New Bank Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={popupData.bank}
                                    onChange={(e) => {
                                        setPopupData({ ...popupData, bank: e.target.value });
                                        if (popupErrors.bank) {
                                            setPopupErrors({ ...popupErrors, bank: "" });
                                        }
                                    }}
                                    className={`h-[44px] w-full rounded-[8px] border ${popupErrors.bank ? "border-red-500" : "border-[#e5e9ef]"} bg-white px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all`}
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
                                    <p className="mt-1 text-[10px] text-red-500">
                                        {popupErrors.bank}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-[13px] font-medium text-[#5a6276] block mb-1.5">
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
                                        if (popupErrors.accountNumber) {
                                            setPopupErrors({ ...popupErrors, accountNumber: "" });
                                        }
                                    }}
                                    className={`h-[44px] w-full rounded-[8px] border ${popupErrors.accountNumber ? "border-red-500" : "border-[#e5e9ef]"} bg-white px-3 text-[14px] text-[#1a2332] outline-none placeholder:text-[#b0b8c8] focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all`}
                                />
                                {popupErrors.accountNumber && (
                                    <p className="mt-1 text-[10px] text-red-500">
                                        {popupErrors.accountNumber}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-[13px] font-medium text-[#5a6276] block mb-1.5">
                                    Confirm Account Number <span className="text-red-500">*</span>
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
                                        if (popupErrors.confirmAccountNumber) {
                                            setPopupErrors({
                                                ...popupErrors,
                                                confirmAccountNumber: "",
                                            });
                                        }
                                    }}
                                    className={`h-[44px] w-full rounded-[8px] border ${popupErrors.confirmAccountNumber ? "border-red-500" : "border-[#e5e9ef]"} bg-white px-3 text-[14px] text-[#1a2332] outline-none placeholder:text-[#b0b8c8] focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all`}
                                />
                                {popupErrors.confirmAccountNumber && (
                                    <p className="mt-1 text-[10px] text-red-500">
                                        {popupErrors.confirmAccountNumber}
                                    </p>
                                )}
                            </div>

                            <div className="bg-[#f8faff] p-3 rounded-[8px] border border-[#e9edf2]">
                                <p className="text-[11px] text-[#8a92a6]">
                                    <span className="font-semibold text-[#5a6276]">Note:</span>{" "}
                                    Changing bank account may take 24-48 hours to reflect in your
                                    profile.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    onClick={() => {
                                        setShowPopup(false);
                                        setPopupData({
                                            bank: "",
                                            accountNumber: "",
                                            confirmAccountNumber: "",
                                        });
                                        setPopupErrors({});
                                    }}
                                    className="h-[40px] min-w-[90px] rounded-[8px] border border-[#e5e9ef] bg-white px-5 text-[13px] font-medium text-[#5a6276] hover:bg-[#f5f6fa] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePopupSubmit}
                                    className="h-[40px] min-w-[90px] rounded-[8px] bg-[#3964FE] px-5 text-[13px] font-medium text-white shadow-md shadow-[#3964FE]/30 hover:bg-[#2a4fd8] hover:shadow-lg transition-all"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

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
            <h3 className="text-[14px] font-semibold text-[#20252b]">Address</h3>

            <div className="mt-[16px] space-y-[14px]">
                <div>
                    <label className={labelClass}>Street Address 1</label>
                    <input
                        value={address.street1}
                        onChange={(e) => handleChange("street1", e.target.value)}
                        className={`${inputClass} ${errors.street1 ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.street1 && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.street1}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Street Address 2</label>
                    <input
                        value={address.street2}
                        onChange={(e) => handleChange("street2", e.target.value)}
                        className={`${inputClass} ${errors.street2 ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.street2 && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.street2}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>City</label>
                    <input
                        value={address.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className={`${inputClass} ${errors.city ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.city && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.city}</p>
                    )}
                </div>

                <div className="grid grid-cols-[1fr_1fr] gap-[14px]">
                    <div>
                        <label className={labelClass}>State/Province</label>
                        <select
                            value={address.state}
                            onChange={(e) => handleChange("state", e.target.value)}
                            className={`h-[40px] w-full rounded-[6px] bg-[#eeeeee] px-[12px] text-[12px] text-[#555] outline-none focus:ring-2 focus:ring-[#3964FE] transition-all ${errors.state ? "border-2 border-red-500" : ""}`}
                        >
                            <option value="">Select</option>
                            <option value="California">California</option>
                            <option value="Texas">Texas</option>
                            <option value="New York">New York</option>
                            <option value="Florida">Florida</option>
                        </select>
                        {errors.state && (
                            <p className="mt-1 text-[10px] text-red-500">{errors.state}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Postcode</label>
                        <input
                            value={address.postcode}
                            onChange={(e) => handleChange("postcode", e.target.value)}
                            className={`${inputClass} ${errors.postcode ? "border-2 border-red-500" : ""}`}
                        />
                        {errors.postcode && (
                            <p className="mt-1 text-[10px] text-red-500">{errors.postcode}</p>
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
            <h3 className="text-[14px] font-semibold text-[#20252b]">Security</h3>

            <div className="mt-[16px] space-y-[14px]">
                <div>
                    <label className={labelClass}>New Password</label>
                    <input
                        type="password"
                        value={security.password}
                        onChange={(e) =>
                            handleChange("password", e.target.value, validatePassword)
                        }
                        placeholder="Enter new password"
                        className={`${inputClass} ${errors.password ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.password && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.password}</p>
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
                        className={`${inputClass} ${errors.confirmPassword ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-[10px] text-red-500">
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
                        className={`${inputClass} ${errors.pin ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.pin && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.pin}</p>
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
                        className={`${inputClass} ${errors.confirmPin ? "border-2 border-red-500" : ""}`}
                    />
                    {errors.confirmPin && (
                        <p className="mt-1 text-[10px] text-red-500">{errors.confirmPin}</p>
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
// PAGE
// ============================================

export default function DistributorProfilePage() {
    return (
        <div className="min-h-screen w-full bg-white">
            <div className="w-full h-full">
                <div className="w-full bg-white">
                    <DashboardHeader distributorId="AIA603525" />

                    <div className="flex min-h-[calc(100vh-72px)] relative">
                        {/* ✅ Ab hum common Sidebar import kar rahe hain */}
                        <Sidebar />

                        <div className="min-w-0 flex-1 bg-[#fafcff] px-8 pt-6 pb-8">
                            <h1 className="text-[20px] font-semibold text-[#20252b]">
                                My Profile
                            </h1>

                            <div className="mt-[20px] grid grid-cols-[200px_minmax(0,1fr)_280px] gap-[10px]">
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
                            <div className="ml-[210px] mt-[18px] grid grid-cols-[minmax(0,1fr)_280px] gap-[10px]">
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