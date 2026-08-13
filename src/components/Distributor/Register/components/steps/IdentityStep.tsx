// components/distributor/registration/components/steps/IdentityStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { DatePicker } from "../DatePicker";
import { PasswordInput } from "../PasswordInput";
import { StepProps } from "../../types";
import ConstellationBackground from "@/components/common/ConstellationBackground";
import authApi from "@/lib/redux/api/authApi";
import {
<<<<<<< Updated upstream
    useDistributorsendOTPMutation,
    useVerifyPhoneOTPMutation,
    useVerifyEmailOTPMutation,
    useStep1PersonalMutation,
    distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import {
    CheckCircle,
    Phone,
    Mail,
    Loader2,
    PlusCircle,
    AlertTriangle,
    X,
=======
  useDistributorsendOTPMutation,
  useVerifyPhoneOTPMutation,
  useVerifyEmailOTPMutation,
  useStep1PersonalMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import {
  CheckCircle,
  Phone,
  Mail,
  Loader2,
  PlusCircle,
  AlertTriangle,
  X,
  Lock,
  User,
  Eye,
  EyeOff,
>>>>>>> Stashed changes
} from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { InfoBox } from "../InfoBox";

/**
 * Same theme tokens as SponsorStep / EmailCheckScreen / LocationStep / BankStep / PANStep / AadhaarStep
 * so every step of the flow reads as one product instead of separately styled screens.
 */
const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

export const IdentityStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBackToMobile,
}) => {
<<<<<<< Updated upstream
    const dispatch = useAppDispatch();
    const [ageError, setAgeError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
    const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
    const [newEmailInput, setNewEmailInput] = useState("");
=======
  const dispatch = useAppDispatch();
  const [ageError, setAgeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
>>>>>>> Stashed changes

    // Mobile verification states
    const [mobileInput, setMobileInput] = useState("");
    const [mobileOtpInput, setMobileOtpInput] = useState("");
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [showMobileOtp, setShowMobileOtp] = useState(false);
    const [mobileError, setMobileError] = useState("");
    const [mobileResendTimer, setMobileResendTimer] = useState(0);
    const [isMobileOtpSending, setIsMobileOtpSending] = useState(false);
    const [isMobileVerifying, setIsMobileVerifying] = useState(false);
    const [isMobileFromCheck, setIsMobileFromCheck] = useState(false);

    // Email verification states
    const [emailInput, setEmailInput] = useState("");
    const [emailOtpInput, setEmailOtpInput] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showEmailOtp, setShowEmailOtp] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [emailResendTimer, setEmailResendTimer] = useState(0);
    const [isEmailOtpSending, setIsEmailOtpSending] = useState(false);
    const [isEmailVerifying, setIsEmailVerifying] = useState(false);

    // Temp token state
    const [tempToken, setTempToken] = useState("");

<<<<<<< Updated upstream
    // API Hooks
    const [sendOTP] = useDistributorsendOTPMutation();
    const [verifyPhoneOTP] = useVerifyPhoneOTPMutation();
    const [verifyEmailOTP] = useVerifyEmailOTPMutation();
    const [step1Personal] = useStep1PersonalMutation();
=======
  // Password state for existing users - store hashed password but don't display it
  const [existingPassword, setExistingPassword] = useState("");
  const [hasExistingPassword, setHasExistingPassword] = useState(false);

  // API Hooks
  const [sendOTP] = useDistributorsendOTPMutation();
  const [verifyPhoneOTP] = useVerifyPhoneOTPMutation();
  const [verifyEmailOTP] = useVerifyEmailOTPMutation();
  const [step1Personal] = useStep1PersonalMutation();
  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();
>>>>>>> Stashed changes

    // ==========================================
    // ✅ COMPLETE CACHE CLEARING FUNCTIONS
    // ==========================================

<<<<<<< Updated upstream
    // Reset distributor API state completely
    const resetDistributorAPI = () => {
        try {
            // Reset RTK Query state
            dispatch(distributorAuthApi.util.resetApiState());

            // Invalidate all distributor auth tags
            dispatch(
                distributorAuthApi.util.invalidateTags([
                    "DistributorCheckStatus",
                    "DistributorStepData",
                    "User",
                    "Auth",
                    "Registration",
                    "DistributorPersonal",
                    "DistributorSponsor",
                    "DistributorAadhaar",
                    "DistributorPAN",
                    "DistributorBank",
                    "DistributorLocation",
                    "DistributorSubmit",
                ]),
            );

            // Also reset auth API
            dispatch(authApi.util.resetApiState());
            dispatch(
                authApi.util.invalidateTags([
                    "User",
                    "Auth",
                    "Registration",
                    "Distributor",
                ]),
            );

            console.log("✅ Distributor API reset successfully");
        } catch (error) {
            console.error("Error resetting distributor API:", error);
=======
  const resetDistributorAPI = () => {
    try {
      dispatch(distributorAuthApi.util.resetApiState());
      dispatch(
        distributorAuthApi.util.invalidateTags([
          "DistributorCheckStatus",
          "DistributorStepData",
          "User",
          "Auth",
          "Registration",
          "DistributorPersonal",
          "DistributorSponsor",
          "DistributorAadhaar",
          "DistributorPAN",
          "DistributorBank",
          "DistributorLocation",
          "DistributorSubmit",
        ]),
      );
      dispatch(authApi.util.resetApiState());
      dispatch(
        authApi.util.invalidateTags([
          "User",
          "Auth",
          "Registration",
          "Distributor",
        ]),
      );
      console.log("✅ Distributor API reset successfully");
    } catch (error) {
      console.error("Error resetting distributor API:", error);
    }
  };

  const clearAllRegistrationData = (clearCache: boolean = true) => {
    setIsMobileVerified(false);
    setShowMobileOtp(false);
    setMobileInput("");
    setMobileOtpInput("");
    setMobileError("");
    setMobileResendTimer(0);
    setIsMobileFromCheck(false);
    setIsEmailVerified(false);
    setEmailInput("");
    setEmailOtpInput("");
    setEmailError("");
    setEmailResendTimer(0);
    setTempToken("");
    setIsDataLoadedFromAPI(false);
    setAgeError("");
    setIsSubmitting(false);
    setExistingPassword("");
    setShowPasswordField(false);
    setHasExistingPassword(false);

    const itemsToClear = [
      "distributor_verified_phone",
      "distributor_phone_verified",
      "distributor_mobile",
      "distributor_verified_email",
      "distributor_email_verified",
      "distributor_temp_token",
      "distributor_exists",
      "distributor_status",
      "user_data",
      "customer_otp",
      "customer_phone",
      "distributor_step_data",
      "distributor_step_completed",
      "distributor_application",
      "distributor_application_data",
      "distributor_application_status",
      "verified_phone",
      "phone_verified",
      "verified_email",
      "email_verified",
      "temp_token",
      "distributor_check_status",
      "distributor_phone",
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
      "distributor_email",
    ];

    itemsToClear.forEach((key) => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
      }
    });

    sessionStorage.clear();
    console.log("✅ SessionStorage cleared");

    if (clearCache) {
      resetDistributorAPI();
    }
  };

  // ==========================================
  // ✅ FETCH STEP DATA FROM API USING EMAIL
  // ==========================================

  const fetchStepData = async () => {
    const email = data.email || localStorage.getItem("distributor_email") || "";

    if (!email) {
      console.log("No email found to fetch step data");
      return;
    }

    try {
      console.log("📡 Fetching step data for email:", email);
      const response = await getStepData({
        step: "1",
        phone: email,
      }).unwrap();

      if (response.status && response.step_data) {
        console.log("✅ Step 1 data fetched:", response);

        const userData = response.step_data.user;
        const profileData = response.step_data.distributor_profile;

        // Update email if available
        if (userData.email) {
          setEmailInput(userData.email);
          onChange({
            target: { name: "email", value: userData.email },
          } as any);

          if (userData.email_verified_at) {
            setIsEmailVerified(true);
            localStorage.setItem("distributor_verified_email", userData.email);
            localStorage.setItem("distributor_email_verified", "true");
          }
        }

        // Update mobile if available
        if (userData.phone) {
          const phoneNumber = userData.phone.replace(/^\+91/, "");
          setMobileInput(phoneNumber);
          setIsMobileFromCheck(true);

          if (userData.phone_verified === 1 || userData.phone_verified_at) {
            setIsMobileVerified(true);
            localStorage.setItem("distributor_verified_phone", phoneNumber);
            localStorage.setItem("distributor_phone_verified", "true");
          }
        }

        // Update full name if available
        if (userData.full_name) {
          onChange({
            target: { name: "full_name", value: userData.full_name },
          } as any);
        }

        // Update date of birth if available
        if (userData.date_of_birth) {
          const dob = userData.date_of_birth.split(" ")[0];
          onChange({
            target: { name: "date_of_birth", value: dob },
          } as any);

          const age = validateAge(dob);
          if (age < 18 && age > 0) {
            setAgeError(
              "You must be at least 18 years old to register as a distributor",
            );
          } else {
            setAgeError("");
          }
        }

        // ✅ Store the hashed password and mark that user has a password
        if (userData.password) {
          setExistingPassword(userData.password);
          setHasExistingPassword(true);
          // Set password fields with masked value (stars)
          const maskedPassword = "••••••••";
          onChange({
            target: { name: "password", value: maskedPassword },
          } as any);
          onChange({
            target: { name: "confirm_password", value: maskedPassword },
          } as any);
          setShowPasswordField(false);
        }

        // Mark data as loaded from API
        setIsDataLoadedFromAPI(true);

        dispatch(
          showToast({
            message: "Loaded existing data successfully",
            type: "success",
          }),
        );
      }
    } catch (error: any) {
      console.error("Error fetching step data:", error);
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message: error?.data?.message || "Failed to load existing data",
            type: "error",
          }),
        );
      }
    }
  };

  const validateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Load data on component mount using email from props
  useEffect(() => {
    const loadData = async () => {
      const emailFromProps = data.email;
      const emailFromStorage = localStorage.getItem("distributor_email");
      const email = emailFromProps || emailFromStorage || "";

      if (email) {
        console.log("📧 Loading data for email:", email);
        await fetchStepData();
      } else {
        console.log("⚠️ No email found to fetch step data");
      }
    };

    loadData();
  }, [data.email]);

  // Load email from props
  useEffect(() => {
    if (data.email && !emailInput && !isDataLoadedFromAPI) {
      setEmailInput(data.email);
      setIsEmailVerified(false);
      console.log("📧 Email loaded from previous step:", data.email);
    }

    if (data.mobile && !mobileInput && !isDataLoadedFromAPI) {
      setMobileInput(data.mobile);
      setIsMobileFromCheck(true);
      console.log("📱 Mobile loaded from previous step:", data.mobile);
    }

    const savedTempToken = localStorage.getItem("distributor_temp_token") || "";
    setTempToken(savedTempToken);
  }, [data.email, data.mobile, isDataLoadedFromAPI]);

  // Watch for both verifications and clear temp_token
  useEffect(() => {
    if (isMobileVerified && isEmailVerified) {
      localStorage.removeItem("distributor_temp_token");
      setTempToken("");
    }
  }, [isMobileVerified, isEmailVerified]);

  // Mobile resend timer
  useEffect(() => {
    if (mobileResendTimer > 0) {
      const timer = setTimeout(
        () => setMobileResendTimer(mobileResendTimer - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [mobileResendTimer]);

  // Email resend timer
  useEffect(() => {
    if (emailResendTimer > 0) {
      const timer = setTimeout(
        () => setEmailResendTimer(emailResendTimer - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [emailResendTimer]);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    onChange(e);
    const age = validateAge(dob);
    if (age < 18 && age > 0) {
      setAgeError(
        "You must be at least 18 years old to register as a distributor",
      );
      dispatch(
        showToast({
          message: "You must be at least 18 years old",
          type: "error",
        }),
      );
    } else {
      setAgeError("");
      if (age >= 18) {
        dispatch(
          showToast({
            message: "Valid age confirmed",
            type: "success",
          }),
        );
      }
    }
  };

  const handleChangeMobile = () => {
    setIsMobileVerified(false);
    setShowMobileOtp(false);
    setMobileInput("");
    setMobileOtpInput("");
    setMobileError("");
    setMobileResendTimer(0);
    setIsMobileFromCheck(false);
    localStorage.removeItem("distributor_verified_phone");
    localStorage.removeItem("distributor_phone_verified");
    localStorage.removeItem("distributor_mobile");
    setTempToken("");
    setIsDataLoadedFromAPI(false);

    dispatch(
      showToast({
        message: "Mobile changed, please verify again",
        type: "info",
      }),
    );
  };

  const handleNewRegistration = () => {
    clearAllRegistrationData(true);
    setShowConfirmModal(false);

    dispatch(
      showToast({
        message: "Starting new registration",
        type: "info",
      }),
    );

    if (onBackToMobile) {
      onBackToMobile();
    }
  };

  // ========== CHANGE EMAIL FUNCTIONS ==========
  const handleChangeEmailClick = () => {
    setNewEmailInput(emailInput);
    setShowChangeEmailModal(true);
  };

  const handleConfirmEmailChange = () => {
    if (!newEmailInput || !newEmailInput.includes("@")) {
      dispatch(
        showToast({
          message: "Please enter a valid email address",
          type: "error",
        }),
      );
      return;
    }

    setIsEmailVerified(false);
    setShowEmailOtp(false);
    setEmailOtpInput("");
    setEmailError("");
    setEmailResendTimer(0);
    setEmailInput(newEmailInput);

    onChange({
      target: { name: "email", value: newEmailInput },
    } as any);

    localStorage.removeItem("distributor_verified_email");
    localStorage.removeItem("distributor_email_verified");
    localStorage.removeItem("distributor_email");

    resetDistributorAPI();
    setShowChangeEmailModal(false);

    dispatch(
      showToast({
        message: `Email changed to ${newEmailInput}. Please verify again.`,
        type: "success",
      }),
    );
  };

  // ========== MOBILE OTP FUNCTIONS ==========
  const handleSendMobileOTP = async () => {
    if (!mobileInput || mobileInput.length < 10) {
      setMobileError("Please enter a valid 10-digit mobile number");
      dispatch(
        showToast({
          message: "Please enter a valid 10-digit mobile number",
          type: "error",
        }),
      );
      return;
    }

    let formattedMobile = mobileInput;
    if (!mobileInput.startsWith("+")) {
      formattedMobile = "+91" + mobileInput.replace(/^0+/, "");
    }

    setIsMobileOtpSending(true);
    setMobileError("");

    try {
      const requestData: any = {
        phone: formattedMobile,
        type: "phone",
      };

      if (tempToken && !(isMobileVerified && isEmailVerified)) {
        requestData.temp_token = tempToken;
      }

      const response = await sendOTP(requestData).unwrap();

      if (response.status) {
        setShowMobileOtp(true);
        setMobileResendTimer(60);
        setMobileError("");
        setMobileOtpInput("");

        if (response.temp_token) {
          setTempToken(response.temp_token);
          localStorage.setItem("distributor_temp_token", response.temp_token);
>>>>>>> Stashed changes
        }
    };

    // Helper function to clear all registration data
    const clearAllRegistrationData = (clearCache: boolean = true) => {
        // Clear all states
        setIsMobileVerified(false);
        setShowMobileOtp(false);
        setMobileInput("");
        setMobileOtpInput("");
        setMobileError("");
        setMobileResendTimer(0);
        setIsMobileFromCheck(false);
        setIsEmailVerified(false);
        setEmailInput("");
        setEmailOtpInput("");
        setEmailError("");
        setEmailResendTimer(0);
        setTempToken("");
        setIsDataLoadedFromAPI(false);
        setAgeError("");
        setIsSubmitting(false);

        // Clear all localStorage
        const itemsToClear = [
            "distributor_verified_phone",
            "distributor_phone_verified",
            "distributor_mobile",
            "distributor_verified_email",
            "distributor_email_verified",
            "distributor_temp_token",
            "distributor_exists",
            "distributor_status",
            "user_data",
            "customer_otp",
            "customer_phone",
            "distributor_step_data",
            "distributor_step_completed",
            "distributor_application",
            "distributor_application_data",
            "distributor_application_status",
            "verified_phone",
            "phone_verified",
            "verified_email",
            "email_verified",
            "temp_token",
            "distributor_check_status",
            "distributor_phone",
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

        itemsToClear.forEach((key) => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                console.log(`✅ Removed: ${key}`);
            }
        });

        // Clear sessionStorage
        sessionStorage.clear();
        console.log("✅ SessionStorage cleared");

        // Reset distributor API if requested
        if (clearCache) {
            resetDistributorAPI();
        }
    };

    // Load email from props (from previous step) - NOT from localStorage
    useEffect(() => {
        // Load email from form data (which came from previous step)
        if (data.email && !emailInput) {
            setEmailInput(data.email);
            // Don't auto-verify email, user needs to verify via OTP
            setIsEmailVerified(false);
            console.log("📧 Email loaded from previous step:", data.email);
        }

        // Load mobile from props if available
        if (data.mobile && !mobileInput) {
            setMobileInput(data.mobile);
            setIsMobileFromCheck(true);
            console.log("📱 Mobile loaded from previous step:", data.mobile);
        }

        // Load temp token from localStorage (only for API calls)
        const savedTempToken = localStorage.getItem("distributor_temp_token") || "";
        setTempToken(savedTempToken);
    }, [data.email, data.mobile]);

    const validateAge = (dob: string) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
    };

    // Watch for both verifications and clear temp_token
    useEffect(() => {
        if (isMobileVerified && isEmailVerified) {
            localStorage.removeItem("distributor_temp_token");
            setTempToken("");
        }
    }, [isMobileVerified, isEmailVerified]);

    // Mobile resend timer
    useEffect(() => {
        if (mobileResendTimer > 0) {
            const timer = setTimeout(
                () => setMobileResendTimer(mobileResendTimer - 1),
                1000,
            );
            return () => clearTimeout(timer);
        }
    }, [mobileResendTimer]);

    // Email resend timer
    useEffect(() => {
        if (emailResendTimer > 0) {
            const timer = setTimeout(
                () => setEmailResendTimer(emailResendTimer - 1),
                1000,
            );
            return () => clearTimeout(timer);
        }
    }, [emailResendTimer]);

    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dob = e.target.value;
        onChange(e);
        const age = validateAge(dob);
        if (age < 18 && age > 0) {
            setAgeError(
                "You must be at least 18 years old to register as a distributor",
            );
            dispatch(
                showToast({
                    message: "You must be at least 18 years old",
                    type: "error",
                }),
            );
        } else {
            setAgeError("");
            if (age >= 18) {
                dispatch(
                    showToast({
                        message: "Valid age confirmed",
                        type: "success",
                    }),
                );
            }
        }
    };

    const handleChangeMobile = () => {
        // Clear all mobile related states
        setIsMobileVerified(false);
        setShowMobileOtp(false);
        setMobileInput("");
        setMobileOtpInput("");
        setMobileError("");
        setMobileResendTimer(0);
        setIsMobileFromCheck(false);

        // Clear mobile from localStorage only, but keep email
        localStorage.removeItem("distributor_verified_phone");
        localStorage.removeItem("distributor_phone_verified");
        localStorage.removeItem("distributor_mobile");

        // Clear temp token
        setTempToken("");
        setIsDataLoadedFromAPI(false);

        dispatch(
            showToast({
                message: "Mobile changed, please verify again",
                type: "info",
            }),
        );
    };

    const handleNewRegistration = () => {
        // Clear all data including cache
        clearAllRegistrationData(true);
        setShowConfirmModal(false);

        dispatch(
            showToast({
                message: "Starting new registration",
                type: "info",
            }),
        );

        if (onBackToMobile) {
            onBackToMobile();
        }
    };

    // ========== CHANGE EMAIL FUNCTIONS ==========
    const handleChangeEmailClick = () => {
        setNewEmailInput(emailInput);
        setShowChangeEmailModal(true);
    };

    const handleConfirmEmailChange = () => {
        if (!newEmailInput || !newEmailInput.includes("@")) {
            dispatch(
                showToast({
                    message: "Please enter a valid email address",
                    type: "error",
                }),
            );
            return;
        }

        // Reset email verification
        setIsEmailVerified(false);
        setShowEmailOtp(false);
        setEmailOtpInput("");
        setEmailError("");
        setEmailResendTimer(0);

        // Update email input
        setEmailInput(newEmailInput);

        // Update form data
        onChange({
            target: { name: "email", value: newEmailInput },
        } as any);

        // Clear email from localStorage
        localStorage.removeItem("distributor_verified_email");
        localStorage.removeItem("distributor_email_verified");

        // Reset distributor API
        resetDistributorAPI();

        setShowChangeEmailModal(false);

        dispatch(
            showToast({
                message: `Email changed to ${newEmailInput}. Please verify again.`,
                type: "success",
            }),
        );
    };

    // ========== MOBILE OTP FUNCTIONS ==========
    const handleSendMobileOTP = async () => {
        if (!mobileInput || mobileInput.length < 10) {
            setMobileError("Please enter a valid 10-digit mobile number");
            dispatch(
                showToast({
                    message: "Please enter a valid 10-digit mobile number",
                    type: "error",
                }),
            );
            return;
        }

        let formattedMobile = mobileInput;
        if (!mobileInput.startsWith("+")) {
            formattedMobile = "+91" + mobileInput.replace(/^0+/, "");
        }

        setIsMobileOtpSending(true);
        setMobileError("");

        try {
            const requestData: any = {
                phone: formattedMobile,
                type: "phone",
            };

<<<<<<< Updated upstream
            if (tempToken && !(isMobileVerified && isEmailVerified)) {
                requestData.temp_token = tempToken;
            }
=======
        localStorage.setItem("distributor_verified_phone", mobileInput);
        localStorage.setItem("distributor_phone_verified", "true");
>>>>>>> Stashed changes

            const response = await sendOTP(requestData).unwrap();

            if (response.status) {
                setShowMobileOtp(true);
                setMobileResendTimer(60);
                setMobileError("");
                setMobileOtpInput("");

                if (response.temp_token) {
                    setTempToken(response.temp_token);
                    localStorage.setItem("distributor_temp_token", response.temp_token);
                }

                dispatch(
                    showToast({
                        message: "OTP sent to " + formattedMobile,
                        type: "success",
                    }),
                );
                if (response.expires_in) {
                    dispatch(
                        showToast({
                            message: "OTP expires in " + response.expires_in + " minutes",
                            type: "info",
                        }),
                    );
                }
            } else {
                setMobileError(response.message || "Failed to send OTP");
                dispatch(
                    showToast({
                        message: response.message || "Failed to send OTP",
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Send OTP error:", error);
            const errorMsg =
                error?.data?.message || "Failed to send OTP. Please try again.";
            setMobileError(errorMsg);
            dispatch(
                showToast({
                    message: errorMsg,
                    type: "error",
                }),
            );
        } finally {
            setIsMobileOtpSending(false);
        }
    };

    const handleVerifyMobileOTP = async () => {
        if (!mobileOtpInput || mobileOtpInput.length < 6) {
            setMobileError("Please enter a valid 6-digit OTP");
            dispatch(
                showToast({
                    message: "Please enter a valid 6-digit OTP",
                    type: "error",
                }),
            );
            return;
        }

        let formattedMobile = mobileInput;
        if (!mobileInput.startsWith("+")) {
            formattedMobile = "+91" + mobileInput.replace(/^0+/, "");
        }

<<<<<<< Updated upstream
        setIsMobileVerifying(true);
        setMobileError("");
=======
        // Fetch step data after successful verification
        await fetchStepData();

        dispatch(
          showToast({
            message: "Mobile verified successfully",
            type: "success",
          }),
        );
      } else {
        setMobileError(response.message || "Invalid OTP. Please try again.");
        dispatch(
          showToast({
            message: response.message || "Invalid OTP. Please try again.",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      const errorMsg =
        error?.data?.message || "Failed to verify OTP. Please try again.";
      setMobileError(errorMsg);
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsMobileVerifying(false);
    }
  };
>>>>>>> Stashed changes

        try {
            const requestData: any = {
                phone: formattedMobile,
                otp: mobileOtpInput,
            };

            if (tempToken) {
                requestData.temp_token = tempToken;
            }

            const response = await verifyPhoneOTP(requestData).unwrap();

            if (response.status) {
                setIsMobileVerified(true);
                setShowMobileOtp(false);
                setMobileError("");

                onChange({
                    target: { name: "mobile", value: mobileInput },
                } as any);

                // Store only in localStorage for API calls, not for display
                localStorage.setItem("distributor_verified_phone", mobileInput);
                localStorage.setItem("distributor_phone_verified", "true");

                if (response.temp_token) {
                    setTempToken(response.temp_token);
                    localStorage.setItem("distributor_temp_token", response.temp_token);
                }

                if (isEmailVerified) {
                    localStorage.removeItem("distributor_temp_token");
                    setTempToken("");
                }

                dispatch(
                    showToast({
                        message: "Mobile verified successfully",
                        type: "success",
                    }),
                );
            } else {
                setMobileError(response.message || "Invalid OTP. Please try again.");
                dispatch(
                    showToast({
                        message: response.message || "Invalid OTP. Please try again.",
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Verify OTP error:", error);
            const errorMsg =
                error?.data?.message || "Failed to verify OTP. Please try again.";
            setMobileError(errorMsg);
            dispatch(
                showToast({
                    message: errorMsg,
                    type: "error",
                }),
            );
        } finally {
            setIsMobileVerifying(false);
        }
    };

    const handleResendMobileOTP = () => {
        if (mobileResendTimer === 0) {
            handleSendMobileOTP();
            dispatch(
                showToast({
                    message: "Resending OTP...",
                    type: "info",
                }),
            );
        }
    };

    // ========== EMAIL OTP FUNCTIONS ==========
    const handleSendEmailOTP = async () => {
        if (!emailInput || !emailInput.includes("@")) {
            setEmailError("Please enter a valid email address");
            dispatch(
                showToast({
                    message: "Please enter a valid email address",
                    type: "error",
                }),
            );
            return;
        }

        setIsEmailOtpSending(true);
        setEmailError("");

        try {
            const requestData: any = {
                email: emailInput,
                type: "email",
            };

<<<<<<< Updated upstream
            if (tempToken && !(isMobileVerified && isEmailVerified)) {
                requestData.temp_token = tempToken;
            }
=======
        localStorage.setItem("distributor_verified_email", emailInput);
        localStorage.setItem("distributor_email_verified", "true");
>>>>>>> Stashed changes

            const response = await sendOTP(requestData).unwrap();

            if (response.status) {
                setShowEmailOtp(true);
                setEmailResendTimer(60);
                setEmailError("");
                setEmailOtpInput("");

                if (response.temp_token) {
                    setTempToken(response.temp_token);
                    localStorage.setItem("distributor_temp_token", response.temp_token);
                }

                dispatch(
                    showToast({
                        message: "OTP sent to " + emailInput,
                        type: "success",
                    }),
                );
                if (response.expires_in) {
                    dispatch(
                        showToast({
                            message: "OTP expires in " + response.expires_in + " minutes",
                            type: "info",
                        }),
                    );
                }
            } else {
                setEmailError(response.message || "Failed to send OTP");
                dispatch(
                    showToast({
                        message: response.message || "Failed to send OTP",
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Send Email OTP error:", error);
            const errorMsg =
                error?.data?.message || "Failed to send OTP. Please try again.";
            setEmailError(errorMsg);
            dispatch(
                showToast({
                    message: errorMsg,
                    type: "error",
                }),
            );
        } finally {
            setIsEmailOtpSending(false);
        }
    };

    const handleVerifyEmailOTP = async () => {
        if (!emailOtpInput || emailOtpInput.length < 6) {
            setEmailError("Please enter a valid 6-digit OTP");
            dispatch(
                showToast({
                    message: "Please enter a valid 6-digit OTP",
                    type: "error",
                }),
            );
            return;
        }

        setIsEmailVerifying(true);
        setEmailError("");

        try {
            const requestData: any = {
                email: emailInput,
                otp: emailOtpInput,
            };

            if (tempToken) {
                requestData.temp_token = tempToken;
            }

            const response = await verifyEmailOTP(requestData).unwrap();

            if (response.status) {
                setIsEmailVerified(true);
                setShowEmailOtp(false);
                setEmailError("");

                onChange({
                    target: { name: "email", value: emailInput },
                } as any);

                // Store only in localStorage for API calls, not for display
                localStorage.setItem("distributor_verified_email", emailInput);
                localStorage.setItem("distributor_email_verified", "true");

                if (response.temp_token) {
                    setTempToken(response.temp_token);
                    localStorage.setItem("distributor_temp_token", response.temp_token);
                }

                if (isMobileVerified) {
                    localStorage.removeItem("distributor_temp_token");
                    setTempToken("");
                }

                dispatch(
                    showToast({
                        message: "Email verified successfully",
                        type: "success",
                    }),
                );
            } else {
                setEmailError(response.message || "Invalid OTP. Please try again.");
                dispatch(
                    showToast({
                        message: response.message || "Invalid OTP. Please try again.",
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Verify Email OTP error:", error);
            const errorMsg =
                error?.data?.message || "Failed to verify OTP. Please try again.";
            setEmailError(errorMsg);
            dispatch(
                showToast({
                    message: errorMsg,
                    type: "error",
                }),
            );
        } finally {
            setIsEmailVerifying(false);
        }
    };

    const handleResendEmailOTP = () => {
        if (emailResendTimer === 0) {
            handleSendEmailOTP();
            dispatch(
                showToast({
                    message: "Resending OTP...",
                    type: "info",
                }),
            );
        }
    };

    // ========== SUBMIT STEP 1 ==========
    const handleSubmit = async () => {
        // Regular validation for new registrations
        if (!data.full_name) {
            dispatch(
                showToast({
                    message: "Full name is required",
                    type: "error",
                }),
            );
            return;
        }

<<<<<<< Updated upstream
        if (!data.date_of_birth) {
            dispatch(
                showToast({
                    message: "Date of birth is required",
                    type: "error",
                }),
            );
            return;
        }

        if (!data.password) {
            dispatch(
                showToast({
                    message: "Password is required",
                    type: "error",
                }),
            );
            return;
        }

        if (data.password !== data.confirm_password) {
            dispatch(
                showToast({
                    message: "Passwords do not match",
                    type: "error",
                }),
            );
            return;
        }

        if (!isMobileVerified) {
            setMobileError("Please verify your mobile number first");
            dispatch(
                showToast({
                    message: "Please verify your mobile number first",
                    type: "error",
                }),
            );
            return;
        }

        if (!isEmailVerified) {
            setEmailError("Please verify your email address first");
            dispatch(
                showToast({
                    message: "Please verify your email address first",
                    type: "error",
                }),
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedMobile = mobileInput.startsWith("+")
                ? mobileInput
                : "+91" + mobileInput.replace(/^0+/, "");

            // Prepare the data for API
            const requestData = {
                email: emailInput,
                full_name: data.full_name,
                phone: formattedMobile,
                date_of_birth: data.date_of_birth,
                country: "India",
                terms_condition: "1",
                password: data.password,
                password_confirmation: data.confirm_password,
            };

            const response = await step1Personal(requestData).unwrap();

            if (response.status) {
                // Only clear temp_token and specific items, not everything
                localStorage.removeItem("distributor_temp_token");
                setTempToken("");

                // Clear step data for this step only
                localStorage.removeItem("distributor_step_data");

                // Store step completion status
                localStorage.setItem("distributor_step_completed", "1");

                dispatch(
                    showToast({
                        message: "Personal information saved successfully",
                        type: "success",
                    }),
                );

                // Proceed to next step
                setTimeout(() => onNext(), 500);
            } else {
                const errorMessage =
                    response.message || "Failed to save personal information";
                dispatch(
                    showToast({
                        message: errorMessage,
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Step 1 submission error:", error);

            const errorMessage =
                error?.data?.message || "Failed to save personal information";
            dispatch(
                showToast({
                    message: errorMessage,
                    type: "error",
                }),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to check if mobile is from step data
    const isMobileFromStepData = () => {
        return isMobileFromCheck && mobileInput && isMobileVerified;
    };

    // Check if Continue button should be enabled
    const isContinueEnabled = () => {
        return !!(
            !isSubmitting &&
            !ageError &&
            isMobileVerified &&
            isEmailVerified &&
            data.full_name &&
            data.date_of_birth &&
            data.password &&
            data.password === data.confirm_password
=======
        // Fetch step data after successful verification
        await fetchStepData();

        dispatch(
          showToast({
            message: "Email verified successfully",
            type: "success",
          }),
>>>>>>> Stashed changes
        );
    };

    return (
        <>
            <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl space-y-5">
                    <div className="text-center mb-2">
                        <h2 className="text-2xl font-bold text-[#06101E]">
                            Personal Information
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Verify your contact details to continue
                        </p>
                    </div>

<<<<<<< Updated upstream
                    {/* New Registration Button - Top Right */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#F9C744]/40 bg-[#FFFBEF] text-sm font-semibold text-[#B8860B] shadow-sm whitespace-nowrap"
                        >
                            <PlusCircle className="w-4 h-4" />
                            New Registration
                        </button>
                    </div>
=======
  // ========== SUBMIT STEP 1 ==========
  const handleSubmit = async () => {
    // Validation
    if (!data.full_name) {
      dispatch(
        showToast({
          message: "Full name is required",
          type: "error",
        }),
      );
      return;
    }
>>>>>>> Stashed changes

                    {/* Email from previous step - Display only with change option */}
                    {data.email && (
                        <div className="bg-blue-50/80 backdrop-blur-sm p-3 rounded-xl border border-blue-200 text-sm text-blue-700 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>
                                    <strong>Email:</strong> {data.email}
                                    {!isEmailVerified && (
                                        <span className="ml-2 text-amber-600">
                                            (Please verify below)
                                        </span>
                                    )}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleChangeEmailClick}
                                className="text-[#F9C744] hover:text-[#e5b33a] text-sm font-medium hover:underline whitespace-nowrap"
                            >
                                Change Email
                            </button>
                        </div>
                    )}

<<<<<<< Updated upstream
                    {/* Mobile Verification Section */}
                    <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Phone className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-800">Mobile Verification</h3>
                            {isMobileVerified && (
                                <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                                    <CheckCircle className="w-4 h-4" /> Verified
                                </span>
                            )}
                        </div>

                        {isMobileVerified ? (
                            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Verified Mobile</p>
                                        <p className="font-medium text-gray-800">+91 {mobileInput}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleChangeMobile}
                                    className="text-[#F9C744] hover:text-[#e5b33a] text-sm font-medium hover:underline"
                                >
                                    Change Number
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Mobile Input with Send OTP Button - No Animation */}
                                <div className="relative">
                                    <Input
                                        label="Mobile Number"
                                        type="tel"
                                        value={mobileInput}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setMobileInput(val);
                                            setMobileError("");
                                        }}
                                        error={mobileError}
                                        placeholder="Enter 10-digit mobile number"
                                        helperText="We'll send OTP to verify your number"
                                        className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 pr-[110px]"
                                    />
                                    {!showMobileOtp && (
                                        <Button
                                            type="button"
                                            onClick={handleSendMobileOTP}
                                            disabled={
                                                isMobileOtpSending ||
                                                !mobileInput ||
                                                mobileInput.length < 10
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[80px]"
                                        >
                                            {isMobileOtpSending ? "Sending..." : "Send OTP"}
                                        </Button>
                                    )}
                                </div>
=======
    // Check password requirements for new users only
    if (!isDataLoadedFromAPI) {
      if (!data.password) {
        dispatch(
          showToast({
            message: "Password is required",
            type: "error",
          }),
        );
        return;
      }

      if (data.password !== data.confirm_password) {
        dispatch(
          showToast({
            message: "Passwords do not match",
            type: "error",
          }),
        );
        return;
      }
    } else {
      // For existing users, password is optional - only validate if they entered one
      // Skip validation if password is still the masked value
      if (data.password && data.password !== "••••••••" && data.password !== data.confirm_password) {
        dispatch(
          showToast({
            message: "Passwords do not match",
            type: "error",
          }),
        );
        return;
      }
    }
>>>>>>> Stashed changes

                                {showMobileOtp && (
                                    <div className="space-y-3">
                                        {/* OTP Input with Verify Button - No Animation */}
                                        <div className="relative">
                                            <Input
                                                label="Enter OTP"
                                                type="text"
                                                value={mobileOtpInput}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, "");
                                                    if (value.length <= 6) {
                                                        setMobileOtpInput(value);
                                                        setMobileError("");
                                                    }
                                                }}
                                                error={mobileError}
                                                placeholder="Enter 6-digit OTP"
                                                className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 pr-[90px]"
                                                disabled={isMobileVerifying}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleVerifyMobileOTP}
                                                disabled={
                                                    isMobileVerifying ||
                                                    !mobileOtpInput ||
                                                    mobileOtpInput.length < 6
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[70px]"
                                            >
                                                {isMobileVerifying ? "Verifying..." : "Verify"}
                                            </Button>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleResendMobileOTP}
                                                disabled={mobileResendTimer > 0 || isMobileOtpSending}
                                                className="text-sm text-[#F9C744] hover:text-[#e5b33a] disabled:text-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {mobileResendTimer > 0
                                                    ? "Resend in " + mobileResendTimer + "s"
                                                    : "Resend OTP"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Email Verification Section - Email field disabled */}
                    <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-800">Email Verification</h3>
                            {isEmailVerified && (
                                <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                                    <CheckCircle className="w-4 h-4" /> Verified
                                </span>
                            )}
                        </div>

<<<<<<< Updated upstream
                        {isEmailVerified ? (
                            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Verified Email</p>
                                        <p className="font-medium text-gray-800">{emailInput}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleChangeEmailClick}
                                    className="text-[#F9C744] hover:text-[#e5b33a] text-sm font-medium hover:underline"
                                >
                                    Change Email
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Email Input with Send OTP Button - No Animation */}
                                <div className="relative">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={emailInput}
                                        onChange={() => { }} // Disabled - no onChange
                                        error={emailError}
                                        placeholder="Enter your email address"
                                        helperText={
                                            data.email
                                                ? `Email from previous step: ${data.email}. Verify with OTP.`
                                                : "We'll send OTP to verify your email"
                                        }
                                        className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 bg-gray-50 cursor-not-allowed pr-[110px]"
                                        disabled={true} // Disabled field
                                    />
                                    {!showEmailOtp && (
                                        <Button
                                            type="button"
                                            onClick={handleSendEmailOTP}
                                            disabled={
                                                isEmailOtpSending ||
                                                !emailInput ||
                                                !emailInput.includes("@")
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[80px]"
                                        >
                                            {isEmailOtpSending ? "Sending..." : "Send OTP"}
                                        </Button>
                                    )}
                                </div>
=======
    // ✅ CHECK: If data is loaded from API and all required fields are filled,
    // just navigate to next step without calling POST API
    if (isDataLoadedFromAPI) {
      // Check if all required fields are filled
      const hasAllFields =
        data.full_name &&
        data.date_of_birth &&
        isMobileVerified &&
        isEmailVerified;

      if (hasAllFields) {
        console.log(
          "✅ All fields are filled - Navigating to next step without POST",
        );

        // Store step completion status
        localStorage.setItem("distributor_step_completed", "1");

        dispatch(
          showToast({
            message: "All information is complete. Proceeding to next step.",
            type: "success",
          }),
        );

        // Navigate to next step immediately
        setTimeout(() => onNext(), 500);
        return;
      }
    }

    // If we reach here, either:
    // 1. It's a new user (no data loaded from API)
    // 2. Or data is loaded but some fields are missing (incomplete registration)
    // So we need to call the POST API

    setIsSubmitting(true);
>>>>>>> Stashed changes

                                {showEmailOtp && (
                                    <div className="space-y-3">
                                        {/* OTP Input with Verify Button - No Animation */}
                                        <div className="relative">
                                            <Input
                                                label="Enter OTP"
                                                type="text"
                                                value={emailOtpInput}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, "");
                                                    if (value.length <= 6) {
                                                        setEmailOtpInput(value);
                                                        setEmailError("");
                                                    }
                                                }}
                                                error={emailError}
                                                placeholder="Enter 6-digit OTP"
                                                className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 pr-[90px]"
                                                disabled={isEmailVerifying}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleVerifyEmailOTP}
                                                disabled={
                                                    isEmailVerifying ||
                                                    !emailOtpInput ||
                                                    emailOtpInput.length < 6
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[70px]"
                                            >
                                                {isEmailVerifying ? "Verifying..." : "Verify"}
                                            </Button>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleResendEmailOTP}
                                                disabled={emailResendTimer > 0 || isEmailOtpSending}
                                                className="text-sm text-[#F9C744] hover:text-[#e5b33a] disabled:text-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {emailResendTimer > 0
                                                    ? "Resend in " + emailResendTimer + "s"
                                                    : "Resend OTP"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

<<<<<<< Updated upstream
                    {/* Other Form Fields */}
                    <div className="space-y-4">
                        <Input
                            label="Full Name (as per PAN)"
                            name="full_name"
                            value={data.full_name || ""}
                            onChange={onChange}
                            error={errors.full_name}
                            placeholder="John Doe"
                            required
                            helperText="Must match your PAN card name"
                            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20"
                        />

                        <DatePicker
                            label="Date of Birth"
                            value={data.date_of_birth || ""}
                            onChange={handleDobChange}
                            error={errors.date_of_birth || ageError}
                            helperText="You must be at least 18 years old"
                            required
                        />

                        <PasswordInput
                            label="Create Password"
                            name="password"
                            value={data.password || ""}
                            onChange={onChange}
                            error={errors.password}
                            placeholder="Create a strong password"
                            required
                            helperText="Minimum 8 characters with uppercase, lowercase and number"
                            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 outline-none"
                        />

                        <PasswordInput
                            label="Confirm Password"
                            name="confirm_password"
                            value={data.confirm_password || ""}
                            onChange={onChange}
                            error={errors.confirm_password}
                            placeholder="Confirm your password"
                            required
                            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 outline-none"
                        />

                        <div className="flex justify-between items-center pt-4">
                            <button
                                type="button"
                                onClick={onBackToMobile}
                                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                                Back to Email
                            </button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isContinueEnabled()}
                                className="bg-[#F9C744] hover:bg-[#e5b33a] text-black font-semibold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5" />
                                        Saving...
                                    </>
                                ) : (
                                    "Continue"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Email Modal */}
            {showChangeEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setShowChangeEmailModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
=======
      // Prepare the data for API
      const requestData: any = {
        email: emailInput,
        full_name: data.full_name,
        phone: formattedMobile,
        date_of_birth: data.date_of_birth,
        country: "India",
        terms_condition: "1",
      };

      // Only include password if it's provided and not the masked value
      if (data.password && data.password !== "••••••••") {
        requestData.password = data.password;
        requestData.password_confirmation = data.confirm_password;
      }

      console.log("📤 Submitting step 1 data:", requestData);

      const response = await step1Personal(requestData).unwrap();

      if (response.status) {
        localStorage.removeItem("distributor_temp_token");
        setTempToken("");
        localStorage.removeItem("distributor_step_data");
        localStorage.setItem("distributor_step_completed", "1");

        // Fetch step data after successful submission
        await fetchStepData();

        dispatch(
          showToast({
            message: "Personal information saved successfully",
            type: "success",
          }),
        );
>>>>>>> Stashed changes

                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Mail className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-center text-[#06101E] mb-2">
                            Change Email Address
                        </h3>

<<<<<<< Updated upstream
                        <p className="text-gray-500 text-center text-sm mb-6">
                            Enter your new email address. You'll need to verify it again with
                            OTP.
                        </p>

                        <div className="space-y-4">
                            <Input
                                label="New Email Address"
                                type="email"
                                value={newEmailInput}
                                onChange={(e) => setNewEmailInput(e.target.value)}
                                placeholder="Enter new email address"
                                className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20"
                            />

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs text-amber-700">
                                    ⚠️ Changing email will reset your verification status and API
                                    state. You'll need to verify the new email.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    onClick={() => setShowChangeEmailModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleConfirmEmailChange}
                                    disabled={!newEmailInput || !newEmailInput.includes("@")}
                                    className="flex-1 bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Change Email
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-center text-[#06101E] mb-2">
                            Start New Registration?
                        </h3>

                        <p className="text-gray-500 text-center text-sm mb-6">
                            All your entered information will be discarded. This action cannot
                            be undone.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-xs text-red-600 text-center">
                                Warning: Your current progress will be lost
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleNewRegistration}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Yes, Start New
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
=======
  // Check if fields should be disabled (when data is loaded from API)
  const isFieldDisabled = (fieldName: string) => {
    if (!isDataLoadedFromAPI) return false;

    if (fieldName === "email" && !isEmailVerified) return false;
    if (fieldName === "mobile" && !isMobileVerified) return false;
    if (fieldName === "password") return false; // Password field should always be editable

    return true;
  };

  // Check if Continue button should be enabled
  const isContinueEnabled = () => {
    const hasRequiredFields = data.full_name && data.date_of_birth;

    // For existing users (data loaded from API), password is optional
    if (isDataLoadedFromAPI) {
      // If password is entered and it's not the masked value, it must match confirm password
      if (data.password && data.password !== "••••••••" && data.password !== data.confirm_password) {
        return false;
      }
      return !!(
        !isSubmitting &&
        !ageError &&
        isMobileVerified &&
        isEmailVerified &&
        hasRequiredFields
      );
    }

    // For new users, password is required
    return !!(
      !isSubmitting &&
      !ageError &&
      isMobileVerified &&
      isEmailVerified &&
      hasRequiredFields &&
      data.password &&
      data.password === data.confirm_password
    );
  };

  // Check if we should show change buttons (only when data is loaded from API and verified)
  const shouldShowChangeButtons = () => {
    return isDataLoadedFromAPI && isMobileVerified && isEmailVerified;
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
              {/* Header with New Registration Button */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                      <User className="w-5 h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                      Personal Information
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">
                    Verify your contact details to continue
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading your data...
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
                  <PlusCircle className="w-4 h-4" />
                  New Registration
                </button>
              </div>

              <InfoBox type="info" title="Why we need this information">
                Your personal details help us verify your identity and ensure
                compliance with regulatory requirements.
              </InfoBox>

              {/* Email from previous step - Display only with change option */}
              {data.email && (
                <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-200 text-sm text-blue-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {data.email}
                      {!isEmailVerified && (
                        <span className="ml-2 text-amber-600 font-normal">
                          (Please verify below)
                        </span>
                      )}
                      {isEmailVerified && (
                        <span className="ml-2 text-green-600 font-normal flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </span>
                  </div>
                  {/* Only show Change Email button if NOT loaded from API or not fully verified */}
                  {!shouldShowChangeButtons() && (
                    <button
                      type="button"
                      onClick={handleChangeEmailClick}
                      className="text-[var(--gold-deep)] hover:text-[var(--gold-dark)] text-sm font-medium hover:underline whitespace-nowrap flex-shrink-0"
                    >
                      Change Email
                    </button>
                  )}
                </div>
              )}

              {/* Mobile Verification Section */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">
                    Mobile Verification
                  </h3>
                  {isMobileVerified && (
                    <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>

                {isMobileVerified ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Verified Mobile</p>
                        <p className="font-medium text-gray-800">
                          +91 {mobileInput}
                        </p>
                      </div>
                    </div>
                    {/* Only show Change Number button if NOT loaded from API */}
                    {!shouldShowChangeButtons() && (
                      <button
                        type="button"
                        onClick={handleChangeMobile}
                        className="text-[var(--gold-deep)] hover:text-[var(--gold-dark)] text-sm font-medium hover:underline"
                      >
                        Change Number
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        label="Mobile Number"
                        type="tel"
                        value={mobileInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setMobileInput(val);
                          setMobileError("");
                        }}
                        error={mobileError}
                        placeholder="Enter 10-digit mobile number"
                        helperText="We'll send OTP to verify your number"
                        className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 pr-[110px]"
                        disabled={isFieldDisabled("mobile")}
                      />
                      {!showMobileOtp && (
                        <button
                          type="button"
                          onClick={handleSendMobileOTP}
                          disabled={
                            isMobileOtpSending ||
                            !mobileInput ||
                            mobileInput.length < 10 ||
                            isFieldDisabled("mobile")
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[80px] transition-all duration-200"
                        >
                          {isMobileOtpSending ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      )}
                    </div>

                    {showMobileOtp && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <Input
                            label="Enter OTP"
                            type="text"
                            value={mobileOtpInput}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 6) {
                                setMobileOtpInput(value);
                                setMobileError("");
                              }
                            }}
                            error={mobileError}
                            placeholder="Enter 6-digit OTP"
                            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 pr-[90px]"
                            disabled={isMobileVerifying}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyMobileOTP}
                            disabled={
                              isMobileVerifying ||
                              !mobileOtpInput ||
                              mobileOtpInput.length < 6
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[70px] transition-all duration-200"
                          >
                            {isMobileVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleResendMobileOTP}
                            disabled={
                              mobileResendTimer > 0 || isMobileOtpSending
                            }
                            className="text-sm text-[var(--gold-deep)] hover:text-[var(--gold-dark)] disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                          >
                            {mobileResendTimer > 0
                              ? `Resend in ${mobileResendTimer}s`
                              : "Resend OTP"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Email Verification Section */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">
                    Email Verification
                  </h3>
                  {isEmailVerified && (
                    <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>

                {isEmailVerified ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Verified Email</p>
                        <p className="font-medium text-gray-800">
                          {emailInput}
                        </p>
                      </div>
                    </div>
                    {/* Only show Change Email button if NOT loaded from API */}
                    {!shouldShowChangeButtons() && (
                      <button
                        type="button"
                        onClick={handleChangeEmailClick}
                        className="text-[var(--gold-deep)] hover:text-[var(--gold-dark)] text-sm font-medium hover:underline"
                      >
                        Change Email
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        label="Email Address"
                        type="email"
                        value={emailInput}
                        onChange={() => { }}
                        error={emailError}
                        placeholder="Enter your email address"
                        helperText={
                          data.email
                            ? `Email from previous step: ${data.email}. Verify with OTP.`
                            : "We'll send OTP to verify your email"
                        }
                        className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 bg-gray-50 cursor-not-allowed pr-[110px]"
                        disabled={true}
                      />
                      {!showEmailOtp && (
                        <button
                          type="button"
                          onClick={handleSendEmailOTP}
                          disabled={
                            isEmailOtpSending ||
                            !emailInput ||
                            !emailInput.includes("@")
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[80px] transition-all duration-200"
                        >
                          {isEmailOtpSending ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      )}
                    </div>

                    {showEmailOtp && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <Input
                            label="Enter OTP"
                            type="text"
                            value={emailOtpInput}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 6) {
                                setEmailOtpInput(value);
                                setEmailError("");
                              }
                            }}
                            error={emailError}
                            placeholder="Enter 6-digit OTP"
                            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 pr-[90px]"
                            disabled={isEmailVerifying}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyEmailOTP}
                            disabled={
                              isEmailVerifying ||
                              !emailOtpInput ||
                              emailOtpInput.length < 6
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[70px] transition-all duration-200"
                          >
                            {isEmailVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleResendEmailOTP}
                            disabled={emailResendTimer > 0 || isEmailOtpSending}
                            className="text-sm text-[var(--gold-deep)] hover:text-[var(--gold-dark)] disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                          >
                            {emailResendTimer > 0
                              ? `Resend in ${emailResendTimer}s`
                              : "Resend OTP"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Other Form Fields */}
              <div className="space-y-4">
                <Input
                  label="Full Name (as per PAN)"
                  name="full_name"
                  value={data.full_name || ""}
                  onChange={onChange}
                  error={errors.full_name}
                  placeholder="John Doe"
                  required
                  helperText="Must match your PAN card name"
                  className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
                  disabled={isFieldDisabled("full_name")}
                />

                <DatePicker
                  label="Date of Birth"
                  value={data.date_of_birth || ""}
                  onChange={handleDobChange}
                  error={errors.date_of_birth || ageError}
                  helperText="You must be at least 18 years old"
                  required
                  disabled={isFieldDisabled("date_of_birth")}
                />

                {/* Password Field - Show always, but optional for existing users */}
                <div className="space-y-1">
                  <PasswordInput
                    label={
                      isDataLoadedFromAPI && hasExistingPassword
                        ? "Change Password (Optional)"
                        : "Create Password"
                    }
                    name="password"
                    value={data.password || ""}
                    onChange={onChange}
                    error={errors.password}
                    placeholder={
                      isDataLoadedFromAPI && hasExistingPassword
                        ? "Leave blank to keep current password"
                        : "Create a strong password"
                    }
                    helperText={
                      isDataLoadedFromAPI && hasExistingPassword
                        ? "Only fill if you want to change your password"
                        : "Minimum 8 characters with uppercase, lowercase and number"
                    }
                    className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none"
                    required={!isDataLoadedFromAPI || !hasExistingPassword}
                  />
                  {isDataLoadedFromAPI && hasExistingPassword && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      You have an existing password. Leave blank to keep it.
                    </p>
                  )}
                </div>

                <PasswordInput
                  label={
                    isDataLoadedFromAPI && hasExistingPassword
                      ? "Confirm New Password"
                      : "Confirm Password"
                  }
                  name="confirm_password"
                  value={data.confirm_password || ""}
                  onChange={onChange}
                  error={errors.confirm_password}
                  placeholder={
                    isDataLoadedFromAPI && hasExistingPassword
                      ? "Confirm new password"
                      : "Confirm your password"
                  }
                  required={!isDataLoadedFromAPI || !hasExistingPassword}
                  className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none"
                />

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={onBackToMobile}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200"
                  >
                    Back to Email
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isContinueEnabled()}
                    className="bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isDataLoadedFromAPI ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      "Continue →"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Email Modal */}
      {showChangeEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-4"
          style={{ fontFamily: theme.font }}
        >
          <div className="bg-white rounded-[28px] max-w-md w-full mx-4 p-6 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
            <button
              type="button"
              onClick={() => setShowChangeEmailModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-blue-50">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-[#06101E] mb-2 tracking-tight">
              Change Email Address
            </h3>

            <p className="text-gray-500 text-center text-sm mb-6 font-medium">
              Enter your new email address. You'll need to verify it again with
              OTP.
            </p>

            <div className="space-y-4">
              <Input
                label="New Email Address"
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="Enter new email address"
                className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
              />

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium">
                  ⚠️ Changing email will reset your verification status and API
                  state. You'll need to verify the new email.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeEmailModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEmailChange}
                  disabled={!newEmailInput || !newEmailInput.includes("@")}
                  className="flex-1 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(249,199,68,0.4)]"
                >
                  Change Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                ⚠️ Your current progress will be lost
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewRegistration}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]"
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
>>>>>>> Stashed changes
