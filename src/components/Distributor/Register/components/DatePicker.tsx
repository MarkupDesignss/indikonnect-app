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

// Calendar Popover Component
const CalendarPopover: React.FC<{
  currentMonth: Date;
  months: string[];
  days: (Date | null)[];
  selectedDate: Date | null;
  onMonthChange: (increment: number) => void;
  onMonthSelect: (monthIndex: number) => void;
  onYearSelect: (year: number) => void;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  formatDisplayDate: (dateStr: string) => string;
  showMonthPicker: boolean;
  setShowMonthPicker: (show: boolean) => void;
  showYearPicker: boolean;
  setShowYearPicker: (show: boolean) => void;
}> = ({
  currentMonth,
  months,
  days,
  selectedDate,
  onMonthChange,
  onMonthSelect,
  onYearSelect,
  onDateSelect,
  onClose,
  formatDisplayDate,
  showMonthPicker,
  setShowMonthPicker,
  showYearPicker,
  setShowYearPicker,
}) => {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );
  
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const yearPickerRef = useRef<HTMLDivElement>(null);
  const currentYear = currentMonth.getFullYear();
  
  // Generate years (1900 to current year - 18)
  const years = [];
  const maxYear = new Date().getFullYear() - 18;
  for (let year = maxYear; year >= 1900; year--) {
    years.push(year);
  }

  // Close pickers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target as Node)
      ) {
        setShowMonthPicker(false);
      }
      if (
        yearPickerRef.current &&
        !yearPickerRef.current.contains(event.target as Node)
      ) {
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowMonthPicker, setShowYearPicker]);

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-[320px] z-50">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => onMonthChange(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:scale-110 active:scale-95"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5 text-gray-700"
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
          {/* Month Picker Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
              className="font-semibold text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 min-w-[70px] justify-center"
            >
              {months[currentMonth.getMonth()]}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showMonthPicker ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Month Picker Dropdown */}
            {showMonthPicker && (
              <div
                ref={monthPickerRef}
                className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-3 gap-1 w-[180px] z-50"
              >
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      onMonthSelect(index);
                      setShowMonthPicker(false);
                    }}
                    className={`px-2 py-1.5 text-sm rounded-lg transition-all hover:bg-[#F9C744]/20 ${
                      currentMonth.getMonth() === index
                        ? "bg-[#F9C744] text-black font-medium"
                        : "text-gray-700 hover:scale-105"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Picker Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
              className="font-semibold text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 min-w-[70px] justify-center"
            >
              {currentYear}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showYearPicker ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Year Picker Dropdown */}
            {showYearPicker && (
              <div
                ref={yearPickerRef}
                className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 max-h-[200px] overflow-y-auto w-[100px]"
              >
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      onYearSelect(year);
                      setShowYearPicker(false);
                    }}
                    className={`w-full px-3 py-1.5 text-sm rounded-lg transition-all hover:bg-[#F9C744]/20 text-left ${
                      currentYear === year
                        ? "bg-[#F9C744] text-black font-medium"
                        : "text-gray-700 hover:scale-105"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMonthChange(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:scale-110 active:scale-95"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5 text-gray-700"
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

      {/* Days Grid */}
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
                ${isDisabled ? "text-gray-300 cursor-not-allowed opacity-50" : "text-gray-900 hover:bg-[#F9C744]/20 hover:scale-105 active:scale-95"}
                ${isSelected ? "bg-[#F9C744] text-black hover:bg-[#e5b33a] shadow-md" : ""}
                ${isToday && !isSelected ? "border-2 border-[#F9C744] text-gray-900" : ""}
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
        <span className="text-xs text-gray-600">
          {selectedDate
            ? `Selected: ${formatDisplayDate(selectedDate.toISOString().split("T")[0])}`
            : "Select a date"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#F9C744] hover:text-[#e5b33a] font-medium transition-colors hover:underline"
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
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
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
        onClick={() => {
          setShowCalendar(!showCalendar);
          setShowMonthPicker(false);
          setShowYearPicker(false);
        }}
      >
        <input
          type="text"
          value={formatDisplayDate(value)}
          placeholder="Select date of birth"
          readOnly
          className={`w-full h-14 px-4 text-black rounded-xl border ${
            error ? "border-red-500" : "border-gray-200"
          } bg-white cursor-pointer focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none hover:border-gray-300`}
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
          onMonthChange={handleMonthChange}
          onMonthSelect={handleMonthSelect}
          onYearSelect={handleYearSelect}
          onDateSelect={handleDateSelect}
          onClose={() => {
            setShowCalendar(false);
            setShowMonthPicker(false);
            setShowYearPicker(false);
          }}
          formatDisplayDate={formatDisplayDate}
          showMonthPicker={showMonthPicker}
          setShowMonthPicker={setShowMonthPicker}
          showYearPicker={showYearPicker}
          setShowYearPicker={setShowYearPicker}
        />
      )}
    </div>
  );
};