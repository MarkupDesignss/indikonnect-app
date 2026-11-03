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
import { useCreateCorrectionRequestMutation } from "@/lib/redux/api/distributor/userDashboardApi";
const NAVY = "#141414";
const EMERALD = "#1f9d6b";
const RED = "#d92d20";
const stickyColumnClass =
  "min-w-0 grid grid-cols-1 items-start gap-4 xl:sticky xl:top-[94px] xl:self-start xl:z-10";
const inputClass =
  "box-border h-[46px] min-w-0 w-full rounded-[12px] border border-[#E3E5E8] bg-white px-3.5 text-[13px] font-medium text-[#282C34] outline-none placeholder:font-normal placeholder:text-[#A1A5AE] transition-[border-color,box-shadow,background-color] duration-150 hover:border-[#C7CAD1] focus:border-[#141414] focus:ring-[3px] focus:ring-black/[0.07] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4";
const readOnlyClass =
  "box-border h-[46px] min-w-0 w-full rounded-[12px] border border-[#ECEDEF] bg-[#F7F7F8] px-3.5 text-[12.5px] font-medium text-[#737782] outline-none cursor-not-allowed sm:px-4 sm:text-[13px]";
const labelClass =
  "mb-2 block break-words text-[12px] font-semibold leading-5 text-[#3B3F48] sm:text-[12.5px]";
const sectionClass =
  "min-w-0 w-full rounded-[20px] border border-[#E9EAED] bg-white p-[18px] shadow-[0_3px_16px_-9px_rgba(19,24,35,0.12)] sm:p-[22px] 2xl:p-6";
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
                : CircleUserRound;
  return (
    <div className="mb-5 flex min-w-0 items-start gap-3 border-b border-[#F0F0F1] pb-[17px]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-[#ECECEE] bg-[#F7F7F8] text-[#222222]">
        <HeaderIcon size={17} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="break-words text-[15px] font-bold leading-5 tracking-[-0.02em] text-[#1A1B1E] sm:text-[16px]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 break-words text-[11.5px] leading-[18px] text-[#858A94]">
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
      className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[11px] border border-[#141414] bg-[#141414] px-5 text-[12.5px] font-bold tracking-[-0.01em] text-white shadow-[0_4px_10px_-6px_rgba(0,0,0,0.35)] transition-all duration-150 hover:border-black hover:bg-black hover:shadow-[0_6px_15px_-7px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-black/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#DDDEE1] disabled:bg-[#DDDEE1] disabled:text-[#888B91] disabled:shadow-none"
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
      className="inline-flex min-h-[43px] shrink-0 items-center justify-center rounded-[11px] border border-[#E4E5E8] bg-white px-5 text-[12.5px] font-semibold text-[#484B53] transition-all duration-150 hover:border-[#C8CAD0] hover:bg-[#F8F8F9] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-black/[0.07]"
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
      <div className="mb-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#848790]">
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
          <p className="break-words text-[13px] font-bold leading-5 tracking-[-0.01em] text-[#202125] sm:text-[14px]">
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
      <div className="mt-5 space-y-0 divide-y divide-[#F1F1F2] border-t border-[#F0F0F1]">
        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#92969D] sm:text-[11.5px]">
            Account ID
          </p>
          <p className="mt-1 break-all text-[12px] font-semibold text-[#282A30] sm:text-[13px]">
            {user?.distributor_id || "—"}
          </p>
        </div>
        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#92969D] sm:text-[11.5px]">
            Account Type
          </p>
          <p className="mt-1 break-words text-[12px] font-semibold capitalize text-[#4B4D56] sm:text-[13px]">
            {user?.account_type || "—"}
          </p>
        </div>
        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#92969D] sm:text-[11.5px]">
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
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#141414] text-white shadow-md transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed"
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
        <div className="flex justify-end border-t border-[#EFEFF1] pt-5">
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
        (parseApiDate(b.created_at) ?? 0) - (parseApiDate(a.created_at) ?? 0),
    );
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
  const days = Math.floor(remainingMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMilliseconds / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingMilliseconds / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingMilliseconds / 1000) % 60);
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
          <p className="mt-1 break-all text-[13px] font-semibold text-[#4B4D56]">
            {user?.phone || "Not available"}
          </p>
        </div>
        {showChangeButton && (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-[11px] bg-[#141414] px-4 text-[12px] font-bold text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
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
              className={`break-words text-[12.5px] font-semibold leading-[19px] text-[#282B31] ${row.capitalize ? "capitalize" : ""}`}
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
        <div className="flex justify-end border-t border-[#EFEFF1] pt-5">
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
          (parseApiDate(b.created_at) ?? 0) - (parseApiDate(a.created_at) ?? 0),
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
        reason: trimmedReason,
      }).unwrap();
      if (response?.success === false || response?.status === false) {
        const message =
          response.message || "Unable to send phone number change request.";
        setPhoneRequestError(message);
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
      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );
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
        <main className="min-h-0 min-w-0 flex-1 overflow-x-clip bg-[#F8F8F9] px-3 pb-10 pt-4 sm:px-5 sm:pb-12 sm:pt-6 lg:px-7 lg:pt-7 2xl:px-9">
          <div className="mx-auto w-full min-w-0 max-w-[1560px]">
            <header className="relative mb-6 overflow-hidden rounded-[22px] bg-[#171717] px-5 py-6 text-white shadow-[0_12px_35px_-24px_rgba(0,0,0,.65)] sm:rounded-[24px] sm:px-7 sm:py-7 lg:px-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 -top-28 h-[250px] w-[250px] rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-20 h-[210px] w-[210px] rounded-full border border-white/[0.055]"
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/75" />
                    Account settings
                  </div>
                  <h1 className="text-[25px] font-bold leading-tight tracking-[-0.045em] text-white sm:text-[30px]">
                    My Profile
                  </h1>
                  <p className="mt-2 max-w-[470px] text-[12px] leading-[19px] text-white/65 sm:text-[13px]">
                    Keep your information, security and account preferences up
                    to date.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-[7px] text-[11px] font-semibold text-white/90">
                    <span
                      className={`h-2 w-2 rounded-full ${user?.is_active ? "bg-[#5BD39C]" : "bg-[#F7B267]"}`}
                    />
                    {user?.distributor_status ||
                      (user?.is_active ? "Active account" : "Inactive account")}
                  </span>
                  {user?.distributor_id && (
                    <span className="max-w-full truncate rounded-full border border-white/15 bg-white/[0.08] px-3 py-[7px] text-[11px] font-medium text-white/80">
                      ID: {user.distributor_id}
                    </span>
                  )}
                </div>
              </div>
            </header>
            <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[240px_minmax(0,1fr)_290px] 2xl:grid-cols-[270px_minmax(0,1fr)_320px] xl:gap-5">
              <aside
                className={`${stickyColumnClass} sm:grid-cols-2 xl:grid-cols-1 xl:gap-5`}
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
              <div className="min-w-0">
                <ProfileForm
                  user={user}
                  loading={isUpdating}
                  onSave={(profileData) => handleUpdateProfile(profileData)}
                />
                <PhoneChangeRequestCard
                  user={user}
                  onClick={openPhoneModal}
                  nextAllowedAt={nextAllowedAt}
                  canResubmit={canResubmitCorrection}
                />
                <AddressSection />
                <div className="mt-5">
                  <DistributorPVCSection user={user} />
                </div>
              </div>
              <aside
                className={`${stickyColumnClass} sm:grid-cols-2 xl:grid-cols-1 xl:gap-5`}
                aria-label="Bank details and security"
              >
                <BankWalletDetails user={user} />
                <SecuritySection />
              </aside>
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
