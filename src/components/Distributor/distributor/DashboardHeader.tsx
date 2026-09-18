"use client";

import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useGetHeaderQuery } from "@/lib/redux/api/headerApi";
import { CalendarDays, ChevronDown, Download, UserRound, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface DashboardHeaderProps {
  distributorId?: string;
}

const NAVY = "#0E1B3D";

// ---- Helper: get ISO week number ----
function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ---- Helper: get Monday & Sunday for a given week ----
function getWeekRange(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

// ---- Helper: format as "15 Aug – 21 Aug" ----
function formatRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

// ---- Helper: format a Date as YYYY-MM-DD ----
function toYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---- Helper: strip time ----
function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============================================
// COMING SOON MODAL
// ============================================

function ComingSoonModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0E1B3D]/40 backdrop-blur-[2px] animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[340px] rounded-[16px] border border-[#e9edf2] bg-white p-6 shadow-[0_20px_60px_-20px_rgba(14,27,61,0.35)] animate-[popIn_0.18s_cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[#98a2b3] transition-colors hover:bg-[#f7f8fa] hover:text-[#475066]"
        >
          <X size={15} />
        </button>

        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${NAVY} 0%, #1f9d6b 100%)`,
              boxShadow: `0 10px 24px -10px ${NAVY}88`,
            }}
          >
            <Sparkles size={26} className="text-white" strokeWidth={1.8} />
          </div>
        </div>

        {/* Text */}
        <h3 className="mt-4 text-center text-[16px] font-bold text-[#101828]">
          Coming Soon
        </h3>
        <p className="mt-1.5 text-center text-[12.5px] leading-relaxed text-[#667085]">
          The report download feature is currently being crafted. We&apos;ll notify
          you the moment it&apos;s ready.
        </p>

        {/* CTA */}
        <button
          onClick={onClose}
          className="mt-5 flex h-[40px] w-full items-center justify-center rounded-[10px] text-[12.5px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            backgroundColor: NAVY,
            boxShadow: `0 8px 20px -8px ${NAVY}66`,
          }}
        >
          Got it
        </button>
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================
// CALENDAR PICKER
// ============================================

function CalendarPicker({
  selectedDate,
  onSelect,
  onClose,
  minDate,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  minDate?: Date | null;
}) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [mode, setMode] = useState<"days" | "months" | "years">("days");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday-first

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const today = startOfDay(new Date());
  const min = minDate ? startOfDay(minDate) : null;

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isBeforeMin = (d: Date) => {
    if (!min) return false;
    return startOfDay(d).getTime() < min.getTime();
  };

  const handlePrev = () => {
    if (mode === "days") setViewDate(new Date(year, month - 1, 1));
    else if (mode === "months") setViewDate(new Date(year - 1, month, 1));
    else setViewDate(new Date(year - 10, month, 1));
  };

  const handleNext = () => {
    if (mode === "days") setViewDate(new Date(year, month + 1, 1));
    else if (mode === "months") setViewDate(new Date(year + 1, month, 1));
    else setViewDate(new Date(year + 10, month, 1));
  };

  // Year range for year mode
  const yearStart = Math.floor(year / 10) * 10;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div
      className="absolute right-0 top-[44px] z-50 w-[290px] rounded-[10px] border border-[#e9edf2] bg-white p-3 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#475066] hover:bg-[#f7f8fa]"
        >
          ‹
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode(mode === "months" ? "days" : "months")}
            className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-[#101828] hover:bg-[#f7f8fa]"
          >
            {monthNames[month]}
          </button>
          <button
            onClick={() => setMode(mode === "years" ? "days" : "years")}
            className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-[#101828] hover:bg-[#f7f8fa]"
          >
            {year}
          </button>
        </div>

        <button
          onClick={handleNext}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#475066] hover:bg-[#f7f8fa]"
        >
          ›
        </button>
      </div>

      {/* Days view */}
      {mode === "days" && (
        <>
          <div className="mb-1 grid grid-cols-7 gap-1">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-[#98a2b3]"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              const thisDate = new Date(year, month, day);
              const isSelected = isSameDay(thisDate, selectedDate);
              const isToday = isSameDay(thisDate, today);
              const disabled = isBeforeMin(thisDate);

              return (
                <button
                  key={idx}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    onSelect(thisDate);
                    onClose();
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[11.5px] font-medium transition-colors ${
                    disabled
                      ? "cursor-not-allowed text-[#d0d5dd] line-through"
                      : isSelected
                      ? "text-white"
                      : isToday
                      ? "text-[#0E1B3D] font-bold hover:bg-[#f7f8fa]"
                      : "text-[#475066] hover:bg-[#f7f8fa]"
                  }`}
                  style={isSelected && !disabled ? { backgroundColor: NAVY } : undefined}
                  title={disabled ? "Before registration date" : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Months view */}
      {mode === "months" && (
        <div className="grid grid-cols-3 gap-1.5">
          {monthNames.map((m, i) => (
            <button
              key={m}
              onClick={() => {
                setViewDate(new Date(year, i, 1));
                setMode("days");
              }}
              className={`rounded-md py-2 text-[11.5px] font-medium transition-colors ${
                i === month
                  ? "text-white"
                  : "text-[#475066] hover:bg-[#f7f8fa]"
              }`}
              style={i === month ? { backgroundColor: NAVY } : undefined}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Years view */}
      {mode === "years" && (
        <div className="grid grid-cols-3 gap-1.5">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => {
                setViewDate(new Date(y, month, 1));
                setMode("months");
              }}
              className={`rounded-md py-2 text-[11.5px] font-medium transition-colors ${
                y === year
                  ? "text-white"
                  : "text-[#475066] hover:bg-[#f7f8fa]"
              }`}
              style={y === year ? { backgroundColor: NAVY } : undefined}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Footer — min date hint + Today shortcut */}
      <div className="mt-2 border-t border-[#e9edf2] pt-2">
        {minDate && (
          <p className="mb-1 text-center text-[10px] text-[#98a2b3]">
            Dates before {toYMD(minDate)} are disabled
          </p>
        )}
        <button
          onClick={() => {
            onSelect(new Date());
            onClose();
          }}
          className="w-full rounded-md py-1.5 text-[11.5px] font-semibold text-[#0E1B3D] hover:bg-[#f7f8fa]"
        >
          Today
        </button>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD HEADER
// ============================================

export default function DashboardHeader({
  distributorId = "AIA603525",
}: DashboardHeaderProps) {
  const { data: headerData, isLoading } = useGetHeaderQuery();
  const { data: profileData } = useGetUserProfileQuery(undefined);

  const logoUrl = headerData?.data?.logo?.logo ?? "";
  const logoAlt = "Indie Konnect";

  // ---- Registration date (min allowed) ----
  const registrationDate: Date | null = profileData?.user?.registration_completed_at
    ? new Date(profileData.user.registration_completed_at)
    : profileData?.user?.created_at
    ? new Date(profileData.user.created_at)
    : null;

  // ---- Date / week state ----
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // If registration exists and today is before it, start from registration
    const today = new Date();
    if (registrationDate && today < registrationDate) return registrationDate;
    return today;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // If registration date loads later and selectedDate < registrationDate, clamp it
  useEffect(() => {
    if (registrationDate && startOfDay(selectedDate) < startOfDay(registrationDate)) {
      setSelectedDate(registrationDate);
    }
  }, [registrationDate]);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  // Compute week range label
  const weekNumber = getISOWeek(selectedDate);
  const { monday, sunday } = getWeekRange(selectedDate);
  const rangeLabel = formatRange(monday, sunday);
  const yearLabel = selectedDate.getFullYear();
  const weekLabel = `Week ${weekNumber}, ${yearLabel} (${rangeLabel})`;

  // ---- Download handler (Coming Soon) ----
  const handleDownload = () => {
    setShowComingSoon(true);
  };

  return (
    <>
      <header
        style={{ fontFamily: "'Lato', sans-serif" }}
        className="h-[72px] border-b border-[#e9edf2] bg-white"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
          /* In production, prefer next/font/google over a runtime @import for this. */
        `}</style>

        <div className="relative flex h-full items-center justify-between px-6">
          {/* Distributor */}
          <div className="flex items-center gap-3">
            <div className="flex h-[36px] items-center gap-2.5 rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-4 transition-colors hover:border-[#0E1B3D]/40">
              <UserRound size={15} strokeWidth={1.7} style={{ color: NAVY }} />

              <span className="text-[11px] font-semibold text-[#667085]">
                Distributor ID:
              </span>

              <span className="text-[11px] font-bold text-[#101828]">
                {distributorId}
              </span>
            </div>
          </div>

          {/* Logo — now properly wrapped in Link */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            aria-label="Go to home"
          >
            {isLoading ? (
              <div className="h-[52px] w-[140px] mt-4 animate-pulse rounded bg-[#e9e9e9]" />
            ) : logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={120}
                height={44}
                className="h-[48px] w-auto object-contain"
                priority
                unoptimized
              />
            ) : null}
          </Link>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-3">
            {/* Calendar picker wrapper */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowCalendar((v) => !v)}
                className="flex h-[36px] items-center gap-2.5 rounded-[8px] border border-[#e5e9ef] bg-white px-4 text-[11px] text-[#101828] transition-all hover:border-[#0E1B3D]/40 hover:bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/15"
              >
                <CalendarDays size={14} style={{ color: NAVY }} />

                <span className="font-semibold">{weekLabel}</span>

                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  className={`text-[#98a2b3] transition-transform ${
                    showCalendar ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showCalendar && (
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelect={(d) => setSelectedDate(d)}
                  onClose={() => setShowCalendar(false)}
                  minDate={registrationDate}
                />
              )}
            </div>

            <button
              onClick={handleDownload}
              className="flex h-[36px] items-center gap-2.5 rounded-[8px] px-5 text-[11px] font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                backgroundColor: NAVY,
                boxShadow: `0 8px 20px -8px ${NAVY}66`,
              }}
            >
              <Download size={13} strokeWidth={2} />
              <span>Download report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        open={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />
    </>
  );
}