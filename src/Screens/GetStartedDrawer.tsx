
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  CreditCard,
  Zap,
  Loader2,
} from "lucide-react";

import {
  useSendOTPMutation,
  useVerifyOTPMutation,
} from "@/lib/redux/api/authApi";

import { showToast } from "../lib/slices/toastSlice";

type Step = "mobile" | "otp";

export default function GetStartedDrawer() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [sendOTP, { isLoading: isSendingOTP }] =
    useSendOTPMutation();

  const [verifyOTP, { isLoading: isVerifyingOTP }] =
    useVerifyOTPMutation();

  // =========================================================
  // STATE
  // =========================================================

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("mobile");

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");

  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");

  // =========================================================
  // CLOSE DRAWER + RESET
  // =========================================================

  const handleCloseDrawer = () => {
    setIsOpen(false);

    setStep("mobile");
    setMobileNumber("");
    setOtp("");

    setMobileError("");
    setOtpError("");
  };

  // =========================================================
  // SIGN UP
  // CLOSE DRAWER FIRST -> THEN ROUTE
  // =========================================================

  const handleSignUp = () => {
    handleCloseDrawer();

    // Small delay so drawer close animation can start smoothly
    setTimeout(() => {
      router.push("/auth/customer/login");
    }, 50);
  };

  // =========================================================
  // MOBILE CHANGE
  // =========================================================

  const handleMobileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digitsOnly = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setMobileNumber(digitsOnly);

    if (mobileError) {
      setMobileError("");
    }
  };

  // =========================================================
  // OTP CHANGE
  // =========================================================

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digitsOnly = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(digitsOnly);

    if (otpError) {
      setOtpError("");
    }
  };

  // =========================================================
  // GET OTP
  // =========================================================

  const handleGetOtp = async () => {
    setMobileError("");

    if (isSendingOTP) {
      return;
    }

    if (!mobileNumber.trim()) {
      setMobileError("Please enter mobile number");
      return;
    }

    if (mobileNumber.length !== 10) {
      setMobileError(
        "Please enter a valid 10-digit mobile number",
      );
      return;
    }

    try {
      const result = await sendOTP({
        phone: `+91${mobileNumber}`,
      }).unwrap();

      console.log("SEND OTP RESPONSE:", result);

      if (!result?.status) {
        const message =
          result?.message ||
          "Unable to send OTP. Please try again.";

        setMobileError(message);

        dispatch(
          showToast({
            message,
            type: "error",
          }),
        );

        return;
      }

      if (result?.phone) {
        const normalizedPhone = String(result.phone)
          .replace(/\D/g, "")
          .slice(-10);

        if (normalizedPhone.length === 10) {
          setMobileNumber(normalizedPhone);
        }
      }

      setOtp("");
      setOtpError("");
      setStep("otp");

      dispatch(
        showToast({
          message:
            result?.message ||
            "OTP sent successfully.",
          type: "success",
        }),
      );
    } catch (error: any) {
      console.error("SEND OTP ERROR:", error);

      const apiMessage =
        error?.data?.message ||
        error?.error?.data?.message ||
        error?.data?.error ||
        error?.message;

      const message =
        typeof apiMessage === "string" &&
        apiMessage.trim()
          ? apiMessage
          : "Failed to send OTP. Please try again.";

      setMobileError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );
    }
  };

  // =========================================================
  // VERIFY OTP
  // =========================================================

  const handleVerifyOtp = async () => {
    setOtpError("");

    if (isVerifyingOTP) {
      return;
    }

    if (!otp.trim()) {
      setOtpError("Please enter OTP");
      return;
    }

    if (otp.length < 4) {
      setOtpError("Please enter a valid OTP");
      return;
    }

    try {
      const result = await verifyOTP({
        phone: `+91${mobileNumber}`,
        otp: otp,
      }).unwrap();

      console.log("VERIFY OTP RESPONSE:", result);

      if (!result?.status) {
        const message =
          result?.message ||
          "OTP verification failed. Please try again.";

        setOtpError(message);

        dispatch(
          showToast({
            message,
            type: "error",
          }),
        );

        return;
      }

      dispatch(
        showToast({
          message:
            result?.message ||
            "OTP verified successfully.",
          type: "success",
        }),
      );
    } catch (error: any) {
      console.error("VERIFY OTP ERROR:", error);

      const apiMessage =
        error?.data?.message ||
        error?.error?.data?.message ||
        error?.data?.error ||
        error?.message;

      const message =
        typeof apiMessage === "string" &&
        apiMessage.trim()
          ? apiMessage
          : "Invalid OTP. Please try again.";

      setOtpError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );
    }
  };

  // =========================================================
  // CHANGE MOBILE
  // =========================================================

  const handleBackToMobile = () => {
    setStep("mobile");
    setOtp("");
    setOtpError("");
  };

  // =========================================================
  // TOGGLE DRAWER
  // =========================================================

  const handleToggleDrawer = () => {
    if (isOpen) {
      handleCloseDrawer();
      return;
    }

    setIsOpen(true);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          OUTSIDE CLICK OVERLAY
      ====================================================== */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close Get Started Drawer"
          onClick={handleCloseDrawer}
          className="
            fixed
            inset-0
            z-[9997]
            cursor-default
            border-0
            bg-transparent
            p-0
            outline-none
          "
        />
      )}

      <div
        className="
          fixed
          right-0
          top-1/2
          z-[9999]
          -translate-y-1/2
          pointer-events-none
        "
      >
        {/* =====================================================
            DRAWER
        ====================================================== */}

        <div
          className={`
            absolute
            right-0
            top-1/2
            h-[300px]
            w-[calc(100vw-36px)]
            max-w-[400px]
            -translate-y-1/2
            overflow-hidden
            rounded-l-[14px]
            border
            border-[#E5E7EB]
            bg-white
            shadow-[-8px_0_28px_rgba(0,0,0,0.08)]
            transition-all
            duration-[380ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            sm:h-[340px]
            sm:w-[400px]
            ${
              isOpen
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "translate-x-full opacity-0 pointer-events-none"
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="
              flex
              h-full
              w-full
              flex-col
              px-[14px]
              py-[15px]
              sm:px-[20px]
              sm:py-[18px]
            "
          >
            {/* =================================================
                TITLE
            ================================================== */}

            <h2
              className="
                m-0
                mb-[20px]
                font-sans
                text-[16px]
                font-semibold
                leading-[20px]
                tracking-[-0.2px]
                text-[#111111]
                sm:mb-[22px]
                sm:text-[18px]
              "
            >
              Unlock Exclusive Benefits
            </h2>

            {/* =================================================
                BENEFITS
            ================================================== */}

            <div
              className="
                mb-[22px]
                mt-4
                grid
                w-full
                grid-cols-4
                gap-[5px]
                sm:mb-[24px]
                sm:gap-[7px]
              "
            >
              {/* 10% OFF */}

              <div className="flex min-w-0 flex-col items-center text-center">
                <div
                  className="
                    mb-[6px]
                    flex
                    h-[35px]
                    w-[35px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF2F2]
                    ring-1
                    ring-[#F04444]/10
                    sm:h-[38px]
                    sm:w-[38px]
                  "
                >
                  <Gift
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#F04444]"
                  />
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[9px]
                    font-semibold
                    leading-[12px]
                    text-[#111111]
                    sm:text-[10px]
                  "
                >
                  10% OFF
                </p>

                <p
                  className="
                    m-0
                    mt-[2px]
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[7.5px]
                    font-normal
                    leading-[11px]
                    text-[#5E6672]
                    sm:text-[8.5px]
                  "
                >
                  For New User
                </p>
              </div>

              {/* NEU COINS */}

              <div className="flex min-w-0 flex-col items-center text-center">
                <div
                  className="
                    mb-[6px]
                    flex
                    h-[35px]
                    w-[35px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF9E7]
                    ring-1
                    ring-[#D7AA2F]/10
                    sm:h-[38px]
                    sm:w-[38px]
                  "
                >
                  <span
                    className="
                      bg-gradient-to-br
                      from-[#FF198F]
                      via-[#6E3EFF]
                      to-[#12C9D8]
                      bg-clip-text
                      font-sans
                      text-[19px]
                      font-extrabold
                      italic
                      leading-none
                      text-transparent
                      sm:text-[21px]
                    "
                  >
                    N
                  </span>
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[9px]
                    font-semibold
                    leading-[12px]
                    text-[#111111]
                    sm:text-[10px]
                  "
                >
                  Earn Neu Coins
                </p>

                <p
                  className="
                    m-0
                    mt-[2px]
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[7.5px]
                    font-normal
                    leading-[11px]
                    text-[#5E6672]
                    sm:text-[8.5px]
                  "
                >
                  On eligible Purchase
                </p>
              </div>

              {/* NO COST EMI */}

              <div className="flex min-w-0 flex-col items-center text-center">
                <div
                  className="
                    mb-[6px]
                    flex
                    h-[35px]
                    w-[35px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EDF3FF]
                    ring-1
                    ring-[#3157D5]/10
                    sm:h-[38px]
                    sm:w-[38px]
                  "
                >
                  <CreditCard
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#3157D5]"
                  />
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[9px]
                    font-semibold
                    leading-[12px]
                    text-[#111111]
                    sm:text-[10px]
                  "
                >
                  No Cost EMI
                </p>

                <p
                  className="
                    m-0
                    mt-[2px]
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[7.5px]
                    font-normal
                    leading-[11px]
                    text-[#5E6672]
                    sm:text-[8.5px]
                  "
                >
                  Option
                </p>
              </div>

              {/* SNAPMINT */}

              <div className="flex min-w-0 flex-col items-center text-center">
                <div
                  className="
                    mb-[6px]
                    flex
                    h-[35px]
                    w-[35px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F0EDFF]
                    ring-1
                    ring-[#6244FF]/10
                    sm:h-[38px]
                    sm:w-[38px]
                  "
                >
                  <Zap
                    size={19}
                    fill="currentColor"
                    strokeWidth={1.6}
                    className="text-[#6244FF]"
                  />
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[9px]
                    font-semibold
                    leading-[12px]
                    text-[#111111]
                    sm:text-[10px]
                  "
                >
                  Snapmint
                </p>

                <p
                  className="
                    m-0
                    mt-[2px]
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[7.5px]
                    font-normal
                    leading-[11px]
                    text-[#5E6672]
                    sm:text-[8.5px]
                  "
                >
                  Buy Now Pay Later
                </p>
              </div>
            </div>

            {/* =================================================
                MOBILE STEP
            ================================================== */}

            {step === "mobile" && (
              <div>
                {/* MOBILE INPUT */}

                <div
                  className={`
                    flex
                    h-[51px]
                    w-full
                    items-center
                    overflow-hidden
                    rounded-[9px]
                    border
                    bg-white
                    ${
                      mobileError
                        ? "border-[#E53935]"
                        : "border-[#AEB7C4]"
                    }
                  `}
                >
                  {/* COUNTRY */}

                  <div
                    className="
                      flex
                      h-full
                      shrink-0
                      items-center
                      gap-[5px]
                      pl-[9px]
                      sm:gap-[6px]
                      sm:pl-[11px]
                    "
                  >
                    <img
                      src="https://www.titan.co.in/on/demandware.static/-/Library-Sites-TitanSharedLibrary/default/dwa85a2882/images/flags/in.svg"
                      alt="India"
                      className="
                        h-[16px]
                        w-[22px]
                        object-contain
                        sm:h-[18px]
                        sm:w-[24px]
                      "
                    />

                    <span
                      className="
                        whitespace-nowrap
                        font-sans
                        text-[13px]
                        font-normal
                        text-[#111111]
                        sm:text-[14px]
                      "
                    >
                      +91
                    </span>

                    <ChevronRight
                      size={13}
                      strokeWidth={2}
                      className="
                        mr-[2px]
                        rotate-90
                        text-[#111111]
                        sm:hidden
                      "
                    />

                    <ChevronRight
                      size={14}
                      strokeWidth={2}
                      className="
                        mr-[2px]
                        hidden
                        rotate-90
                        text-[#111111]
                        sm:block
                      "
                    />
                  </div>

                  {/* MOBILE NUMBER */}

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    placeholder="Mobile Number"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleGetOtp();
                      }
                    }}
                    className="
                      h-full
                      min-w-0
                      flex-1
                      border-0
                      bg-transparent
                      px-[8px]
                      font-sans
                      text-[15px]
                      font-normal
                      text-[#222222]
                      outline-none
                      placeholder:text-[#A5ACB8]
                      sm:text-[15px]
                    "
                  />
                </div>

                {/* MOBILE ERROR */}

                {mobileError && (
                  <p
                    className="
                      m-0
                      mt-[6px]
                      px-[2px]
                      font-sans
                      text-[10px]
                      font-normal
                      leading-[13px]
                      text-[#E53935]
                    "
                  >
                    {mobileError}
                  </p>
                )}

                {/* GET OTP */}

                <button
                  type="button"
                  onClick={handleGetOtp}
                  disabled={isSendingOTP}
                  className="
                    mt-[20px]
                    flex
                    h-[51px]
                    w-full
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[9px]
                    border-0
                    bg-[#050505]
                    font-sans
                    text-[15px]
                    font-semibold
                    text-white
                    transition-all
                    duration-200
                    hover:bg-[#161616]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {isSendingOTP ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      SENDING OTP
                    </>
                  ) : (
                    <>
                      GET OTP

                      <ChevronRight
                        size={17}
                        strokeWidth={2}
                      />
                    </>
                  )}
                </button>

                {/* =================================================
                    SIGN UP
                ================================================== */}

                <div
                  className="
                    mt-[10px]
                    flex
                    items-center
                    justify-center
                    gap-[4px]
                  "
                >
                  <span
                    className="
                      font-sans
                      text-[10px]
                      font-normal
                      text-[#7A828E]
                      sm:text-[11px]
                    "
                  >
                    Don&apos;t have an account?
                  </span>

                  <button
                    type="button"
                    onClick={handleSignUp}
                    className="
                      border-0
                      bg-transparent
                      p-0
                      font-sans
                      text-[10px]
                      font-semibold
                      text-[#111111]
                      underline
                      underline-offset-[2px]
                      transition-colors
                      hover:text-[#3157D5]
                      sm:text-[11px]
                    "
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                OTP STEP
            ================================================== */}

            {step === "otp" && (
              <div>
                {/* OTP INFO */}

                <p
                  className="
                    m-0
                    mb-[12px]
                    font-sans
                    text-[11px]
                    font-normal
                    leading-[16px]
                    text-[#5B6572]
                    sm:text-[12px]
                  "
                >
                  Enter the OTP sent to{" "}
                  <span className="font-medium text-[#111111]">
                    +91 {mobileNumber}
                  </span>{" "}
                  ·{" "}
                  <button
                    type="button"
                    onClick={handleBackToMobile}
                    className="
                      border-0
                      bg-transparent
                      p-0
                      font-sans
                      text-[11px]
                      font-medium
                      text-[#3157D5]
                      underline
                      sm:text-[12px]
                    "
                  >
                    Change
                  </button>
                </p>

                {/* OTP INPUT */}

                <div
                  className={`
                    mb-[6px]
                    flex
                    h-[51px]
                    w-full
                    items-center
                    overflow-hidden
                    rounded-[9px]
                    border
                    bg-white
                    ${
                      otpError
                        ? "border-[#E53935]"
                        : "border-[#AEB7C4]"
                    }
                  `}
                >
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter OTP"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleVerifyOtp();
                      }
                    }}
                    className="
                      h-full
                      min-w-0
                      flex-1
                      border-0
                      bg-transparent
                      px-[13px]
                      font-sans
                      text-[16px]
                      font-normal
                      tracking-[4px]
                      text-[#222222]
                      outline-none
                      placeholder:tracking-normal
                      placeholder:text-[#A5ACB8]
                      sm:text-[15px]
                    "
                  />
                </div>

                {/* OTP ERROR */}

                {otpError && (
                  <p
                    className="
                      m-0
                      mb-[8px]
                      px-[2px]
                      font-sans
                      text-[10px]
                      font-normal
                      leading-[13px]
                      text-[#E53935]
                    "
                  >
                    {otpError}
                  </p>
                )}

                {/* VERIFY OTP */}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOTP}
                  className="
                    mt-[8px]
                    flex
                    h-[51px]
                    w-full
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[9px]
                    border-0
                    bg-[#050505]
                    font-sans
                    text-[15px]
                    font-semibold
                    text-white
                    transition-all
                    duration-200
                    hover:bg-[#161616]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {isVerifyingOTP ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      VERIFYING...
                    </>
                  ) : (
                    <>
                      VERIFY OTP

                      <ChevronRight
                        size={17}
                        strokeWidth={2}
                      />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            SIDE TAB
        ====================================================== */}

        <button
          type="button"
          onClick={handleToggleDrawer}
          aria-label={
            isOpen
              ? "Close Get Started"
              : "Open Get Started"
          }
          className={`
            pointer-events-auto
            absolute
            right-0
            top-1/2
            flex
            h-[136px]
            w-[36px]
            -translate-y-1/2
            flex-col
            items-center
            justify-center
            rounded-l-[10px]
            border
            border-r-0
            border-white/10
            bg-[#1B1B1B]
            p-0
            text-white
            shadow-[0_3px_14px_rgba(0,0,0,0.12)]
            transition-all
            duration-[380ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            hover:bg-[#111111]
            sm:h-[146px]
            sm:w-[39px]
            ${
              isOpen
                ? "right-[calc(100vw-36px)] sm:right-[400px]"
                : "right-0"
            }
          `}
        >
          {/* ARROW */}

          <span
            className="
              absolute
              top-[9px]
              flex
              h-[22px]
              w-[22px]
              items-center
              justify-center
              rounded-full
              bg-white/5
              sm:top-[10px]
            "
          >
            {isOpen ? (
              <ChevronRight
                size={16}
                strokeWidth={1.8}
              />
            ) : (
              <ChevronLeft
                size={16}
                strokeWidth={1.8}
              />
            )}
          </span>

          {/* VERTICAL TEXT */}

          <span
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-[38%]
              -rotate-90
              whitespace-nowrap
              font-sans
              text-[11px]
              font-semibold
              tracking-[1px]
              text-white
              sm:text-[12px]
            "
          >
            GET STARTED
          </span>
        </button>
      </div>
    </>
  );
}
