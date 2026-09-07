// components/distributor/registration/components/steps/ReviewStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle,
    FileText,
    Shield,
    Users,
    Award,
    UserCheck,
    Calendar,
    Mail,
    Phone,
    CreditCard,
    MapPin,
    Building2,
    Landmark,
    BadgeCheck,
    User,
    Lock,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
    useStep7SubmitMutation,
    useLazyGetStepDataQuery,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import { useRouter } from "next/navigation";
import { InfoBox } from "../InfoBox";

/**
 * Same theme tokens as IdentityStep
 */
const theme = {
    font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    gold: "#F9C744",
    goldDark: "#E6B33D",
    goldDeep: "#C9922A",
    navy: "#06101E",
    navySoft: "#0B1B2E",
};

export const ReviewStep: React.FC<StepProps> = ({
    data,
    onBack,
    onSubmit,
    isLoading,
    errors,
    onChange,
    onNext,
    onBackToMobile,
}) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [step7Submit] = useStep7SubmitMutation();
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [applicationData, setApplicationData] = useState<any>(null);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [completedSteps, setCompletedSteps] = useState<any>(null);

    // API hook for fetching step data
    const [getStepData, { isLoading: isLoadingStepData }] =
        useLazyGetStepDataQuery();

    // Load phone number from localStorage
    useEffect(() => {
        const savedPhone =
            localStorage.getItem("distributor_verified_phone") ||
            localStorage.getItem("distributor_mobile") ||
            "";
        if (savedPhone) {
            const formattedPhone = savedPhone.startsWith("+")
                ? savedPhone
                : `+91${savedPhone.replace(/^0+/, "")}`;
            setPhoneNumber(formattedPhone);
        }
    }, []);

    // Fetch step data from API
    useEffect(() => {
        const fetchData = async () => {
            const email = localStorage.getItem("distributor_email") || data.email || "";
            if (!email) return;

            try {
                console.log("📡 Fetching review data for email:", email);
                const response = await getStepData({
                    step: "7",
                    phone: email,
                }).unwrap();

                if (response.status && response.step_data) {
                    console.log("✅ Review data fetched:", response);
                    setUserData(response.step_data.user);
                    setProfileData(response.step_data.distributor_profile);
                    setCompletedSteps(response.completed_steps);
                    setIsDataLoaded(true);

                    // Update form data with fetched values
                    if (response.step_data.user) {
                        const user = response.step_data.user;
                        onChange({
                            target: { name: "full_name", value: user.full_name || "" },
                        } as any);
                        onChange({
                            target: { name: "email", value: user.email || "" },
                        } as any);
                        onChange({
                            target: { name: "date_of_birth", value: user.date_of_birth?.split(" ")[0] || "" },
                        } as any);
                        onChange({
                            target: { name: "mobile", value: user.phone?.replace(/^\+91/, "") || "" },
                        } as any);
                        onChange({
                            target: { name: "sponsor_id", value: user.sponsor_id || "" },
                        } as any);
                        onChange({
                            target: { name: "placement_leg", value: user.placement_leg || "Auto" },
                        } as any);
                    }

                    if (response.step_data.distributor_profile) {
                        const profile = response.step_data.distributor_profile;
                        onChange({
                            target: { name: "aadhaar_verified", value: profile.aadhaar_verified === 1 },
                        } as any);
                        onChange({
                            target: { name: "pan_verified", value: profile.pan_verified === 1 },
                        } as any);
                        onChange({
                            target: { name: "bank_verified", value: profile.bank_verified === 1 },
                        } as any);
                        onChange({
                            target: { name: "bank_name", value: profile.bank_name || "" },
                        } as any);
                        onChange({
                            target: { name: "bank_account_number", value: profile.bank_account_number || "" },
                        } as any);
                        onChange({
                            target: { name: "bank_ifsc_code", value: profile.bank_ifsc || "" },
                        } as any);
                        onChange({
                            target: { name: "location_consent", value: profile.location_consent === 1 },
                        } as any);
                    }

                    dispatch(
                        showToast({
                            message: "Loaded application data successfully",
                            type: "success",
                        }),
                    );
                }
            } catch (error: any) {
                console.error("Error fetching review data:", error);
                if (error?.status !== 404) {
                    dispatch(
                        showToast({
                            message: error?.data?.message || "Failed to load application data",
                            type: "error",
                        }),
                    );
                }
            }
        };

        fetchData();
    }, [data.email]);

    const clearNavigationHistory = () => {
        const keysToRemove = [
            "distributor_verified_phone",
            "distributor_mobile",
            "distributor_application_data",
            "distributor_application_status",
            "distributor_registration_data",
            "distributor_step_data",
            "distributor_form_data",
            "distributor_current_step",
            "distributor_registration_step",
            "distributor_temp_data",
            "verified_phone",
            "phone_verified",
            "distributor_email",
            "verified_email",
            "email_verified",
            "temp_token",
            "distributor_check_status",
            "distributor_phone",
            "distributor_exists",
            "distributor_status",
            "user_data",
            "customer_otp",
            "customer_phone",
            "distributor_application",
            "distributor_application_data",
            "distributor_application_status",
            "distributor_verified_phone",
            "distributor_phone_verified",
            "distributor_verified_email",
            "distributor_email_verified",
            "distributor_temp_token",
            "distributor_step_data",
            "distributor_step_completed",
            "distributor_fresh_registration",
            "distributor_user_data",
            "registration_step",
            "registration_data",
            "registration_completed",
            "auth_token",
            "auth_user",
            "auth_verified",
            "otp_timer",
            "otp_attempts",
            "otp_resend_timer",
        ];

        keysToRemove.forEach((key) => {
            localStorage.removeItem(key);
        });

        sessionStorage.clear();
        router.replace("/");
    };

    const handleSubmit = async () => {
        if (!isAllAccepted) {
            dispatch(
                showToast({
                    message: "Please accept all terms and conditions",
                    type: "error",
                }),
            );
            return;
        }

        if (!phoneNumber) {
            dispatch(
                showToast({
                    message: "Phone number not found. Please verify your mobile first.",
                    type: "error",
                }),
            );
            return;
        }

        if (!isAllStepsVerified) {
            dispatch(
                showToast({
                    message: "Please complete all previous steps before submitting.",
                    type: "error",
                }),
            );
            return;
        }

        setIsSubmitting(true);
        setSubmissionError(null);

        try {
            const response = await step7Submit({
                phone: phoneNumber,
                accept_terms: data.terms_accepted ? 1 : 0,
                accept_agreement: data.agreement_accepted ? 1 : 0,
                accept_code_of_conduct: data.code_of_conduct_accepted ? 1 : 0,
            }).unwrap();

            if (response.status) {
                setSubmitSuccess(true);
                setApplicationData(response.data);

                localStorage.setItem(
                    "distributor_application_data",
                    JSON.stringify({
                        application_id: response.data?.application_id,
                        distributor_id: response.data?.distributor_id,
                        status: response.data?.status || "submitted",
                        submitted_at: new Date().toISOString(),
                    }),
                );

                localStorage.setItem("distributor_application_status", "submitted");

                dispatch(
                    showToast({
                        message: response.message || "✅ Application submitted successfully!",
                        type: "success",
                    }),
                );

                onChange({
                    target: {
                        name: "application_submitted",
                        value: true,
                    },
                } as any);

                if (response.data?.application_id) {
                    onChange({
                        target: {
                            name: "application_id",
                            value: response.data.application_id,
                        },
                    } as any);
                }

                if (response.data?.distributor_id) {
                    onChange({
                        target: {
                            name: "distributor_id",
                            value: response.data.distributor_id,
                        },
                    } as any);
                }

                if (onSubmit) {
                    await onSubmit();
                }

                setTimeout(() => {
                    clearNavigationHistory();
                }, 2000);
            } else {
                const errorMsg =
                    response.message || "Application submission failed. Please try again.";
                setSubmissionError(errorMsg);
                dispatch(
                    showToast({
                        message: errorMsg,
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Application submission error:", error);
            const errorMsg =
                error?.data?.message ||
                error?.message ||
                "Application submission failed. Please try again.";
            setSubmissionError(errorMsg);
            dispatch(
                showToast({
                    message: errorMsg,
                    type: "error",
                }),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkboxes = [
        {
            name: "terms_accepted",
            label: "Terms of Use",
            href: "/terms",
        },
        {
            name: "agreement_accepted",
            label: "Distributor Agreement",
            href: "/distributor-agreement",
        },
        {
            name: "code_of_conduct_accepted",
            label: "Code of Conduct",
            href: "/code-of-conduct",
        },
    ];

    const isAllAccepted = checkboxes.every(
        (cb) => data[cb.name as keyof typeof data] === true,
    );

    const isAllStepsVerified =
        data.aadhaar_verified &&
        data.pan_verified &&
        data.bank_verified &&
        data.location_verified;

    // Get status badge color
    const getStatusColor = (status: boolean) => {
        return status ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100";
    };

    const getStatusIcon = (status: boolean) => {
        return status ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
            <AlertTriangle className="w-4 h-4 text-gray-400" />
        );
    };

    return (
        <div
            style={
                {
                    fontFamily: theme.font,
                    "--gold": theme.gold,
                    "--gold-dark": theme.goldDark,
                    "--gold-deep": theme.goldDeep,
                    "--navy": theme.navy,
                    "--navy-soft": theme.navySoft,
                } as React.CSSProperties
            }
            className="min-h-[60vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10"
        >
            <div className="w-full max-w-lg mx-auto">
                <div className="relative rounded-[20px] sm:rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-4 sm:px-6 md:px-9 py-6 sm:py-8 md:py-10">
                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
                        <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
                    </div>

                    <div className="relative space-y-4 sm:space-y-5">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                    <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                                        <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--navy)]" />
                                    </div>
                                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                                        Review & Submit
                                    </h2>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                    Review all information before submitting
                                </p>
                                {isLoadingStepData && (
                                    <div className="flex items-center justify-start gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                                        <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                                        Loading your data...
                                    </div>
                                )}
                                {isDataLoaded && (
                                    <div className="mt-2 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-2 sm:px-3 rounded-full inline-block">
                                        Application data loaded
                                    </div>
                                )}
                            </div>
                        </div>

                        <InfoBox type="info" title="Application Review">
                            Please review all your information before submitting. Make sure everything is correct.
                        </InfoBox>

                        {/* User Information Section */}
                        <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <User className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800">Personal Information</h3>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Full Name</span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">{userData?.full_name || data.full_name || "-"}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Date of Birth</span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-800">{userData?.date_of_birth?.split(" ")[0] || data.date_of_birth || "-"}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Email</span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-800 flex items-center gap-1 break-all">
                                        <Mail className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400 flex-shrink-0" />
                                        {userData?.email || data.email || "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Mobile</span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-800 flex items-center gap-1">
                                        <Phone className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400 flex-shrink-0" />
                                        {userData?.phone || data.mobile ? `+91 ${data.mobile}` : "-"}
                                        {userData?.phone_verified === 1 && (
                                            <CheckCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-600 flex-shrink-0" />
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sponsor Information */}
                        <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800">Sponsor Information</h3>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Sponsor ID</span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">{userData?.sponsor_id || data.sponsor_id || "None"}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Placement Leg</span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-800">{userData?.placement_leg || data.placement_leg || "Auto"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800">Verification Status</h3>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Aadhaar</span>
                                    <span className={`text-[10px] sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full ${getStatusColor(profileData?.aadhaar_verified === 1 || data.aadhaar_verified)}`}>
                                        {profileData?.aadhaar_verified === 1 || data.aadhaar_verified ? "✓ Verified" : "Pending"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">PAN</span>
                                    <span className={`text-[10px] sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full ${getStatusColor(profileData?.pan_verified === 1 || data.pan_verified)}`}>
                                        {profileData?.pan_verified === 1 || data.pan_verified ? "✓ Verified" : "Pending"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Bank Account</span>
                                    <span className={`text-[10px] sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full ${getStatusColor(profileData?.bank_verified === 1 || data.bank_verified)}`}>
                                        {profileData?.bank_verified === 1 || data.bank_verified ? "✓ Verified" : "Pending"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm text-gray-500">Location Consent</span>
                                    <span className={`text-[10px] sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full ${getStatusColor(profileData?.location_consent === 1 || data.location_consent)}`}>
                                        {profileData?.location_consent === 1 || data.location_consent ? "✓ Granted" : "Not Granted"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bank Information */}
                        {(profileData?.bank_name || data.bank_name) && (
                            <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
                                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                    <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800">Bank Information</h3>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm text-gray-500">Bank Name</span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">{profileData?.bank_name || data.bank_name || "-"}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm text-gray-500">Account Holder</span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">{profileData?.bank_holder_name || data.bank_holder_name || "-"}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm text-gray-500">Account Number</span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-800">{userData?.account_last4 || data.bank_account_number ? `****${(userData?.account_last4 || data.bank_account_number)?.slice(-4)}` : "-"}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm text-gray-500">IFSC Code</span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-800 uppercase">{profileData?.bank_ifsc || data.bank_ifsc_code || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Terms and Conditions */}
                        <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
                            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Terms & Conditions</h4>
                            </div>
                            {checkboxes.map((cb) => (
                                <label
                                    key={cb.name}
                                    className={`flex items-start gap-2 sm:gap-3 ${isSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"} p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors`}
                                >
                                    <input
                                        type="checkbox"
                                        name={cb.name}
                                        checked={data[cb.name as keyof typeof data] as boolean}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                        className="mt-0.5 sm:mt-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)] flex-shrink-0"
                                    />
                                    <span className="text-[11px] sm:text-sm text-gray-600 leading-relaxed">
                                        I accept the{" "}
                                        <Link href={cb.href} className="text-[var(--gold-deep)] hover:underline font-medium">
                                            {cb.label}
                                        </Link>
                                    </span>
                                </label>
                            ))}

                            {(errors.terms_accepted ||
                                errors.agreement_accepted ||
                                errors.code_of_conduct_accepted) && (
                                    <p className="text-[10px] sm:text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                        You must accept all terms to submit your application
                                    </p>
                                )}

                            {submissionError && (
                                <div className="bg-red-50/80 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-red-200 text-[11px] sm:text-sm text-red-700 flex items-start gap-1.5 sm:gap-2">
                                    <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0 mt-0.5" />
                                    <span className="break-words">{submissionError}</span>
                                </div>
                            )}

                            {!isAllStepsVerified && (
                                <div className="bg-yellow-50/80 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-yellow-200 text-[11px] sm:text-sm text-yellow-700 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                    <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                                    <span className="break-words">Please complete all previous steps before submitting.</span>
                                    <button
                                        onClick={onBackToMobile}
                                        className="text-[var(--gold-deep)] hover:underline font-medium text-[10px] sm:text-xs"
                                    >
                                        Go to start
                                    </button>
                                </div>
                            )}

                            {isSubmitting && (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                                    <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                                    Submitting application...
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                            <button
                                type="button"
                                onClick={onBack}
                                className="w-full sm:w-auto text-center text-gray-600 hover:text-gray-800 font-medium text-xs sm:text-sm transition-colors duration-200 py-2 sm:py-0"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={
                                    !isAllAccepted ||
                                    isSubmitting ||
                                    !phoneNumber ||
                                    !isAllStepsVerified ||
                                    isLoading
                                }
                                className="w-full sm:w-auto bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] text-sm sm:text-base"
                            >
                                {isSubmitting || isLoading ? (
                                    <>
                                        <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Application →"
                                )}
                            </button>
                        </div>

                        {/* Success State */}
                        {submitSuccess && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4">
                                <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] text-center">
                                    <div className="flex justify-center mb-3 sm:mb-4">
                                        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-green-50">
                                            <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-[#06101E] mb-1 sm:mb-2">
                                        🎉 Application Submitted!
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                                        Your distributor application has been submitted successfully.
                                    </p>
                                    {applicationData?.application_id && (
                                        <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 mb-1.5 sm:mb-2">
                                            <p className="text-[10px] sm:text-xs text-gray-500">Application ID</p>
                                            <p className="font-mono font-semibold text-[#06101E] text-sm sm:text-base break-all">
                                                {applicationData.application_id}
                                            </p>
                                        </div>
                                    )}
                                    {applicationData?.distributor_id && (
                                        <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4">
                                            <p className="text-[10px] sm:text-xs text-gray-500">Distributor ID</p>
                                            <p className="font-mono font-semibold text-[#06101E] text-sm sm:text-base break-all">
                                                {applicationData.distributor_id}
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-[10px] sm:text-xs text-gray-400">Redirecting to distributor page...</p>
                                    <div className="mt-3 sm:mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full bg-[var(--gold)] rounded-full animate-pulse w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};