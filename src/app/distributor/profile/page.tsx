"use client";

import { ImagePlus, Pencil, UserRound, X, Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from "react";
import { useDispatch } from "react-redux";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../Sidebar";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useChangePasswordMutation, useUpdateUserProfileMutation } from "@/lib/redux/api/Profile/userApi";
import AddressComponent from "@/components/profile/AddressComponent";
import { showToast } from "@/lib/slices/toastSlice";

// ---- Design tokens (same as Sidebar) ----
const NAVY = "#0E1B3D";
const EMERALD = "#1f9d6b";

const inputClass =
    "h-[42px] w-full rounded-[10px] bg-[#f7f8fa] border border-[#e9edf2] px-[14px] text-[13px] text-[#475066] outline-none placeholder:text-[#98a2b3] focus:bg-white focus:border-[#0E1B3D] focus:ring-2 focus:ring-[#0E1B3D]/10 transition-all";

const readOnlyClass =
    "h-[42px] w-full rounded-[10px] bg-[#f2f4f7] border border-[#e9edf2] px-[14px] text-[13px] text-[#98a2b3] outline-none cursor-not-allowed";

const labelClass =
    "mb-[8px] block text-[12.5px] font-semibold text-[#475066]";

const sectionClass =
    "rounded-[12px] border border-[#e9edf2] bg-white p-[22px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

// ---- Helper: extract readable error message from RTK Query error ----
function getErrorMessage(err: any, fallback: string) {
    // RTK Query error shape: { status, data: { message, errors: {...} } }
    const data = err?.data;

    if (data?.errors && typeof data.errors === "object") {
        // Grab the first error message from the errors object
        const firstKey = Object.keys(data.errors)[0];
        const firstVal = data.errors[firstKey];
        if (Array.isArray(firstVal) && firstVal.length > 0) return firstVal[0];
        if (typeof firstVal === "string") return firstVal;
    }

    if (data?.message) return data.message;
    if (err?.message) return err.message;
    return fallback;
}

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
    loading = false,
}: {
    text?: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={
                !disabled && !loading
                    ? {
                        backgroundColor: NAVY,
                        boxShadow: `0 8px 20px -8px ${NAVY}66`,
                    }
                    : undefined
            }
            className={`flex h-[38px] min-w-[80px] items-center justify-center gap-2 rounded-[10px] px-[20px] text-[12.5px] font-semibold text-white transition-all ${disabled || loading
                    ? "bg-[#c1c6d0] cursor-not-allowed"
                    : "hover:brightness-110"
                }`}
        >
            {loading && <Loader2 size={14} className="animate-spin" />}
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
// PROFILE SUMMARY
// ============================================

function ProfileSummary({ user }: { user: any }) {
    const initials = user?.full_name
        ? user.full_name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    return (
        <div className={sectionClass}>
            <div className="flex items-center gap-3">
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden"
                    style={{ backgroundColor: NAVY }}
                >
                    {user?.profile_picture ? (
                        <img
                            src={user.profile_picture}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-[14px] font-bold text-white">{initials}</span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-[#101828]">
                        {user?.full_name?.toUpperCase() || "—"}
                    </p>
                    <p className="truncate text-[11.5px] text-[#98a2b3]">
                        {user?.email || "—"}
                    </p>
                </div>
                <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                        backgroundColor: user?.is_active ? EMERALD : "#98a2b3",
                    }}
                />
            </div>

            <div className="mt-[18px] space-y-[14px] border-t border-dashed border-[#e9edf2] pt-[16px]">
                <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#98a2b3]">
                        Account ID
                    </p>
                    <p className="mt-[3px] text-[13px] font-semibold text-[#475066]">
                        {user?.distributor_id || "—"}
                    </p>
                </div>
                <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#98a2b3]">
                        Account Type
                    </p>
                    <p className="mt-[3px] text-[13px] font-semibold text-[#475066] capitalize">
                        {user?.account_type || "—"}
                    </p>
                </div>
                <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#98a2b3]">
                        Status
                    </p>
                    <p
                        className="mt-[3px] flex items-center gap-2 text-[13px] font-semibold capitalize"
                        style={{ color: user?.is_active ? EMERALD : "#98a2b3" }}
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{
                                backgroundColor: user?.is_active ? EMERALD : "#98a2b3",
                            }}
                        />
                        {user?.distributor_status || (user?.is_active ? "Active" : "Inactive")}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ============================================
// PROFILE IMAGE CARD
// ============================================

function ProfileImageCard({
    user,
    onSave,
    loading,
}: {
    user: any;
    onSave: (file: File) => void;
    loading: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.profile_picture) {
            setImagePreview(user.profile_picture);
        }
    }, [user?.profile_picture]);

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
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (selectedFile) {
            onSave(selectedFile);
        } else {
            setError("Please upload an image first");
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setImagePreview(user?.profile_picture || null);
        setError(null);
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
                <GhostButton text="Cancel" onClick={handleCancel} />
                <SaveButton text="Save" onClick={handleSave} loading={loading} disabled={!selectedFile} />
            </div>
        </div>
    );
}

// ============================================
// PROFILE FORM
// ============================================

function ProfileForm({
    user,
    onSave,
    loading,
}: {
    user: any;
    onSave: (data: { full_name: string; phone: string }) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        country: "",
        phone: "",
        idNumber: "",
        passportNumber: "",
        dateOfBirth: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.full_name || "",
                email: user.email || "",
                country: user.country || "",
                phone: (user.phone || "").replace(/^\+91/, ""),
                idNumber: user.aadhaar_last4 ? `XXXX-XXXX-${user.aadhaar_last4}` : "",
                passportNumber: user.pan_last4 ? `XXXXX${user.pan_last4}` : "",
                dateOfBirth: user.date_of_birth || "",
            });
        }
    }, [user]);

    const validateFullName = (name: string) => {
        if (!name) return "Full name is required";
        if (name.length < 2) return "Name must be at least 2 characters";
        return null;
    };

    const validatePhone = (phone: string) => {
        if (!phone) return "Phone number is required";
        if (!/^\d{10}$/.test(phone)) return "Phone must be exactly 10 digits";
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

    const handleSave = () => {
        const newErrors: Record<string, string> = {};
        const nameErr = validateFullName(formData.fullName);
        if (nameErr) newErrors.fullName = nameErr;
        const phoneErr = validatePhone(formData.phone);
        if (phoneErr) newErrors.phone = phoneErr;

        setErrors(newErrors);
        setTouched({ fullName: true, phone: true });

        if (Object.keys(newErrors).length === 0) {
            onSave({
                full_name: formData.fullName,
                phone: `+91${formData.phone}`,
            });
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
                        Email Address
                        <span className="ml-2 rounded bg-[#f2f4f7] px-1.5 py-0.5 text-[9.5px] font-medium text-[#98a2b3]">
                            READ ONLY
                        </span>
                    </label>
                    <input
                        value={formData.email}
                        readOnly
                        disabled
                        className={readOnlyClass}
                    />
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                        <label className={labelClass}>Country</label>
                        <input
                            value={formData.country}
                            readOnly
                            disabled
                            className={readOnlyClass}
                        />
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
                                    maxLength={10}
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
                        <label className={labelClass}>Aadhaar (Last 4)</label>
                        <input
                            value={formData.idNumber}
                            readOnly
                            disabled
                            className={readOnlyClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>PAN (Masked)</label>
                        <input
                            value={formData.passportNumber}
                            readOnly
                            disabled
                            className={readOnlyClass}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input
                        value={formData.dateOfBirth}
                        readOnly
                        disabled
                        className={readOnlyClass}
                    />
                </div>

                <div className="flex justify-end pt-[4px]">
                    <SaveButton onClick={handleSave} loading={loading} />
                </div>
            </div>
        </section>
    );
}

// ============================================
// BENEFICIARY PROFILE
// ============================================

function BeneficiaryProfile({ user }: { user: any }) {
    return (
        <section className={sectionClass}>
            <SectionHeader title="Beneficiary Profile" />
            <p className="-mt-[8px] mb-[16px] text-[11.5px] text-[#98a2b3]">
                {user?.email || "—"}
            </p>

            <div>
                <label className={labelClass}>Full Name</label>
                <input
                    value={user?.full_name || ""}
                    readOnly
                    disabled
                    className={readOnlyClass}
                />
            </div>
        </section>
    );
}

// ============================================
// BANK / WALLET DETAILS
// ============================================

function BankWalletDetails({ user }: { user: any }) {
    const bp = user?.business_profile;

    return (
        <section className={sectionClass}>
            <SectionHeader title="Bank / Wallet Details" />

            <div className="space-y-[16px]">
                <div>
                    <label className={labelClass}>Bank Name</label>
                    <input
                        value={bp?.bank_name || "—"}
                        readOnly
                        disabled
                        className={readOnlyClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Bank IFSC</label>
                    <input
                        value={bp?.bank_ifsc || "—"}
                        readOnly
                        disabled
                        className={readOnlyClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Account Holder Name</label>
                    <input
                        value={bp?.bank_holder_name || "—"}
                        readOnly
                        disabled
                        className={readOnlyClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Account Number (Last 4)</label>
                    <input
                        value={
                            user?.account_last4 ? `XXXX-XXXX-${user.account_last4}` : "—"
                        }
                        readOnly
                        disabled
                        className={readOnlyClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Branch Name</label>
                    <input
                        value={bp?.branch_name || "—"}
                        readOnly
                        disabled
                        className={readOnlyClass}
                    />
                </div>
            </div>
        </section>
    );
}

// ============================================
// ADDRESS WRAPPER
// ============================================

function AddressSection() {
    return (
        <section className={`${sectionClass} mt-[14px]`}>
            <SectionHeader
                title="Address"
                subtitle="Manage your saved delivery & billing addresses"
            />
            <div className="address-card-wrapper -mt-[6px]">
            <AddressComponent buttonPosition="bottom" />
            </div>

            {/* Scoped overrides — match profile UI, keep icons white on hover */}
            <style jsx global>{`
                /* Hide any outer stray gaps inside AddressComponent header */
                .address-card-wrapper > div {
                    margin-top: 0 !important;
                }

                /* "Saved Addresses" heading */
                .address-card-wrapper h2 {
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    color: #101828 !important;
                    margin-bottom: 0 !important;
                }

                /* Hide the top "Add New Address" button (it's moved to bottom) */
                .address-card-wrapper > div > div:first-child > button {
                    display: none !important;
                }

                /* ============================================
                   Add New Address button (appended at bottom)
                   ============================================ */
                .address-card-wrapper .add-address-bottom-btn {
                    background-color: #0e1b3d !important;
                    border-radius: 10px !important;
                    height: 38px !important;
                    padding: 0 20px !important;
                    font-size: 12.5px !important;
                    font-weight: 600 !important;
                    color: #ffffff !important;
                    box-shadow: 0 8px 20px -8px rgba(14, 27, 61, 0.4) !important;
                    transition: filter 0.15s ease !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    margin-top: 16px !important;
                }
                .address-card-wrapper .add-address-bottom-btn:hover {
                    filter: brightness(1.1) !important;
                }

                /* Empty-state button */
                .address-card-wrapper .border-dashed button {
                    background-color: #0e1b3d !important;
                    border-radius: 10px !important;
                    height: 38px !important;
                    font-size: 12.5px !important;
                    font-weight: 600 !important;
                    box-shadow: 0 8px 20px -8px rgba(14, 27, 61, 0.4) !important;
                }

                /* Address cards */
                .address-card-wrapper .rounded-\[8px\] {
                    border-radius: 12px !important;
                    border-color: #e9edf2 !important;
                }
                .address-card-wrapper .rounded-\[8px\]:hover {
                    border-color: #0e1b3d !important;
                }

                /* Default badge */
                .address-card-wrapper .bg-\[\#111111\] {
                    background-color: #0e1b3d !important;
                }

                /* Icon buttons — keep transparent/white bg, navy icon on hover */
                .address-card-wrapper .rounded-\[6px\].text-\[\#888888\] {
                    background-color: transparent !important;
                    color: #98a2b3 !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .address-card-wrapper .rounded-\[6px\].text-\[\#888888\]:hover {
                    background-color: #f7f8fa !important;
                    color: #0e1b3d !important;
                }

                /* Ensure SVG icons follow the button color */
                .address-card-wrapper .rounded-\[6px\] svg {
                    color: currentColor !important;
                    stroke: currentColor !important;
                }

                /* "Set default" link */
                .address-card-wrapper button.underline {
                    color: #475066 !important;
                    background-color: transparent !important;
                    box-shadow: none !important;
                }
                .address-card-wrapper button.underline:hover {
                    color: #0e1b3d !important;
                }

                /* Billing / Delivery pills — keep white */
                .address-card-wrapper .bg-white.rounded-full {
                    background-color: #ffffff !important;
                }
            `}</style>
        </section>
    );
}

// ============================================
// SECURITY
// ============================================

function SecuritySection() {
    const dispatch = useDispatch();
    const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();

    const [security, setSecurity] = useState({
        oldPassword: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateOldPassword = (value: string) => {
        if (!value) return "Old password is required";
        return null;
    };
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

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        const oldErr = validateOldPassword(security.oldPassword);
        if (oldErr) newErrors.oldPassword = oldErr;
        const passErr = validatePassword(security.password);
        if (passErr) newErrors.password = passErr;
        const confirmErr = validateConfirmPassword(security.confirmPassword);
        if (confirmErr) newErrors.confirmPassword = confirmErr;

        setErrors(newErrors);

        if (Object.keys(newErrors).length !== 0) return;

        try {
            const res = await changePassword({
                current_password: security.oldPassword,
                new_password: security.password,
                new_password_confirmation: security.confirmPassword,
            }).unwrap();

            if (res?.status) {
                dispatch(
                    showToast({
                        message: res?.message || "Password changed successfully!",
                        type: "success",
                    })
                );
                setSecurity({ oldPassword: "", password: "", confirmPassword: "" });
                setErrors({});
            } else {
                dispatch(
                    showToast({
                        message: res?.message || "Failed to change password",
                        type: "error",
                    })
                );
            }
        } catch (err: any) {
            dispatch(
                showToast({
                    message: getErrorMessage(
                        err,
                        "Something went wrong while changing password"
                    ),
                    type: "error",
                })
            );
        }
    };

    return (
        <section className={`${sectionClass} mt-[14px]`}>
            <SectionHeader title="Security" subtitle="Change your account password" />

            <div className="space-y-[16px]">
                <div>
                    <label className={labelClass}>
                        Old Password<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            value={security.oldPassword}
                            onChange={(e) =>
                                handleChange(
                                    "oldPassword",
                                    e.target.value,
                                    validateOldPassword,
                                )
                            }
                            placeholder="Enter current password"
                            className={`${inputClass} pr-10 ${errors.oldPassword
                                    ? "border-red-500 ring-2 ring-red-500/10"
                                    : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] hover:text-[#475066] transition-colors"
                        >
                            {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.oldPassword && (
                        <p className="mt-1 text-[10.5px] text-red-500">
                            {errors.oldPassword}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        New Password<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={security.password}
                            onChange={(e) =>
                                handleChange("password", e.target.value, validatePassword)
                            }
                            placeholder="Enter new password"
                            className={`${inputClass} pr-10 ${errors.password
                                    ? "border-red-500 ring-2 ring-red-500/10"
                                    : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] hover:text-[#475066] transition-colors"
                        >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-[10.5px] text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        Confirm New Password<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={security.confirmPassword}
                            onChange={(e) =>
                                handleChange(
                                    "confirmPassword",
                                    e.target.value,
                                    validateConfirmPassword,
                                )
                            }
                            placeholder="Confirm new password"
                            className={`${inputClass} pr-10 ${errors.confirmPassword
                                    ? "border-red-500 ring-2 ring-red-500/10"
                                    : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] hover:text-[#475066] transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-[10.5px] text-red-500">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <div className="flex justify-end pt-[4px]">
                    <SaveButton
                        text="Change Password"
                        onClick={handleSave}
                        loading={isChanging}
                    />
                </div>
            </div>
        </section>
    );
}

// ============================================
// PAGE
// ============================================

export default function DistributorProfilePage() {
    const dispatch = useDispatch();
    const { data, isLoading, isError, refetch } = useGetUserProfileQuery(undefined);
    const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

    const user = data?.user;

    const handleUpdateProfile = async (payload: {
        full_name?: string;
        phone?: string;
        profile_image?: File;
    }) => {
        try {
            const formData = new FormData();

            if (payload.full_name) formData.append("full_name", payload.full_name);
            if (payload.phone) formData.append("phone", payload.phone);
            if (payload.profile_image)
                formData.append("profile_picture", payload.profile_image);

            const res = await updateUserProfile(formData).unwrap();
            if (res.status) {
                dispatch(
                    showToast({
                        message: res.message || "Profile updated successfully!",
                        type: "success",
                    })
                );
                refetch();
            } else {
                dispatch(
                    showToast({
                        message: res.message || "Failed to update profile",
                        type: "error",
                    })
                );
            }
        } catch (err: any) {
            dispatch(
                showToast({
                    message: getErrorMessage(
                        err,
                        "Something went wrong while updating profile"
                    ),
                    type: "error",
                })
            );
        }
    };

    if (isLoading) {
        return (
            <div
                className="min-h-screen w-full bg-white flex items-center justify-center"
                style={{ fontFamily: "'Lato', sans-serif" }}
            >
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: NAVY }} />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div
                className="min-h-screen w-full bg-white flex flex-col items-center justify-center gap-3"
                style={{ fontFamily: "'Lato', sans-serif" }}
            >
                <p className="text-[14px] font-semibold text-[#101828]">
                    Failed to load profile
                </p>
                <GhostButton text="Retry" onClick={() => refetch()} />
            </div>
        );
    }

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
                    <DashboardHeader distributorId={user?.distributor_id || ""} />

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

                            <div className="grid grid-cols-[220px_minmax(0,1fr)_300px] gap-[14px] items-start">
                                {/* LEFT */}
                                <div className="space-y-[14px]">
                                    <ProfileSummary user={user} />
                                    <ProfileImageCard
                                        user={user}
                                        loading={isUpdating}
                                        onSave={(file) =>
                                            handleUpdateProfile({ profile_image: file })
                                        }
                                    />
                                </div>

                                {/* CENTER — Profile form + Address below it */}
                                <div className="min-w-0">
                                    <ProfileForm
                                        user={user}
                                        loading={isUpdating}
                                        onSave={(data) => handleUpdateProfile(data)}
                                    />
                                    <AddressSection />
                                </div>

                                {/* RIGHT — Beneficiary + Bank + Security below */}
                                <div className="space-y-[14px]">
                                    <BeneficiaryProfile user={user} />
                                    <BankWalletDetails user={user} />
                                    <SecuritySection />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}