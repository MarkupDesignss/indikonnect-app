// components/distributor/registration/components/steps/ReviewStep.tsx

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  FileText,
  Shield,
  Users,
  Mail,
  Phone,
  Building2,
  User,
} from "lucide-react";
import { StepProps } from "@/features/distributor/registration/types/index";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useStep7SubmitMutation,
  useLazyGetStepDataQuery,
} from "@/lib/redux/api/distributor/distributorauthApis";
import { InfoBox } from "@/features/distributor/registration/components/InfoBox";
import { LegalModal } from "@/features/distributor/shell/LegalModal";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

/** Final redirect target after successful submission. */
const LOGIN_REDIRECT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/indiekonnect-distributor/auth/distributor/login/`
    : "/indiekonnect-distributor/auth/distributor/login/";

type LegalType = "terms" | "agreement" | "code-of-conduct";
type AcceptanceType = LegalType | "refund-policy";

interface AcceptanceModalState {
  isOpen: boolean;
  type: AcceptanceType | null;
  expectedText: string;
  label: string;
  policyText: string;
}

const TERMS_CONDITIONS_TEXT = "I accept these Terms and Conditions.";
const REFUND_POLICY_TEXT =
  "In the event of a refund, a 5% deduction will be applied to the total refundable amount towards administrative and processing charges. By proceeding with a purchase, the customer acknowledges and agrees to this refund policy as outlined in our Service Level Agreement (SLA).";
const REFUND_POLICY_ACCEPTANCE_TEXT = "I accept the Refund Policy.";

const isTruthy = (value: any): boolean =>
  value === true || value === 1 || value === "1" || value === "true" || value === "on";

export const ReviewStep: React.FC<StepProps> = ({
  data,
  onBack,
  onSubmit,
  isLoading,
  errors,
  onChange,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const hasNavigatedRef = useRef(false);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalType | null>(null);

  const [acceptanceModal, setAcceptanceModal] =
    useState<AcceptanceModalState>({
      isOpen: false,
      type: null,
      expectedText: "",
      label: "",
      policyText: "",
    });
  const [typedText, setTypedText] = useState("");
  const [acceptanceError, setAcceptanceError] = useState("");

  // Local backups ensure acceptance text is available even if the parent
  // registration state updates asynchronously.
  const [acceptTermsTextLocal, setAcceptTermsTextLocal] = useState("");
  const [acceptRefundPolicyTextLocal, setAcceptRefundPolicyTextLocal] =
    useState("");

  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    if (typeof window === "undefined") return "";

    const candidates = [
      localStorage.getItem("distributor_verified_phone"),
      localStorage.getItem("distributor_mobile"),
      localStorage.getItem("distributor_phone"),
      localStorage.getItem("verified_phone"),
      localStorage.getItem("phone"),
    ].filter(Boolean) as string[];

    const saved = candidates[0] || "";
    if (!saved) return "";

    const cleaned = saved.replace(/\s+/g, "").replace(/^0+/, "");
    return cleaned.startsWith("+") ? cleaned : `+91${cleaned}`;
  });

  const [step7Submit] = useStep7SubmitMutation();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<any>(null);

  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  // Keep local acceptance text in sync with the parent form data.
  useEffect(() => {
    const termsText = (data as any)?.accept_terms_text;
    if (typeof termsText === "string" && termsText.length > 0) {
      setAcceptTermsTextLocal(termsText);
    }

    const refundText = (data as any)?.accept_refund_policy_text;
    if (typeof refundText === "string" && refundText.length > 0) {
      setAcceptRefundPolicyTextLocal(refundText);
    }
  }, [data]);

  // Phone number fallback.
  useEffect(() => {
    if (phoneNumber) return;

    const emailFallback =
      data.email || localStorage.getItem("distributor_email") || "";

    if (emailFallback) {
      console.warn(
        "No phone in localStorage. Falling back to email:",
        emailFallback,
      );
      setPhoneNumber(emailFallback);
    } else {
      console.error(
        "No phone and no email found. Submit button will stay disabled.",
      );
    }
  }, [data.email, phoneNumber]);

  // Fetch the saved application data for the review screen.
  useEffect(() => {
    const fetchData = async () => {
      const email =
        localStorage.getItem("distributor_email") || data.email || "";
      if (!email) return;

      try {
        const response = await getStepData({
          step: "7",
          phone: email,
        }).unwrap();

        if (response.status && response.step_data) {
          setUserData(response.step_data.user);
          setProfileData(response.step_data.distributor_profile);
          setCompletedSteps(response.completed_steps);
          setIsDataLoaded(true);

          if (response.step_data.user) {
            const user = response.step_data.user;
            onChange({
              target: { name: "full_name", value: user.full_name || "" },
            } as any);
            onChange({
              target: { name: "email", value: user.email || "" },
            } as any);
            onChange({
              target: {
                name: "date_of_birth",
                value: user.date_of_birth?.split(" ")[0] || "",
              },
            } as any);
            onChange({
              target: {
                name: "mobile",
                value: user.phone?.replace(/^\+91/, "") || "",
              },
            } as any);
            onChange({
              target: { name: "sponsor_id", value: user.sponsor_id || "" },
            } as any);
            onChange({
              target: {
                name: "placement_leg",
                value: user.placement_leg || "Auto",
              },
            } as any);
          }

          if (response.step_data.distributor_profile) {
            const profile = response.step_data.distributor_profile;
            onChange({
              target: {
                name: "aadhaar_verified",
                value: profile.aadhaar_verified === true,
              },
            } as any);
            onChange({
              target: {
                name: "pan_verified",
                value: profile.pan_verified === true,
              },
            } as any);
            onChange({
              target: {
                name: "bank_verified",
                value: profile.bank_verified === true,
              },
            } as any);
            onChange({
              target: { name: "bank_name", value: profile.bank_name || "" },
            } as any);
            onChange({
              target: {
                name: "bank_account_number",
                value: profile.bank_account_number || "",
              },
            } as any);
            onChange({
              target: {
                name: "bank_ifsc_code",
                value: profile.bank_ifsc || "",
              },
            } as any);
            onChange({
              target: {
                name: "location_verified",
                value: profile.location_consent === true,
              },
            } as any);
            onChange({
              target: {
                name: "location_consent",
                value: profile.location_consent === true,
              },
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
              message:
                error?.data?.message || "Failed to load application data",
              type: "error",
            }),
          );
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email]);

  // Clear registration-only data and redirect after successful submission.
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
      "distributor_phone_verified",
      "distributor_verified_email",
      "distributor_email_verified",
      "distributor_temp_token",
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
      "distributor_accept_terms_text",
      "distributor_accept_refund_policy_text",
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn("sessionStorage clear failed:", error);
    }

    if (typeof window !== "undefined") {
      window.location.href = LOGIN_REDIRECT_URL;
    }
  };

  const apiStepChecks = useMemo(() => {
    const cs = completedSteps || {};
    return {
      step1: cs.step_1_personal_info === true,
      step2: cs.step_2_sponsor === true,
      step3: cs.step_3_aadhaar === true,
      step4: cs.step_4_pan === true,
      step5: cs.step_5_bank === true,
      step6: cs.step_6_location === true,
    };
  }, [completedSteps]);

  const profileChecks = useMemo(() => {
    const profile = profileData || {};
    return {
      aadhaar: isTruthy(profile.aadhaar_verified),
      pan: isTruthy(profile.pan_verified),
      bank: isTruthy(profile.bank_verified),
      location: isTruthy(profile.location_consent),
    };
  }, [profileData]);

  const dataChecks = useMemo(() => {
    return {
      aadhaar: isTruthy((data as any).aadhaar_verified),
      pan: isTruthy((data as any).pan_verified),
      bank: isTruthy((data as any).bank_verified),
      location:
        isTruthy((data as any).location_verified) ||
        isTruthy((data as any).location_consent),
    };
  }, [data]);

  const step1Verified =
    apiStepChecks.step1 ||
    (!!(userData?.full_name || data.full_name) &&
      !!(userData?.email || data.email) &&
      !!(userData?.phone || data.mobile));

  const step2Verified =
    apiStepChecks.step2 || !!(userData?.sponsor_id || data.sponsor_id);
  const step3Verified =
    apiStepChecks.step3 || profileChecks.aadhaar || dataChecks.aadhaar;
  const step4Verified =
    apiStepChecks.step4 || profileChecks.pan || dataChecks.pan;
  const step5Verified =
    apiStepChecks.step5 || profileChecks.bank || dataChecks.bank;
  const step6Verified =
    apiStepChecks.step6 || profileChecks.location || dataChecks.location;

  const isAllStepsVerified =
    step1Verified &&
    step2Verified &&
    step3Verified &&
    step4Verified &&
    step5Verified &&
    step6Verified;

  const isAllAccepted =
    isTruthy((data as any).terms_accepted) &&
    isTruthy((data as any).agreement_accepted) &&
    isTruthy((data as any).code_of_conduct_accepted) &&
    isTruthy((data as any).refund_policy_accepted);

  const isSubmitDisabled =
    isNavigating ||
    submitSuccess ||
    !isAllAccepted ||
    isSubmitting ||
    !phoneNumber ||
    !isAllStepsVerified ||
    isLoading;

  const getStatusColor = (status: boolean) =>
    status ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100";

  // Terms of Use keeps its typed confirmation popup. The Refund Policy is
  // read-only: the user reads the complete policy and confirms with one click.
  const openAcceptanceModal = (type: AcceptanceType, label: string) => {
    const isRefundPolicy = type === "refund-policy";

    setAcceptanceModal({
      isOpen: true,
      type,
      expectedText: isRefundPolicy ? "" : TERMS_CONDITIONS_TEXT,
      label,
      policyText: isRefundPolicy ? REFUND_POLICY_TEXT : "",
    });
    setTypedText("");
    setAcceptanceError("");
  };

  const closeAcceptanceModal = () => {
    setAcceptanceModal({
      isOpen: false,
      type: null,
      expectedText: "",
      label: "",
      policyText: "",
    });
    setTypedText("");
    setAcceptanceError("");
  };

  const blockClipboardEvent = (
    event:
      | React.ClipboardEvent<HTMLElement>
      | React.DragEvent<HTMLElement>
      | React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const blockClipboardShortcuts = (event: React.KeyboardEvent<HTMLElement>) => {
    const key = event.key.toLowerCase();
    const isClipboardShortcut =
      (event.ctrlKey || event.metaKey) && ["c", "x", "v"].includes(key);
    const isShiftInsertPaste = event.shiftKey && event.key === "Insert";

    if (isClipboardShortcut || isShiftInsertPaste) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // The Refund Policy is accepted by clicking "I Agree" after reading it.
  // No typing or copy/paste confirmation is required for this policy.
  const handleRefundPolicyAccept = () => {
    onChange({
      target: { name: "refund_policy_accepted", value: true },
    } as any);
    onChange({
      target: {
        name: "accept_refund_policy_text",
        value: REFUND_POLICY_ACCEPTANCE_TEXT,
      },
    } as any);

    setAcceptRefundPolicyTextLocal(REFUND_POLICY_ACCEPTANCE_TEXT);
    try {
      localStorage.setItem(
        "distributor_accept_refund_policy_text",
        REFUND_POLICY_ACCEPTANCE_TEXT,
      );
    } catch {
      // Local storage is optional; form state remains the source of truth.
    }

    dispatch(
      showToast({
        message: "Refund Policy accepted successfully",
        type: "success",
      }),
    );
    closeAcceptanceModal();
  };

  // Terms of Use still requires the user to type the displayed sentence.
  const handleAcceptance = () => {
    if (acceptanceModal.type !== "terms") return;

    const trimmedTyped = typedText.trim();
    const trimmedExpected = acceptanceModal.expectedText.trim();

    if (!trimmedTyped) {
      setAcceptanceError("Please type the acceptance text to continue.");
      return;
    }

    if (trimmedTyped !== trimmedExpected) {
      setAcceptanceError(
        `Text does not match. Please type exactly: "${trimmedExpected}"`,
      );
      return;
    }

    onChange({
      target: { name: "terms_accepted", value: true },
    } as any);
    onChange({
      target: { name: "accept_terms_text", value: trimmedTyped },
    } as any);

    setAcceptTermsTextLocal(trimmedTyped);
    try {
      localStorage.setItem("distributor_accept_terms_text", trimmedTyped);
    } catch {
      // Local storage is optional; form state remains the source of truth.
    }

    dispatch(
      showToast({
        message: "Terms of Use accepted successfully",
        type: "success",
      }),
    );

    closeAcceptanceModal();
  };

  const checkboxes: {
    name: string;
    label: string;
    type: AcceptanceType;
  }[] = [
    { name: "terms_accepted", label: "Terms of Use", type: "terms" },
    {
      name: "agreement_accepted",
      label: "Distributor Agreement",
      type: "agreement",
    },
    {
      name: "code_of_conduct_accepted",
      label: "Code of Conduct",
      type: "code-of-conduct",
    },
    {
      name: "refund_policy_accepted",
      label: "Refund Policy",
      type: "refund-policy",
    },
  ];

  const handleCheckboxChange = (
    checkbox: { name: string; label: string; type: AcceptanceType },
    checked: boolean,
  ) => {
    // Terms and refund policy require the typed confirmation popup first.
    if (checked && checkbox.type === "terms") {
      openAcceptanceModal(checkbox.type, checkbox.label);
      return;
    }

    if (checked && checkbox.type === "refund-policy") {
      openAcceptanceModal(checkbox.type, checkbox.label);
      return;
    }

    onChange({
      target: { name: checkbox.name, value: checked },
    } as any);

    if (!checked && checkbox.name === "terms_accepted") {
      setAcceptTermsTextLocal("");
      onChange({
        target: { name: "accept_terms_text", value: "" },
      } as any);
      try {
        localStorage.removeItem("distributor_accept_terms_text");
      } catch {
        // Ignore storage cleanup failures.
      }
    }

    if (!checked && checkbox.name === "refund_policy_accepted") {
      setAcceptRefundPolicyTextLocal("");
      onChange({
        target: { name: "accept_refund_policy_text", value: "" },
      } as any);
      try {
        localStorage.removeItem("distributor_accept_refund_policy_text");
      } catch {
        // Ignore storage cleanup failures.
      }
    }
  };

  const handleSubmit = async () => {
    if (
      hasNavigatedRef.current ||
      isNavigating ||
      isSubmitting ||
      submitSuccess
    ) {
      console.log("Navigation already in progress, ignoring click");
      return;
    }

    if (!isAllAccepted) {
      dispatch(
        showToast({
          message: "Please accept all required terms, agreements, and policies.",
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

    const resolvedTermsText =
      acceptTermsTextLocal.trim() ||
      ((data as any)?.accept_terms_text || "").trim();
    const resolvedRefundPolicyText =
      acceptRefundPolicyTextLocal.trim() ||
      ((data as any)?.accept_refund_policy_text || "").trim();

    // Lock the button before making the request to prevent duplicate submits.
    hasNavigatedRef.current = true;
    setIsNavigating(true);
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await step7Submit(
        {
          phone: phoneNumber,
          accept_terms: isTruthy((data as any).terms_accepted) ? 1 : 0,
          accept_agreement: isTruthy((data as any).agreement_accepted) ? 1 : 0,
          accept_code_of_conduct: isTruthy(
            (data as any).code_of_conduct_accepted,
          )
            ? 1
            : 0,
          accept_terms_text: resolvedTermsText,
          // New refund policy acceptance fields. The backend should store these
          // against the distributor application for the acceptance record.
          accept_refund_policy: isTruthy(
            (data as any).refund_policy_accepted,
          )
            ? 1
            : 0,
          accept_refund_policy_text: resolvedRefundPolicyText,
        } as any,
      ).unwrap();

      if (response?.status || response?.success) {
        setSubmitSuccess(true);
        setApplicationData(response.data || {});

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
            message:
              response.message || "Application submitted successfully!",
            type: "success",
          }),
        );

        onChange({
          target: { name: "application_submitted", value: true },
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
          try {
            await onSubmit();
          } catch (error) {
            console.warn("onSubmit callback error:", error);
          }
        }

        setTimeout(() => {
          clearNavigationHistory();
        }, 2000);
      } else {
        const errorMessage =
          response?.message ||
          "Application submission failed. Please try again.";
        setSubmissionError(errorMessage);
        dispatch(showToast({ message: errorMessage, type: "error" }));
        hasNavigatedRef.current = false;
        setIsNavigating(false);
      }
    } catch (error: any) {
      console.error("Application submission error:", error);

      const httpStatus = error?.status;
      if (httpStatus === 200 || httpStatus === 201) {
        setSubmitSuccess(true);
        setApplicationData(error?.data?.data || {});
        dispatch(
          showToast({
            message:
              error?.data?.message || "Application submitted successfully!",
            type: "success",
          }),
        );
        setTimeout(() => {
          clearNavigationHistory();
        }, 2000);
        return;
      }

      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Application submission failed. Please try again.";
      setSubmissionError(errorMessage);
      dispatch(showToast({ message: errorMessage, type: "error" }));
      hasNavigatedRef.current = false;
      setIsNavigating(false);
    } finally {
      setIsSubmitting(false);
    }
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
                    Review &amp; Submit
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
              Please review all your information before submitting. Make sure
              everything is correct.
            </InfoBox>

            {/* Personal Information */}
            <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <User className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Personal Information
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-500">Full Name</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">
                    {userData?.full_name || data.full_name || "-"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-500">Date of Birth</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                    {userData?.date_of_birth?.split(" ")[0] ||
                      data.date_of_birth ||
                      "-"}
                  </span>
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
                    {userData?.phone || data.mobile
                      ? `+91 ${data.mobile || userData?.phone?.replace(/^\+91/, "") || ""}`
                      : "-"}
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
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Sponsor Information
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-500">Sponsor ID</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">
                    {userData?.sponsor_id || data.sponsor_id || "None"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-500">Placement Leg</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                    {userData?.placement_leg || data.placement_leg || "Auto"}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Verification Status
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { label: "Aadhaar", verified: step3Verified, pending: "Pending", done: "✓ Verified" },
                  { label: "PAN", verified: step4Verified, pending: "Pending", done: "✓ Verified" },
                  { label: "Bank Account", verified: step5Verified, pending: "Pending", done: "✓ Verified" },
                  { label: "Location Consent", verified: step6Verified, pending: "Not Granted", done: "✓ Granted" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b last:border-b-0 border-gray-100 gap-1 sm:gap-0"
                  >
                    <span className="text-xs sm:text-sm text-gray-500">{item.label}</span>
                    <span
                      className={`text-[10px] sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full ${getStatusColor(item.verified)}`}
                    >
                      {item.verified ? item.done : item.pending}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Information */}
            {(profileData?.bank_name || data.bank_name) && (
              <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                    Bank Information
                  </h3>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-gray-500">Bank Name</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">
                      {profileData?.bank_name || data.bank_name || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-gray-500">Account Holder</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 break-all">
                      {profileData?.bank_holder_name || data.bank_holder_name || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 border-b border-gray-100 gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-gray-500">Account Number</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      {userData?.account_last4 || data.bank_account_number
                        ? `****${(
                            userData?.account_last4 || data.bank_account_number
                          )?.slice(-4)}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 sm:py-1.5 gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-gray-500">IFSC Code</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 uppercase">
                      {profileData?.bank_ifsc || data.bank_ifsc_code || "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms, Agreement and Refund Policy */}
            <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700">
                  Terms &amp; Conditions
                </h4>
              </div>

              {checkboxes.map((checkbox) => {
                const checked = isTruthy((data as any)[checkbox.name]);
                const isRefundPolicy = checkbox.type === "refund-policy";

                return (
                  <label
                    key={checkbox.name}
                    className={`flex items-start gap-2 sm:gap-3 ${
                      isSubmitting || isNavigating || submitSuccess
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                    } p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors`}
                  >
                    <input
                      type="checkbox"
                      name={checkbox.name}
                      checked={checked}
                      onChange={(event) =>
                        handleCheckboxChange(checkbox, event.target.checked)
                      }
                      disabled={isSubmitting || isNavigating || submitSuccess}
                      className="mt-0.5 sm:mt-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)] flex-shrink-0"
                    />

                    <span className="text-[11px] sm:text-sm text-gray-600 leading-relaxed">
                      {isRefundPolicy ? "I have read and agree to the " : "I accept the "}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          if (isRefundPolicy) {
                            openAcceptanceModal("refund-policy", "Refund Policy");
                          } else {
                            setLegalModalType(checkbox.type as LegalType);
                            setLegalModalOpen(true);
                          }
                        }}
                        disabled={isSubmitting || isNavigating || submitSuccess}
                        className="text-[var(--gold-deep)] hover:underline font-medium cursor-pointer bg-transparent border-0 p-0 disabled:cursor-not-allowed"
                      >
                        {checkbox.label}
                      </button>
                      {isRefundPolicy && "."}
                    </span>
                  </label>
                );
              })}

              {(errors.terms_accepted ||
                errors.agreement_accepted ||
                errors.code_of_conduct_accepted ||
                (errors as any).refund_policy_accepted) && (
                <p className="text-[10px] sm:text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  You must accept all terms, agreements, and the refund policy
                  before submitting your application.
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
                  <span className="break-words">
                    Please complete all previous steps before submitting.
                  </span>
                  <button
                    type="button"
                    onClick={onBackToMobile}
                    className="text-[var(--gold-deep)] hover:underline font-medium text-[10px] sm:text-xs"
                  >
                    Go to start
                  </button>
                </div>
              )}

              {(isSubmitting || isNavigating) && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                  <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                  Submitting application...
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={onBack}
                disabled={isNavigating || submitSuccess}
                className="w-full sm:w-auto text-center text-gray-600 hover:text-gray-800 font-medium text-xs sm:text-sm transition-colors duration-200 py-2 sm:py-0 disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="w-full sm:w-auto bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] text-sm sm:text-base"
              >
                {isSubmitting || isNavigating || isLoading ? (
                  <>
                    <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                    {isNavigating ? "Loading next step..." : "Submitting..."}
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
                    Application Submitted!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    Your distributor application has been submitted
                    successfully.
                  </p>
                  {applicationData?.application_id && (
                    <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 mb-1.5 sm:mb-2">
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        Application ID
                      </p>
                      <p className="font-mono font-semibold text-[#06101E] text-sm sm:text-base break-all">
                        {applicationData.application_id}
                      </p>
                    </div>
                  )}
                  {applicationData?.distributor_id && (
                    <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4">
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        Distributor ID
                      </p>
                      <p className="font-mono font-semibold text-[#06101E] text-sm sm:text-base break-all">
                        {applicationData.distributor_id}
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Redirecting to login...
                  </p>
                  <div className="mt-3 sm:mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[var(--gold)] rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Existing legal content modal for Terms / Agreement / Code of Conduct */}
      <LegalModal
        isOpen={legalModalOpen}
        type={legalModalType}
        onClose={() => {
          setLegalModalOpen(false);
          setLegalModalType(null);
        }}
      />

      {/* Terms typing popup and read-only Refund Policy popup */}
      {acceptanceModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--navy)]/60 backdrop-blur-sm px-3 sm:px-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full mx-2 sm:mx-4 p-4 sm:p-6 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[var(--gold-deep)]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--navy)]">
                  {acceptanceModal.label} Acceptance
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAcceptanceModal}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                aria-label="Close acceptance popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {acceptanceModal.type === "refund-policy" ? (
              <>
                <p className="text-[11px] sm:text-sm font-semibold text-gray-700 mb-2">
                  Refund Policy
                </p>
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4">
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                    {REFUND_POLICY_TEXT}
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={closeAcceptanceModal}
                    className="flex-1 px-3 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRefundPolicyAccept}
                    className="flex-1 px-3 py-2 sm:py-2.5 rounded-xl bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    I Agree
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] sm:text-sm text-gray-500 mb-2 sm:mb-3 leading-relaxed">
                  To accept, please type the following text exactly as shown below:
                </p>

                <div
                  className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 sm:p-3 mb-2 sm:mb-3 select-none"
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                  }}
                  onCopy={blockClipboardEvent}
                  onCut={blockClipboardEvent}
                  onContextMenu={blockClipboardEvent}
                  onDragStart={blockClipboardEvent}
                  onKeyDown={blockClipboardShortcuts}
                >
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 font-medium">
                    Type this text:
                  </p>
                  <p
                    className="text-xs sm:text-sm font-mono font-semibold text-[var(--navy)] break-words select-none"
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                    onCopy={blockClipboardEvent}
                    onCut={blockClipboardEvent}
                    onContextMenu={blockClipboardEvent}
                    onDragStart={blockClipboardEvent}
                  >
                    {acceptanceModal.expectedText}
                  </p>
                </div>

                <input
                  type="text"
                  value={typedText}
                  onChange={(event) => {
                    setTypedText(event.target.value);
                    setAcceptanceError("");
                  }}
                  onPaste={blockClipboardEvent}
                  onCopy={blockClipboardEvent}
                  onCut={blockClipboardEvent}
                  onDrop={blockClipboardEvent}
                  onContextMenu={blockClipboardEvent}
                  onKeyDown={blockClipboardShortcuts}
                  placeholder="Type the text here..."
                  className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 outline-none text-xs sm:text-sm font-mono text-[var(--navy)] bg-white transition-all duration-200 placeholder:font-sans placeholder:text-gray-300"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                />

                {acceptanceError && (
                  <p className="text-[10px] sm:text-xs text-red-500 mt-1.5 sm:mt-2 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{acceptanceError}</span>
                  </p>
                )}

                <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <button
                    type="button"
                    onClick={closeAcceptanceModal}
                    className="flex-1 px-3 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptance}
                    disabled={!typedText.trim()}
                    className="flex-1 px-3 py-2 sm:py-2.5 rounded-xl bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    Accept
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
