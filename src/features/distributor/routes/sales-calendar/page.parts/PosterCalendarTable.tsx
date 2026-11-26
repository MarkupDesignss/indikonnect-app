"use client";

import { POSTER_RANK_BASIS_2026, SalesCalendarMonth, formatPosterApiDate } from "@/features/distributor/routes/sales-calendar/page.parts/support";

// --------------------------------------------------// Image-inspired 2026 sales calendar, dynamically populated from the API// --------------------------------------------------
export function PosterCalendarTable({
  months,

  year,

  selectedWeek,

  onSelectWeek,
}: {
  months: SalesCalendarMonth[];

  year: number;

  selectedWeek: number;

  onSelectWeek: (weekNo: number) => void;
}) {
  const header =
    "border border-[#e2e9f2] px-1 py-1.5 text-center text-[10px] font-bold uppercase leading-[1.35] sm:text-[11px]";

  const cell =
    "border border-[#e2e9f2] px-1 py-[5px] text-center text-[10px] leading-[1.4] sm:text-[11px]";

  return (
    <div className="min-w-0 overflow-x-auto rounded-[16px] border border-[#dce5f1] bg-white shadow-[0_8px_24px_rgba(20,50,100,.05)]">
      <table className="w-full min-w-[540px] table-fixed border-collapse bg-white">
        <thead>
          <tr className="bg-[#172c51] text-white">
            <th className={`${header} w-[9%] border-[#29549c]`}>
              Sales
              <br />
              month
            </th>

            <th className={`${header} border-[#29549c]`} colSpan={3}>
              Sales week
            </th>

            <th className={`${header} w-[20%] border-[#29549c]`}>
              Commission
              <br />
              payout
            </th>

            <th className={`${header} w-[19%] border-[#29549c]`}>Rank basis</th>
          </tr>

          <tr className="bg-[#e9f0fa] text-[#253f68]">
            <th className={header} aria-label="Month number" />

            <th className={header}>Week</th>

            <th className={header}>Start date</th>

            <th className={header}>End date</th>

            <th className={header}>Date</th>

            <th className={header} aria-label="Rank basis detail" />
          </tr>
        </thead>

        {months.map((month) => {
          const weeks = [...(month.weeks ?? [])]

            .filter((week) => typeof week.week_no === "number")

            .sort((a, b) => (a.week_no ?? 0) - (b.week_no ?? 0));

          const basis =
            year === 2026 ? POSTER_RANK_BASIS_2026[month.month_no] : undefined;

          if (!weeks.length) return null;

          return (
            <tbody key={`${year}-${month.month_no}`}>
              {weeks.map((week, index) => {
                const active = Boolean(week.is_current);

                const selected = week.week_no === selectedWeek;

                return (
                  <tr
                    key={`${month.month_no}-${week.week_no}`}

                    className={`transition-colors ${selected ? "bg-[#edf4ff]" : "bg-white hover:bg-[#f5f8ff]"}`}
                  >
                    {index === 0 && (
                      <td
                        rowSpan={weeks.length}

                        className="border border-[#e2e9f2] bg-[#e9f0fa] px-0.5 text-center align-middle"
                      >
                        <span className="text-[19px] font-extrabold leading-none text-[#123d84] sm:text-[22px]">
                          {month.month_no}
                        </span>
                      </td>
                    )}

                    <td className={`${cell} w-[8%] font-black text-[#123d84]`}>
                      <button
                        type="button"

                        title={`Week ${week.week_no} · ${week.is_settled ? "Settled" : "Pending"}${active ? " · Current week" : ""}`}

                        onClick={() => onSelectWeek(week.week_no!)}

                        aria-label={`Select week ${week.week_no} for CV search`}

                        aria-pressed={selected}

                        className={`mx-auto flex h-[22px] min-w-[24px] items-center justify-center rounded px-0.5 text-[10px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#f2a91b] ${selected ? "bg-[#245cbd] text-white" : active ? "bg-[#ffe6a0] text-[#123d84] hover:bg-[#fbd473]" : "text-[#123d84] hover:bg-[#dceaff]"}`}
                      >
                        {week.week_no}
                      </button>
                    </td>

                    <td
                      className={`${cell} whitespace-nowrap text-[#364b67]`}

                      title={week.start ?? ""}
                    >
                      {formatPosterApiDate(week.start)}
                    </td>

                    <td
                      className={`${cell} whitespace-nowrap text-[#364b67]`}

                      title={week.end ?? ""}
                    >
                      {formatPosterApiDate(week.end)}
                    </td>

                    <td
                      className={`${cell} whitespace-nowrap bg-[#fff7e8]`}

                      title={week.payout_date ?? ""}
                    >
                      <span className="rounded-sm bg-[#fff0ce] px-0.5 py-0.5 font-bold text-[#143f82]">
                        {formatPosterApiDate(week.payout_date)}
                      </span>
                    </td>

                    {index === 0 && (
                      <td
                        rowSpan={weeks.length}

                        className="border border-[#e2e9f2] bg-[#f9fafc] px-1 py-1.5 text-center align-middle"
                      >
                        {basis ? (
                          <div className="mx-auto max-w-[125px] text-[9px] font-bold uppercase leading-[1.3] text-[#153c79]">
                            {basis.title}

                            {basis.period && (
                              <div className="mt-0.5 text-[8px] font-medium text-[#68778c]">
                                ({basis.period})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-[#8290a3]">
                            —
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
