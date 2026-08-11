// components/distributor/registration/components/common/CalendarPopover.tsx

import React from "react";

interface CalendarPopoverProps {
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
}

export const CalendarPopover: React.FC<CalendarPopoverProps> = ({
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
}) => {
    const quickYears = [1990, 1995, 2000, 2005, 2010, 2015, 2020];

    return (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-[340px] left-0">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMonthChange(-1); }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800 text-lg">
                        {months[currentMonth.getMonth()]}
                    </span>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={yearInput || currentMonth.getFullYear()}
                            onChange={onYearChange}
                            onBlur={onYearBlur}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 h-9 text-center border border-gray-200 rounded-lg text-sm font-semibold focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 outline-none"
                            min="1900"
                            max="2100"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMonthChange(1); }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (date) onDateSelect(date); }}
                        disabled={!date}
                        className={`
              h-10 rounded-lg text-sm transition-colors
              ${!date ? "invisible" : "hover:bg-[#F9C744]/20"}
              ${date && selectedDate && date.toDateString() === selectedDate.toDateString()
                                ? "bg-[#F9C744] text-[#06101E] font-semibold hover:bg-[#E6B33D]"
                                : date && date.toDateString() === new Date().toDateString()
                                    ? "border-2 border-[#F9C744] text-[#06101E]"
                                    : "text-gray-700 hover:bg-gray-50"
                            }
              ${date && date > new Date() ? "text-gray-300 cursor-not-allowed" : ""}
            `}
                    >
                        {date ? date.getDate() : ""}
                    </button>
                ))}
            </div>

            {/* Quick Year Jump */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Jump to year:</span>
                    <div className="flex flex-wrap gap-1">
                        {quickYears.map((year) => (
                            <button
                                key={year}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newDate = new Date(currentMonth);
                                    newDate.setFullYear(year);
                                    onMonthChange(0);
                                    // Need to update month with new year
                                }}
                                className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-[#F9C744]/20 hover:border-[#F9C744] transition-colors"
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 py-1 border-t border-gray-100 pt-2"
            >
                Close
            </button>
        </div>
    );
};