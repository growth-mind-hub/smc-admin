"use client";

import React from "react";
import { useBookings } from "@/context/BookingContext";
import { Search } from "lucide-react";

export default function BookingsFilterTabs() {
  const {
    counts,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
  } = useBookings();

  const tabs = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "in_progress", label: "In-progress", count: counts.in_progress },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-4">
      {/* Filter Tabs matching bookingspaeg.html & Screenshot 3 */}
      <div className="self-stretch inline-flex justify-start items-start gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] inline-flex flex-col justify-center items-center transition-all cursor-pointer ${
                isActive
                  ? "bg-color-background-brand outline-slate-900 text-color-text-inverse"
                  : "bg-color-background-white outline-color-border-subtle text-color-input-placeholder hover:bg-stone-50"
              }`}
            >
              <div
                className={`text-center justify-start text-xs font-semibold font-['Manrope'] leading-4 ${
                  isActive ? "text-color-text-inverse" : "text-color-input-placeholder"
                }`}
              >
                {tab.label} {isLoading ? "" : `(${tab.count})`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input matching bookingspaeg.html */}
      <div className="self-stretch h-10 relative">
        <div className="size-4 left-3.5 top-3 absolute flex items-center justify-center pointer-events-none text-gray-500">
          <Search className="size-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, email, ref no, or location…"
          className="w-full h-10 pl-10 pr-4 py-2.5 bg-color-background-white rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal font-['Manrope'] placeholder:text-color-input-placeholder focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}
