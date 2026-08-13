// components/distributor/registration/components/steps/PANStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  IdCard,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useStep4PANMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

/**
 * Same theme tokens as EmailCheckScreen / LocationStep / BankStep so every
 * step of the flow reads as one product instead of separately-styled screens.
 */
const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

export const PANStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(false);
  const [panError, setPanError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [panLast4, setPanLast4] = useState("");

  // API Hooks
  const [step4PAN] = useStep4PANMutation();
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

  // ==========================================
  // ✅ FETCH STEP DATA FROM API
  // ==========================================

  const fetchStepData = async () => {
    const email = data.email || localStorage.getItem("distributor_email") || "";

    if (!email) {
      console.log("No email found to fetch step data");
      return;
    }

    try {
      console.log("📡 Fetching step 4 data for email:", email);
      const response = await getStepData({
        step: "4",
        phone: email,
      }).unwrap();

      if (response.status && response.step_data) {
        console.log("✅ Step 4 data fetched:", response);

        const userData = response.step_data.user;
        const profileData = response.step_data.distributor_profile;

        // Check if PAN is verified
        if (userData.pan_last4) {
          setPanLast4(userData.pan_last4);

          // Mark as verified
          onChange({
            target: {
              name: "pan_verified",
              value: true,
            },
          } as any);

          // Set masked PAN number for display
          onChange({
            target: {
              name: "pan_number",
              value: userData.pan_last4,
            },
          } as any);

          // Mark data as loaded from API
          setIsDataLoadedFromAPI(true);

          dispatch(
            showToast({
              message: "Loaded PAN verification data successfully",
              type: "success",
            }),
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching step 4 data:", error);
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message: error?.data?.message || "Failed to load PAN data",
            type: "error",
          }),
        );
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const emailFromProps = data.email;
      const emailFromStorage = localStorage.getItem("distributor_email");
      const email = emailFromProps || emailFromStorage || "";

      if (email) {
        console.log("📧 Loading PAN data for email:", email);
        await fetchStepData();
      }
    };

    loadData();
  }, [data.email]);

  // ==========================================
  // ✅ CLEAR REGISTRATION DATA
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
  // ✅ PAN VERIFICATION
  // ==========================================

  const handlePANVerify = async () => {
    const cleanPan =
      data.pan_number?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

    // Validate PAN number
    if (cleanPan.length !== 10) {
      setPanError("Please enter a valid 10-character PAN");
      dispatch(
        showToast({
          message: "Please enter a valid 10-character PAN",
          type: "error",
        }),
      );
      return;
    }

    // Validate PAN pattern: First 5 letters, next 4 digits, last 1 letter
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panPattern.test(cleanPan)) {
      setPanError("Invalid PAN format. Format: ABCDE1234F");
      dispatch(
        showToast({
          message: "Invalid PAN format. Format: ABCDE1234F",
          type: "error",
        }),
      );
      return;
    }

    if (!phoneNumber) {
      setPanError(
        "Phone number not found. Please go back and verify your mobile.",
      );
      dispatch(
        showToast({
          message: "Phone number not found. Please verify your mobile first.",
          type: "error",
        }),
      );
      return;
    }

    setPanError("");
    setIsVerifying(true);

    try {
      const response = await step4PAN({
        phone: phoneNumber,
        encrypted_pan: cleanPan,
      }).unwrap();

      if (response.status) {
        onChange({
          target: {
            name: "pan_verified",
            value: true,
          },
        } as any);

        dispatch(
          showToast({
            message: response.message || "PAN verified successfully",
            type: "success",
          }),
        );

        // Fetch step data after successful verification
        await fetchStepData();

        // Auto proceed to next step
        setTimeout(() => {
          onNext?.();
        }, 1000);
      } else {
        const errorMsg =
          response.message || "PAN verification failed. Please try again.";
        setPanError(errorMsg);
        dispatch(
          showToast({
            message: errorMsg,
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("PAN verification error:", error);
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "PAN verification failed. Please try again.";
      setPanError(errorMsg);
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ==========================================
  // ✅ HANDLE NEXT - POST OR NAVIGATE
  // ==========================================

  const handleNext = () => {
    // ✅ CHECK: If data is loaded from API and PAN is verified,
    // just navigate to next step without calling POST API
    if (isDataLoadedFromAPI && data.pan_verified) {
      console.log(
        "✅ PAN data already exists - Navigating to next step without POST",
      );
      dispatch(
        showToast({
          message: "PAN already verified. Proceeding to next step.",
          type: "success",
        }),
      );
      setTimeout(() => onNext(), 500);
      return;
    }

    // If not verified, call verification API
    if (!data.pan_verified) {
      handlePANVerify();
    } else {
      onNext();
    }
  };

  // ==========================================
  // ✅ HANDLE INPUT CHANGES
  // ==========================================

  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 10) value = value.slice(0, 10);

    // Reset API loaded state when user changes input
    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
    }

    onChange({
      target: {
        name: "pan_number",
        value: value,
      },
    } as any);

    setPanError("");
  };

  // Get clean PAN number for validation
  const cleanPan =
    data.pan_number?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

  // Check if Continue button should be enabled
  const isContinueEnabled = () => {
    if (isDataLoadedFromAPI && data.pan_verified) {
      return true;
    }
    return data.pan_number && cleanPan.length === 10 && !isVerifying;
  };

  // Get button label
  const getButtonLabel = () => {
    if (isDataLoadedFromAPI && data.pan_verified) {
      return "Continue";
    }
    if (isVerifying) {
      return "Verifying...";
    }
    return "Verify PAN";
  };

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
        className="min-h-[60vh] flex items-center justify-center px-4 py-10"
      >
        {/* Centered surface card, matching the rest of the registration flow */}
        <div className="w-full max-w-lg mx-auto">
          <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-6 py-8 sm:px-9 sm:py-10">
            {/* Ambient glow to match the other steps */}
            <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
            </div>

            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                      <IdCard className="w-5 h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                      PAN Verification
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">
                    Verify your PAN for tax compliance
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading your PAN data...
                    </div>
                  )}
                  {isDataLoadedFromAPI && (
                    <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-3 rounded-full inline-block">
                      Existing data loaded
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
                    border border-[var(--gold)]/40 bg-[#FFFBEF]
                    text-sm font-semibold text-[var(--gold-deep)]
                    hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)]
                    shadow-sm hover:shadow-md
                    transition-all duration-200 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                  New Registration
                </button>
              </div>

              <InfoBox type="info" title="Why this is needed">
                PAN verification is mandatory for distributor activation. A
                verified PAN is required for tax deduction on commission and
                compliance with income tax regulations.
              </InfoBox>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pan_number"
                      value={data.pan_number || ""}
                      onChange={handlePANChange}
                      placeholder={
                        isDataLoadedFromAPI ? "*****" + panLast4 : "ABCDE1234F"
                      }
                      maxLength={10}
                      className={
                        "w-full h-14 px-4 text-black rounded-2xl border uppercase tracking-wider font-medium " +
                        (errors.pan_number || panError
                          ? "border-red-400 ring-2 ring-red-100"
                          : data.pan_verified
                            ? "border-emerald-400 bg-emerald-50/60"
                            : isDataLoadedFromAPI
                              ? "border-blue-400 bg-blue-50/60"
                              : "border-gray-200") +
                        " bg-white focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal"
                      }
                      disabled={
                        isVerifying ||
                        data.pan_verified ||
                        (isDataLoadedFromAPI && data.pan_verified)
                      }
                    />
                    {data.pan_verified && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {(errors.pan_number || panError) && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      {errors.pan_number || panError}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    {isDataLoadedFromAPI && data.pan_verified
                      ? "✓ PAN already verified. Only last 4 characters are visible."
                      : "Format: ABCDE1234F (5 letters, 4 digits, 1 letter)"}
                  </p>
                </div>

                {isVerifying && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying PAN...
                  </div>
                )}

                {data.pan_verified && (
                  <div className="bg-emerald-50/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 text-sm text-emerald-700 flex items-center gap-2.5 font-medium">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      PAN verified successfully
                      {isDataLoadedFromAPI && (
                        <span className="ml-2 text-xs text-blue-600">
                          (loaded from saved data)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <FormActions
                  onBack={onBack}
                  onNext={
                    isDataLoadedFromAPI && data.pan_verified
                      ? onNext
                      : undefined
                  }
                  onSubmit={
                    !isDataLoadedFromAPI || !data.pan_verified
                      ? handlePANVerify
                      : undefined
                  }
                  isSubmitDisabled={!isContinueEnabled()}
                  isLoading={isVerifying}
                  submitLabel={getButtonLabel()}
                  nextLabel="Continue →"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-4"
          style={{ fontFamily: theme.font }}
        >
          <div className="bg-white rounded-[28px] max-w-md w-full mx-4 p-6 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-50">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-[#06101E] mb-2 tracking-tight">
              Start New Registration?
            </h3>

            <p className="text-gray-500 text-center text-sm mb-6 font-medium">
              All your entered information will be discarded. This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
              <p className="text-xs text-red-600 text-center font-semibold">
                Warning: Your current progress will be lost
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewRegistration}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]"
              >
                <PlusCircle className="w-4 h-4" />
                Yes, Start New
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
