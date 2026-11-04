"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookings } from "@/context/BookingContext";
import { Booking } from "@/types/booking";

export default function RecentBookingsTable() {
  const router = useRouter();
  const { bookings, openBookingDetails, isLoading } = useBookings();

  // In Screenshot 2, the Recent Bookings sequence is:
  // Sarah Lim, Mei Lin Wong, David Ng, Aditya Kumar, Chen Wei, Raj Patel
  // Let's sort to show pending/recent active bookings
  const sortedBookings = [...bookings].sort((a, b) => {
    const priority: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      in_progress: 3,
      completed: 4,
      cancelled: 5,
    };
    return (priority[a.status] || 99) - (priority[b.status] || 99);
  });

  const recentList = sortedBookings.slice(0, 6);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 outline outline-1 outline-offset-[-1px] outline-amber-200 text-amber-700",
          text: "Pending",
        };
      case "confirmed":
        return {
          bg: "bg-blue-50 outline outline-1 outline-offset-[-1px] outline-blue-200 text-blue-700",
          text: "Confirmed",
        };
      case "in_progress":
        return {
          bg: "bg-purple-50 outline outline-1 outline-offset-[-1px] outline-purple-200 text-purple-700",
          text: "In-progress",
        };
      case "completed":
        return {
          bg: "bg-green-50 outline outline-1 outline-offset-[-1px] outline-green-200 text-green-700",
          text: "Completed",
        };
      case "cancelled":
      default:
        return {
          bg: "bg-stone-100 outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-color-input-placeholder",
          text: "Cancelled",
        };
    }
  };

  const handleRowClick = (bookingId: string) => {
    openBookingDetails(bookingId);
    router.push("/bookings");
  };

  return (
    <div className="w-full bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden shadow-xs">
      {/* Header */}
      <div className="w-full px-5 py-4 border-b border-color-border-subtle flex justify-between items-center">
        <div className="flex flex-col justify-start items-start">
          <div className="justify-start text-color-text-primary text-base font-bold font-['Manrope'] leading-6">
            Recent Bookings
          </div>
        </div>
        <Link
          href="/bookings"
          className="flex flex-col justify-start items-start hover:opacity-80 transition-opacity"
        >
          <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
            View all →
          </div>
        </Link>
      </div>

      {/* Rows */}
      <div className="w-full flex flex-col justify-start items-start divide-y divide-gray-100">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-full px-5 py-4 flex justify-between items-center gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="size-9 bg-stone-200 rounded-full flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-4 w-32 bg-stone-200 rounded" />
                  <div className="h-3 w-48 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-stone-100 rounded-md" />
                <div className="h-4 w-12 bg-stone-200 rounded" />
              </div>
            </div>
          ))
        ) : recentList.length === 0 ? (
          <div className="w-full p-8 text-center text-xs text-stone-500 font-['Manrope']">
            No bookings recorded yet.
          </div>
        ) : (
          recentList.map((booking) => {
          const badge = getStatusBadge(booking.status);

          return (
            <div
              key={booking.id}
              onClick={() => handleRowClick(booking.id)}
              className="w-full px-5 py-4 flex justify-between items-center gap-4 hover:bg-[#EEF5FB]/50 transition-colors cursor-pointer"
            >
              {/* Left: Avatar + Customer & Route Info */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Avatar */}
                <div className="size-9 bg-color-background-brand rounded-full flex justify-center items-center flex-shrink-0">
                  <div className="text-color-text-inverse text-[11px] font-bold font-['Manrope'] leading-4">
                    {getInitials(booking.customerName)}
                  </div>
                </div>

                {/* Customer & Route */}
                <div className="flex-1 min-w-0 flex flex-col justify-start items-start">
                  <div className="w-full flex items-center gap-2 overflow-hidden">
                    <span className="text-color-text-primary text-xs sm:text-sm font-semibold font-['Manrope'] leading-5 truncate">
                      {booking.customerName}
                    </span>
                    <span className="text-orange-400 text-[11px] font-semibold font-['Manrope'] hidden sm:inline">
                      • {booking.refNumber}
                    </span>
                  </div>
                  <div className="w-full text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4 truncate">
                    {booking.pickupLocation} → {booking.dropoffLocation}
                  </div>
                </div>
              </div>

              {/* Middle: Vehicle & Fare on larger screens */}
              <div className="hidden sm:flex flex-col justify-start items-end flex-shrink-0 px-2">
                <div className="text-color-text-primary text-xs font-bold font-['Manrope'] leading-5">
                  ${booking.fare} SGD
                </div>
                <div className="text-color-input-placeholder text-[10px] font-normal font-['Manrope'] leading-4 capitalize">
                  {booking.vehicleName || "Maxi Cab"}
                </div>
              </div>

              {/* Right: Status & Date */}
              <div className="flex flex-col justify-start items-end flex-shrink-0">
                <div className="h-6 flex items-center justify-end">
                  <div
                    className={`h-5 px-2.5 flex items-center justify-center rounded-full ${badge.bg}`}
                  >
                    <div className="text-right text-[10px] font-semibold font-['Manrope'] leading-4">
                      {badge.text}
                    </div>
                  </div>
                </div>
                <div className="h-5 pt-0.5 flex flex-col justify-start items-end">
                  <div className="text-right text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                    {booking.pickupDate}
                  </div>
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
