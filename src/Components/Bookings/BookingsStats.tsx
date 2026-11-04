"use client";

import React from "react";
import { CalendarDays, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useBookings } from "@/context/BookingContext";

export default function BookingsStats() {
  const { counts, isLoading } = useBookings();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 font-['Manrope']">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-12 bg-slate-200 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 font-['Manrope']">
      {/* Total Bookings */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Bookings
          </span>
          <div className="text-2xl font-extrabold text-[#071E3B] mt-0.5">
            {counts.all}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#071E3B] border border-slate-100 flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
      </div>

      {/* Confirmed */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Confirmed
          </span>
          <div className="text-2xl font-extrabold text-blue-600 mt-0.5">
            {counts.confirmed}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Pending Review
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-0.5">
            {counts.pending}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* In-Progress & Active */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            In-Progress
          </span>
          <div className="text-2xl font-extrabold text-purple-600 mt-0.5">
            {counts.in_progress}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
