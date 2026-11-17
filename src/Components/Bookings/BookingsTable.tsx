"use client";

import React, { useState, useMemo } from "react";
import { useBookings } from "@/context/BookingContext";
import { Booking } from "@/types/booking";
import { Globe, PhoneCall, Mail, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { WhatsAppIcon } from "@/Shared/Icons";

type SortField = "ref" | "contact" | "route" | "date" | "source" | "status" | "fare";
type SortOrder = "asc" | "desc";

export default function BookingsTable() {
  const { filteredBookings, activeBookingId, openBookingDetails, isLoading } = useBookings();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "ref": {
          const refA = (a.refNumber || "").toLowerCase();
          const refB = (b.refNumber || "").toLowerCase();
          comparison = refA.localeCompare(refB, undefined, { numeric: true });
          if (comparison === 0) {
            comparison = (a.customerName || "").localeCompare(b.customerName || "");
          }
          break;
        }
        case "contact": {
          const phoneA = (a.phone || "").toLowerCase();
          const phoneB = (b.phone || "").toLowerCase();
          comparison = phoneA.localeCompare(phoneB);
          if (comparison === 0) {
            comparison = (a.email || "").localeCompare(b.email || "");
          }
          break;
        }
        case "route": {
          const routeA = `${a.pickupLocation || ""} ${a.dropoffLocation || ""}`.toLowerCase();
          const routeB = `${b.pickupLocation || ""} ${b.dropoffLocation || ""}`.toLowerCase();
          comparison = routeA.localeCompare(routeB);
          break;
        }
        case "date": {
          const dateStrA = `${a.pickupDate || ""} ${a.pickupTime || ""}`.trim();
          const dateStrB = `${b.pickupDate || ""} ${b.pickupTime || ""}`.trim();
          comparison = dateStrA.localeCompare(dateStrB);
          break;
        }
        case "source": {
          comparison = (a.channel || "").localeCompare(b.channel || "");
          break;
        }
        case "status": {
          comparison = (a.status || "").localeCompare(b.status || "");
          break;
        }
        case "fare": {
          const fareA =
            typeof a.fare === "number"
              ? a.fare
              : parseFloat(String(a.fare).replace(/[^0-9.-]/g, "")) || 0;
          const fareB =
            typeof b.fare === "number"
              ? b.fare
              : parseFloat(String(b.fare).replace(/[^0-9.-]/g, "")) || 0;
          comparison = fareA - fareB;
          break;
        }
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredBookings, sortField, sortOrder]);

  const renderSortHeader = (label: string, field: SortField, className: string = "") => {
    const isCurrent = sortField === field;
    return (
      <th
        key={field}
        onClick={() => handleSort(field)}
        className={`px-4 py-3 select-none cursor-pointer group transition-colors hover:bg-stone-200/60 ${className}`}
        title={`Sort by ${label} (${isCurrent ? (sortOrder === "asc" ? "Ascending" : "Descending") : "Click to sort"})`}
      >
        <div className="inline-flex items-center gap-1.5 font-semibold">
          <span>{label}</span>
          <span className="flex items-center">
            {isCurrent ? (
              sortOrder === "asc" ? (
                <ArrowUp className="size-3.5 text-orange-500 font-bold" />
              ) : (
                <ArrowDown className="size-3.5 text-orange-500 font-bold" />
              )
            ) : (
              <ArrowUpDown className="size-3 text-stone-400 group-hover:text-stone-600 transition-colors" />
            )}
          </span>
        </div>
      </th>
    );
  };

  const getSourceBadge = (channel: Booking["channel"]) => {
    switch (channel) {
      case "website":
        return {
          bg: "bg-blue-50 outline outline-1 outline-offset-[-1px] outline-blue-200 text-blue-700",
          text: "Website",
          icon: Globe,
        };
      case "whatsapp":
        return {
          bg: "bg-green-50 outline outline-1 outline-offset-[-1px] outline-green-200 text-green-700",
          text: "WhatsApp",
          icon: WhatsAppIcon,
        };
      case "email":
        return {
          bg: "bg-amber-50 outline outline-1 outline-offset-[-1px] outline-amber-200 text-amber-700",
          text: "Email",
          icon: Mail,
        };
      case "phone":
      default:
        return {
          bg: "bg-purple-50 outline outline-1 outline-offset-[-1px] outline-purple-200 text-purple-700",
          text: "Phone Call",
          icon: PhoneCall,
        };
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return {
          bg: "bg-blue-50 outline outline-1 outline-offset-[-1px] outline-blue-200 text-blue-700",
          text: "Confirmed",
        };
      case "pending":
        return {
          bg: "bg-amber-50 outline outline-1 outline-offset-[-1px] outline-amber-200 text-amber-700",
          text: "Pending",
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

  if (isLoading) {
    return (
      <div className="w-full bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden font-['Manrope']">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-stone-100 border-b border-color-border-subtle text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase tracking-wide">
                <th className="px-4 py-3">Ref / Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-stone-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-stone-100 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3.5 w-24 bg-stone-100 rounded mb-1" />
                    <div className="h-3 w-32 bg-stone-100 rounded" />
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="h-3.5 w-36 bg-stone-100 rounded mb-1" />
                    <div className="h-3 w-32 bg-stone-100 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3.5 w-20 bg-stone-100 rounded mb-1" />
                    <div className="h-3 w-12 bg-stone-100 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-20 bg-stone-100 rounded-md" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-16 bg-stone-100 rounded-md" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 w-12 bg-stone-200 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="w-full bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle p-12 text-center flex flex-col items-center justify-center font-['Manrope']">
        <div className="justify-start text-color-text-primary text-sm font-semibold font-['Manrope']">
          No bookings found
        </div>
        <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] mt-1">
          Try adjusting your search criteria or status filter.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden font-['Manrope']">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-stone-100 border-b border-color-border-subtle text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase tracking-wide">
              {renderSortHeader("Ref / Customer", "ref")}
              {renderSortHeader("Contact", "contact")}
              {renderSortHeader("Route", "route")}
              {renderSortHeader("Date", "date")}
              {renderSortHeader("Source", "source")}
              {renderSortHeader("Status", "status")}
              {renderSortHeader("Fare", "fare")}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {sortedBookings.map((booking: Booking) => {
              const isSelected = booking.id === activeBookingId;
              const srcBadge = getSourceBadge(booking.channel);
              const statBadge = getStatusBadge(booking.status);
              const Icon = srcBadge.icon;

              return (
                <tr
                  key={booking.id}
                  onClick={() => openBookingDetails(booking.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-color-background-selected"
                      : "hover:bg-stone-50/80"
                  }`}
                >
                  {/* Ref / Customer */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col justify-start items-start">
                      <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
                        {booking.refNumber}
                      </div>
                      <div className="justify-start text-color-text-primary text-xs font-medium font-['Manrope'] leading-5 truncate">
                        {booking.customerName}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col justify-start items-start">
                      <div className="justify-start text-color-text-primary text-xs font-normal font-['Manrope'] leading-4">
                        {booking.phone}
                      </div>
                      <div className="max-w-[160px] 2xl:max-w-xs flex flex-col justify-start items-start overflow-hidden">
                        <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4 truncate">
                          {booking.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="px-4 py-3">
                    <div className="max-w-[220px] 2xl:max-w-md flex flex-col justify-start items-start overflow-hidden">
                      <div className="justify-start text-color-text-primary text-xs font-normal font-['Manrope'] leading-4 truncate">
                        {booking.pickupLocation}
                      </div>
                      <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4 truncate">
                        → {booking.dropoffLocation}
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col justify-start items-start">
                      <div className="justify-start text-color-text-primary text-xs font-normal font-['Manrope'] leading-4">
                        {booking.pickupDate}
                      </div>
                      {booking.pickupTime && (
                        <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                          {booking.pickupTime}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div
                      className={`px-2 py-0.5 rounded-full inline-flex justify-start items-center gap-1 ${srcBadge.bg}`}
                    >
                      {Icon && <Icon className="size-2.5 flex-shrink-0" />}
                      <div className="text-[10px] font-semibold font-['Manrope'] leading-4">
                        {srcBadge.text}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div
                      className={`px-2.5 py-0.5 rounded-full inline-flex justify-start items-center ${statBadge.bg}`}
                    >
                      <div className="text-[10px] font-semibold font-['Manrope'] leading-4">
                        {statBadge.text}
                      </div>
                    </div>
                  </td>

                  {/* Fare */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
                      ${booking.fare}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
