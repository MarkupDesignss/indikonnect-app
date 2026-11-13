"use client";

import {
  Eye,
  EyeOff,
  MapPin,
  LockKeyhole,
  Landmark,
  CircleUserRound,
  Camera,
  Loader2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  UserRound,
  X,
  Mail,
  HelpCircle,
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
  CorrectionRequestType,
} from "@/lib/redux/api/distributor/userDashboardApi";

const NAVY = "#172B4D";
const EMERALD = "#128364";
const RED = "#d92d20";
const AMBER = "#B8935A";

const stickyColumnClass =
  "min-w-0 grid grid-cols-1 items-start gap-5 lg:sticky lg:top-[104px] lg:self-start";

const inputClass =
  "box-border h-[50px] min-w-0 w-full rounded-[13px] border border-[#DDE5F0] bg-white px-4 text-[14px] font-medium text-[#1F3048] outline-none placeholder:font-normal placeholder:text-[#98A6B9] transition-all duration-150 hover:border-[#AFC2DF] focus:border-[#3869C8] focus:ring-[4px] focus:ring-[#3869C8]/10 disabled:cursor-not-allowed disabled:opacity-60";

const readOnlyClass =
  "box-border h-[50px] min-w-0 w-full rounded-[13px] border border-[#EDF1F6] bg-[#F6F8FC] px-4 text-[13px] font-medium text-[#64748B] outline-none cursor-not-allowed";

const labelClass =
  "mb-2 block break-words text-[13px] font-bold leading-5 text-[#334155]";

const sectionClass =
  "min-w-0 w-full rounded-[22px] border border-[#E2EAF4] bg-white p-5 shadow-[0_10px_35px_-18px_rgba(23,43,77,0.20)] sm:p-6 2xl:p-7";

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

/**
 * IMPORTANT FIX
 * The API returns `latest_correction_request` as an object keyed by type:
 *   { phone: {...}, email: {...} }
 * The old code pushed the whole object as a single entry, so filtering by
 * `request.type === "email_request"` never matched.
 *
 * This helper flattens every possible shape into a clean CorrectionRequest[].
 */
function collectCorrectionRequests(user: any): CorrectionRequest[] {
  const collected: CorrectionRequest[] = [];

  const pushValue = (value: unknown) => {
    if (!value) return;

    // Array of requests
    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }

    if (typeof value !== "object") return;

    const candidate = value as CorrectionRequest & Record<string, unknown>;

    // A real request object carries a `type` + `status`
    if (typeof candidate.type === "string" && candidate.status != null) {
      collected.push(candidate);
      return;
    }

    // Otherwise it's a type-keyed map: { phone: {...}, email: {...} }
    Object.values(candidate).forEach(pushValue);
  };

  pushValue(user?.correction_requests);
  pushValue(user?.latest_correction_request);

  // De-duplicate by id so the same request appearing in both sources
  // doesn't produce duplicate status cards.
  const seen = new Set<string>();
  return collected
    .filter((request) => {
      const key = String(request.id ?? `${request.type}-${request.created_at}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        (parseApiDate(b.created_at) ?? 0) - (parseApiDate(a.created_at) ?? 0),
    );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const HeaderIcon =
    title === "Profile"
      ? UserRound
      : title === "Profile picture"
        ? Camera
        : title === "Phone Number"
          ? Phone
          : title === "Address"
            ? MapPin
            : title === "Security"
              ? LockKeyhole
              : title === "Bank / Wallet Details"
                ? Landmark
                : title === "Help Center"
                  ? HelpCircle
                  : CircleUserRound;

  return (
    <div className="mb-6 flex min-w-0 items-start gap-3.5 border-b border-[#EAF0F7] pb-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-[#DCE8FA] bg-[#EDF4FF] text-[#315FAE]">
        <HeaderIcon size={17} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="break-words text-[17px] font-extrabold leading-6 tracking-[-0.025em] text-[#172B4D] sm:text-[19px]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 break-words text-[12.5px] leading-5 text-[#64748B]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function SaveButton({
  text = "Save changes",
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
      className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[12px] border border-[#2957A8] bg-[#2957A8] px-5 text-[13px] font-bold tracking-[-0.01em] text-white shadow-[0_4px_10px_-6px_rgba(0,0,0,0.35)] transition-all duration-150 hover:border-[#1D468D] hover:bg-[#1D468D] hover:shadow-[0_6px_15px_-7px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-black/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#DDDEE1] disabled:bg-[#DDDEE1] disabled:text-[#888B91] disabled:shadow-none"
    >
      {loading && <Loader2 size={15} className="shrink-0 animate-spin" />}
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
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[43px] shrink-0 items-center justify-center rounded-[12px] border border-[#CBD9EB] bg-white px-5 text-[13px] font-semibold text-[#484B53] transition-all duration-150 hover:border-[#C8CAD0] hover:bg-[#F8F8F9] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-black/[0.07]"
    >
      {text}
    </button>
  );
}

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
      <div className="mb-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#4770AE]">
        <ShieldCheck size={13} className="text-[#161616]" />
        Account overview
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-2 border-white shadow-[0_0_0_1px_#E5E5E7] sm:h-[52px] sm:w-[52px]"
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
          <p className="break-words text-[16px] font-extrabold leading-6 tracking-[-0.02em] text-[#172B4D] sm:text-[17px]">
            {user?.full_name?.toUpperCase() || "—"}
          </p>
          <p className="break-all text-[11px] leading-4 text-[#8A8E97] sm:truncate sm:text-[11.5px]">
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

      <div className="mt-6 space-y-0 divide-y divide-[#EAF0F7] border-t border-[#EAF0F7]">
        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#71819A] sm:text-[12px]">
            Account ID
          </p>
          <p className="mt-1 break-all text-[14px] font-bold text-[#253858]">
            {user?.distributor_id || "—"}
          </p>
        </div>

        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#71819A] sm:text-[12px]">
            Account Type
          </p>
          <p className="mt-1 break-words text-[12px] font-semibold capitalize text-[#4B4D56] sm:text-[13px]">
            {user?.account_type || "—"}
          </p>
        </div>

        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#71819A] sm:text-[12px]">
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
    user?.profile_picture || null,
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
      <SectionHeader
        title="Profile picture"
        subtitle="Use a clear photo for your account"
      />

      <div className="mt-5 flex justify-center sm:mt-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => !loading && fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Upload profile image"
            className="flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-full border-[5px] border-[#F4F4F5] bg-[#FAFAFA] shadow-[0_0_0_1px_#E6E7E9] transition hover:shadow-[0_0_0_2px_#202020] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 disabled:cursor-not-allowed sm:h-[118px] sm:w-[118px]"
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
                className="text-[#8A8E97] sm:h-[70px] sm:w-[70px]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => !loading && fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Edit profile image"
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#141414] text-white shadow-md transition-colors hover:bg-[#1D468D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed"
          >
            <Camera size={15} />
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

      <p className="mt-2 text-center text-[10px] leading-4 text-[#8A8E97] sm:text-[10.5px]">
        Image file · Maximum 5 MB
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:mt-6">
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
      idNumber: user.aadhaar_last4 ? `XXXX-XXXX-${user.aadhaar_last4}` : "",
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
            <span className="ml-2 inline-block rounded bg-[#f2f4f7] px-1.5 py-0.5 text-[9px] font-medium text-[#8A8E97]">
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

        <div className="flex justify-end border-t border-[#EAF0F7] pt-5">
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

  const phoneRequests: CorrectionRequest[] = collectCorrectionRequests(
    user,
  ).filter((request) => request?.type === "phone_request");

  const latestRequest = phoneRequests[0] ?? null;
  const rawStatus = latestRequest?.status?.toLowerCase() ?? null;

  type UIState = "none" | "pending" | "approved" | "completed" | "rejected";

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
      color: "#141414",
      bg: "#f5f5f5",
      dot: "#141414",
      description: "Your phone number was changed successfully.",
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
    cooldownActive && uiState !== "pending" && uiState !== "approved";

  const showCombinedCard = meta !== null || showCooldownSection;

  return (
    <section className={`${sectionClass} mt-5`}>
      <SectionHeader
        title="Phone Number"
        subtitle="Phone number changes are reviewed by the admin."
      />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8E97]">
            Registered phone number
          </p>
          <p className="mt-1 break-all text-[15px] font-bold text-[#253858]">
            {user?.phone || "Not available"}
          </p>
        </div>

        {showChangeButton && (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#2957A8] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#1D468D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
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
            backgroundColor: meta?.bg ?? "#fafafa",
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
              {(latestRequest.rejected_at || latestRequest.updated_at) && (
                <p className="mt-2 text-[10.5px] text-[#8A8E97]">
                  Rejected on{" "}
                  {formatApiDate(
                    latestRequest.rejected_at || latestRequest.updated_at,
                  )}
                </p>
              )}
              {(latestRequest.rejected_reason || latestRequest.reason) && (
                <div className="mt-2.5 rounded-[12px] border border-[#d92d2033] bg-white/70 px-2.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8E97]">
                    Admin remark
                  </p>
                  <p className="mt-1 break-words text-[10.5px] leading-4 text-[#4B4D56]">
                    {latestRequest.rejected_reason || latestRequest.reason}
                  </p>
                </div>
              )}
            </>
          )}

          {(uiState === "pending" || uiState === "approved") &&
            latestRequest?.created_at && (
              <p className="mt-2 text-[10.5px] text-[#8A8E97]">
                Submitted on {formatApiDate(latestRequest.created_at)}
              </p>
            )}

          {showCooldownSection && (
            <>
              <div className="mt-3 flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#141414]"
                />
                <p className="text-[11px] leading-5 text-[#667085]">
                  You can submit another phone number change request after the
                  cooldown period ends.
                </p>
              </div>
              {nextAllowedAt && (
                <p className="mt-2.5 break-words text-[10.5px] text-[#667085]">
                  Next request available:{" "}
                  <span className="font-semibold text-[#141414]">
                    {formatApiDate(nextAllowedAt) || nextAllowedAt}
                  </span>
                </p>
              )}
            </>
          )}

          {uiState === "approved" && (
            <div className="mt-2.5 flex items-start gap-2 rounded-[12px] border border-[#1f9d6b33] bg-white/70 px-2.5 py-2">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[#1f9d6b]"
              />
              <p className="text-[10.5px] leading-4 text-[#4B4D56]">
                A secure link has been sent to you. Please open it to change
                your phone number. If you didn't receive it, contact admin.
              </p>
            </div>
          )}

          {uiState === "completed" && (
            <p className="mt-2 text-[10.5px] text-[#8A8E97]">
              You may request another change when permitted.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

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
        className="mb-4 flex min-w-0 items-start gap-2 rounded-[12px] px-3 py-2.5"
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
          {bankVerified ? "Bank account verified" : "Bank verification pending"}
        </p>
      </div>

      <dl className="divide-y divide-[#F0F0F2]">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0 py-3 first:pt-0 last:pb-0">
            <dt className="mb-1 text-[10.5px] font-medium text-[#8A8E97]">
              {row.label}
            </dt>
            <dd
              className={`break-words text-[14px] font-bold leading-6 text-[#253858] ${
                row.capitalize ? "capitalize" : ""
              }`}
              title={row.value}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AddressSection() {
  return (
    <section className={`${sectionClass} mt-5`}>
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
          width: 100%;
          max-width: 100%;
        }

        .address-card-wrapper > div {
          margin-top: 0 !important;
          max-width: 100%;
          min-width: 0;
        }

        .address-card-wrapper input,
        .address-card-wrapper textarea,
        .address-card-wrapper select {
          box-sizing: border-box;
          max-width: 100%;
          min-width: 0;
          border-radius: 12px !important;
          border-color: #e4e5e8 !important;
          background: #fff !important;
        }

        .address-card-wrapper input:focus-visible,
        .address-card-wrapper textarea:focus-visible,
        .address-card-wrapper select:focus-visible {
          outline: 2px solid rgba(20, 20, 20, 0.15);
          outline-offset: 1px;
        }

        .address-card-wrapper h2 {
          color: #222 !important;
          font-size: 14px !important;
          font-weight: 700 !important;
        }

        .address-card-wrapper > div > div:first-child > button {
          display: none !important;
        }

        .address-card-wrapper .add-address-bottom-btn,
        .address-card-wrapper .border-dashed button {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 43px !important;
          max-width: 100%;
          padding: 0 20px !important;
          border: 1px solid #141414 !important;
          border-radius: 11px !important;
          background: #141414 !important;
          box-shadow: none !important;
          color: #fff !important;
          font-size: 12.5px !important;
          font-weight: 700 !important;
          transition: background-color 0.15s ease !important;
        }

        .address-card-wrapper .add-address-bottom-btn:hover,
        .address-card-wrapper .border-dashed button:hover {
          background: #000 !important;
        }

        .address-card-wrapper .add-address-bottom-btn {
          margin-top: 14px !important;
        }

        .address-card-wrapper button.underline {
          color: #454545 !important;
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }

        .address-card-wrapper button.underline:hover {
          color: #000 !important;
        }

        .address-card-wrapper img {
          max-width: 100%;
          object-fit: cover;
        }

        @media (max-width: 639px) {
          .address-card-wrapper,
          .address-card-wrapper p,
          .address-card-wrapper span {
            overflow-wrap: anywhere;
          }

          .address-card-wrapper .add-address-bottom-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

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
    newPassword = security.password,
  ) =>
    !value
      ? "Please confirm your password"
      : value !== newPassword
        ? "Passwords do not match"
        : null;

  const handleChange = (
    field: "oldPassword" | "password" | "confirmPassword",
    value: string,
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
          }),
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
          }),
        );
      }
    } catch (error: unknown) {
      dispatch(
        showToast({
          message: getErrorMessage(
            error,
            "Something went wrong while changing password",
          ),
          type: "error",
        }),
      );
    }
  };

  const passwordField = (
    field: "oldPassword" | "password" | "confirmPassword",
    label: string,
    placeholder: string,
    visible: boolean,
    toggle: () => void,
    autoComplete: string,
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8E97] transition-colors hover:text-[#4B4D56]"
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
      <SectionHeader title="Security" subtitle="Change your account password" />

      <div className="space-y-4 sm:space-y-[16px]">
        {passwordField(
          "oldPassword",
          "Old Password",
          "Enter current password",
          showOldPassword,
          () => setShowOldPassword((value) => !value),
          "current-password",
        )}

        {passwordField(
          "password",
          "New Password",
          "Enter new password",
          showNewPassword,
          () => setShowNewPassword((value) => !value),
          "new-password",
        )}

        {passwordField(
          "confirmPassword",
          "Confirm New Password",
          "Confirm new password",
          showConfirmPassword,
          () => setShowConfirmPassword((value) => !value),
          "new-password",
        )}

        <div className="flex justify-end border-t border-[#EAF0F7] pt-5">
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
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-[4px] sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-phone-title"
    >
      <div className="relative my-auto w-full max-w-[480px] overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_28px_90px_-24px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFEFF1] px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F2F3] text-[#141414]">
              <Phone size={19} />
            </span>
            <div className="min-w-0">
              <h2
                id="change-phone-title"
                className="text-[17px] font-bold tracking-[-0.02em] text-[#1B1B1B]"
              >
                Change Phone Number
              </h2>
              <p className="text-[11.5px] text-[#8A8E97]">
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

        <form
          onSubmit={onSubmit}
          className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
        >
          <div className="rounded-[10px] border border-[#E8E9EC] bg-[#fafafa] p-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#141414]"
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
                    words.slice(0, MAX_PHONE_CHANGE_REASON_WORDS).join(" "),
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
              className={`box-border min-h-[110px] min-w-0 w-full resize-y rounded-[10px] border border-[#E8E9EC] bg-[#F8F8F9] px-3.5 py-3 text-[13px] leading-5 text-[#4B4D56] outline-none placeholder:text-[#8A8E97] transition-all focus:border-[#141414] focus:bg-white focus:ring-2 focus:ring-[#141414]/10 sm:px-[14px] ${
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
                <p className="text-[10.5px] text-[#8A8E97]">
                  Minimum 10 characters required.
                </p>
              )}

              <span
                className={`ml-auto shrink-0 text-[10.5px] ${
                  reason.trim().length >= MIN_PHONE_CHANGE_REASON_CHARACTERS
                    ? "text-[#1f9d6b]"
                    : "text-[#8A8E97]"
                }`}
              >
                {getWordCount(reason)}/{MAX_PHONE_CHANGE_REASON_WORDS} words
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#EFEFF1] pt-4 sm:flex-row sm:justify-end">
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

// ============================================
// FIXED HELP CENTER SECTION
// ============================================

function HelpCenterSection({ user }: { user: any }) {
  const dispatch = useDispatch();

  const [createCorrectionRequest, { isLoading }] =
    useCreateCorrectionRequestMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] =
    useState<CorrectionRequestType>("phone_request");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // ✅ FIX: flatten every possible API shape into a clean list.
  // `latest_correction_request` is an object keyed by type
  // ({ phone: {...}, email: {...} }), not a single request.
  const allRequests: CorrectionRequest[] = collectCorrectionRequests(user);

  const getLatestRequestForType = (type: string) =>
    allRequests.find((req) => req?.type === type) ?? null;

  const latestPhoneRequest = getLatestRequestForType("phone_request");
  const latestEmailRequest = getLatestRequestForType("email_request");

  const isLocked = (request: CorrectionRequest | null) => {
    const status = request?.status?.toLowerCase();
    return status === "pending" || status === "approved";
  };

  const isPhoneLocked = isLocked(latestPhoneRequest);
  const isEmailLocked = isLocked(latestEmailRequest);

  // ✅ FIX: if both are locked, don't let the modal open at all.
  const bothLocked = isPhoneLocked && isEmailLocked;

  const handleOpen = () => {
    setReason("");
    setError("");

    if (isPhoneLocked && isEmailLocked) {
      dispatch(
        showToast({
          message:
            "Both phone and email requests are already pending or approved. Please wait for admin review.",
          type: "info",
        }),
      );
      return;
    }

    // Auto-select the first unlocked type.
    if (!isPhoneLocked) {
      setRequestType("phone_request");
    } else if (!isEmailLocked) {
      setRequestType("email_request");
    } else {
      setRequestType("phone_request");
    }

    setIsModalOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedReason = reason.trim();

    if (trimmedReason.length < MIN_PHONE_CHANGE_REASON_CHARACTERS) {
      setError("Please enter at least 10 characters.");
      return;
    }

    if (getWordCount(trimmedReason) > MAX_PHONE_CHANGE_REASON_WORDS) {
      setError("Reason cannot exceed 150 words.");
      return;
    }

    // Strict check before submit.
    const isCurrentTypeLocked =
      requestType === "phone_request" ? isPhoneLocked : isEmailLocked;

    if (isCurrentTypeLocked) {
      const message = `A ${
        requestType === "phone_request" ? "phone" : "email"
      } request is already pending or approved.`;
      setError(message);
      dispatch(showToast({ message, type: "error" }));
      return;
    }

    try {
      const response = await createCorrectionRequest({
        type: requestType,
        reason: trimmedReason,
      }).unwrap();

      if (response?.success === false || response?.status === false) {
        const message = response.message || "Unable to send request.";
        setError(message);
        dispatch(showToast({ message, type: "error" }));
        return;
      }

      dispatch(
        showToast({
          message: response?.message || "Request sent successfully.",
          type: "success",
        }),
      );

      handleClose();
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Something went wrong while sending the request.",
      );
      setError(message);
      dispatch(showToast({ message, type: "error" }));
    }
  };

  return (
    <section className={`${sectionClass} mt-5`}>
      <SectionHeader
        title="Help Center"
        subtitle="Raise a request to update your contact details"
      />

      {/* Status Display */}
      <div className="mb-4 space-y-3">
        {/* Phone Status */}
        {latestPhoneRequest && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#E2EAF4] bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#52647E]" />
              <span className="text-[13px] font-semibold text-[#334155]">
                Phone Number Request
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                latestPhoneRequest.status === "pending"
                  ? "bg-[#F8F1E4] text-[#B8935A]"
                  : latestPhoneRequest.status === "approved"
                    ? "bg-[#EAF7F0] text-[#1f9d6b]"
                    : latestPhoneRequest.status === "rejected"
                      ? "bg-[#FEF3F2] text-[#d92d20]"
                      : "bg-[#F5F5F5] text-[#141414]"
              }`}
            >
              {latestPhoneRequest.status}
            </span>
          </div>
        )}

        {/* Email Status */}
        {latestEmailRequest && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#E2EAF4] bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#52647E]" />
              <span className="text-[13px] font-semibold text-[#334155]">
                Email Address Request
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                latestEmailRequest.status === "pending"
                  ? "bg-[#F8F1E4] text-[#B8935A]"
                  : latestEmailRequest.status === "approved"
                    ? "bg-[#EAF7F0] text-[#1f9d6b]"
                    : latestEmailRequest.status === "rejected"
                      ? "bg-[#FEF3F2] text-[#d92d20]"
                      : "bg-[#F5F5F5] text-[#141414]"
              }`}
            >
              {latestEmailRequest.status}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-[#64748B]">
          Need to change your registered phone number or email address? You can
          raise a request here.
        </p>

        <button
          type="button"
          onClick={handleOpen}
          disabled={bothLocked}
          className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#2957A8] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#1D468D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 disabled:cursor-not-allowed disabled:bg-[#DDDEE1] disabled:text-[#888B91]"
        >
          <HelpCircle size={15} />
          {bothLocked ? "All requests pending" : "Open Help Center"}
        </button>
      </div>

      {isModalOpen && !bothLocked && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-[4px] sm:p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-auto w-full max-w-[480px] overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_28px_90px_-24px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#EFEFF1] px-5 py-5 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F2F3] text-[#141414]">
                  <HelpCircle size={19} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#1B1B1B]">
                    Help Center Request
                  </h2>
                  <p className="text-[11.5px] text-[#8A8E97]">
                    Select what you want to change and provide a reason.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
            >
              {/* Type Selector */}
              <div>
                <label className={labelClass}>
                  What do you want to change?
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      !isPhoneLocked && setRequestType("phone_request")
                    }
                    disabled={isPhoneLocked}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                      requestType === "phone_request"
                        ? "border-[#2957A8] bg-[#F0F5FF] text-[#2957A8] ring-1 ring-[#2957A8]"
                        : "border-[#E8E9EC] bg-white text-[#667085] hover:bg-[#F8F9FA]"
                    } ${
                      isPhoneLocked ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <Phone
                      size={20}
                      className={
                        requestType === "phone_request"
                          ? "text-[#2957A8]"
                          : "text-[#8A8E97]"
                      }
                    />
                    <span className="text-[12px] font-bold">
                      Phone Number
                    </span>
                    {isPhoneLocked && (
                      <span className="text-[9px] font-bold text-red-500">
                        Locked
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      !isEmailLocked && setRequestType("email_request")
                    }
                    disabled={isEmailLocked}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                      requestType === "email_request"
                        ? "border-[#2957A8] bg-[#F0F5FF] text-[#2957A8] ring-1 ring-[#2957A8]"
                        : "border-[#E8E9EC] bg-white text-[#667085] hover:bg-[#F8F9FA]"
                    } ${
                      isEmailLocked ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <Mail
                      size={20}
                      className={
                        requestType === "email_request"
                          ? "text-[#2957A8]"
                          : "text-[#8A8E97]"
                      }
                    />
                    <span className="text-[12px] font-bold">
                      Email Address
                    </span>
                    {isEmailLocked && (
                      <span className="text-[9px] font-bold text-red-500">
                        Locked
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label htmlFor="help-reason" className={labelClass}>
                  Reason for Change{" "}
                  <span className="ml-0.5 text-red-500">*</span>
                </label>

                <textarea
                  id="help-reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => {
                    const val = e.target.value;

                    if (getWordCount(val) > MAX_PHONE_CHANGE_REASON_WORDS) {
                      setReason(
                        val
                          .trim()
                          .split(/\s+/)
                          .slice(0, MAX_PHONE_CHANGE_REASON_WORDS)
                          .join(" "),
                      );
                      setError("Maximum 150 words are allowed.");
                      return;
                    }

                    setReason(val);
                    setError("");
                  }}
                  placeholder={`Enter reason for changing your ${
                    requestType === "phone_request" ? "phone number" : "email"
                  }`}
                  className={`box-border min-h-[110px] min-w-0 w-full resize-y rounded-[10px] border border-[#E8E9EC] bg-[#F8F8F9] px-3.5 py-3 text-[13px] leading-5 text-[#4B4D56] outline-none placeholder:text-[#8A8E97] transition-all focus:border-[#141414] focus:bg-white focus:ring-2 focus:ring-[#141414]/10 sm:px-[14px] ${
                    error ? "border-red-500 ring-2 ring-red-500/10" : ""
                  }`}
                />

                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  {error ? (
                    <p className="text-[10.5px] text-red-500">{error}</p>
                  ) : (
                    <p className="text-[10.5px] text-[#8A8E97]">
                      Minimum 10 characters required.
                    </p>
                  )}

                  <span
                    className={`ml-auto shrink-0 text-[10.5px] ${
                      reason.trim().length >= 10
                        ? "text-[#1f9d6b]"
                        : "text-[#8A8E97]"
                    }`}
                  >
                    {getWordCount(reason)}/{MAX_PHONE_CHANGE_REASON_WORDS} words
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#EFEFF1] pt-4 sm:flex-row sm:justify-end">
                <GhostButton text="Cancel" onClick={handleClose} />
                <SaveButton
                  text="Submit Request"
                  type="submit"
                  loading={isLoading}
                  disabled={
                    (requestType === "phone_request"
                      ? isPhoneLocked
                      : isEmailLocked) ||
                    reason.trim().length <
                      MIN_PHONE_CHANGE_REASON_CHARACTERS ||
                    getWordCount(reason) > MAX_PHONE_CHANGE_REASON_WORDS
                  }
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// --------------------------------------------------
// KYC status — displayed inside Profile Overview
// --------------------------------------------------

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

    .kyc-status-page,
    .kyc-status-page * {
      box-sizing: border-box;
    }

    .kyc-status-page {
      min-width: 0;
      max-width: 100%;
      font-family: 'Lato', sans-serif;
    }

    .kyc-status-page p,
    .kyc-status-page h1,
    .kyc-status-page h2,
    .kyc-status-page h3 {
      overflow-wrap: anywhere;
    }

    .kyc-status-page button {
      -webkit-tap-highlight-color: transparent;
    }
  `}</style>
);

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function maskLast(
  value: string | number | null | undefined,
  lastN = 4,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const stringValue = String(value);

  if (stringValue.length <= lastN) {
    return `XXXX ${stringValue}`;
  }

  return `XXXX XXXX ${stringValue.slice(-lastN)}`;
}

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";

  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length < 6) return phone;

  return `${cleaned.slice(0, cleaned.length - 4)}XXXX`;
}

const cardClass =
  "min-w-0 rounded-[22px] border border-[#E2EAF4] bg-white p-5 shadow-[0_10px_35px_-18px_rgba(23,43,77,0.20)] sm:p-6 lg:p-7";

function KycLoading() {
  return (
    <div
      className={`kyc-status-page ${cardClass}`}
      aria-label="Loading KYC status"
      aria-busy="true"
    >
      <FontImport />

      <div className="flex items-center gap-3">
        <Loader2
          className="h-5 w-5 shrink-0 animate-spin"
          style={{ color: NAVY }}
        />
        <div className="min-w-0 flex-1">
          <div className="h-5 w-36 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
          <div className="mt-2 h-3.5 w-56 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
        </div>
      </div>

      <div className="mt-6 rounded-[14px] border border-[#e7e9ee] p-4 sm:mt-8 sm:p-6">
        <div className="h-4 w-40 max-w-full animate-pulse rounded bg-[#f2f4f7]" />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[#f2f4f7] sm:h-14 sm:w-14" />
          <div className="h-7 w-36 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
        </div>

        <div className="mt-4 h-4 w-full max-w-[440px] animate-pulse rounded bg-[#f2f4f7]" />
        <div className="mt-2 h-4 w-4/5 max-w-[360px] animate-pulse rounded bg-[#f2f4f7]" />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col items-center rounded-[12px] bg-[#f7f8fa] p-3 sm:p-4"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#e7e9ee]" />
              <div className="mt-3 h-3 w-20 max-w-full animate-pulse rounded bg-[#e7e9ee]" />
              <div className="mt-2 h-3 w-16 max-w-full animate-pulse rounded bg-[#e7e9ee]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-[14px] bg-[#f7f8fa] sm:rounded-[16px]" />
        <div className="h-52 animate-pulse rounded-[14px] bg-[#f7f8fa] sm:rounded-[16px]" />
      </div>
    </div>
  );
}

function KycError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={`kyc-status-page ${cardClass}`}>
      <FontImport />

      <div className="flex min-h-[260px] flex-col items-center justify-center px-1 py-10 text-center sm:min-h-[320px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fef2f2]">
          <AlertCircle className="h-7 w-7 text-[#DC2626]" />
        </div>

        <p className="mt-4 text-[14px] font-semibold text-[#101828] sm:text-[15px]">
          Failed to load KYC status
        </p>

        <p className="mt-2 max-w-sm text-[12px] leading-5 text-[#667085] sm:text-[13px]">
          Something went wrong while fetching your profile. Please try again.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[9px] bg-[#0E1B3D] px-5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#1a2a54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B3D]/30 focus-visible:ring-offset-2"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
  capitalize = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-3 sm:gap-4">
      <p className="min-w-0 break-words text-[12px] leading-5 text-[#667085] sm:text-[13px] sm:text-[13.5px]">
        {label}
      </p>

      <p
        className={`min-w-0 break-words text-right text-[12px] font-semibold leading-5 text-[#101828] sm:text-[13px] sm:text-[13.5px] ${
          capitalize ? "capitalize" : ""
        }`}
        style={{ color: valueColor }}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineStep({
  label,
  date,
  done,
  color,
  nextDone,
  isLast,
}: {
  label: string;
  date: string;
  done: boolean;
  color: string;
  nextDone: boolean;
  isLast: boolean;
}) {
  return (
    <div className="relative flex min-w-0 flex-col items-center px-1 text-center">
      {!isLast && (
        <div
          className="absolute left-1/2 top-[17px] z-0 hidden h-[2px] w-full sm:block"
          style={{ backgroundColor: nextDone ? color : "#e7e9ee" }}
          aria-hidden="true"
        />
      )}

      <div
        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
        style={{ backgroundColor: done ? color : "#e7e9ee" }}
      >
        <CheckCircle2
          className="h-[18px] w-[18px] sm:h-5 sm:w-5"
          style={{ color: done ? "#ffffff" : "#98a2b3" }}
        />
      </div>

      <p className="mt-2 w-full break-words text-[11px] font-semibold leading-4 text-[#101828] sm:text-[12px]">
        {label}
      </p>

      <p className="mt-1 w-full break-words text-[10px] leading-4 text-[#98a2b3] sm:text-[11px]">
        {date}
      </p>
    </div>
  );
}

function KycDetailsCard({
  user,
  status,
}: {
  user: any;
  status: { label: string; color: string };
}) {
  const details = [
    {
      label: "Application ID",
      value: `KYC${String(user.id).padStart(10, "0")}`,
    },
    {
      label: "Full name",
      value: user.full_name || "—",
      capitalize: true,
    },
    {
      label: "Aadhaar number",
      value: maskLast(user.aadhaar_last4),
    },
    {
      label: "Mobile number",
      value: maskPhone(user.phone),
    },
    {
      label: "PAN number",
      value: maskLast(user.pan_last4),
    },
  ];

  return (
    <div className={cardClass}>
      <h3 className="break-words text-[15px] font-bold text-[#101828] sm:text-[16px]">
        KYC details
      </h3>

      <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-4 sm:space-y-3.5">
        {details.map((item) => (
          <DetailRow
            key={item.label}
            label={item.label}
            value={item.value}
            capitalize={item.capitalize}
          />
        ))}
      </div>

      <div className="mt-4">
        <DetailRow
          label="KYC status"
          value={status.label}
          valueColor={status.color}
        />
      </div>
    </div>
  );
}

function DocumentVerificationCard({
  bp,
  documents,
}: {
  bp: any;
  documents: {
    label: string;
    status: string;
    verified: boolean;
    notApplicable: boolean;
  }[];
}) {
  return (
    <div className={cardClass}>
      <h3 className="break-words text-[15px] font-bold text-[#101828] sm:text-[16px]">
        Document verification status
      </h3>

      <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-4 sm:space-y-3.5">
        {documents.map((document) => {
          const color = document.notApplicable
            ? "#98a2b3"
            : document.verified
              ? EMERALD
              : AMBER;

          return (
            <div
              key={document.label}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3"
            >
              <p className="min-w-0 break-words text-[12px] leading-5 text-[#667085] sm:text-[13px] sm:text-[13.5px]">
                {document.label}
              </p>

              <span
                className="inline-flex max-w-full items-center justify-end gap-1.5 break-words text-right text-[11px] font-semibold leading-5 sm:text-[12px] sm:text-[13px]"
                style={{ color }}
              >
                {document.verified && (
                  <CheckCircle2 size={13} className="shrink-0" />
                )}
                {!document.verified && !document.notApplicable && (
                  <Clock size={13} className="shrink-0" />
                )}
                <span>{document.status}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-3 sm:space-y-3.5">
        <DetailRow label="Bank name" value={bp.bank_name || "—"} />
        <DetailRow
          label="Account type"
          value={bp.account_type || "—"}
          capitalize
        />
      </div>
    </div>
  );
}

const KycStatus = ({ user }: { user: any }) => {
  const bp = user.distributor_profile ?? user.business_profile ?? {};

  const kycStatus: string = (bp.kyc_status || "").toLowerCase();
  const aadhaarVerified = !!bp.aadhaar_verified;
  const panVerified = !!bp.pan_verified;
  const bankVerified = !!bp.bank_verified;

  const STATUS_META: Record<
    string,
    {
      label: string;
      color: string;
      bg: string;
      Icon: typeof CheckCircle2;
      description: string;
      successMsg: string;
      successTitle: string;
    }
  > = {
    verified: {
      label: "Completed",
      color: EMERALD,
      bg: "#eaf7f0",
      Icon: CheckCircle2,
      description:
        "Your KYC verification is complete. Thank you — your details have been verified successfully.",
      successTitle: "Great! Your KYC is completed",
      successMsg:
        "All your details have been verified successfully. You now have full access to all features.",
    },
    pending: {
      label: "Under Review",
      color: AMBER,
      bg: "#f8f1e4",
      Icon: Clock,
      description:
        "Your KYC verification is currently under review. This usually takes 24–48 hours.",
      successTitle: "KYC under review",
      successMsg:
        "We're reviewing your submitted documents. You'll be notified once the verification is complete.",
    },
    rejected: {
      label: "Rejected",
      color: RED,
      bg: "#fef2f2",
      Icon: XCircle,
      description: bp.rejection_reason
        ? `Your KYC was rejected. Reason: ${bp.rejection_reason}`
        : "Your KYC verification was rejected. Please re-submit with correct details.",
      successTitle: "KYC rejected",
      successMsg: bp.rejection_reason
        ? `Reason: ${bp.rejection_reason}`
        : "Please contact support or re-submit your KYC documents.",
    },
  };

  const status = STATUS_META[kycStatus] ?? STATUS_META.pending;
  const StatusIcon = status.Icon;

  const timeline = [
    {
      label: "Submitted",
      date: formatDate(bp.submitted_at),
      done: !!bp.submitted_at,
    },
    {
      label: "Under review",
      date: formatDate(bp.submitted_at),
      done: !!bp.submitted_at,
    },
    {
      label: "In verification",
      date: formatDate(bp.aadhaar_verified_at || bp.pan_verified_at),
      done: aadhaarVerified || panVerified,
    },
    {
      label: status.label,
      date: formatDate(bp.reviewed_at || bp.updated_at || bp.submitted_at),
      done: kycStatus === "verified" || kycStatus === "rejected",
    },
  ];

  const documents = [
    {
      label: "Aadhaar proof",
      status: aadhaarVerified ? "Verified" : "Pending",
      verified: aadhaarVerified,
      notApplicable: false,
    },
    {
      label: "PAN card",
      status: panVerified ? "Verified" : "Pending",
      verified: panVerified,
      notApplicable: false,
    },
    {
      label: "Bank account",
      status: bankVerified ? "Verified" : "Pending",
      verified: bankVerified,
      notApplicable: false,
    },
    {
      label: "Address proof",
      status: bp.location_consent ? "Verified" : "Not applicable",
      verified: !!bp.location_consent,
      notApplicable: !bp.location_consent,
    },
  ];

  return (
    <div className={`kyc-status-page ${cardClass}`}>
      <FontImport />

      <div className="min-w-0">
        <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828] sm:text-[22px]">
          KYC status
        </h1>
        <p className="mt-1 break-words text-[12px] leading-5 text-[#667085] sm:text-[13.5px]">
          Track and manage your KYC verification status.
        </p>
      </div>

      <section className="mt-2 min-w-0 rounded-[14px] border border-[#e7e9ee] bg-white p-4 sm:mt-4 sm:rounded-[16px] sm:p-5 lg:p-6">
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start xl:gap-8">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#667085] sm:text-[13.5px]">
              Overall KYC status
            </p>

            <div className="mt-3 flex min-w-0 items-center gap-3 sm:gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
                style={{ backgroundColor: status.bg }}
              >
                <StatusIcon
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  style={{ color: status.color }}
                />
              </div>

              <h2
                className="min-w-0 break-words text-[22px] font-black leading-tight sm:text-[26px]"
                style={{ color: status.color }}
              >
                {status.label}
              </h2>
            </div>

            <p className="mt-4 max-w-[440px] break-words text-[12px] leading-5 text-[#667085] sm:text-[13px] sm:leading-[1.7]">
              {status.description}
            </p>
          </div>

          <div className="min-w-0 rounded-[12px] bg-[#fafbfc] p-3 sm:p-4">
            <h3 className="mb-4 text-[12px] font-bold text-[#475066] sm:text-[13px]">
              Verification timeline
            </h3>

            <div className="grid min-w-0 grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-4 sm:gap-x-0 sm:gap-y-3">
              {timeline.map((item, index) => (
                <TimelineStep
                  key={item.label}
                  label={item.label}
                  date={item.date}
                  done={item.done}
                  color={status.color}
                  nextDone={
                    index < timeline.length - 1
                      ? timeline[index + 1].done
                      : false
                  }
                  isLast={index === timeline.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-5 flex min-w-0 items-start gap-3 rounded-[12px] p-3.5 sm:mt-8 sm:gap-4 sm:rounded-[14px] sm:p-4"
          style={{ backgroundColor: status.bg }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white sm:h-10 sm:w-10">
            <StatusIcon
              className="h-[18px] w-[18px] sm:h-5 sm:w-5"
              style={{ color: status.color }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="break-words text-[13px] font-bold leading-5 sm:text-[14px]"
              style={{ color: status.color }}
            >
              {status.successTitle}
            </p>

            <p className="mt-1 break-words text-[12px] leading-5 text-[#475066] sm:text-[13px]">
              {status.successMsg}
            </p>
          </div>
        </div>

        <div className="mt-4 flex min-w-0 items-start gap-2 border-t border-[#f0f2f5] pt-4 sm:mt-6">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#98a2b3]" />

          <p className="min-w-0 break-words text-[11px] leading-5 text-[#98a2b3] sm:text-[12px]">
            <span className="font-semibold">Last updated:</span>{" "}
            {formatDateTime(bp.updated_at || user.updated_at)}
          </p>
        </div>
      </section>

      <div className="mt-4 grid min-w-0 grid-cols-1 items-start gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-2">
        <KycDetailsCard user={user} status={status} />
        <DocumentVerificationCard bp={bp} documents={documents} />
      </div>
    </div>
  );
};

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