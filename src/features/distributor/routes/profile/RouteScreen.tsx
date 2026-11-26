"use client";

import { MapPin, LockKeyhole, Landmark, Phone, ShieldCheck, UserRound, HelpCircle, Users } from "lucide-react";

import { useState, type FormEvent } from "react";

import { useDispatch } from "react-redux";

import DashboardHeader from "@/features/distributor/shell/DashboardHeader";
import Sidebar from "@/features/distributor/shell/Sidebar";

import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useUpdateUserProfileMutation } from "@/lib/redux/api/Profile/userApi";


import { showToast } from "@/lib/slices/toastSlice";
import DistributorPVCSection from "@/features/distributor/routes/profile/DistributorPVCSection";
import Loding from "@/components/common/Loding";

import { useCreateCorrectionRequestMutation } from "@/lib/redux/api/distributor/userDashboardApi";


import { GhostButton, MAX_PHONE_CHANGE_REASON_WORDS, MIN_PHONE_CHANGE_REASON_CHARACTERS, ProfileApiResponse, collectCorrectionRequests, formatApiDate, getErrorMessage, getWordCount, parseApiDate, stickyColumnClass } from "@/features/distributor/routes/profile/page.parts/support";
import { ProfileSummary } from "@/features/distributor/routes/profile/page.parts/ProfileSummary";
import { ProfileImageCard } from "@/features/distributor/routes/profile/page.parts/ProfileImageCard";
import { ProfileForm } from "@/features/distributor/routes/profile/page.parts/ProfileForm";
import { KycStatus } from "@/features/distributor/routes/profile/page.parts/KycStatus";
import { PhoneChangeRequestCard } from "@/features/distributor/routes/profile/page.parts/PhoneChangeRequestCard";
import { AddressSection } from "@/features/distributor/routes/profile/page.parts/AddressSection";
import { BankWalletDetails } from "@/features/distributor/routes/profile/page.parts/BankWalletDetails";
import { BeneficiarySection } from "@/features/distributor/routes/profile/page.parts/BeneficiarySection";
import { SecuritySection } from "@/features/distributor/routes/profile/page.parts/SecuritySection";
import { HelpCenterSection } from "@/features/distributor/routes/profile/page.parts/HelpCenterSection";
import { ChangePhoneNumberModal } from "@/features/distributor/routes/profile/page.parts/ChangePhoneNumberModal";


export default function DistributorProfilePage() {
  const dispatch = useDispatch();

  const { data, isLoading, isError, refetch } =
    useGetUserProfileQuery(undefined);

  const [updateUserProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const [createCorrectionRequest, { isLoading: isSendingPhoneRequest }] =
    useCreateCorrectionRequestMutation();

  const profileResponse = data as ProfileApiResponse | undefined;
  const user = profileResponse?.user;
  const nextAllowedAt = profileResponse?.next_allowed_at ?? null;
  const canResubmitCorrection = profileResponse?.can_resubmit_correction;

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneChangeReason, setPhoneChangeReason] = useState("");
  const [phoneRequestError, setPhoneRequestError] = useState("");

  const handleUpdateProfile = async (payload: {
    full_name?: string;
    profile_image?: File;
  }) => {
    try {
      const formData = new FormData();

      if (payload.full_name !== undefined) {
        formData.append("full_name", payload.full_name);
      }

      if (payload.profile_image) {
        formData.append("profile_picture", payload.profile_image);
      }

      const response = await updateUserProfile(formData).unwrap();

      if (response.status) {
        dispatch(
          showToast({
            message: response.message || "Profile updated successfully!",
            type: "success",
          }),
        );
        await refetch();
      } else {
        dispatch(
          showToast({
            message: response.message || "Failed to update profile",
            type: "error",
          }),
        );
      }
    } catch (error: unknown) {
      dispatch(
        showToast({
          message: getErrorMessage(
            error,
            "Something went wrong while updating profile",
          ),
          type: "error",
        }),
      );
    }
  };

  const openPhoneModal = () => {
    // ✅ FIX: use the same flattened collector as HelpCenterSection.
    const requests = collectCorrectionRequests(user).filter(
      (request) => request?.type === "phone_request",
    );

    const latest = requests[0];
    const status = latest?.status?.toLowerCase();

    if (status === "pending" || status === "approved") {
      dispatch(
        showToast({
          message:
            status === "pending"
              ? "Your phone change request is already pending admin review."
              : "Your request is approved. Please use the link sent to you to change your number.",
          type: "info",
        }),
      );
      return;
    }

    const allowedAt = parseApiDate(nextAllowedAt);

    if (allowedAt !== null && Date.now() < allowedAt) {
      dispatch(
        showToast({
          message: `You can submit another request after ${
            formatApiDate(nextAllowedAt) || nextAllowedAt
          }.`,
          type: "info",
        }),
      );
      return;
    }

    if (canResubmitCorrection !== true) {
      dispatch(
        showToast({
          message:
            "A new correction request is not currently permitted. Please refresh your profile and try again.",
          type: "info",
        }),
      );
      return;
    }

    setPhoneChangeReason("");
    setPhoneRequestError("");
    setShowPhoneModal(true);
  };

  const handlePhoneRequestSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedReason = phoneChangeReason.trim();

    if (trimmedReason.length < MIN_PHONE_CHANGE_REASON_CHARACTERS) {
      setPhoneRequestError("Please enter at least 10 characters.");
      return;
    }

    if (getWordCount(trimmedReason) > MAX_PHONE_CHANGE_REASON_WORDS) {
      setPhoneRequestError("Reason cannot exceed 150 words.");
      return;
    }

    const allowedAt = parseApiDate(nextAllowedAt);

    if (allowedAt !== null && Date.now() < allowedAt) {
      setPhoneRequestError(
        `You can submit another request after ${
          formatApiDate(nextAllowedAt) || nextAllowedAt
        }.`,
      );
      return;
    }

    if (canResubmitCorrection !== true) {
      setPhoneRequestError(
        "The API has not permitted another correction request yet. Please refresh your profile.",
      );
      return;
    }

    try {
      const response = await createCorrectionRequest({
        type: "phone_request",
        reason: trimmedReason,
      }).unwrap();

      if (response?.success === false || response?.status === false) {
        const message =
          response.message || "Unable to send phone number change request.";
        setPhoneRequestError(message);
        dispatch(showToast({ message, type: "error" }));
        return;
      }

      dispatch(
        showToast({
          message:
            response?.message ||
            "Phone number change request sent to admin successfully.",
          type: "success",
        }),
      );

      setShowPhoneModal(false);
      setPhoneChangeReason("");
      setPhoneRequestError("");
      await refetch();
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Something went wrong while sending the request.",
      );
      setPhoneRequestError(message);
      dispatch(showToast({ message, type: "error" }));
      await refetch();
    }
  };

  const closePhoneModal = () => {
    if (isSendingPhoneRequest) return;
    setShowPhoneModal(false);
    setPhoneChangeReason("");
    setPhoneRequestError("");
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-dvh w-full items-center justify-center overflow-x-clip bg-white px-4"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        `}</style>
        <div className="flex flex-col items-center gap-3">
          <Loding />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div
        className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 overflow-x-clip bg-white px-4"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        <p className="text-center text-[14px] font-semibold text-[#22242A]">
          Failed to load profile
        </p>
        <GhostButton text="Retry" onClick={() => refetch()} />
      </div>
    );
  }

  return (
    <div
      className="profile-redesign min-h-dvh w-full overflow-x-clip bg-white"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

        html,
        body {
          max-width: 100%;
          overflow-x: clip;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .profile-redesign { scroll-behavior: smooth; }

        .profile-redesign .profile-no-double-margin > section { margin-top: 0 !important; }

        .profile-redesign .profile-section-nav::-webkit-scrollbar { height: 4px; }
        .profile-redesign .profile-section-nav::-webkit-scrollbar-thumb {
          background: #CFD9E7;
          border-radius: 6px;
        }

        .profile-redesign button:not(:disabled) { cursor: pointer; }
        .profile-redesign :focus-visible { outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .profile-redesign { scroll-behavior: auto; }
        }
      `}</style>

      <DashboardHeader distributorId={user?.distributor_id || ""} />

      <div className="relative flex min-h-[calc(100dvh-72px)] min-w-0">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-clip bg-[#F3F6FB] px-3 pb-12 pt-5 sm:px-5 sm:pb-16 sm:pt-7 lg:px-8 lg:pt-8 2xl:px-10">
          <div className="mx-auto w-full min-w-0 max-w-[1390px]">
            <header className="relative mb-6 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#172B4D] via-[#22457C] to-[#326AC0] px-5 py-7 text-white shadow-[0_16px_40px_-20px_rgba(23,43,77,.6)] sm:px-8 sm:py-8 lg:px-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[45px] border-white/[0.055]"
              />

              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-blue-100">
                    <ShieldCheck size={14} /> Your account workspace
                  </p>

                  <h1 className="text-[27px] font-extrabold tracking-[-0.04em] sm:text-[34px]">
                    Manage your profile
                  </h1>

                  <p className="mt-2 max-w-xl text-[13px] leading-6 text-blue-100 sm:text-[14px]">
                    Update personal information, check verification progress,
                    manage your addresses and protect your account.
                  </p>
                </div>

                <div className="flex min-w-0 flex-col gap-2 rounded-[18px] border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm md:min-w-[220px]">
                  <span className="text-[11px] font-semibold text-blue-100">
                    ACCOUNT STATUS
                  </span>

                  <span className="inline-flex items-center gap-2 text-[15px] font-bold">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        user?.is_active ? "bg-[#72EDB8]" : "bg-[#FFD18A]"
                      }`}
                    />
                    {user?.distributor_status ||
                      (user?.is_active ? "Active account" : "Inactive account")}
                  </span>

                  {user?.distributor_id && (
                    <span className="break-all text-[12px] text-blue-100">
                      BA ID: {user.distributor_id}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <nav
              aria-label="Profile sections"
              className="profile-section-nav mb-6 flex gap-2 overflow-x-auto rounded-[18px] border border-[#E2EAF4] bg-white p-2 shadow-sm"
            >
              {[
                {
                  id: "personal-details",
                  label: "Personal info",
                  Icon: UserRound,
                },
                {
                  id: "profile-kyc-overview",
                  label: "KYC verification",
                  Icon: ShieldCheck,
                },
                { id: "phone-details", label: "Phone number", Icon: Phone },
                { id: "address-details", label: "Addresses", Icon: MapPin },
                { id: "bank-details", label: "Bank details", Icon: Landmark },
                { id: "beneficiary-details", label: "Beneficiary", Icon: Users },
                {
                  id: "security-details",
                  label: "Security",
                  Icon: LockKeyhole,
                },
                {
                  id: "help-center-details",
                  label: "Help Center",
                  Icon: HelpCircle,
                },
              ].map(({ id, label, Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-[12px] px-4 text-[12px] font-bold text-[#52647E] transition-colors hover:bg-[#EDF4FF] hover:text-[#2858A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#326AC0]"
                >
                  <Icon size={16} /> {label}
                </a>
              ))}
            </nav>

            <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)] lg:gap-6">
              <aside
                className={stickyColumnClass}
                aria-label="Your profile at a glance"
              >
                <ProfileSummary user={user} />

                <ProfileImageCard
                  user={user}
                  loading={isUpdating}
                  onSave={(file) =>
                    handleUpdateProfile({ profile_image: file })
                  }
                />

                <div className="rounded-[19px] border border-[#D8E5F8] bg-[#EDF4FF] p-5">
                  <p className="flex items-center gap-2 text-[13px] font-extrabold text-[#214C91]">
                    <ShieldCheck size={17} /> Keep your account secure
                  </p>

                  <p className="mt-2 text-[12px] leading-5 text-[#52709B]">
                    Review your verification, contact details and password
                    regularly.
                  </p>

                  <a
                    href="#security-details"
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#2459AD] hover:underline"
                  >
                    Security settings <span aria-hidden="true">→</span>
                  </a>
                </div>
              </aside>

              <div className="min-w-0 space-y-5">
                <div id="personal-details" className="scroll-mt-28">
                  <ProfileForm
                    user={user}
                    loading={isUpdating}
                    onSave={(profileData) => handleUpdateProfile(profileData)}
                  />
                </div>

                {/* Entire KYC moved into Profile Overview */}
                <div
                  id="profile-kyc-overview"
                  className="min-w-0 scroll-mt-28"
                >
                  <KycStatus user={user} />
                </div>

                <div
                  id="phone-details"
                  className="scroll-mt-28 profile-no-double-margin"
                >
                  <PhoneChangeRequestCard
                    user={user}
                    onClick={openPhoneModal}
                    nextAllowedAt={nextAllowedAt}
                    canResubmit={canResubmitCorrection}
                  />
                </div>

                <div
                  id="address-details"
                  className="scroll-mt-28 profile-no-double-margin"
                >
                  <AddressSection />
                </div>

                <div className="min-w-0">
                  <DistributorPVCSection user={user} />
                </div>

                <div id="bank-details" className="scroll-mt-28">
                  <BankWalletDetails user={user} />
                </div>

                {/* NEW: Beneficiary Section */}
                <div id="beneficiary-details" className="scroll-mt-28">
                  <BeneficiarySection
                    beneficiaries={profileResponse?.beneficiaries}
                    onSuccess={() => refetch()}
                  />
                </div>

                <div id="security-details" className="scroll-mt-28">
                  <SecuritySection />
                </div>

                {/* FIXED: Help Center Section */}
                <div id="help-center-details" className="scroll-mt-28">
                  <HelpCenterSection user={user} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showPhoneModal && (
        <ChangePhoneNumberModal
          reason={phoneChangeReason}
          setReason={setPhoneChangeReason}
          error={phoneRequestError}
          setError={setPhoneRequestError}
          loading={isSendingPhoneRequest}
          onClose={closePhoneModal}
          onSubmit={handlePhoneRequestSubmit}
        />
      )}
    </div>
  );
}