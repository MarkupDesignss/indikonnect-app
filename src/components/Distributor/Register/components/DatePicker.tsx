// components/distributor/registration/components/common/DatePicker.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";

interface DatePickerProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  label: string;
  required?: boolean;
}

// Calendar Popover Component - Defined outside
const CalendarPopover: React.FC<{
  currentMonth: Date;
  months: string[];
  days: (Date | null)[];
  selectedDate: Date | null;
  yearInput: string;
  onMonthChange: (increment: number) => void;
  onYearChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYearBlur: () => void;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  formatDisplayDate: (dateStr: string) => string;
}> = ({
  currentMonth,
  months,
  days,
  selectedDate,
  yearInput,
  onMonthChange,
  onYearChange,
  onYearBlur,
  onDateSelect,
  onClose,
  formatDisplayDate,
}) => {
  // Get current date for max date (today)
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-[320px] z-50">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => onMonthChange(-1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">
            {months[currentMonth.getMonth()]}
          </span>
          <input
            type="text"
            value={yearInput || currentMonth.getFullYear()}
            onChange={onYearChange}
            onBlur={onYearBlur}
            className="w-16 text-center font-semibold text-gray-800 border-b-2 border-transparent focus:border-[#F9C744] outline-none px-1 py-0.5"
            placeholder="Year"
            maxLength={4}
          />
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-9" />;
          }

          const isSelected =
            selectedDate && day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === new Date().toDateString();
          const isDisabled = day > maxDate;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={`
                                h-9 rounded-lg text-sm font-medium transition-all duration-200
                                ${isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-[#F9C744]/20"}
                                ${isSelected ? "bg-[#F9C744] text-black hover:bg-[#e5b33a]" : ""}
                                ${isToday && !isSelected ? "border-2 border-[#F9C744]" : ""}
                                ${!isDisabled && !isSelected ? "hover:bg-[#F9C744]/10" : ""}
                            `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {selectedDate
            ? `Selected: ${formatDisplayDate(selectedDate.toISOString().split("T")[0])}`
            : "Select a date"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#F9C744] hover:text-[#e5b33a] font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  error,
  helperText,
  label,
  required,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [yearInput, setYearInput] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const months = [
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startingDay = firstDay.getDay();

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split("T")[0];
    onChange({
      target: { name: "date_of_birth", value: formattedDate },
    } as any);
    setShowCalendar(false);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (year && year > 1900 && year < 2100) {
      const newDate = new Date(currentMonth);
      newDate.setFullYear(year);
      setCurrentMonth(newDate);
    }
    setYearInput(e.target.value);
  };

  const handleYearBlur = () => {
    if (yearInput) {
      const year = parseInt(yearInput);
      if (year >= 1900 && year <= 2100) {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
      }
    }
    setYearInput("");
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-1.5 relative" ref={pickerRef}>
      <label className="text-sm font-medium text-gray-700 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <input
          type="text"
          value={formatDisplayDate(value)}
          placeholder="Select date of birth"
          readOnly
          className={`w-full h-14 px-4 text-black rounded-xl border ${
            error ? "border-red-500" : "border-gray-200"
          } bg-white cursor-pointer focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-400 mt-1">{helperText}</p>
      )}

      {showCalendar && (
        <CalendarPopover
          currentMonth={currentMonth}
          months={months}
          days={days}
          selectedDate={selectedDate}
          yearInput={yearInput}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          onYearBlur={handleYearBlur}
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
          formatDisplayDate={formatDisplayDate}
        />
      )}
    </div>
  );
};
