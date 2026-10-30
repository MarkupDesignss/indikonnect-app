"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type FormEvent,
} from "react";

import { useDispatch } from "react-redux";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../../../components/Distributor/distributor/Sidebar";

import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

import {
  useChangePasswordMutation,
  useUpdateUserProfileMutation,
} from "@/lib/redux/api/Profile/userApi";

import AddressComponent from "@/components/profile/AddressComponent";
import { showToast } from "@/lib/slices/toastSlice";
import DistributorPVCSection from "./DistributorPVCSection";
import Loding from "@/components/common/Loding";

import {
  useCreateCorrectionRequestMutation,
} from "@/lib/redux/api/distributor/userDashboardApi";

const NAVY = "#0E1B3D";
const EMERALD = "#1f9d6b";
const RED = "#d92d20";

const stickyColumnClass =
  "min-w-0 grid grid-cols-1 items-start gap-4 xl:sticky xl:top-[88px] xl:self-start xl:z-10";

const inputClass =
  "box-border h-[42px] min-w-0 w-full rounded-[10px] border border-[#e9edf2] bg-[#f7f8fa] px-3.5 text-[13px] text-[#475066] outline-none placeholder:text-[#98a2b3] transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10 sm:px-[14px]";

const readOnlyClass =
  "box-border h-[42px] min-w-0 w-full rounded-[10px] border border-[#e9edf2] bg-[#f2f4f7] px-3.5 text-[12px] text-[#667085] outline-none cursor-not-allowed sm:px-[14px] sm:text-[13px]";

const labelClass =
  "mb-2 block break-words text-[12px] font-semibold leading-5 text-[#475066] sm:text-[12.5px]";

const sectionClass =
  "min-w-0 w-full rounded-[12px] border border-[#e9edf2] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5 lg:p-[22px]";

const MAX_PHONE_CHANGE_REASON_WORDS = 150;
const MIN_PHONE_CHANGE_REASON_CHARACTERS = 10;

const getWordCount = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

type ApiError = {
  data?: {
    errors?: Record<string, string | string[]>;
    message?: string;
  };
  message?: string;
};

type CorrectionRequest = {
  id?: number;
  type?: string;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
  rejected_at?: string | null;
  rejected_reason?: string | null;
  reason?: string | null;
};

type ProfileApiResponse = {
  status?: boolean;
  message?: string;
  user?: any;
  next_allowed_at?: string | null;
  can_resubmit_correction?: boolean;
  correction_rejection_days?: number;
};

function getErrorMessage(err: unknown, fallback: string): string {
  const error = err as ApiError;
  const data = error?.data;

  if (data?.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const firstValue = firstKey ? data.errors[firstKey] : undefined;

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return data?.message || error?.message || fallback;
}

/* -------------------------------------------------------------------------- */
/* Date Helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * API example:
 * 2026-11-09 18:29:06
 *
 * The API timestamp has no timezone suffix.
 * This implementation interprets it in the browser's local timezone.
 * If your backend returns UTC timestamps without a suffix, change this
 * parser to explicitly interpret those timestamps as UTC.
 */
function parseApiDate(value?: string | null): number | null {
  if (!value) return null;

  const normalized = value.trim().replace(" ", "T");
  const timestamp = new Date(normalized).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
}

function formatApiDate(value?: string | null): string | null {
  const timestamp = parseApiDate(value);

  if (timestamp === null) return null;

  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* -------------------------------------------------------------------------- */
/* Section Header                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex min-w-0 items-start gap-2.5 border-b border-[#e9edf2] pb-3.5 sm:mb-[18px]">
      <span
        className="mt-0.5 h-4 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: NAVY }}
      />

      <div className="min-w-0 flex-1">
        <h3 className="break-words text-[14px] font-semibold text-[#101828]">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-1 break-words text-[11px] leading-4 text-[#98a2b3] sm:text-[11.5px]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Save Button                                                                */
/* -------------------------------------------------------------------------- */

function SaveButton({
  text = "Save",
  onClick,
  disabled = false,
  loading = false,
  type = "button",
}: {
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}) {
  const unavailable = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={unavailable}
      style={
        !unavailable
          ? {
              backgroundColor: NAVY,
              boxShadow: `0 8px 20px -8px ${NAVY}66`,
            }
          : undefined
      }
      className={`inline-flex min-h-[38px] min-w-[80px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-4 text-[12px] font-semibold text-white transition-all sm:px-5 sm:text-[12.5px] ${
        unavailable
          ? "cursor-not-allowed bg-[#c1c6d0]"
          : "hover:brightness-110"
      }`}
    >
      {loading && <Loader2 size={14} className="shrink-0 animate-spin" />}
      {text}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Ghost Button                                                               */
/* -------------------------------------------------------------------------- */

function GhostButton({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[38px] min-w-[80px] shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] border border-[#e9edf2] bg-white px-4 text-[12px] font-semibold text-[#475066] transition-colors hover:bg-[#f7f8fa] sm:px-5 sm:text-[12.5px]"
    >
      {text}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile Summary                                                            */
/* -------------------------------------------------------------------------- */

function ProfileSummary({ user }: { user: any }) {
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .filter(Boolean)
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className={sectionClass}>
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-12 sm:w-12"
          style={{ backgroundColor: NAVY }}
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[14px] font-bold text-white">
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-[12px] font-bold leading-5 text-[#101828] sm:text-[14px]">
            {user?.full_name?.toUpperCase() || "—"}
          </p>

          <p className="break-all text-[11px] leading-4 text-[#98a2b3] sm:truncate sm:text-[11.5px]">
            {user?.email || "—"}
          </p>
        </div>

        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: user?.is_active ? EMERALD : "#98a2b3",
          }}
          title={user?.is_active ? "Active" : "Inactive"}
        />
      </div>

      <div className="mt-4 space-y-3.5 border-t border-dashed border-[#e9edf2] pt-4 sm:mt-[18px]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3] sm:text-[11.5px]">
            Account ID
          </p>

          <p className="mt-1 break-all text-[12px] font-semibold text-[#475066] sm:text-[13px]">
            {user?.distributor_id || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3] sm:text-[11.5px]">
            Account Type
          </p>

          <p className="mt-1 break-words text-[12px] font-semibold capitalize text-[#475066] sm:text-[13px]">
            {user?.account_type || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3] sm:text-[11.5px]">
            Status
          </p>

          <p
            className="mt-1 flex items-center gap-2 break-words text-[12px] font-semibold sm:text-[13px]"
            style={{ color: user?.is_active ? EMERALD : "#98a2b3" }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: user?.is_active ? EMERALD : "#98a2b3",
              }}
            />

            <span>
              {user?.distributor_status ||
                (user?.is_active ? "Active" : "Inactive")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile Image Card                                                         */
/* -------------------------------------------------------------------------- */

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

  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profile_picture || null
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setImagePreview(user?.profile_picture || null);
    }
  }, [user?.profile_picture, selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      event.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setImagePreview(user?.profile_picture || null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={sectionClass}>
      <h3 className="text-center text-[12px] font-semibold text-[#101828] sm:text-[13px]">
        UPDATE PROFILE IMAGE
      </h3>

      <div className="mt-4 flex justify-center sm:mt-5">
        <div className="relative">
          <button
            type="button"
            onClick={() => !loading && fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Upload profile image"
            className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full border-2 border-[#e9edf2] bg-[#f7f8fa] transition-all hover:border-[#0E1B3D] disabled:cursor-not-allowed sm:h-[110px] sm:w-[110px]"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound
                size={64}
                strokeWidth={1}
                className="text-[#98a2b3] sm:h-[70px] sm:w-[70px]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => !loading && fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Edit profile image"
            className="absolute right-0 top-0 flex h-[29px] w-[29px] items-center justify-center rounded-full border-2 bg-white shadow-md transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed"
            style={{ borderColor: NAVY }}
          >
            <Pencil size={13} style={{ color: NAVY }} />
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
        <p className="mt-2 break-words text-center text-[10.5px] text-red-500">
          {error}
        </p>
      )}

      <p className="mt-2 text-center text-[10px] leading-4 text-[#98a2b3] sm:text-[10.5px]">
        Click on image to upload (Max 5MB)
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-[18px]">
        <GhostButton text="Cancel" onClick={handleCancel} />

        <SaveButton
          text="Save"
          onClick={() =>
            selectedFile
              ? onSave(selectedFile)
              : setError("Please upload an image first")
          }
          loading={loading}
          disabled={!selectedFile}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile Form                                                               */
/* -------------------------------------------------------------------------- */

function ProfileForm({
  user,
  onSave,
  loading,
}: {
  user: any;
  onSave: (data: { full_name: string }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    idNumber: "",
    panNumber: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.full_name || "",
      email: user.email || "",
      country: user.country || "",
      idNumber: user.aadhaar_last4
        ? `XXXX-XXXX-${user.aadhaar_last4}`
        : "",
      panNumber: user.pan_last4 ? `XXXXX${user.pan_last4}` : "",
      dateOfBirth: user.date_of_birth || "",
    });
  }, [user]);

  const validateFullName = (name: string) => {
    if (!name.trim()) return "Full name is required";

    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }

    return null;
  };

  const handleNameChange = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      fullName: value,
    }));

    setTouched((previous) => ({
      ...previous,
      fullName: true,
    }));

    setErrors((previous) => ({
      ...previous,
      fullName: validateFullName(value) || "",
    }));
  };

  const handleSave = () => {
    const error = validateFullName(formData.fullName);

    setErrors({ fullName: error || "" });
    setTouched({ fullName: true });

    if (!error) {
      onSave({
        full_name: formData.fullName.trim(),
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <section className={sectionClass}>
      <SectionHeader
        title="Profile"
        subtitle="Manage your personal information"
      />

      <div className="space-y-4 sm:space-y-[16px]">
        <div className="min-w-0">
          <label className={labelClass}>
            Full Name<span className="ml-0.5 text-red-500">*</span>
          </label>

          <input
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={(event) => handleNameChange(event.target.value)}
            onBlur={() => {
              setTouched((previous) => ({
                ...previous,
                fullName: true,
              }));

              setErrors((previous) => ({
                ...previous,
                fullName: validateFullName(formData.fullName) || "",
              }));
            }}
            onKeyDown={handleKeyDown}
            className={`${inputClass} ${
              touched.fullName && errors.fullName
                ? "border-red-500 ring-2 ring-red-500/10"
                : ""
            }`}
          />

          {touched.fullName && errors.fullName && (
            <p className="mt-1 break-words text-[10.5px] text-red-500">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label className={labelClass}>
            Email Address{" "}
            <span className="ml-2 inline-block rounded bg-[#f2f4f7] px-1.5 py-0.5 text-[9px] font-medium text-[#98a2b3]">
              READ ONLY
            </span>
          </label>

          <input
            type="email"
            value={formData.email}
            readOnly
            disabled
            className={readOnlyClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Country</label>

          <input
            value={formData.country}
            readOnly
            disabled
            className={readOnlyClass}
          />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label className={labelClass}>Aadhaar (Last 4)</label>

            <input
              value={formData.idNumber}
              readOnly
              disabled
              className={readOnlyClass}
            />
          </div>

          <div className="min-w-0">
            <label className={labelClass}>PAN (Masked)</label>

            <input
              value={formData.panNumber}
              readOnly
              disabled
              className={readOnlyClass}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Date of Birth</label>

          <input
            value={formData.dateOfBirth}
            readOnly
            disabled
            className={readOnlyClass}
          />
        </div>

        <div className="flex justify-end border-t border-[#f0f2f5] pt-4">
          <SaveButton onClick={handleSave} loading={loading} />
        </div>
      </div>
    </section>
  );
}

function PhoneChangeRequestCard({
  user,
  onClick,
  nextAllowedAt,
  canResubmit,
}: {
  user: any;
  onClick: () => void;
  nextAllowedAt?: string | null;
  canResubmit?: boolean;
}) {
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTime(Date.now());

    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const phoneRequests: CorrectionRequest[] = [
    ...(Array.isArray(user?.correction_requests)
      ? user.correction_requests
      : []),
    ...(user?.latest_correction_request
      ? [user.latest_correction_request]
      : []),
  ]
    .filter((request) => request?.type === "phone_request")
    .sort(
      (a, b) =>
        (parseApiDate(b.created_at) ?? 0) -
        (parseApiDate(a.created_at) ?? 0)
    );

  const latestRequest = phoneRequests[0] ?? null;

  const rawStatus = latestRequest?.status?.toLowerCase() ?? null;

  type UIState =
    | "none"
    | "pending"
    | "approved"
    | "completed"
    | "rejected";

  const uiState: UIState =
    rawStatus === "pending"
      ? "pending"
      : rawStatus === "approved"
      ? "approved"
      : rawStatus === "completed"
      ? "completed"
      : rawStatus === "rejected"
      ? "rejected"
      : "none";

  const allowedTimestamp = parseApiDate(nextAllowedAt);

  const cooldownActive =
    currentTime !== null &&
    allowedTimestamp !== null &&
    currentTime < allowedTimestamp;

  const remainingMilliseconds =
    cooldownActive && currentTime !== null && allowedTimestamp !== null
      ? Math.max(0, allowedTimestamp - currentTime)
      : 0;

  const days = Math.floor(
    remainingMilliseconds / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (remainingMilliseconds / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (remainingMilliseconds / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (remainingMilliseconds / 1000) % 60
  );

  const statusMeta: Record<
    Exclude<UIState, "none">,
    {
      label: string;
      color: string;
      bg: string;
      dot: string;
      description: string;
    }
  > = {
    pending: {
      label: "Pending",
      color: "#B8935A",
      bg: "#f8f1e4",
      dot: "#B8935A",
      description:
        "Your phone number change request has been submitted and is awaiting admin review.",
    },
    approved: {
      label: "Approved",
      color: "#1f9d6b",
      bg: "#eaf7f0",
      dot: "#1f9d6b",
      description:
        "Your request was approved. A verification link has been sent to your registered email. Please use it to complete the change.",
    },
    completed: {
      label: "Completed",
      color: "#0E1B3D",
      bg: "#eef2fb",
      dot: "#0E1B3D",
      description:
        "Your phone number was changed successfully.",
    },
    rejected: {
      label: "Rejected",
      color: RED,
      bg: "#fef3f2",
      dot: RED,
      description:
        "Your phone number change request was rejected by the admin.",
    },
  };

  const meta = uiState !== "none" ? statusMeta[uiState] : null;

  /*
   * Pending and approved requests always block another request.
   * A rejected request remains blocked until the cooldown ends.
   * The API permission must also allow resubmission.
   */
  const showChangeButton =
    currentTime !== null &&
    uiState !== "pending" &&
    uiState !== "approved" &&
    !cooldownActive &&
    canResubmit === true;

  const changeButtonLabel =
    uiState === "rejected"
      ? "Request Phone Change Again"
      : uiState === "completed"
      ? "Change Phone Number Again"
      : "Change Your Phone Number";

  const showCooldownSection =
    cooldownActive &&
    uiState !== "pending" &&
    uiState !== "approved";

  const showCombinedCard = meta !== null || showCooldownSection;

  return (
    <section className={`${sectionClass} mt-4 sm:mt-[14px]`}>
      <SectionHeader
        title="Phone Number"
        subtitle="Phone number changes are reviewed by the admin."
      />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">
            Registered phone number
          </p>

          <p className="mt-1 break-all text-[13px] font-semibold text-[#475066]">
            {user?.phone || "Not available"}
          </p>
        </div>

        {showChangeButton && (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-[10px] px-4 text-[12px] font-semibold text-white transition hover:brightness-110"
            style={{
              backgroundColor: NAVY,
              boxShadow: `0 8px 20px -8px ${NAVY}66`,
            }}
          >
            <Phone size={15} />
            {changeButtonLabel}
          </button>
        )}
      </div>

      {showCombinedCard && (
        <div
          className="mt-4 rounded-[10px] border px-3 py-3 sm:px-4"
          style={{
            backgroundColor: meta?.bg ?? "#f8faff",
            borderColor: meta ? `${meta.color}33` : "#e9edf2",
          }}
        >
          {meta && (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.dot }}
                />
                <p
                  className="text-[11px] font-bold uppercase tracking-wide sm:text-[11.5px]"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </p>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-[#667085]">
                {meta.description}
              </p>
            </>
          )}

          {uiState === "rejected" && (
            <>
              {(latestRequest.rejected_at ||
                latestRequest.updated_at) && (
                <p className="mt-2 text-[10.5px] text-[#98a2b3]">
                  Rejected on{" "}
                  {formatApiDate(
                    latestRequest.rejected_at ||
                      latestRequest.updated_at
                  )}
                </p>
              )}

              {(latestRequest.rejected_reason ||
                latestRequest.reason) && (
                <div className="mt-2.5 rounded-[8px] border border-[#d92d2033] bg-white/70 px-2.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">
                    Admin remark
                  </p>

                  <p className="mt-1 break-words text-[10.5px] leading-4 text-[#475066]">
                    {latestRequest.rejected_reason ||
                      latestRequest.reason}
                  </p>
                </div>
              )}
            </>
          )}

          {(uiState === "pending" || uiState === "approved") &&
            latestRequest?.created_at && (
              <p className="mt-2 text-[10.5px] text-[#98a2b3]">
                Submitted on {formatApiDate(latestRequest.created_at)}
              </p>
            )}

          {showCooldownSection && (
            <>
              <div className="mt-3 flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#0E1B3D]"
                />

                <p className="text-[11px] leading-5 text-[#667085]">
                  You can submit another phone number change request
                  after the cooldown period ends.
                </p>
              </div>

              {nextAllowedAt && (
                <p className="mt-2.5 break-words text-[10.5px] text-[#667085]">
                  Next request available:{" "}
                  <span className="font-semibold text-[#0E1B3D]">
                    {formatApiDate(nextAllowedAt) || nextAllowedAt}
                  </span>
                </p>
              )}
            </>
          )}

          {uiState === "approved" && (
            <div className="mt-2.5 flex items-start gap-2 rounded-[8px] border border-[#1f9d6b33] bg-white/70 px-2.5 py-2">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[#1f9d6b]"
              />

              <p className="text-[10.5px] leading-4 text-[#475066]">
                A secure link has been sent to you. Please open it to
                change your phone number. If you didn&apos;t receive
                it, contact admin.
              </p>
            </div>
          )}

          {uiState === "completed" && (
            <p className="mt-2 text-[10.5px] text-[#98a2b3]">
              You may request another change when permitted.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
/* -------------------------------------------------------------------------- */
/* Bank / Wallet Details                                                      */
/* -------------------------------------------------------------------------- */

function BankWalletDetails({ user }: { user: any }) {
  const bankProfile = user?.distributor_profile ?? user?.business_profile;

  const maskedAccount = user?.account_last4
    ? `XXXX XXXX ${user.account_last4}`
    : "—";

  const rows: {
    label: string;
    value: string;
    capitalize?: boolean;
  }[] = [
    {
      label: "Bank Name",
      value: bankProfile?.bank_name || "—",
    },
    {
      label: "Account Holder Name",
      value: bankProfile?.bank_holder_name || "—",
      capitalize: true,
    },
    {
      label: "Account Number",
      value: maskedAccount,
    },
    {
      label: "Account Type",
      value: bankProfile?.account_type || "—",
      capitalize: true,
    },
    {
      label: "IFSC Code",
      value: bankProfile?.bank_ifsc || "—",
    },
    {
      label: "Branch Name",
      value: bankProfile?.branch_name || "—",
    },
  ];

  const bankVerified = !!bankProfile?.bank_verified;

  return (
    <section className={sectionClass}>
      <SectionHeader title="Bank / Wallet Details" />

      <div
        className="mb-4 flex min-w-0 items-start gap-2 rounded-[8px] px-3 py-2.5"
        style={{
          backgroundColor: bankVerified ? "#eaf7f0" : "#f8f1e4",
        }}
      >
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: bankVerified ? EMERALD : "#B8935A",
          }}
        />

        <p
          className="break-words text-[11px] font-semibold leading-4 sm:text-[11.5px]"
          style={{
            color: bankVerified ? EMERALD : "#B8935A",
          }}
        >
          {bankVerified
            ? "Bank account verified"
            : "Bank verification pending"}
        </p>
      </div>

      <div className="space-y-3.5 sm:space-y-[14px]">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <label className={labelClass}>{row.label}</label>

            <input
              value={row.value}
              readOnly
              disabled
              className={`${readOnlyClass} ${
                row.capitalize ? "capitalize" : ""
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Address Section                                                            */
/* -------------------------------------------------------------------------- */

function AddressSection() {
  return (
    <section className={`${sectionClass} mt-4 sm:mt-[14px]`}>
      <SectionHeader
        title="Address"
        subtitle="Manage your saved delivery & billing addresses"
      />

      <div className="address-card-wrapper -mt-1 min-w-0">
        <AddressComponent buttonPosition="bottom" />
      </div>

      <style jsx global>{`
        .address-card-wrapper {
          min-width: 0;
          max-width: 100%;
        }

        .address-card-wrapper *,
        .address-card-wrapper input,
        .address-card-wrapper textarea,
        .address-card-wrapper select,
        .address-card-wrapper button,
        .address-card-wrapper div {
          border-color: #e9edf2 !important;
        }

        .address-card-wrapper input,
        .address-card-wrapper textarea,
        .address-card-wrapper select {
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
        }

        .address-card-wrapper > div {
          margin-top: 0 !important;
          min-width: 0;
          max-width: 100%;
        }

        .address-card-wrapper h2 {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #101828 !important;
          margin-bottom: 0 !important;
        }

        .address-card-wrapper > div > div:first-child > button {
          display: none !important;
        }

        .address-card-wrapper .add-address-bottom-btn {
          background-color: #0e1b3d !important;
          border-radius: 10px !important;
          border: 1px solid #e9edf2 !important;
          min-height: 38px !important;
          max-width: 100%;
          padding: 0 20px !important;
          font-size: 12.5px !important;
          font-weight: 600 !important;
          color: #fff !important;
          box-shadow: 0 8px 20px -8px rgba(14, 27, 61, 0.4) !important;
          transition: filter 0.15s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-wrap: wrap;
          gap: 8px !important;
          margin-top: 16px !important;
        }

        .address-card-wrapper .add-address-bottom-btn:hover {
          filter: brightness(1.1) !important;
        }

        .address-card-wrapper .border-dashed button {
          background-color: #0e1b3d !important;
          border-radius: 10px !important;
          border: 1px solid #e9edf2 !important;
          min-height: 38px !important;
          max-width: 100%;
          font-size: 12.5px !important;
          font-weight: 600 !important;
          box-shadow: 0 8px 20px -8px rgba(14, 27, 61, 0.4) !important;
        }

        .address-card-wrapper .rounded-\\[8px\\] {
          border-radius: 12px !important;
          border-color: #e9edf2 !important;
          border-style: solid !important;
          border-width: 1px !important;
          min-width: 0;
          max-width: 100%;
        }

        .address-card-wrapper .rounded-\\[8px\\]:hover {
          border-color: #e9edf2 !important;
        }

        .address-card-wrapper .bg-\\[\\#111111\\] {
          background-color: #0e1b3d !important;
        }

        .address-card-wrapper .rounded-\\[6px\\].text-\\[\\#888888\\] {
          background-color: transparent !important;
          color: #98a2b3 !important;
          border: none !important;
          box-shadow: none !important;
        }

        .address-card-wrapper .rounded-\\[6px\\].text-\\[\\#888888\\]:hover {
          background-color: #f7f8fa !important;
          color: #0e1b3d !important;
        }

        .address-card-wrapper .rounded-\\[6px\\] svg {
          color: currentColor !important;
          stroke: currentColor !important;
          flex-shrink: 0;
        }

        .address-card-wrapper button.underline {
          color: #475066 !important;
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        .address-card-wrapper button.underline:hover {
          color: #0e1b3d !important;
        }

        .address-card-wrapper .bg-white.rounded-full {
          background-color: #fff !important;
          border: 1px solid #e9edf2 !important;
        }

        @media (max-width: 639px) {
          .address-card-wrapper {
            width: 100%;
            overflow-wrap: anywhere;
          }

          .address-card-wrapper p,
          .address-card-wrapper span {
            overflow-wrap: anywhere;
          }

          .address-card-wrapper button {
            max-width: 100%;
          }

          .address-card-wrapper img {
            max-width: 100%;
            height: auto;
            object-fit: cover;
          }

          .address-card-wrapper .add-address-bottom-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Security Section                                                           */
/* -------------------------------------------------------------------------- */

function SecuritySection() {
  const dispatch = useDispatch();

  const [changePassword, { isLoading: isChanging }] =
    useChangePasswordMutation();

  const [security, setSecurity] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateOldPassword = (value: string) =>
    !value ? "Old password is required" : null;

  const validatePassword = (value: string) =>
    !value
      ? "Password is required"
      : value.length < 6
      ? "Password must be at least 6 characters"
      : null;

  const validateConfirmPassword = (
    value: string,
    newPassword = security.password
  ) =>
    !value
      ? "Please confirm your password"
      : value !== newPassword
      ? "Passwords do not match"
      : null;

  const handleChange = (
    field: "oldPassword" | "password" | "confirmPassword",
    value: string
  ) => {
    const next = {
      ...security,
      [field]: value,
    };

    setSecurity(next);

    const nextErrors = { ...errors };

    if (field === "oldPassword") {
      nextErrors.oldPassword = validateOldPassword(value) || "";
    }

    if (field === "password") {
      nextErrors.password = validatePassword(value) || "";

      if (next.confirmPassword) {
        nextErrors.confirmPassword =
          validateConfirmPassword(next.confirmPassword, value) || "";
      }
    }

    if (field === "confirmPassword") {
      nextErrors.confirmPassword = validateConfirmPassword(value) || "";
    }

    setErrors(nextErrors);
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};

    const oldError = validateOldPassword(security.oldPassword);
    const passwordError = validatePassword(security.password);
    const confirmError = validateConfirmPassword(security.confirmPassword);

    if (oldError) nextErrors.oldPassword = oldError;
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    try {
      const response = await changePassword({
        current_password: security.oldPassword,
        new_password: security.password,
        new_password_confirmation: security.confirmPassword,
      }).unwrap();

      if (response?.status) {
        dispatch(
          showToast({
            message: response?.message || "Password changed successfully!",
            type: "success",
          })
        );

        setSecurity({
          oldPassword: "",
          password: "",
          confirmPassword: "",
        });

        setErrors({});
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        dispatch(
          showToast({
            message: response?.message || "Failed to change password",
            type: "error",
          })
        );
      }
    } catch (error: unknown) {
      dispatch(
        showToast({
          message: getErrorMessage(
            error,
            "Something went wrong while changing password"
          ),
          type: "error",
        })
      );
    }
  };

  const passwordField = (
    field: "oldPassword" | "password" | "confirmPassword",
    label: string,
    placeholder: string,
    visible: boolean,
    toggle: () => void,
    autoComplete: string
  ) => (
    <div className="min-w-0" key={field}>
      <label className={labelClass}>
        {label}
        <span className="ml-0.5 text-red-500">*</span>
      </label>

      <div className="relative min-w-0">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={security[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          placeholder={placeholder}
          className={`${inputClass} pr-11 ${
            errors[field] ? "border-red-500 ring-2 ring-red-500/10" : ""
          }`}
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] transition-colors hover:text-[#475066]"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {errors[field] && (
        <p className="mt-1 break-words text-[10.5px] text-red-500">
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <section className={sectionClass}>
      <SectionHeader
        title="Security"
        subtitle="Change your account password"
      />

      <div className="space-y-4 sm:space-y-[16px]">
        {passwordField(
          "oldPassword",
          "Old Password",
          "Enter current password",
          showOldPassword,
          () => setShowOldPassword((value) => !value),
          "current-password"
        )}

        {passwordField(
          "password",
          "New Password",
          "Enter new password",
          showNewPassword,
          () => setShowNewPassword((value) => !value),
          "new-password"
        )}

        {passwordField(
          "confirmPassword",
          "Confirm New Password",
          "Confirm new password",
          showConfirmPassword,
          () => setShowConfirmPassword((value) => !value),
          "new-password"
        )}

        <div className="flex justify-end border-t border-[#f0f2f5] pt-4">
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

/* -------------------------------------------------------------------------- */
/* Change Phone Number Modal                                                  */
/* -------------------------------------------------------------------------- */

function ChangePhoneNumberModal({
  reason,
  setReason,
  error,
  setError,
  loading,
  onClose,
  onSubmit,
}: {
  reason: string;
  setReason: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#0e1b3d]/55 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-phone-title"
    >
      <div className="relative my-auto w-full max-w-[460px] overflow-hidden rounded-[18px] border border-[#e9edf2] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#e9edf2] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#eef2fb] text-[#0E1B3D]">
              <Phone size={19} />
            </span>

            <div className="min-w-0">
              <h2
                id="change-phone-title"
                className="text-[16px] font-bold text-[#101828]"
              >
                Change Phone Number
              </h2>

              <p className="text-[11.5px] text-[#98a2b3]">
                Tell the admin why you want to change your phone number.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close popup"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5 sm:px-6">
          <div className="rounded-[10px] border border-[#e9edf2] bg-[#f8faff] p-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#0E1B3D]"
              />

              <p className="text-[11px] leading-5 text-[#667085]">
                Your request will be sent to the admin for review. Your
                registered phone number will not change until the request is
                approved and completed.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="phone-change-reason" className={labelClass}>
              Reason for Change
              <span className="ml-0.5 text-red-500">*</span>
            </label>

            <textarea
              id="phone-change-reason"
              rows={4}
              autoComplete="off"
              value={reason}
              onChange={(event) => {
                const nextValue = event.target.value;

                const words = nextValue.trim()
                  ? nextValue.trim().split(/\s+/)
                  : [];

                if (words.length > MAX_PHONE_CHANGE_REASON_WORDS) {
                  setReason(
                    words
                      .slice(0, MAX_PHONE_CHANGE_REASON_WORDS)
                      .join(" ")
                  );

                  setError("Maximum 150 words are allowed.");
                  return;
                }

                setReason(nextValue);
                setError("");
              }}
              placeholder="Enter reason"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "phone-reason-error" : undefined}
              className={`box-border min-h-[110px] min-w-0 w-full resize-y rounded-[10px] border border-[#e9edf2] bg-[#f7f8fa] px-3.5 py-3 text-[13px] leading-5 text-[#475066] outline-none placeholder:text-[#98a2b3] transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10 sm:px-[14px] ${
                error ? "border-red-500 ring-2 ring-red-500/10" : ""
              }`}
            />

            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              {error ? (
                <p
                  id="phone-reason-error"
                  className="text-[10.5px] text-red-500"
                >
                  {error}
                </p>
              ) : (
                <p className="text-[10.5px] text-[#98a2b3]">
                  Minimum 10 characters required.
                </p>
              )}

              <span
                className={`ml-auto shrink-0 text-[10.5px] ${
                  reason.trim().length >= MIN_PHONE_CHANGE_REASON_CHARACTERS
                    ? "text-[#1f9d6b]"
                    : "text-[#98a2b3]"
                }`}
              >
                {getWordCount(reason)}/{MAX_PHONE_CHANGE_REASON_WORDS} words
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#f0f2f5] pt-4 sm:flex-row sm:justify-end">
            <GhostButton text="Cancel" onClick={onClose} />

            <SaveButton
              text="Send Request"
              type="submit"
              loading={loading}
              disabled={
                reason.trim().length < MIN_PHONE_CHANGE_REASON_CHARACTERS ||
                getWordCount(reason) > MAX_PHONE_CHANGE_REASON_WORDS
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Distributor Profile Page                                              */
/* -------------------------------------------------------------------------- */

export default function DistributorProfilePage() {
  const dispatch = useDispatch();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetUserProfileQuery(undefined);

  const [updateUserProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const [
    createCorrectionRequest,
    { isLoading: isSendingPhoneRequest },
  ] = useCreateCorrectionRequestMutation();

  const profileResponse = data as ProfileApiResponse | undefined;

  const user = profileResponse?.user;

  /*
   * These values come from the top-level API response,
   * not from the user object.
   */
  const nextAllowedAt = profileResponse?.next_allowed_at ?? null;

  const canResubmitCorrection =
    profileResponse?.can_resubmit_correction;

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneChangeReason, setPhoneChangeReason] = useState("");
  const [phoneRequestError, setPhoneRequestError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Update Profile                                                           */
  /* ------------------------------------------------------------------------ */

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
          })
        );

        await refetch();
      } else {
        dispatch(
          showToast({
            message: response.message || "Failed to update profile",
            type: "error",
          })
        );
      }
    } catch (error: unknown) {
      dispatch(
        showToast({
          message: getErrorMessage(
            error,
            "Something went wrong while updating profile"
          ),
          type: "error",
        })
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Open Phone Modal                                                         */
  /* ------------------------------------------------------------------------ */

  const openPhoneModal = () => {
    const requests: CorrectionRequest[] = [
      ...(Array.isArray(user?.correction_requests)
        ? user.correction_requests
        : []),
      ...(user?.latest_correction_request
        ? [user.latest_correction_request]
        : []),
    ]
      .filter((request) => request?.type === "phone_request")
      .sort(
        (a, b) =>
          (parseApiDate(b.created_at) ?? 0) -
          (parseApiDate(a.created_at) ?? 0)
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
        })
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
        })
      );

      return;
    }

    if (canResubmitCorrection !== true) {
      dispatch(
        showToast({
          message:
            "A new correction request is not currently permitted. Please refresh your profile and try again.",
          type: "info",
        })
      );

      return;
    }

    setPhoneChangeReason("");
    setPhoneRequestError("");
    setShowPhoneModal(true);
  };

  /* ------------------------------------------------------------------------ */
  /* Submit Phone Change Request                                              */
  /* ------------------------------------------------------------------------ */

  const handlePhoneRequestSubmit = async (
    event: FormEvent<HTMLFormElement>
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

    /*
     * Recheck the cooldown and API permission at submission time.
     */
    const allowedAt = parseApiDate(nextAllowedAt);

    if (allowedAt !== null && Date.now() < allowedAt) {
      setPhoneRequestError(
        `You can submit another request after ${
          formatApiDate(nextAllowedAt) || nextAllowedAt
        }.`
      );

      return;
    }

    if (canResubmitCorrection !== true) {
      setPhoneRequestError(
        "The API has not permitted another correction request yet. Please refresh your profile."
      );

      return;
    }

    try {
      const response = await createCorrectionRequest({
        reason: trimmedReason,
      }).unwrap();

      if (response?.success === false || response?.status === false) {
        const message =
          response.message ||
          "Unable to send phone number change request.";

        setPhoneRequestError(message);

        dispatch(
          showToast({
            message,
            type: "error",
          })
        );

        return;
      }

      dispatch(
        showToast({
          message:
            response?.message ||
            "Phone number change request sent to admin successfully.",
          type: "success",
        })
      );

      setShowPhoneModal(false);
      setPhoneChangeReason("");
      setPhoneRequestError("");

      /*
       * Refresh the profile so the latest request, cooldown,
       * and permission returned by the server are displayed.
       */
      await refetch();
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Something went wrong while sending the request."
      );

      setPhoneRequestError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        })
      );

      /*
       * Refresh in case the server rejected the request because
       * the cooldown or permission changed.
       */
      await refetch();
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Close Phone Modal                                                        */
  /* ------------------------------------------------------------------------ */

  const closePhoneModal = () => {
    if (isSendingPhoneRequest) return;

    setShowPhoneModal(false);
    setPhoneChangeReason("");
    setPhoneRequestError("");
  };

  /* ------------------------------------------------------------------------ */
  /* Loading State                                                            */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Error State                                                              */
  /* ------------------------------------------------------------------------ */

  if (isError || !user) {
    return (
      <div
        className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 overflow-x-clip bg-white px-4"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        <p className="text-center text-[14px] font-semibold text-[#101828]">
          Failed to load profile
        </p>

        <GhostButton text="Retry" onClick={() => refetch()} />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Main UI                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="min-h-dvh w-full overflow-x-clip bg-white"
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
      `}</style>

      <DashboardHeader distributorId={user?.distributor_id || ""} />

      <div className="relative flex min-h-[calc(100dvh-72px)] min-w-0">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-clip bg-[#fafcff] px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5 lg:px-8 lg:pt-6">
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">
            {/* Page Heading */}

            <div className="mb-5 flex min-w-0 items-start gap-3 sm:mb-[22px]">
              <span
                className="mt-1 h-6 w-1 shrink-0 rounded-full sm:w-1.5"
                style={{ backgroundColor: NAVY }}
              />

              <div className="min-w-0 flex-1">
                <h1 className="break-words text-[20px] font-semibold leading-tight text-[#101828] sm:text-[22px]">
                  My Profile
                </h1>

                <p className="mt-1 break-words text-[11px] leading-5 text-[#98a2b3] sm:text-[12px]">
                  Manage your account, security and bank details
                </p>
              </div>
            </div>

            {/* Three Column Profile Layout */}

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px] xl:gap-[14px]">
              {/* LEFT COLUMN */}

              <aside
                className={`${stickyColumnClass} sm:grid-cols-2 xl:grid-cols-1 xl:gap-[14px]`}
                aria-label="Profile summary"
              >
                <ProfileSummary user={user} />

                <ProfileImageCard
                  user={user}
                  loading={isUpdating}
                  onSave={(file) =>
                    handleUpdateProfile({
                      profile_image: file,
                    })
                  }
                />
              </aside>

              {/* MIDDLE COLUMN */}

              <div className="min-w-0">
                <ProfileForm
                  user={user}
                  loading={isUpdating}
                  onSave={(profileData) =>
                    handleUpdateProfile(profileData)
                  }
                />

                <PhoneChangeRequestCard
                  user={user}
                  onClick={openPhoneModal}
                  nextAllowedAt={nextAllowedAt}
                  canResubmit={canResubmitCorrection}
                />

                <AddressSection />

                <div className="mt-4">
                  <DistributorPVCSection user={user} />
                </div>
              </div>

              {/* RIGHT COLUMN */}

              <aside
                className={`${stickyColumnClass} sm:grid-cols-2 xl:grid-cols-1 xl:gap-[14px]`}
                aria-label="Bank details and security"
              >
                <BankWalletDetails user={user} />

                <SecuritySection />
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Phone Change Modal */}

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
