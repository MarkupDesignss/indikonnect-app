// components/distributor/registration/components/steps/SponsorStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle,
    Users,
    BadgeCheck,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
    useStep2SponsorMutation,
    useLazyGetStepDataQuery,
    useCheckDistributorMutation,
    distributorAuthApi,
} from "@/lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

const theme = {
    font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    gold: "#F9C744",
    goldDark: "#E6B33D",
    goldDeep: "#C9922A",
    navy: "#06101E",
    navySoft: "#0B1B2E",
};

export const SponsorStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
    onBackToMobile,
}) => {
    const dispatch = useAppDispatch();

    // ============ SPONSOR STATE ============
    const [sponsorName, setSponsorName] = useState("");
    const [sponsorValid, setSponsorValid] = useState(false);
    const [sponsorLoading, setSponsorLoading] = useState(false);
    const [sponsorError, setSponsorError] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [validationAttempted, setValidationAttempted] = useState(false);
    const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ============ BA ID STATE ============
    const [baId, setBaId] = useState("");
    const [baIdLoading, setBaIdLoading] = useState(false);
    const [baIdValid, setBaIdValid] = useState(false);
    const [baIdError, setBaIdError] = useState("");
    const [baIdValidationAttempted, setBaIdValidationAttempted] = useState(false);
    const [isSponsorAutoFilled, setIsSponsorAutoFilled] = useState(false);

    // API Hooks
    const [step2Sponsor] = useStep2SponsorMutation();
    const [checkDistributor] = useCheckDistributorMutation();
    const [getStepData, { isLoading: isLoadingStepData }] =
        useLazyGetStepDataQuery();

    // ==========================================
    // LOAD PHONE NUMBER
    // ==========================================

    useEffect(() => {
        const savedPhone =
            localStorage.getItem("distributor_verified_phone") ||
            localStorage.getItem("distributor_mobile") ||
            "";
        if (savedPhone) {
            let formattedPhone = savedPhone.trim();
            formattedPhone = formattedPhone.replace(/\s/g, "");
            if (!formattedPhone.startsWith("+")) {
                if (formattedPhone.startsWith("91")) {
                    formattedPhone = `+${formattedPhone}`;
                } else {
                    formattedPhone = formattedPhone.replace(/^0+/, "");
                    formattedPhone = `+91${formattedPhone}`;
                }
            }
            setPhoneNumber(formattedPhone);
            console.log("Phone number loaded:", formattedPhone);
        } else {
            console.warn("No phone number found in localStorage");
        }
    }, [dispatch]);

    // ==========================================
    // FETCH STEP DATA FROM API
    // ==========================================

    const fetchStepData = async () => {
        const email = data.email || localStorage.getItem("distributor_email") || "";

        if (!email) {
            console.log("No email found to fetch step data");
            return;
        }

        try {
            const response = await getStepData({
                step: "2",
                phone: email,
            }).unwrap();

            if (response.status && response.step_data) {
                const userData = response.step_data.user;

                // ✅ NEW — GET API se phone number bhi set karo
                if (userData?.phone) {
                    let formattedPhone = String(userData.phone).trim().replace(/\s/g, "");

                    // Add +91 if not present
                    if (!formattedPhone.startsWith("+")) {
                        if (formattedPhone.startsWith("91")) {
                            formattedPhone = `+${formattedPhone}`;
                        } else {
                            formattedPhone = formattedPhone.replace(/^0+/, "");
                            formattedPhone = `+91${formattedPhone}`;
                        }
                    }

                    setPhoneNumber(formattedPhone);

                    // ✅ Backup — localStorage me bhi save kar do
                    localStorage.setItem("distributor_verified_phone", formattedPhone);
                    localStorage.setItem("distributor_mobile", formattedPhone);

                    console.log(
                        "[SponsorStep] ✅ Phone loaded from GET API:",
                        formattedPhone,
                    );
                }

                // ... existing sponsor_id handling
                if (userData.sponsor_id) {
                    onChange({
                        target: { name: "sponsor_id", value: userData.sponsor_id },
                    } as any);

                    setSponsorValid(true);
                    setValidationAttempted(true);
                    setSponsorName(userData.sponsor_name || userData.sponsor_id);
                    setIsDataLoadedFromAPI(true);

                    dispatch(
                        showToast({
                            message: "Loaded sponsor data successfully",
                            type: "success",
                        }),
                    );
                }
            }
        } catch (error: any) {
            console.error("Sponsor validation error:", error);

            let errorMsg = "Failed to validate sponsor. Please try again.";

            if (error?.data?.message) {
                errorMsg = error.data.message;
            } else if (error?.data?.error) {
                errorMsg = error.data.error;
            } else if (error?.message) {
                errorMsg = error.message;
            }

            setSponsorError(errorMsg);
            setValidationAttempted(true);
            dispatch(showToast({ message: errorMsg, type: "error" }));
            return false;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const emailFromProps = data.email;
            const emailFromStorage = localStorage.getItem("distributor_email");
            const email = emailFromProps || emailFromStorage || "";

            if (email) {
                console.log("📧 Loading sponsor data for email:", email);
                await fetchStepData();
            }
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.email]);

    // ==========================================
    // CLEAR REGISTRATION DATA
    // ==========================================

    const clearAllRegistrationData = () => {
        const itemsToRemove = [
            "verified_phone",
            "phone_verified",
            "distributor_mobile",
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
            "distributor_email",
        ];

        itemsToRemove.forEach((item) => {
            localStorage.removeItem(item);
        });

        try {
            dispatch(distributorAuthApi.util.resetApiState());
            dispatch(authApi.util.resetApiState());
        } catch (error) {
            console.error("Error resetting API:", error);
        }
    };

    const handleNewRegistration = () => {
        clearAllRegistrationData();
        setShowConfirmModal(false);
        if (onBackToMobile) {
            onBackToMobile();
        }
    };

    // ==========================================
    // ✅ POST SUCCESS → CLEAR RELEVANT LOCALSTORAGE
    // ==========================================

    /**
     * Sponsor POST सफल होने के बाद यह function चलता है।
     *
     * यहाँ हम sponsor/step-data से जुड़ी local keys clear कर रहे हैं
     * ताकि जब user वापस इस step पर आए, तो fresh GET API call हो
     * और नया saved data fetch हो जाए।
     *
     * ⚠️ ध्यान रखें: phone, email, temp_token जैसी keys को हम clear नहीं कर रहे
     *     क्योंकि वो पूरे registration flow के लिए ज़रूरी हैं।
     */
    const clearSponsorRelatedLocalStorage = () => {
        const sponsorRelatedKeys = [
            "distributor_sponsor_id",
            "distributor_sponsor_name",
            "sponsor_id",
            "sponsor_name",
            "distributor_step2_data",
            "distributor_step_2",
        ];

        sponsorRelatedKeys.forEach((key) => {
            localStorage.removeItem(key);
        });

        console.log("🧹 Sponsor related localStorage cleared");
    };

    // ==========================================
    // BA ID → CHECK DISTRIBUTOR → AUTO-FILL SPONSOR
    // ==========================================

    const handleBaIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBaId(value);

        setBaIdError("");
        setBaIdValid(false);
        setBaIdValidationAttempted(false);

        // अगर sponsor BA ID से auto-fill हुआ था तो reset कर दो
        if (isSponsorAutoFilled) {
            setIsSponsorAutoFilled(false);
            setSponsorValid(false);
            setSponsorName("");
            setValidationAttempted(false);

            onChange({
                target: { name: "sponsor_id", value: "" },
            } as any);
            onChange({
                target: { name: "sponsor_name", value: "" },
            } as any);
        }

        // ✅ अगर BA ID खाली हो गई → Sponsor ID field automatically enable हो जाएगा
        // (क्योंकि isSponsorInputDisabled में baId check है)
    };

    const handleCheckBaId = async () => {
        const trimmedBaId = baId.trim();

        setBaIdError("");
        setBaIdValid(false);
        setBaIdValidationAttempted(false);

        if (!trimmedBaId) {
            setBaIdError("BA ID is required");
            dispatch(
                showToast({
                    message: "Please enter a BA ID",
                    type: "error",
                }),
            );
            return;
        }

        setBaIdLoading(true);

        try {
            console.log("📡 Calling checkDistributor with:", {
                distributor_id: trimmedBaId,
            });

            const response = await checkDistributor({
                distributor_id: trimmedBaId,
            }).unwrap();

            console.log("✅ checkDistributor response:", response);

            const isSuccess =
                response?.status === true ||
                response?.success === true ||
                response?.status === "success";

            if (isSuccess && response?.sponsor_id) {
                const fetchedSponsorId = String(response.sponsor_id);
                const fetchedSponsorName =
                    response?.distributor?.full_name ||
                    response?.sponsor_name ||
                    `Sponsor: ${fetchedSponsorId}`;

                onChange({
                    target: { name: "sponsor_id", value: fetchedSponsorId },
                } as any);

                onChange({
                    target: {
                        name: "sponsor_name",
                        value: fetchedSponsorName,
                    },
                } as any);

                setSponsorValid(true);
                setValidationAttempted(true);
                setSponsorName(fetchedSponsorName);
                setIsSponsorAutoFilled(true);
                setIsDataLoadedFromAPI(false);
                setSponsorError("");

                setBaIdValid(true);
                setBaIdValidationAttempted(true);

                dispatch(
                    showToast({
                        message: `✓ BA ID verified. Sponsor ID auto-filled: ${fetchedSponsorId}`,
                        type: "success",
                    }),
                );
            } else {
                const errorMsg =
                    response?.message ||
                    "No sponsor found for this BA ID. Please check and try again.";

                setBaIdError(errorMsg);
                setBaIdValidationAttempted(true);
                setIsSponsorAutoFilled(false);

                // Sponsor ID clear कर दो ताकि user manually डाल सके
                setSponsorValid(false);
                setSponsorName("");
                setValidationAttempted(false);
                onChange({
                    target: { name: "sponsor_id", value: "" },
                } as any);
                onChange({
                    target: { name: "sponsor_name", value: "" },
                } as any);

                dispatch(
                    showToast({
                        message: errorMsg + " You can enter Sponsor ID manually.",
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("BA ID check error:", error);

            let errorMsg = "Failed to verify BA ID. Please try again.";

            if (error?.data?.message) {
                errorMsg = error.data.message;
            } else if (error?.data?.error) {
                errorMsg = error.data.error;
            } else if (error?.message) {
                errorMsg = error.message;
            }

            setBaIdError(errorMsg);
            setBaIdValidationAttempted(true);
            setIsSponsorAutoFilled(false);

            setSponsorValid(false);
            setSponsorName("");
            setValidationAttempted(false);
            onChange({
                target: { name: "sponsor_id", value: "" },
            } as any);
            onChange({
                target: { name: "sponsor_name", value: "" },
            } as any);

            dispatch(
                showToast({
                    message: errorMsg + " You can enter Sponsor ID manually.",
                    type: "error",
                }),
            );
        } finally {
            setBaIdLoading(false);
        }
    };

    // ==========================================
    // VALIDATE + SAVE SPONSOR (via step2Sponsor)
    // ==========================================

    const validateAndSaveSponsor = async (sponsorId: string) => {
        setSponsorValid(false);
        setSponsorName("");
        setSponsorError("");
        setValidationAttempted(false);

        if (!sponsorId || sponsorId.trim().length === 0) {
            setSponsorError("Sponsor ID is required");
            dispatch(
                showToast({
                    message: "Please enter a Sponsor ID",
                    type: "error",
                }),
            );
            return false;
        }

        if (!phoneNumber) {
            setSponsorError(
                "Phone number not found. Please go back and verify your mobile.",
            );
            dispatch(
                showToast({
                    message: "Phone number not found. Please verify your mobile first.",
                    type: "error",
                }),
            );
            return false;
        }

        setSponsorLoading(true);
        setIsValidating(true);

        try {
            const requestData = {
                phone: phoneNumber,
                sponsor_id: sponsorId.trim(),
            };

            console.log("Calling step2-sponsor API with:", requestData);

            const response = await step2Sponsor(requestData).unwrap();
            console.log("✅ step2-sponsor API Response:", response);

            const isSuccess =
                response?.status === true ||
                response?.success === true ||
                response?.status === "success";

            if (isSuccess) {
                setSponsorValid(true);
                setValidationAttempted(true);

                const sponsorNameFromResponse =
                    response?.sponsor_name ||
                    response?.data?.sponsor_name ||
                    response?.name ||
                    `Sponsor ID: ${sponsorId.trim()}`;

                setSponsorName(sponsorNameFromResponse);

                onChange({
                    target: {
                        name: "sponsor_name",
                        value: sponsorNameFromResponse,
                    },
                } as any);

                // ✅ POST success → local storage clear
                clearSponsorRelatedLocalStorage();

                dispatch(
                    showToast({
                        message: `✓ Sponsor saved: ${sponsorNameFromResponse}`,
                        type: "success",
                    }),
                );
                return true;
            } else {
                const errorMsg =
                    response?.message ||
                    "Sponsor not found. Please check the ID and try again.";

                setSponsorError(errorMsg);
                setValidationAttempted(true);

                dispatch(
                    showToast({
                        message: errorMsg,
                        type: "error",
                    }),
                );
                return false;
            }
        } catch (error: any) {
            console.error("Sponsor validation error:", error);

            // ✅ API ke andar se hi message nikalo — jo mila wahi dikhao
            const errorMsg =
                error?.data?.errors?.sponsor_id?.[0] ||   // { errors: { sponsor_id: ["The sponsor id has already been taken."] } }
                error?.data?.message ||                    // { message: "..." }
                error?.data?.error ||                      // { error: "..." }
                error?.message ||                          // JS/RTK internal
                "";                                        // kuch nahi mila → blank

            setSponsorError(errorMsg);
            setValidationAttempted(true);

            if (errorMsg) {
                dispatch(
                    showToast({
                        message: errorMsg,
                        type: "error",
                    }),
                );
            }

            return false;
        } finally {
            setSponsorLoading(false);
            setIsValidating(false);
        }
    };

    const handleSponsorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSponsorError("");
        setSponsorValid(false);
        setSponsorName("");
        setValidationAttempted(false);
        setIsDataLoadedFromAPI(false);
        setIsSponsorAutoFilled(false);
        onChange(e);
    };

    // ==========================================
    // HANDLE NEXT
    // ==========================================

    const handleNext = async () => {
        if (isSubmitting) return;

        // Manual validation
        if (!data.sponsor_id || data.sponsor_id.trim().length === 0) {
            setSponsorError("Sponsor ID is required");
            dispatch(
                showToast({
                    message: "Please enter a Sponsor ID",
                    type: "error",
                }),
            );
            return;
        }

        if (data.sponsor_id.trim().length < 3) {
            setSponsorError("Sponsor ID must be at least 3 characters");
            dispatch(
                showToast({
                    message: "Sponsor ID must be at least 3 characters",
                    type: "error",
                }),
            );
            return;
        }

        // ✅ Path A: GET API से already loaded sponsor → POST नहीं करेंगे
        if (isDataLoadedFromAPI && sponsorValid && data.sponsor_id) {
            console.log("✅ Sponsor loaded from GET API — skipping POST");
            setTimeout(() => onNext(), 300);
            return;
        }

        // ✅ Path B: BA ID auto-filled / Manual → step2Sponsor POST
        setIsSubmitting(true);

        try {
            const success = await validateAndSaveSponsor(data.sponsor_id);

            if (success) {
                setTimeout(() => {
                    setIsSubmitting(false);
                    onNext();
                }, 400);
            } else {
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("handleNext error:", error);
            setIsSubmitting(false);
        }
    };

    // ==========================================
    // CONTINUE BUTTON ENABLE LOGIC
    // ==========================================

    const isContinueEnabled = () => {
        if (sponsorLoading || isValidating || baIdLoading || isSubmitting)
            return false;
        if (!phoneNumber) return false;

        if (!data.sponsor_id || data.sponsor_id.trim().length < 3) return false;

        return true;
    };

    // ==========================================
    // 🔒 SPONSOR ID DISABLED LOGIC
    // ==========================================
    //
    // Disabled जब:
    //   - Sponsor loading हो
    //   - Phone number missing हो
    //   - GET API से data loaded हो
    //   - BA ID भरी हो (valid हो या ना हो — क्योंकि user BA ID use कर रहा है)
    //
    const isSponsorInputDisabled =
        sponsorLoading ||
        !phoneNumber ||
        isDataLoadedFromAPI ||
        (baId.trim().length > 0 && isSponsorAutoFilled);

    // ==========================================
    // 🔒 CHECK BUTTON DISABLED LOGIC
    // ==========================================
    //
    // Disabled जब:
    //   - BA ID loading हो
    //   - BA ID खाली हो
    //   - Sponsor already auto-filled हो (BA ID से)
    //   - Sponsor GET API से loaded हो
    //
    const isCheckButtonDisabled =
        baIdLoading ||
        !baId.trim() ||
        (isSponsorAutoFilled && baIdValid) ||
        isDataLoadedFromAPI;

    return (
        <>
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
                        <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
                            <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
                        </div>

                        <div className="relative space-y-4 sm:space-y-5">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                        <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                                            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--navy)]" />
                                        </div>
                                        <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                                            Sponsor Information
                                        </h2>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                        Identify who introduced you to the network
                                    </p>
                                    {isLoadingStepData && (
                                        <div className="flex items-center justify-start gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                                            <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                                            Loading your sponsor data...
                                        </div>
                                    )}
                                    {isDataLoadedFromAPI && (
                                        <div className="mt-2 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-2 sm:px-3 rounded-full inline-block">
                                            Existing data loaded
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(true)}
                                    className="group flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                                    border border-[var(--gold)]/40 bg-[#FFFBEF]
                                    text-xs sm:text-sm font-semibold text-[var(--gold-deep)]
                                    hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)]
                                    shadow-sm hover:shadow-md
                                    transition-all duration-200 whitespace-nowrap"
                                >
                                    <PlusCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                    <span className="hidden xs:inline">New Registration</span>
                                    <span className="xs:hidden">New</span>
                                </button>
                            </div>

                            <InfoBox type="info" title="Why this is needed">
                                Your sponsor determines where you sit in the binary network and
                                who earns against your activity.
                            </InfoBox>

                            <div className="space-y-3 sm:space-y-4">
                                {/* ============================
                                    BA ID (OPTIONAL)
                                ============================ */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            BA ID
                                        </label>
                                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            OPTIONAL
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Input
                                                name="ba_id"
                                                value={baId}
                                                onChange={handleBaIdChange}
                                                error={baIdError}
                                                placeholder="Enter your BA ID"
                                                disabled={baIdLoading || isDataLoadedFromAPI}

                                                className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base ${baIdValid
                                                        ? "border-emerald-400 bg-emerald-50/60"
                                                        : baIdValidationAttempted && !baIdValid
                                                            ? "border-red-400 bg-red-50/60"
                                                            : ""
                                                    }`}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleCheckBaId}
                                            disabled={isCheckButtonDisabled}
                                            className="h-12 sm:h-14 px-3 sm:px-5 rounded-xl font-semibold text-sm sm:text-base
                                            bg-[var(--navy)] text-white
                                            hover:bg-[var(--navy-soft)]
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            transition-all duration-200
                                            flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {baIdLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Checking...</span>
                                                </>
                                            ) : isSponsorAutoFilled && baIdValid ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Checked</span>
                                                </>
                                            ) : (
                                                <>
                                                    <BadgeCheck className="w-4 h-4" />
                                                    <span>Check</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* ============================
                                    SPONSOR ID (MANDATORY)
                                    - BA ID भरी हो → disabled
                                    - BA ID खाली हो → enabled (manual entry)
                                    - GET API से loaded → disabled
                                ============================ */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Sponsor ID
                                        </label>
                                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                            REQUIRED
                                        </span>
                                    </div>

                                    <Input
                                        name="sponsor_id"
                                        value={data.sponsor_id || ""}
                                        onChange={handleSponsorChange}
                                        error={errors.sponsor_id || sponsorError}
                                        placeholder={
                                            isDataLoadedFromAPI
                                                ? "Loaded from saved data"
                                                : isSponsorAutoFilled
                                                    ? "Auto-filled from BA ID"
                                                    : "Enter your sponsor's distributor ID"
                                        }
                                        required
                                        disabled={isSponsorInputDisabled}

                                        className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base ${sponsorValid
                                                ? "border-emerald-400 bg-emerald-50/60"
                                                : validationAttempted && !sponsorValid
                                                    ? "border-red-400 bg-red-50/60"
                                                    : isDataLoadedFromAPI
                                                        ? "border-blue-400 bg-blue-50/60"
                                                        : ""
                                            } ${isSponsorInputDisabled
                                                ? "cursor-not-allowed opacity-90"
                                                : ""
                                            }`}
                                    />

                                    {sponsorLoading && (
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                                            <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                                            Saving sponsor...
                                        </div>
                                    )}

                                    {!phoneNumber && (
                                        <div className="bg-amber-50/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-700 flex items-center gap-2 sm:gap-2.5 font-medium">
                                            <span className="text-base sm:text-lg flex-shrink-0">
                                                ⚠️
                                            </span>
                                            <span>
                                                Phone number not found. Please go back and verify your
                                                mobile.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <FormActions
                                    onBack={onBack}
                                    onNext={handleNext}
                                    isNextDisabled={!isContinueEnabled()}
                                    nextLabel={
                                        isSubmitting
                                            ? "Saving..."
                                            : isDataLoadedFromAPI && sponsorValid
                                                ? "Continue →"
                                                : "Validate & Continue →"
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4"
                    style={{ fontFamily: theme.font }}
                >
                    <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1 transition-colors"
                        >
                            <X className="w-4 sm:w-5 h-4 sm:h-5" />
                        </button>

                        <div className="flex justify-center mb-3 sm:mb-4">
                            <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-50">
                                <AlertTriangle className="w-6 sm:w-8 h-6 sm:h-8 text-amber-600" />
                            </div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-center text-[#06101E] mb-1 sm:mb-2 tracking-tight">
                            Start New Registration?
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 font-medium">
                            All your entered information will be discarded. This action cannot
                            be undone.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-6">
                            <p className="text-[10px] sm:text-xs text-red-600 text-center font-semibold">
                                ⚠️ Your current progress will be lost
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-2.5 rounded-xl transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleNewRegistration}
                                className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] text-sm sm:text-base order-1 sm:order-2"
                            >
                                <PlusCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                Yes, Start New
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
