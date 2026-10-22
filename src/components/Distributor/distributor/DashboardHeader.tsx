"use client";

import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useGetHeaderQuery } from "@/lib/redux/api/headerApi";

import {
    CalendarDays,
    ChevronDown,
    Download,
    UserRound,
    Menu,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
} from "react";

// =====================================================
// TYPES
// =====================================================

interface DashboardHeaderProps {
    distributorId?: string;
}

// Keep in sync with Sidebar.tsx
const MOBILE_SIDEBAR_EVENT = "open-distributor-sidebar";

const NAVY = "#0E1B3D";



const CATALOGUE_API =
    "https://www.markupdesigns.net/indikonnect/api/catalogues";

// =====================================================
// DATE HELPERS
// =====================================================

function startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function toYMD(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getISOWeek(date: Date) {
    const d = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const dayNumber = d.getDay() || 7;

    d.setDate(d.getDate() + 4 - dayNumber);

    const yearStart = new Date(d.getFullYear(), 0, 1);

    return Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
}

function getWeekRange(date: Date) {
    const base = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const day = base.getDay();

    const diff =
        base.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(
        base.getFullYear(),
        base.getMonth(),
        diff
    );

    const sunday = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6
    );

    return {
        monday,
        sunday,
    };
}

function formatRange(start: Date, end: Date) {
    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
    };

    return `${start.toLocaleDateString(
        "en-GB",
        options
    )} – ${end.toLocaleDateString("en-GB", options)}`;
}

function formatWeekLabel(date: Date) {
    const weekNumber = getISOWeek(date);
    const { monday, sunday } = getWeekRange(date);
    const rangeLabel = formatRange(monday, sunday);
    const yearLabel = date.getFullYear();

    return `Week ${weekNumber}, ${yearLabel} (${rangeLabel})`;
}

// =====================================================
// CALENDAR PICKER
// =====================================================

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
        () =>
            new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1
            )
    );

    const [mode, setMode] = useState<"days" | "months" | "years">(
        "days"
    );

    useEffect(() => {
        setViewDate(
            new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1
            )
        );
    }, [selectedDate]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startOffset =
        firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days: (number | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
        days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const today = startOfDay(new Date());
    const min = minDate ? startOfDay(minDate) : null;

    const isSameDay = (date1: Date, date2: Date) =>
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();

    const isBeforeMin = (date: Date) => {
        if (!min) return false;

        return startOfDay(date).getTime() < min.getTime();
    };

    const handlePrev = () => {
        if (mode === "days") {
            setViewDate(new Date(year, month - 1, 1));
        } else if (mode === "months") {
            setViewDate(new Date(year - 1, month, 1));
        } else {
            setViewDate(new Date(year - 10, month, 1));
        }
    };

    const handleNext = () => {
        if (mode === "days") {
            setViewDate(new Date(year, month + 1, 1));
        } else if (mode === "months") {
            setViewDate(new Date(year + 1, month, 1));
        } else {
            setViewDate(new Date(year + 10, month, 1));
        }
    };

    const yearStart = Math.floor(year / 10) * 10;

    const years = Array.from(
        { length: 12 },
        (_, index) => yearStart + index
    );

    const selectDate = (date: Date) => {
        if (isBeforeMin(date)) return;

        onSelect(date);
        onClose();
    };

    return (
        <div
            role="dialog"
            aria-label="Select week date"
            className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[min(290px,calc(100vw-24px))] rounded-xl border border-[#E9EDF2] bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
        >
            {/* Calendar navigation */}
            <div className="mb-3 flex items-center justify-between gap-1">
                <button
                    type="button"
                    aria-label="Previous"
                    onClick={handlePrev}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-[#475066] transition-colors hover:bg-[#F7F8FA]"
                >
                    ‹
                </button>

                <div className="flex min-w-0 items-center justify-center gap-1">
                    <button
                        type="button"
                        onClick={() =>
                            setMode(mode === "months" ? "days" : "months")
                        }
                        className="rounded-lg px-2 py-2 text-sm font-semibold text-[#101828] transition-colors hover:bg-[#F7F8FA]"
                    >
                        {monthNames[month]}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setMode(mode === "years" ? "days" : "years")
                        }
                        className="rounded-lg px-2 py-2 text-sm font-semibold text-[#101828] transition-colors hover:bg-[#F7F8FA]"
                    >
                        {year}
                    </button>
                </div>

                <button
                    type="button"
                    aria-label="Next"
                    onClick={handleNext}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-[#475066] transition-colors hover:bg-[#F7F8FA]"
                >
                    ›
                </button>
            </div>

            {/* Days */}
            {mode === "days" && (
                <>
                    <div className="mb-1 grid grid-cols-7 gap-1">
                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
                            (day) => (
                                <div
                                    key={day}
                                    className="flex h-8 items-center justify-center text-[11px] font-semibold text-[#98A2B3]"
                                >
                                    {day}
                                </div>
                            )
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            if (day === null) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="h-9"
                                    />
                                );
                            }

                            const thisDate = new Date(year, month, day);

                            const isSelected = isSameDay(
                                thisDate,
                                selectedDate
                            );

                            const isToday = isSameDay(
                                thisDate,
                                today
                            );

                            const disabled = isBeforeMin(thisDate);

                            return (
                                <button
                                    type="button"
                                    key={`${year}-${month}-${day}`}
                                    disabled={disabled}
                                    onClick={() => selectDate(thisDate)}
                                    className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                        disabled
                                            ? "cursor-not-allowed text-[#D0D5DD] line-through"
                                            : isSelected
                                            ? "text-white"
                                            : isToday
                                            ? "font-bold text-[#0E1B3D] hover:bg-[#F2F4F7]"
                                            : "text-[#475066] hover:bg-[#F2F4F7]"
                                    }`}
                                    style={
                                        isSelected && !disabled
                                            ? { backgroundColor: NAVY }
                                            : undefined
                                    }
                                    title={
                                        disabled
                                            ? "Before registration date"
                                            : undefined
                                    }
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Months */}
            {mode === "months" && (
                <div className="grid grid-cols-3 gap-2">
                    {monthNames.map((monthName, index) => (
                        <button
                            type="button"
                            key={monthName}
                            onClick={() => {
                                setViewDate(new Date(year, index, 1));
                                setMode("days");
                            }}
                            className={`rounded-lg py-3 text-xs font-medium transition-colors ${
                                index === month
                                    ? "text-white"
                                    : "text-[#475066] hover:bg-[#F7F8FA]"
                            }`}
                            style={
                                index === month
                                    ? { backgroundColor: NAVY }
                                    : undefined
                            }
                        >
                            {monthName}
                        </button>
                    ))}
                </div>
            )}

            {/* Years */}
            {mode === "years" && (
                <div className="grid grid-cols-3 gap-2">
                    {years.map((yearValue) => (
                        <button
                            type="button"
                            key={yearValue}
                            onClick={() => {
                                setViewDate(
                                    new Date(yearValue, month, 1)
                                );
                                setMode("months");
                            }}
                            className={`rounded-lg py-3 text-xs font-medium transition-colors ${
                                yearValue === year
                                    ? "text-white"
                                    : "text-[#475066] hover:bg-[#F7F8FA]"
                            }`}
                            style={
                                yearValue === year
                                    ? { backgroundColor: NAVY }
                                    : undefined
                            }
                        >
                            {yearValue}
                        </button>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="mt-3 border-t border-[#E9EDF2] pt-3">
                {minDate && (
                    <p className="mb-2 break-words text-center text-[10px] text-[#98A2B3]">
                        Dates before {toYMD(minDate)} are disabled
                    </p>
                )}

                <button
                    type="button"
                    onClick={() => selectDate(new Date())}
                    className="w-full rounded-lg py-2.5 text-xs font-semibold text-[#0E1B3D] transition-colors hover:bg-[#F7F8FA]"
                >
                    Today
                </button>
            </div>
        </div>
    );
}

// =====================================================
// DASHBOARD HEADER
// =====================================================

export default function DashboardHeader({
    distributorId = "AIA603525",
}: DashboardHeaderProps) {
    const { data: headerData, isLoading } = useGetHeaderQuery();

    const { data: profileData } =
        useGetUserProfileQuery(undefined);

    const logoUrl = headerData?.data?.logo?.logo ?? "";

    const logoAlt = "IndieKonnect";

    // Registration date timestamp
    const registrationTs = useMemo<number | null>(() => {
        const raw =
            profileData?.user?.registration_completed_at ??
            profileData?.user?.created_at;

        if (!raw) return null;

        const timestamp = new Date(raw).getTime();

        return Number.isFinite(timestamp) ? timestamp : null;
    }, [
        profileData?.user?.registration_completed_at,
        profileData?.user?.created_at,
    ]);

    const [mounted, setMounted] = useState(false);
    const [selectedTs, setSelectedTs] = useState<number | null>(null);

    const [showCalendar, setShowCalendar] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize selected date
    useEffect(() => {
        if (!mounted || selectedTs !== null) return;

        const today = Date.now();

        if (registrationTs && today < registrationTs) {
            setSelectedTs(registrationTs);
        } else {
            setSelectedTs(today);
        }
    }, [mounted, registrationTs, selectedTs]);

    // Prevent selecting dates before registration
    useEffect(() => {
        if (!mounted || selectedTs === null || !registrationTs) {
            return;
        }

        if (selectedTs < registrationTs) {
            setSelectedTs(registrationTs);
        }
    }, [mounted, registrationTs, selectedTs]);

    // Close calendar on outside click / Escape
    useEffect(() => {
        if (!showCalendar) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                setShowCalendar(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowCalendar(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [showCalendar]);

    // Selected date
    const selectedDate = useMemo<Date | null>(
        () =>
            selectedTs === null
                ? null
                : new Date(selectedTs),
        [selectedTs]
    );

    const registrationDate = useMemo<Date | null>(
        () =>
            registrationTs === null
                ? null
                : new Date(registrationTs),
        [registrationTs]
    );

    // -------------------------------------------------
    // OPEN MOBILE SIDEBAR
    // -------------------------------------------------

    const handleOpenSidebar = () => {
        window.dispatchEvent(
            new Event(MOBILE_SIDEBAR_EVENT)
        );
    };

    // -------------------------------------------------
    // DOWNLOAD CATALOGUE
    // -------------------------------------------------

    const handleDownload = async () => {
        if (isDownloading) return;

        try {
            setIsDownloading(true);

            const catalogueResponse = await fetch(CATALOGUE_API, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            if (!catalogueResponse.ok) {
                throw new Error(
                    `API failed: ${catalogueResponse.status}`
                );
            }

            const catalogueResult = await catalogueResponse.json();

            const catalogue = catalogueResult?.data?.data?.[0];

            if (!catalogue?.file_url) {
                throw new Error("Catalogue not found");
            }

            const fileUrl = catalogue.file_url;

            const fileName =
                catalogue.file_name ||
                "KONNECTO-Product-Catalogue.pdf";

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
                error instanceof Error
                    ? error.message
                    : "Download failed";

            console.error("Download error:", error);

            window.alert(
                `Catalogue download failed.\n\n${errorMessage}`
            );
        } finally {
            setTimeout(() => {
                setIsDownloading(false);
            }, 800);
        }
    };

    // -------------------------------------------------
    // SELECT DATE
    // -------------------------------------------------

    const handleSelectDate = useCallback((date: Date) => {
        setSelectedTs(date.getTime());
    }, []);

    // -------------------------------------------------
    // WEEK LABEL
    // -------------------------------------------------

    const label = useMemo(() => {
        if (!mounted || !selectedDate) {
            return "Loading...";
        }

        return formatWeekLabel(selectedDate);
    }, [mounted, selectedDate]);

    // -------------------------------------------------
    // LOGO
    // -------------------------------------------------

    const renderLogo = (mobile = false) => {
        if (isLoading) {
            return (
                <div
                    className={`animate-pulse rounded-lg bg-[#E9EDF2] ${
                        mobile
                            ? "h-9 w-[65px]"
                            : "h-11 w-[120px]"
                    }`}
                />
            );
        }

        if (!logoUrl) return null;

        return (
            <Image
                src={logoUrl}
                alt={logoAlt}
                width={120}
                height={44}
                priority
                unoptimized
                sizes={mobile ? "65px" : "120px"}
                className={
                    mobile
                        ? "h-9 w-[65px] object-contain"
                        : "h-11 w-[120px] object-contain"
                }
            />
        );
    };

    // =================================================
    // UI
    // =================================================

    return (
        <>
            <header
                style={{
                    fontFamily: "'Lato', sans-serif",
                }}
                className="relative z-30 w-full min-w-0 border-b border-[#E9EDF2] bg-white"
            >
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
                `}</style>

                <div
                    className="
                        flex w-full min-w-0 flex-col gap-3
                        px-3 py-3
                        sm:px-4
                        lg:grid lg:min-h-[72px]
                        lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
                        lg:items-center lg:gap-4
                        lg:px-6 lg:py-0
                    "
                >
                    {/* ================================= */}
                    {/* TOP ROW: MOBILE MENU + ID + LOGO */}
                    {/* ================================= */}

                    <div className="flex min-w-0 items-center gap-2 lg:justify-self-start">
                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            onClick={handleOpenSidebar}
                            aria-label="Open navigation menu"
                            aria-controls="distributor-sidebar"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E9EF] bg-white text-[#0E1B3D] transition-colors hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/20 lg:hidden"
                        >
                            <Menu size={20} strokeWidth={2} />
                        </button>

                        {/* Distributor ID */}
                        <div
                            title={`Distributor ID: ${distributorId}`}
                            className="flex h-10 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg border border-[#E5E9EF] bg-[#F7F8FA] px-2.5 sm:px-3 lg:w-fit lg:flex-none lg:gap-2.5 lg:px-4"
                        >
                            <UserRound
                                size={15}
                                strokeWidth={1.7}
                                className="shrink-0"
                                style={{ color: NAVY }}
                            />

                            <span className="shrink-0 text-[11px] font-semibold text-[#667085] sm:text-xs">
                                <span className="sm:hidden">ID:</span>
                                <span className="hidden sm:inline">
                                    Distributor ID:
                                </span>
                            </span>

                            <span className="min-w-0 truncate text-[11px] font-bold text-[#101828] sm:text-xs">
                                {distributorId}
                            </span>
                        </div>

                        {/* Compact logo for smaller screens */}
                        <Link
                            href="/"
                            aria-label="Go to home"
                            className="ml-auto flex shrink-0 items-center justify-center min-[420px]:flex lg:hidden"
                        >
                            {renderLogo(true)}
                        </Link>
                    </div>

                    {/* ================================= */}
                    {/* DESKTOP CENTER LOGO */}
                    {/* ================================= */}

                    <Link
                        href="/"
                        aria-label="Go to home"
                        className="hidden items-center justify-center lg:flex"
                    >
                        {renderLogo(false)}
                    </Link>

                    {/* ================================= */}
                    {/* DATE + DOWNLOAD CONTROLS */}
                    {/* ================================= */}

                    <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto lg:justify-self-end">
                        {/* Calendar */}
                        <div
                            className="relative min-w-0 flex-1 lg:flex-none"
                            ref={pickerRef}
                        >
                            <button
                                type="button"
                                aria-label={`Selected week: ${label}. Select another date`}
                                aria-expanded={showCalendar}
                                onClick={() =>
                                    setShowCalendar((previous) => !previous)
                                }
                                className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-[#E5E9EF] bg-white px-2.5 text-left text-[#101828] transition-colors hover:border-[#0E1B3D]/40 hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/15 sm:px-3 lg:w-auto lg:min-w-[210px] lg:gap-2.5 lg:px-4"
                            >
                                <CalendarDays
                                    size={15}
                                    className="shrink-0"
                                    style={{ color: NAVY }}
                                />

                                <span
                                    title={label}
                                    className="min-w-0 flex-1 truncate text-[11px] font-semibold sm:text-xs lg:flex-none"
                                >
                                    {label}
                                </span>

                                <ChevronDown
                                    size={14}
                                    strokeWidth={2}
                                    className={`shrink-0 text-[#98A2B3] transition-transform ${
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

                        {/* Download catalogue */}
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            aria-busy={isDownloading}
                            aria-label={
                                isDownloading
                                    ? "Downloading catalogue"
                                    : "Download catalogue"
                            }
                            title="Download Catalogue"
                            className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-[11px] font-semibold text-white transition-all sm:px-3.5 lg:px-5 lg:text-xs ${
                                isDownloading
                                    ? "cursor-not-allowed opacity-70"
                                    : "active:scale-[0.98] hover:brightness-110"
                            }`}
                            style={{
                                backgroundColor: NAVY,
                                boxShadow: `0 6px 18px -8px ${NAVY}66`,
                            }}
                        >
                            <Download
                                size={15}
                                strokeWidth={2}
                                className={
                                    isDownloading
                                        ? "animate-pulse"
                                        : ""
                                }
                            />

                            <span className="hidden min-[420px]:inline lg:hidden">
                                {isDownloading ? "Downloading..." : "Catalogue"}
                            </span>

                            <span className="hidden lg:inline">
                                {isDownloading
                                    ? "Downloading..."
                                    : "Download Catalogue"}
                            </span>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}