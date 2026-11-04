"use client";

import React from "react";
import { useBookings } from "@/context/BookingContext";

export default function StatusBreakdownCard() {
  const { counts, isLoading } = useBookings();

  const total = counts.all || 1;
  const getWidthPercent = (val: number) => {
    if (!counts.all || counts.all === 0) return 0;
    return Math.min(100, Math.max(8, Math.round((val / total) * 100)));
  };

  const statusItems = [
    {
      key: "confirmed",
      label: "Confirmed",
      count: counts.confirmed,
      badgeClass: "bg-blue-50 outline-blue-200 text-blue-700",
      barClass: "bg-blue-500",
      width: `${getWidthPercent(counts.confirmed)}%`,
    },
    {
      key: "pending",
      label: "Pending",
      count: counts.pending,
      badgeClass: "bg-amber-50 outline-amber-200 text-amber-700",
      barClass: "bg-amber-500",
      width: `${getWidthPercent(counts.pending)}%`,
    },
    {
      key: "completed",
      label: "Completed",
      count: counts.completed,
      badgeClass: "bg-green-50 outline-green-200 text-green-700",
      barClass: "bg-green-500",
      width: `${getWidthPercent(counts.completed)}%`,
    },
    {
      key: "in_progress",
      label: "In-progress",
      count: counts.in_progress,
      badgeClass: "bg-purple-50 outline-purple-200 text-purple-700",
      barClass: "bg-purple-500",
      width: `${getWidthPercent(counts.in_progress)}%`,
    },
  ];

  return (
    <div className="self-stretch p-5 bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start font-['Manrope']">
      <div className="self-stretch flex flex-col justify-start items-start">
        <div className="justify-start text-color-text-primary text-base font-bold leading-6">
          Booking Status
        </div>
      </div>

      <div className="w-full pt-4 flex flex-col justify-start items-start gap-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="self-stretch inline-flex justify-between items-center animate-pulse"
            >
              <div className="h-5 w-18 bg-stone-200 rounded-full" />
              <div className="flex justify-start items-center gap-2">
                <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-1.5 w-1/2 bg-stone-200 rounded-full" />
                </div>
                <div className="h-4 w-4 bg-stone-200 rounded" />
              </div>
            </div>
          ))
        ) : (
          statusItems.map((item) => (
            <div
              key={item.key}
              className="self-stretch inline-flex justify-between items-center"
            >
              <div
                className={`px-2 py-0.5 rounded-full outline outline-1 outline-offset-[-1px] inline-flex flex-col justify-start items-start ${item.badgeClass}`}
              >
                <div className="text-[10px] font-semibold leading-4">
                  {item.label}
                </div>
              </div>
              <div className="flex justify-start items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full inline-flex flex-col justify-start items-start overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      item.count > 0 ? item.barClass : "bg-transparent"
                    }`}
                    style={{ width: item.count > 0 ? item.width : "0%" }}
                  />
                </div>
                <div className="w-4 inline-flex flex-col justify-start items-end">
                  <div className="text-right justify-start text-color-text-primary text-xs font-semibold leading-5">
                    {item.count}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
