"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { DatePicker } from "../DatePicker";
import { PasswordInput } from "../PasswordInput";
import { StepProps } from "../../types";
import authApi from "@/lib/redux/api/authApi";
import {
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
  Calendar,
} from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { InfoBox } from "../InfoBox";

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
  const dispatch = useAppDispatch();
  const [ageError, setAgeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const [passwordMatchError, setPasswordMatchError] = useState<string>("");

  // ✅ FIX: Navigation locks
  const [isNavigating, setIsNavigating] = useState(false);
  const hasNavigatedRef = useRef(false);

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

  const [tempToken, setTempToken] = useState("");
  const [existingPassword, setExistingPassword] = useState("");

  const [apiFields, setApiFields] = useState({
    full_name: false,
    date_of_birth: false,
    email: false,
    mobile: false,
    password: false,
  });

  // ✅ FIX: Track if email/mobile were verified via API (for bypass logic)
  const [isEmailVerifiedFromAPI, setIsEmailVerifiedFromAPI] = useState(false);
  const [isMobileVerifiedFromAPI, setIsMobileVerifiedFromAPI] = useState(false);

  // Handle password changes with real-time confirmation validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(e);

    if (name === "confirm_password") {
      if (data.password && value !== data.password) {
        setPasswordMatchError("Passwords do not match");
      } else {
        setPasswordMatchError("");
      }
    }

    if (name === "password") {
      if (data.confirm_password && value !== data.confirm_password) {
        setPasswordMatchError("Passwords do not match");
      } else {
        setPasswordMatchError("");
      }
    }
  };

  const [sendOTP] = useDistributorsendOTPMutation();
  const [verifyPhoneOTP] = useVerifyPhoneOTPMutation();
  const [verifyEmailOTP] = useVerifyEmailOTPMutation();
  const [step1Personal] = useStep1PersonalMutation();
  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  const resetDistributorAPI = () => {
    try {
      dispatch(distributorAuthApi.util.resetApiState());
      dispatch(authApi.util.resetApiState());
    } catch (error) {
      console.error("Error resetting API:", error);
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
    setPasswordMatchError("");
    setApiFields({
      full_name: false,
      date_of_birth: false,
      email: false,
      mobile: false,
      password: false,
    });
    setIsEmailVerifiedFromAPI(false);
    setIsMobileVerifiedFromAPI(false);

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

    itemsToClear.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();

    if (clearCache) resetDistributorAPI();
  };

  // ==========================================
  // FETCH STEP DATA FROM API
  // ==========================================
  const fetchStepData = async () => {
    const email = data.email || localStorage.getItem("distributor_email") || "";
    if (!email) return;

    try {
      const response = await getStepData({ step: "1", phone: email }).unwrap();

      if (response.status && response.step_data) {
        const userData = response.step_data.user;

        // ✅ Strict checks
        const isEmailActuallyVerified = !!userData.email_verified_at;
        const isMobileActuallyVerified =
          userData.phone_verified === 1 || !!userData.phone_verified_at;

        const fieldsFromAPI = {
          full_name: !!userData.full_name,
          date_of_birth: !!userData.date_of_birth,
          email: !!userData.email,
          mobile: !!userData.phone,
          password: !!userData.password,
        };
        setApiFields(fieldsFromAPI);

        if (userData.email) {
          setEmailInput(userData.email);
          onChange({ target: { name: "email", value: userData.email } } as any);

          if (isEmailActuallyVerified) {
            setIsEmailVerified(true);
            setIsEmailVerifiedFromAPI(true);
            localStorage.setItem("distributor_verified_email", userData.email);
            localStorage.setItem("distributor_email_verified", "true");
          } else {
            // ✅ API has email but NOT verified -> show OTP button
            setIsEmailVerified(false);
            setIsEmailVerifiedFromAPI(false);
            setShowEmailOtp(false); // Ensure OTP button shows
          }
        }

        if (userData.phone) {
          const phoneNumber = userData.phone.replace(/^\+91/, "");
          setMobileInput(phoneNumber);
          setIsMobileFromCheck(true);

          if (isMobileActuallyVerified) {
            setIsMobileVerified(true);
            setIsMobileVerifiedFromAPI(true);
            localStorage.setItem("distributor_verified_phone", phoneNumber);
            localStorage.setItem("distributor_phone_verified", "true");
          } else {
            // ✅ API has phone but NOT verified -> show OTP button
            setIsMobileVerified(false);
            setIsMobileVerifiedFromAPI(false);
            setShowMobileOtp(false);
          }
        }

        if (userData.full_name) {
          onChange({
            target: { name: "full_name", value: userData.full_name },
          } as any);
        }

        if (userData.date_of_birth) {
          const dob = userData.date_of_birth.split(" ")[0];
          onChange({ target: { name: "date_of_birth", value: dob } } as any);
          const age = validateAge(dob);
          if (age < 18 && age > 0) {
            setAgeError(
              "You must be at least 18 years old to register as a distributor",
            );
          } else {
            setAgeError("");
          }
        }

        if (userData.password) {
          const encryptedPassword = userData.password;
          setExistingPassword(encryptedPassword);
          onChange({
            target: { name: "password", value: encryptedPassword },
          } as any);
          onChange({
            target: { name: "confirm_password", value: encryptedPassword },
          } as any);
          setShowPasswordField(false);
        }

        setIsDataLoadedFromAPI(true);
        dispatch(
          showToast({ message: "Loaded existing data", type: "success" }),
        );
      }
    } catch (error: any) {
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message: error?.data?.message || "Failed to load data",
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

  useEffect(() => {
    const loadData = async () => {
      const emailFromProps = data.email;
      const emailFromStorage = localStorage.getItem("distributor_email");
      const email = emailFromProps || emailFromStorage || "";
      if (email) await fetchStepData();
    };
    loadData();
  }, [data.email]);

  useEffect(() => {
    if (data.email && !emailInput && !isDataLoadedFromAPI) {
      setEmailInput(data.email);
      setIsEmailVerified(false);
    }
    if (data.mobile && !mobileInput && !isDataLoadedFromAPI) {
      setMobileInput(data.mobile);
      setIsMobileFromCheck(true);
    }
    const savedTempToken = localStorage.getItem("distributor_temp_token") || "";
    setTempToken(savedTempToken);
  }, [data.email, data.mobile, isDataLoadedFromAPI]);

  useEffect(() => {
    if (isMobileVerified && isEmailVerified) {
      localStorage.removeItem("distributor_temp_token");
      setTempToken("");
    }
  }, [isMobileVerified, isEmailVerified]);

  useEffect(() => {
    if (mobileResendTimer > 0) {
      const timer = setTimeout(
        () => setMobileResendTimer(mobileResendTimer - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [mobileResendTimer]);

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
    } else {
      setAgeError("");
    }
  };

  const handleNewRegistration = () => {
    clearAllRegistrationData(true);
    setShowConfirmModal(false);
    dispatch(showToast({ message: "Starting new registration", type: "info" }));
    if (onBackToMobile) onBackToMobile();
  };

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
    setIsEmailVerifiedFromAPI(false);
    setShowEmailOtp(false);
    setEmailOtpInput("");
    setEmailError("");
    setEmailResendTimer(0);
    setEmailInput(newEmailInput);

    onChange({ target: { name: "email", value: newEmailInput } } as any);
    localStorage.removeItem("distributor_verified_email");
    localStorage.removeItem("distributor_email_verified");
    localStorage.removeItem("distributor_email");

    resetDistributorAPI();
    setShowChangeEmailModal(false);
    setApiFields((prev) => ({ ...prev, email: false }));
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
      return;
    }

    let formattedMobile = mobileInput.startsWith("+")
      ? mobileInput
      : "+91" + mobileInput.replace(/^0+/, "");

    setIsMobileOtpSending(true);
    setMobileError("");

    try {
      const requestData: any = { phone: formattedMobile, type: "phone" };
      if (tempToken && !(isMobileVerified && isEmailVerified))
        requestData.temp_token = tempToken;

      const response = await sendOTP(requestData).unwrap();

      if (response.status) {
        setShowMobileOtp(true);
        setMobileResendTimer(60);
        setMobileOtpInput("");
        if (response.temp_token) {
          setTempToken(response.temp_token);
          localStorage.setItem("distributor_temp_token", response.temp_token);
        }
        dispatch(showToast({ message: response.message, type: "success" }));
      } else {
        setMobileError(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      setMobileError(error?.data?.message || "Failed to send OTP");
    } finally {
      setIsMobileOtpSending(false);
    }
  };

  const handleVerifyMobileOTP = async () => {
    if (!mobileOtpInput || mobileOtpInput.length < 6) {
      setMobileError("Please enter a valid 6-digit OTP");
      return;
    }

    let formattedMobile = mobileInput.startsWith("+")
      ? mobileInput
      : "+91" + mobileInput.replace(/^0+/, "");

    setIsMobileVerifying(true);
    setMobileError("");

    try {
      const requestData: any = { phone: formattedMobile, otp: mobileOtpInput };
      if (tempToken) requestData.temp_token = tempToken;

      const response = await verifyPhoneOTP(requestData).unwrap();

      if (response.status) {
        setIsMobileVerified(true);
        setIsMobileVerifiedFromAPI(false); // Manually verified
        setShowMobileOtp(false);
        onChange({ target: { name: "mobile", value: mobileInput } } as any);
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
        setMobileError(response.message || "Invalid OTP");
      }
    } catch (error: any) {
      setMobileError(error?.data?.message || "Failed to verify OTP");
    } finally {
      setIsMobileVerifying(false);
    }
  };

  // ========== EMAIL OTP FUNCTIONS ==========
  const handleSendEmailOTP = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsEmailOtpSending(true);
    setEmailError("");

    try {
      const requestData: any = { email: emailInput, type: "email" };
      if (tempToken && !(isMobileVerified && isEmailVerified))
        requestData.temp_token = tempToken;

      const response = await sendOTP(requestData).unwrap();

      if (response.status) {
        setShowEmailOtp(true);
        setEmailResendTimer(60);
        setEmailOtpInput("");
        if (response.temp_token) {
          setTempToken(response.temp_token);
          localStorage.setItem("distributor_temp_token", response.temp_token);
        }
        dispatch(
          showToast({ message: "OTP sent to " + emailInput, type: "success" }),
        );
      } else {
        setEmailError(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      setEmailError(error?.data?.message || "Failed to send OTP");
    } finally {
      setIsEmailOtpSending(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtpInput || emailOtpInput.length < 6) {
      setEmailError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsEmailVerifying(true);
    setEmailError("");

    try {
      const requestData: any = { email: emailInput, otp: emailOtpInput };
      if (tempToken) requestData.temp_token = tempToken;

      const response = await verifyEmailOTP(requestData).unwrap();

      if (response.status) {
        setIsEmailVerified(true);
        setIsEmailVerifiedFromAPI(false); // Manually verified
        setShowEmailOtp(false);
        onChange({ target: { name: "email", value: emailInput } } as any);
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
        setEmailError(response.message || "Invalid OTP");
      }
    } catch (error: any) {
      setEmailError(error?.data?.message || "Failed to verify OTP");
    } finally {
      setIsEmailVerifying(false);
    }
  };

  // ========== SUBMIT STEP 1 (WITH RACE CONDITION FIX) ==========
  const handleSubmit = async () => {
    // Guard: Agar already navigating hai, toh kuch mat karo
    if (hasNavigatedRef.current || isNavigating) {
      console.log("⏭️ Navigation already in progress, ignoring");
      return;
    }

    setPasswordMatchError("");

    // ✅ Check if we can bypass POST API (Direct Next)
    const isEverythingAlreadyVerified =
      isDataLoadedFromAPI &&
      apiFields.full_name &&
      apiFields.date_of_birth &&
      apiFields.password &&
      isEmailVerified &&
      isMobileVerified &&
      isEmailVerifiedFromAPI && // ✅ Only bypass if verified by API
      isMobileVerifiedFromAPI; // ✅ Only bypass if verified by API

    if (isEverythingAlreadyVerified) {
      hasNavigatedRef.current = true;
      setIsNavigating(true);
      dispatch(
        showToast({
          message: "All details already verified. Proceeding...",
          type: "success",
        }),
      );
      onNext();
      return;
    }

    // Standard Validation if not bypassing
    if (!data.full_name)
      return dispatch(
        showToast({ message: "Full name is required", type: "error" }),
      );
    if (!data.date_of_birth)
      return dispatch(
        showToast({ message: "Date of birth is required", type: "error" }),
      );

    if (!isDataLoadedFromAPI) {
      if (!data.password || data.password !== data.confirm_password) {
        return dispatch(
          showToast({
            message: "Passwords do not match or are empty",
            type: "error",
          }),
        );
      }
    } else if (data.password && data.password !== existingPassword) {
      if (data.password !== data.confirm_password) {
        return dispatch(
          showToast({ message: "Passwords do not match", type: "error" }),
        );
      }
    }

    if (!isMobileVerified)
      return dispatch(
        showToast({
          message: "Please verify your mobile number first",
          type: "error",
        }),
      );
    if (!isEmailVerified)
      return dispatch(
        showToast({
          message: "Please verify your email address first",
          type: "error",
        }),
      );

    setIsSubmitting(true);

    try {
      const formattedMobile = mobileInput.startsWith("+")
        ? mobileInput
        : "+91" + mobileInput.replace(/^0+/, "");
      const requestData: any = {
        email: emailInput,
        full_name: data.full_name,
        phone: formattedMobile,
        date_of_birth: data.date_of_birth,
        country: "India",
        terms_condition: "1",
        account_type: "distributor",
      };

      if (
        data.password &&
        (!isDataLoadedFromAPI || data.password !== existingPassword)
      ) {
        requestData.password = data.password;
        requestData.password_confirmation = data.confirm_password;
      }

      const response = await step1Personal(requestData).unwrap();

      if (response.status) {
        localStorage.removeItem("distributor_temp_token");
        setTempToken("");
        localStorage.removeItem("distributor_step_data");
        localStorage.setItem("distributor_step_completed", "1");

        if (response.user) {
          localStorage.setItem(
            "distributor_user_data",
            JSON.stringify(response.user),
          );
          if (response.user.email)
            localStorage.setItem("distributor_email", response.user.email);
          if (response.user.phone)
            localStorage.setItem("distributor_phone", response.user.phone);
        }

        // ✅ LOCK UI FIRST
        setIsNavigating(true);

        // ✅ Await API before navigating so UI is in sync
        await fetchStepData();

        // ✅ Navigate only once, no setTimeout
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          dispatch(
            showToast({
              message: response.message || "Personal information saved",
              type: "success",
            }),
          );
          onNext();
        }
      } else {
        dispatch(
          showToast({
            message: response.message || "Failed to save data",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      let errorMessage = "Failed to save personal information";
      if (error?.data?.message) errorMessage = error.data.message;
      if (error?.data?.errors) {
        const validationErrors = Object.values(error.data.errors).flat();
        if (validationErrors.length > 0)
          errorMessage = validationErrors.join(", ");
      }
      dispatch(showToast({ message: errorMessage, type: "error" }));
    } finally {
      setIsSubmitting(false);
      // Don't reset isNavigating so button stays locked
    }
  };

  const isFieldDisabled = (fieldName: string) => {
    if (isDataLoadedFromAPI && apiFields[fieldName as keyof typeof apiFields]) {
      return true;
    }
    return false;
  };

  // ✅ BUTTON ENABLE LOGIC
  const isContinueEnabled = () => {
    if (isSubmitting || isNavigating || ageError) return false;

    const isEverythingAlreadyVerified =
      isDataLoadedFromAPI &&
      apiFields.full_name &&
      apiFields.date_of_birth &&
      apiFields.password &&
      isEmailVerified &&
      isMobileVerified &&
      isEmailVerifiedFromAPI &&
      isMobileVerifiedFromAPI;

    // Bypass logic: Directly enable if all details are from API and verified by API
    if (isEverythingAlreadyVerified) return true;

    // Standard logic for manual filling
    const hasRequiredFields = data.full_name && data.date_of_birth;

    if (!isMobileVerified || !isEmailVerified || !hasRequiredFields)
      return false;

    if (!isDataLoadedFromAPI || !apiFields.password) {
      if (
        !data.password ||
        data.password !== data.confirm_password ||
        passwordMatchError
      ) {
        return false;
      }
    } else if (data.password && data.password !== existingPassword) {
      if (data.password !== data.confirm_password || passwordMatchError) {
        return false;
      }
    }

    return true;
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
        className="min-h-[60vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10"
      >
        <div className="w-full max-w-lg mx-auto">
          <div className="relative rounded-[20px] sm:rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-4 sm:px-6 md:px-9 py-6 sm:py-8 md:py-10">
            <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
              <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
            </div>

            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                      <User className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                      Personal Information
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    Verify your contact details to continue
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                      <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                      Loading your data...
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
                  disabled={isNavigating}
                  className="group flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--gold)]/40 bg-[#FFFBEF] text-xs sm:text-sm font-semibold text-[var(--gold-deep)] hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)] shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="hidden xs:inline">New Registration</span>
                  <span className="xs:hidden">New</span>
                </button>
              </div>

              <InfoBox type="info" title="Why we need this information">
                Your personal details help us verify your identity and ensure
                compliance with regulatory requirements.
              </InfoBox>

              {data.email && (
                <div className="bg-blue-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-200 text-xs sm:text-sm text-blue-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {data.email}
                      {!isEmailVerified && (
                        <span className="ml-1 sm:ml-2 text-amber-600 font-normal">
                          (Verify below)
                        </span>
                      )}
                      {isEmailVerified && (
                        <span className="ml-1 sm:ml-2 text-green-600 font-normal flex items-center gap-0.5 sm:gap-1">
                          <CheckCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                          <span className="hidden xs:inline">Verified</span>
                          <span className="xs:hidden">✓</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Verification Section */}
              <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                    Mobile Verification
                  </h3>
                  {isMobileVerified && (
                    <span className="ml-auto flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-green-600 font-medium">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="hidden xs:inline">Verified</span>
                      <span className="xs:hidden">✓</span>
                    </span>
                  )}
                </div>

                {isMobileVerified ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          Verified Mobile
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                          +91 {mobileInput}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        label="Mobile Number"
                        type="tel"
                        maxLength={10}
                        value={mobileInput}
                        onChange={(e) => {
                          setMobileInput(e.target.value.replace(/\D/g, ""));
                          setMobileError("");
                        }}
                        error={mobileError}
                        placeholder="Enter 10-digit mobile number"
                        helperText="We'll send OTP to verify your number"
                        className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base sm:pr-[110px]"
                        disabled={isNavigating}
                      />

                      {!showMobileOtp && (
                        <button
                          type="button"
                          onClick={handleSendMobileOTP}
                          disabled={
                            isMobileOtpSending ||
                            !mobileInput ||
                            mobileInput.length < 10 ||
                            isNavigating
                          }
                          className="mt-2 w-full sm:w-auto sm:mt-0 sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                      <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                            className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base sm:pr-[90px]"
                            disabled={isMobileVerifying || isNavigating}
                          />

                          <button
                            type="button"
                            onClick={handleVerifyMobileOTP}
                            disabled={
                              isMobileVerifying ||
                              !mobileOtpInput ||
                              mobileOtpInput.length < 6 ||
                              isNavigating
                            }
                            className="mt-2 w-full sm:w-auto sm:mt-0 sm:absolute sm:right-3 sm:top-14 sm:-translate-y-1/2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap sm:min-w-[70px]"
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
                            onClick={handleSendMobileOTP}
                            disabled={
                              mobileResendTimer > 0 ||
                              isMobileOtpSending ||
                              isNavigating
                            }
                            className="text-[10px] sm:text-sm text-[var(--gold-deep)] hover:text-[var(--gold-dark)] disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
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
              <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white/50">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                    Email Verification
                  </h3>
                  {isEmailVerified && (
                    <span className="ml-auto flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-green-600 font-medium">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="hidden xs:inline">Verified</span>
                      <span className="xs:hidden">✓</span>
                    </span>
                  )}
                </div>

                {isEmailVerified ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          Verified Email
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                          {emailInput}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        label="Email Address"
                        type="email"
                        value={emailInput}
                        onChange={() => {}}
                        error={emailError}
                        placeholder="Enter your email address"
                        helperText={
                          data.email
                            ? `Email from previous step: ${data.email}. Verify with OTP.`
                            : "We'll send OTP to verify your email"
                        }
                        className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 bg-gray-50 cursor-not-allowed text-sm sm:text-base"
                        disabled={true}
                      />

                      {!showEmailOtp && (
                        <button
                          type="button"
                          onClick={handleSendEmailOTP}
                          disabled={
                            isEmailOtpSending ||
                            !emailInput ||
                            !emailInput.includes("@") ||
                            isNavigating
                          }
                          className="mt-2 w-full sm:w-auto sm:absolute sm:right-3 sm:top-14 sm:-translate-y-1/2 sm:mt-0 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                            className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base sm:pr-[100px]"
                            disabled={isEmailVerifying || isNavigating}
                          />

                          <button
                            type="button"
                            onClick={handleVerifyEmailOTP}
                            disabled={
                              isEmailVerifying ||
                              !emailOtpInput ||
                              emailOtpInput.length < 6 ||
                              isNavigating
                            }
                            className="mt-2 w-full sm:w-auto sm:mt-0 sm:absolute sm:right-3 sm:top-14 sm:-translate-y-1/2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap sm:min-w-[70px]"
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
                            onClick={handleSendEmailOTP}
                            disabled={
                              emailResendTimer > 0 ||
                              isEmailOtpSending ||
                              isNavigating
                            }
                            className="text-[10px] sm:text-sm text-[var(--gold-deep)] hover:text-[var(--gold-dark)] disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
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
              <div className="space-y-3 sm:space-y-4">
                <Input
                  label="Full Name (as per PAN)"
                  name="full_name"
                  value={data.full_name || ""}
                  onChange={onChange}
                  error={errors.full_name}
                  placeholder={
                    isFieldDisabled("full_name")
                      ? "Name from existing account"
                      : "Enter your full name"
                  }
                  required
                  helperText={
                    isFieldDisabled("full_name")
                      ? "Full name from existing account"
                      : "Must match your PAN card name"
                  }
                  className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base"
                  disabled={isFieldDisabled("full_name") || isNavigating}
                />

                <div className="space-y-1">
                  {isDataLoadedFromAPI && apiFields.date_of_birth ? (
                    <>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Date of Birth (From existing account - Read Only)
                      </label>
                      <div className="relative">
                        <div className="w-full h-12 sm:h-14 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-xl border border-gray-200 flex items-center text-gray-700">
                          <span className="flex-1 text-sm sm:text-base font-medium truncate">
                            {data.date_of_birth
                              ? new Date(data.date_of_birth).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  },
                                )
                              : "Not provided"}
                          </span>
                          <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1 mt-1">
                        <Lock className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                        🔒 Date of birth is locked from your existing account
                      </p>
                    </>
                  ) : (
                    <DatePicker
                      label="Date of Birth"
                      value={data.date_of_birth || ""}
                      onChange={handleDobChange}
                      error={errors.date_of_birth || ageError}
                      helperText={
                        isFieldDisabled("date_of_birth")
                          ? "Date of birth from existing account"
                          : "You must be at least 18 years old"
                      }
                      required
                      disabled={
                        isFieldDisabled("date_of_birth") || isNavigating
                      }
                    />
                  )}
                </div>

                <div className="space-y-1">
                  {isDataLoadedFromAPI && apiFields.password ? (
                    <>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Password (From existing account - Read Only)
                      </label>
                      <div className="relative">
                        <div className="w-full h-12 sm:h-14 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-xl border border-gray-200 flex items-center text-gray-700">
                          <span className="flex-1 font-mono text-xs sm:text-sm tracking-wider truncate">
                            ••••••••••••••••••••••••••••••••
                          </span>
                          <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1 mt-1">
                        <Lock className="w-2.5 sm:w-3 h-2.5 sm:h-3" /> 🔒
                        Password is locked from your existing account
                      </p>
                    </>
                  ) : (
                    <PasswordInput
                      label="Create Password"
                      name="password"
                      value={data.password || ""}
                      onChange={handlePasswordChange}
                      error={errors.password}
                      placeholder="Create a strong password"
                      helperText="Minimum 8 characters with uppercase, lowercase and number"
                      className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none text-sm sm:text-base"
                      required={!isDataLoadedFromAPI}
                      disabled={isNavigating}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  {isDataLoadedFromAPI && apiFields.password ? (
                    <>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Confirm Password (From existing account - Read Only)
                      </label>
                      <div className="relative">
                        <div className="w-full h-12 sm:h-14 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-xl border border-gray-200 flex items-center text-gray-700">
                          <span className="flex-1 font-mono text-xs sm:text-sm tracking-wider truncate">
                            ••••••••••••••••••••••••••••••••
                          </span>
                          <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <PasswordInput
                      label="Confirm Password"
                      name="confirm_password"
                      value={data.confirm_password || ""}
                      onChange={handlePasswordChange}
                      error={errors.confirm_password || passwordMatchError}
                      placeholder="Confirm your password"
                      required={!isDataLoadedFromAPI}
                      className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none text-sm sm:text-base"
                      disabled={isNavigating}
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={onBackToMobile}
                    disabled={isNavigating}
                    className="w-full sm:w-auto text-center text-gray-600 hover:text-gray-800 font-medium text-xs sm:text-sm transition-colors duration-200 py-2 sm:py-0 disabled:opacity-50"
                  >
                    Back to Email
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isContinueEnabled()}
                    className="w-full sm:w-auto bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] text-sm sm:text-base"
                  >
                    {isSubmitting || isNavigating ? (
                      <>
                        <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                        {isNavigating
                          ? "Loading next step..."
                          : isDataLoadedFromAPI
                            ? "Updating..."
                            : "Saving..."}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4"
          style={{ fontFamily: theme.font }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
            <button
              type="button"
              onClick={() => setShowChangeEmailModal(false)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-blue-50">
                <Mail className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center text-[#06101E] mb-1 sm:mb-2 tracking-tight">
              Change Email Address
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 font-medium">
              Enter your new email address. You'll need to verify it again with
              OTP.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <Input
                label="New Email Address"
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="Enter new email address"
                className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base"
              />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-amber-700 font-medium">
                  ⚠️ Changing email will reset your verification status and API
                  state. You'll need to verify the new email.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeEmailModal(false)}
                  className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-2.5 rounded-xl transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEmailChange}
                  disabled={!newEmailInput || !newEmailInput.includes("@")}
                  className="w-full sm:flex-1 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold py-2 sm:py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(249,199,68,0.4)] text-sm sm:text-base order-1 sm:order-2"
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
