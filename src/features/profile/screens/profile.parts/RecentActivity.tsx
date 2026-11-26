"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Coins, Package } from "lucide-react";
import { AnyObject, BRAND_GREEN, CARD, LABEL, SECTION_TITLE, getActivityDate, getActivityTime, renderRatingStars } from "@/features/profile/screens/profile.parts/support";


/* ========================================================================= */
/* RECENT ACTIVITY                                                           */
/* ========================================================================= */

export function RecentActivity({
  activities,
  activityFilter,
  setActivityFilter,
  isDistributor,
}: {
  activities: AnyObject[];
  activityFilter: string;
  setActivityFilter: (value: string) => void;
  isDistributor: boolean;
}) {
  const filteredActivities = useMemo(() => {
    if (!Array.isArray(activities)) {
      return [];
    }

    if (activityFilter === "all") {
      return activities;
    }

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return activities.filter((activity) => {
      const activityDate = activity?.created_timestamp
        ? new Date(Number(activity.created_timestamp) * 1000)
        : new Date(activity?.created_at || "");

      if (Number.isNaN(activityDate.getTime())) {
        return true;
      }

      switch (activityFilter) {
        case "today":
          return activityDate >= today;

        case "yesterday":
          return activityDate >= yesterday && activityDate < today;

        case "week":
          return activityDate >= weekAgo;

        case "month":
          return activityDate >= monthAgo;

        default:
          return true;
      }
    });
  }, [activities, activityFilter]);

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={LABEL}>Your Journey</p>

          <h3 className={`mt-1 ${SECTION_TITLE}`}>
            Recent Activity
          </h3>
        </div>

        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="
            rounded-[10px]
            border border-[#DCDDD7]
            bg-white
            px-3.5 py-2
            text-[9px]
            font-semibold
            text-[#555750]
            outline-none
            transition
            focus:border-[#AEB1A9]
          "
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className={`${CARD} p-5`}>
        {filteredActivities.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F3F4F0]">
                <Package className="h-6 w-6 text-[#B1B2AB]" />
              </div>

              <p className="mt-4 text-[11px] font-medium text-[#888981]">
                No recent activity to show.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-[370px] overflow-y-auto pr-2">
              {filteredActivities.map((activity, index) => {
                const isLast =
                  index === filteredActivities.length - 1;

                return (
                  <motion.div
                    key={
                      activity?.order_reference ||
                      `${activity?.event || "activity"}-${index}`
                    }
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="grid grid-cols-[54px_20px_1fr_auto] gap-3.5"
                  >
                    <div className="pt-0.5 text-right">
                      <span className="text-[11px] font-semibold text-[#333531]">
                        {getActivityTime(
                          activity?.created_timestamp,
                          activity?.created_at,
                        )}
                      </span>
                    </div>

                    <div className="relative flex justify-center">
                      {!isLast && (
                        <div className="absolute left-1/2 top-5 h-[78px] w-px -translate-x-1/2 bg-[#E4E5DF]" />
                      )}

                      <div
                        className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.4)]"
                        style={{
                          borderColor: BRAND_GREEN,
                        }}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: BRAND_GREEN,
                          }}
                        />
                      </div>
                    </div>

                    <div className="pb-7">
                      <p className="text-[11px] font-semibold leading-[1.45] text-[#191A18]">
                        {activity?.event || "Activity"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-[#E5E5E0] bg-[#FAFAF8] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#70716B]">
                          {activity?.type === "order"
                            ? "Purchase"
                            : activity?.type || "Activity"}
                        </span>

                        {isDistributor && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#EBD9B4] bg-[#FBF3E4] px-2.5 py-1 text-[8px] font-bold text-[#A9711F]">
                            <Coins className="h-2.5 w-2.5" />

                            {activity?.points_earned || 0} Points
                          </span>
                        )}

                        {!isDistributor && activity?.rating && (
                          <span className="rounded-full bg-[#F7F7F4] px-2 py-1 text-[8px] tracking-[1px] text-[#222]">
                            {renderRatingStars(activity.rating)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-0.5 text-right">
                      <span className="whitespace-nowrap text-[8px] font-medium text-[#A0A19A]">
                        {getActivityDate(
                          activity?.created_timestamp,
                          activity?.created_at,
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredActivities.length > 4 && (
              <div className="mt-1 border-t border-[#E9E9E4] pt-3 text-center text-[8px] font-medium uppercase tracking-[0.12em] text-[#A1A19A]">
                Showing {filteredActivities.length} activities
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}
