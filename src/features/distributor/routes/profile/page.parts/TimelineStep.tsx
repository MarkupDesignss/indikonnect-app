"use client";

import { CheckCircle2 } from "lucide-react";


export function TimelineStep({
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
