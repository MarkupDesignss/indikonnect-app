"use client";

import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useGetHeaderQuery } from "@/lib/redux/api/headerApi";
import { CalendarDays, ChevronDown, Download, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

interface DashboardHeaderProps {
  distributorId?: string;
}

const NAVY = "#0E1B3D";

const CATALOGUE_API =
  "https://www.markupdesigns.net/indikonnect/api/catalogues";

// ---------- Date helpers (pure, no mutation) ----------

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getISOWeek(date: Date) {
  // Work in local time to avoid server/client timezone mismatch
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ✅ Pure function — no mutation of input
function getWeekRange(date: Date) {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(base.getFullYear(), base.getMonth(), diff);
  const sunday = new Date(
    monday.getFullYear(),
    monday.getMonth(),
    monday.getDate() + 6
  );
  return { monday, sunday };
}

function formatRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
  };
  return `${start.toLocaleDateString(
    "en-GB",
    opts
  )} – ${end.toLocaleDateString("en-GB", opts)}`;
}

function formatWeekLabel(date: Date) {
  const weekNumber = getISOWeek(date);
  const { monday, sunday } = getWeekRange(date);
  const rangeLabel = formatRange(monday, sunday);
  const yearLabel = date.getFullYear();
  return `Week ${weekNumber}, ${yearLabel} (${rangeLabel})`;
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
  const [viewDate, setViewDate] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const [mode, setMode] = useState<"days" | "months" | "years">("days");

  // ✅ Sync view when selectedDate changes externally
  useEffect(() => {
    setViewDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
  }, [selectedDate.getFullYear(), selectedDate.getMonth()]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

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

  const yearStart = Math.floor(year / 10) * 10;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div
      className="absolute right-0 top-[44px] z-50 w-[290px] rounded-[10px] border border-[#e9edf2] bg-white p-3 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#475066] hover:bg-[#f7f8fa]"
        >
          ‹
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode(mode === "months" ? "days" : "months")}
            className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-[#101828] hover:bg-[#f7f8fa]"
          >
            {monthNames[month]}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "years" ? "days" : "years")}
            className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-[#101828] hover:bg-[#f7f8fa]"
          >
            {year}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#475066] hover:bg-[#f7f8fa]"
        >
          ›
        </button>
      </div>

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
                  type="button"
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
                      ? "font-bold text-[#0E1B3D] hover:bg-[#f7f8fa]"
                      : "text-[#475066] hover:bg-[#f7f8fa]"
                  }`}
                  style={
                    isSelected && !disabled
                      ? { backgroundColor: NAVY }
                      : undefined
                  }
                  title={disabled ? "Before registration date" : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === "months" && (
        <div className="grid grid-cols-3 gap-1.5">
          {monthNames.map((m, i) => (
            <button
              type="button"
              key={m}
              onClick={() => {
                setViewDate(new Date(year, i, 1));
                setMode("days");
              }}
              className={`rounded-md py-2 text-[11.5px] font-medium transition-colors ${
                i === month ? "text-white" : "text-[#475066] hover:bg-[#f7f8fa]"
              }`}
              style={i === month ? { backgroundColor: NAVY } : undefined}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {mode === "years" && (
        <div className="grid grid-cols-3 gap-1.5">
          {years.map((y) => (
            <button
              type="button"
              key={y}
              onClick={() => {
                setViewDate(new Date(y, month, 1));
                setMode("months");
              }}
              className={`rounded-md py-2 text-[11.5px] font-medium transition-colors ${
                y === year ? "text-white" : "text-[#475066] hover:bg-[#f7f8fa]"
              }`}
              style={y === year ? { backgroundColor: NAVY } : undefined}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 border-t border-[#e9edf2] pt-2">
        {minDate && (
          <p className="mb-1 text-center text-[10px] text-[#98a2b3]">
            Dates before {toYMD(minDate)} are disabled
          </p>
        )}
        <button
          type="button"
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

  // ✅ Compute registrationDate as a stable number (timestamp), not a Date object
  //    This prevents useEffect dependency loops.
  const registrationTs = useMemo<number | null>(() => {
    const raw =
      profileData?.user?.registration_completed_at ??
      profileData?.user?.created_at;
    if (!raw) return null;
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : null;
  }, [
    profileData?.user?.registration_completed_at,
    profileData?.user?.created_at,
  ]);

  // ✅ Only render real dates after mount
  const [mounted, setMounted] = useState(false);
  const [selectedTs, setSelectedTs] = useState<number | null>(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ One-shot init once mounted + registration known
  useEffect(() => {
    if (!mounted) return;
    if (selectedTs !== null) return; // already set, never override
    const today = Date.now();
    if (registrationTs && today < registrationTs) {
      setSelectedTs(registrationTs);
    } else {
      setSelectedTs(today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, registrationTs]);

  // ✅ Clamp if registration date changes later (only lower bound)
  useEffect(() => {
    if (!mounted) return;
    if (selectedTs === null) return;
    if (!registrationTs) return;
    if (selectedTs < registrationTs) {
      setSelectedTs(registrationTs);
    }
  }, [mounted, registrationTs, selectedTs]);

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

  // ✅ Wrapper Date (only valid when selectedTs !== null)
  const selectedDate = useMemo<Date | null>(
    () => (selectedTs === null ? null : new Date(selectedTs)),
    [selectedTs]
  );
  const registrationDate = useMemo<Date | null>(
    () => (registrationTs === null ? null : new Date(registrationTs)),
    [registrationTs]
  );

  const handleDownload = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const catalogueResponse = await fetch(CATALOGUE_API, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!catalogueResponse.ok) {
        throw new Error(`API failed: ${catalogueResponse.status}`);
      }
      const catalogueResult = await catalogueResponse.json();
      const catalogue = catalogueResult?.data?.data?.[0];
      if (!catalogue?.file_url) throw new Error("Catalogue not found");

      const fileUrl = catalogue.file_url;
      const fileName =
        catalogue.file_name || "KONNECTO-Product-Catalogue.pdf";

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Download failed";
      console.error("Download error:", error);
      window.alert(`Catalogue download failed.\n\n${errorMessage}`);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedTs(d.getTime());
  }, []);

  // ✅ Label — stable across SSR/CSR
  const label = useMemo(() => {
    if (!mounted || !selectedDate) return "Loading…";
    return formatWeekLabel(selectedDate);
  }, [mounted, selectedDate]);

  return (
    <>
      <header
        suppressHydrationWarning
        style={{ fontFamily: "'Lato', sans-serif" }}
        className="h-[72px] border-b border-[#e9edf2] bg-white"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        `}</style>

        <div
          suppressHydrationWarning
          className="relative flex h-full items-center justify-between px-6"
        >
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

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
            aria-label="Go to home"
          >
            {isLoading ? (
              <div className="mt-4 h-[52px] w-[140px] animate-pulse rounded bg-[#e9e9e9]" />
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
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setShowCalendar((v) => !v)}
                className="flex h-[36px] items-center gap-2.5 rounded-[8px] border border-[#e5e9ef] bg-white px-4 text-[11px] text-[#101828] transition-all hover:border-[#0E1B3D]/40 hover:bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/15"
              >
                <CalendarDays size={14} style={{ color: NAVY }} />
                <span className="font-semibold">{label}</span>
                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  className={`text-[#98a2b3] transition-transform ${
                    showCalendar ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showCalendar && selectedDate && (
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelect={handleSelectDate}
                  onClose={() => setShowCalendar(false)}
                  minDate={registrationDate}
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              aria-busy={isDownloading}
              className={`flex h-[36px] items-center gap-2.5 rounded-[8px] px-5 text-[11px] font-semibold text-white transition-all ${
                isDownloading
                  ? "cursor-not-allowed opacity-70"
                  : "active:scale-[0.98] hover:brightness-110"
              }`}
              style={{
                backgroundColor: NAVY,
                boxShadow: `0 8px 20px -8px ${NAVY}66`,
              }}
            >
              <Download
                size={13}
                strokeWidth={2}
                className={isDownloading ? "animate-pulse" : ""}
              />
              <span>
                {isDownloading ? "Downloading..." : "Download Catalogue"}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}