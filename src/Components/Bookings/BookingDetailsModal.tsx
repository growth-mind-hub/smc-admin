"use client";

import React, { useEffect, useCallback } from "react";
import { useBookings } from "@/context/BookingContext";
import { BookingStatus, BookingChannel } from "@/types/booking";
import {
  X,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Calendar,
  Clock,
  Users,
  Briefcase,
  MapPin,
  CheckCircle2,
  Clock3,
  CheckCircle,
  AlertOctagon,
  Car,
  Plane,
  Sparkles,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { WhatsAppIcon } from "@/Shared/Icons";

export default function BookingDetailsModal() {
  const {
    activeBooking,
    closeBookingDetails,
    updateBookingStatus,
    deleteBooking,
    assignDriver,
  } = useBookings();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditingDriver, setIsEditingDriver] = React.useState(false);
  const [inputDriverName, setInputDriverName] = React.useState("");
  const [inputDriverPhone, setInputDriverPhone] = React.useState("");
  const [isSavingDriver, setIsSavingDriver] = React.useState(false);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeBookingDetails();
      }
    },
    [closeBookingDetails]
  );

  useEffect(() => {
    if (activeBooking) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeBooking, handleKeyDown]);

  if (!activeBooking) return null;

  const handleDeleteBooking = async () => {
    if (!activeBooking) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete booking ${activeBooking.refNumber}? This will remove all associated snapshots.`
      )
    ) {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteBooking(activeBooking.id);
      closeBookingDetails();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    updateBookingStatus(activeBooking.id, newStatus);
  };

  const formatService = (type?: string) => {
    if (!type) return "Transfer";
    const map: Record<string, string> = {
      airport_transfer: "Airport Transfer",
      airport_departure: "Airport Departure",
      city_transfer: "Point-to-Point Transfer",
      hourly_charter: "Hourly Charter",
      special_occasions: "Special Occasions",
      corporate: "Corporate Transfer",
    };
    return (
      map[type] ||
      type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    );
  };

  const openCustomerWhatsApp = () => {
    let cleanPhone = activeBooking.phone ? activeBooking.phone.replace(/[^0-9]/g, "") : "";
    if (cleanPhone.length === 8) {
      cleanPhone = `65${cleanPhone}`;
    }
    if (!cleanPhone) {
      alert("No customer phone number available.");
      return;
    }

    const statusLabel = activeBooking.status
      ? activeBooking.status.replace("_", " ").toUpperCase()
      : "CONFIRMED";
    const vehicleLabel = activeBooking.vehicleName || "Maxi Cab";
    const assignedDriver = activeBooking.assignedDriver || activeBooking.driverAssigned;

    const summaryLines = [
      `🚕 *Singapore Maxicabs — Booking Summary*`,
      ``,
      `Hello *${activeBooking.customerName}*, here is your booking confirmation:`,
      ``,
      `📋 *Booking Ref:* ${activeBooking.refNumber}`,
      `📌 *Status:* ${statusLabel}`,
      `🚗 *Vehicle:* ${vehicleLabel}`,
      `🛠️ *Service:* ${formatService(activeBooking.serviceType)}`,
      ``,
      `📅 *Date & Time:* ${activeBooking.pickupDate} at ${activeBooking.pickupTime}`,
      `📍 *Pickup:* ${activeBooking.pickupLocation}`,
      `🏁 *Drop-off:* ${activeBooking.dropoffLocation}`,
      ...(activeBooking.flightNumber ? [`✈️ *Flight No:* ${activeBooking.flightNumber}`] : []),
      ``,
      `👥 *Passengers:* ${activeBooking.passengers || 1} pax`,
      `🧳 *Luggage:* ${activeBooking.luggageBags ?? activeBooking.luggage ?? 0} bags`,
      ...(activeBooking.meetAndGreet ? [`🤝 *Meet & Greet:* Yes (Included)`] : []),
      ...(activeBooking.addons && activeBooking.addons.length > 0
        ? [`✨ *Add-ons:* ${activeBooking.addons.join(", ")}`]
        : []),
      ...(activeBooking.specialRequest || activeBooking.notes
        ? [`📝 *Special Request:* ${activeBooking.specialRequest || activeBooking.notes}`]
        : []),
      ``,
      `💰 *Total Fare:* SGD $${activeBooking.fare}`,
      ...(assignedDriver?.name
        ? [
            `👨‍✈️ *Assigned Driver:* ${assignedDriver.name} (${assignedDriver.phone || "Contact via SMC"})${
              assignedDriver.vehiclePlate ? ` [Plate: ${assignedDriver.vehiclePlate}]` : ""
            }`,
          ]
        : []),
      ``,
      `Thank you for choosing Singapore Maxicabs! Please let us know if you need any adjustments.`,
    ];

    const text = encodeURIComponent(summaryLines.join("\n"));
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const openDriverWhatsApp = () => {
    const driver = activeBooking.assignedDriver || activeBooking.driverAssigned;
    const phone = driver?.phone;
    if (!phone) {
      alert("No driver phone number available.");
      return;
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 8) {
      cleanPhone = `65${cleanPhone}`;
    }

    const driverMsgLines = [
      `🚕 *Singapore Maxicabs — Trip Assignment*`,
      ``,
      `Hello *${driver?.name || driverName}*, here are the trip assignment details for *${activeBooking.refNumber}*:`,
      ``,
      `👤 *Customer:* ${activeBooking.customerName} (${activeBooking.phone})`,
      `📅 *Date & Time:* ${activeBooking.pickupDate} at ${activeBooking.pickupTime}`,
      `📍 *Pickup:* ${activeBooking.pickupLocation}`,
      `🏁 *Drop-off:* ${activeBooking.dropoffLocation}`,
      `🛠️ *Service:* ${formatService(activeBooking.serviceType)}`,
      ...(activeBooking.flightNumber ? [`✈️ *Flight No:* ${activeBooking.flightNumber}`] : []),
      `👥 *Pax:* ${activeBooking.passengers || 1} | 🧳 *Bags:* ${activeBooking.luggageBags ?? activeBooking.luggage ?? 0}`,
      ...(activeBooking.meetAndGreet ? [`🤝 *Meet & Greet:* Yes`] : []),
      ...(activeBooking.addons && activeBooking.addons.length > 0
        ? [`✨ *Add-ons:* ${activeBooking.addons.join(", ")}`]
        : []),
      ...(activeBooking.specialRequest || activeBooking.notes
        ? [`📝 *Notes:* ${activeBooking.specialRequest || activeBooking.notes}`]
        : []),
      `💰 *Fare:* SGD $${activeBooking.fare}`,
      ``,
      `Please confirm once received.`,
    ];

    const text = encodeURIComponent(driverMsgLines.join("\n"));
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const hasDriverAssigned = Boolean(
    activeBooking.assignedDriver?.name || activeBooking.driverAssigned?.name
  );
  const driverName =
    activeBooking.assignedDriver?.name ||
    activeBooking.driverAssigned?.name ||
    "Unassigned";
  const driverPhone =
    activeBooking.assignedDriver?.phone ||
    activeBooking.driverAssigned?.phone ||
    "";
  const vehiclePlate =
    activeBooking.assignedDriver?.vehiclePlate ||
    activeBooking.driverAssigned?.vehiclePlate ||
    (activeBooking.vehicleName ? activeBooking.vehicleName.slice(0, 7).toUpperCase() : "SMC");

  const driverInitials = hasDriverAssigned
    ? driverName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NA";

  const handleSaveDriver = async () => {
    if (!inputDriverName.trim()) {
      alert("Please enter driver name");
      return;
    }
    try {
      setIsSavingDriver(true);
      await assignDriver(activeBooking.id, {
        name: inputDriverName.trim(),
        phone: inputDriverPhone.trim() || "+65 9000 0000",
        vehiclePlate: vehiclePlate || "SMC-001",
      });
      setIsEditingDriver(false);
    } catch (err: any) {
      alert(err?.message || "Failed to assign driver");
    } finally {
      setIsSavingDriver(false);
    }
  };

  const statusOptions: {
    id: BookingStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
  }[] = [
    {
      id: "pending",
      label: "Pending",
      icon: Clock3,
      activeClass: "bg-amber-500 text-white shadow-sm ring-2 ring-amber-300",
    },
    {
      id: "confirmed",
      label: "Confirmed",
      icon: CheckCircle2,
      activeClass: "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300",
    },
    {
      id: "in_progress",
      label: "In Progress",
      icon: Car,
      activeClass: "bg-purple-600 text-white shadow-sm ring-2 ring-purple-300",
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle,
      activeClass: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: AlertOctagon,
      activeClass: "bg-rose-600 text-white shadow-sm ring-2 ring-rose-300",
    },
  ];

  const getChannelBadge = (channel: BookingChannel) => {
    switch (channel) {
      case "whatsapp":
        return {
          icon: WhatsAppIcon,
          label: "WhatsApp",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "phone":
        return {
          icon: Phone,
          label: "Phone Call",
          classes: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "email":
        return {
          icon: Mail,
          label: "Email",
          classes: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "walkin":
        return {
          icon: Users,
          label: "Walk-in",
          classes: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "website":
      default:
        return {
          icon: Globe,
          label: "Website",
          classes: "bg-blue-50 text-blue-700 border-blue-200",
        };
    }
  };

  const channelBadge = getChannelBadge(activeBooking.channel);
  const ChannelIcon = channelBadge.icon;

  const currentStatusConfig = statusOptions.find(
    (s) => s.id === activeBooking.status
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-center items-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={closeBookingDetails}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-color-background-white rounded-2xl shadow-2xl flex flex-col overflow-hidden font-['Manrope'] border border-color-border-subtle my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-color-background-brand border-b border-white/10 flex justify-between items-center flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md text-xs font-bold tracking-wider">
                {activeBooking.refNumber}
              </span>
              <div
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 ${channelBadge.classes}`}
              >
                <ChannelIcon className="size-3" />
                <span>{channelBadge.label}</span>
              </div>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <h2
              id="booking-modal-title"
              className="text-white text-base sm:text-lg font-bold leading-6 truncate"
            >
              {activeBooking.customerName}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-white/60 uppercase font-medium tracking-wide">
                Total Fare
              </div>
              <div className="text-amber-400 text-base font-bold">
                ${activeBooking.fare} SGD
              </div>
            </div>

            <button
              type="button"
              onClick={closeBookingDetails}
              className="size-8 rounded-lg bg-white/10 hover:bg-white/20 flex justify-center items-center cursor-pointer transition-colors text-white/80 hover:text-white"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Status Workflow Selector Bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-color-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-color-input-placeholder tracking-wider">
            <span>Status:</span>
            {currentStatusConfig && (
              <span className="capitalize font-bold text-color-text-primary flex items-center gap-1">
                <currentStatusConfig.icon className="size-3.5" />
                {currentStatusConfig.label}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((st) => {
              const isActive = activeBooking.status === st.id;
              const StatusIcon = st.icon;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusChange(st.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? st.activeClass
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <StatusIcon className="size-3" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Top Grid: Route & Journey (Left) + Vehicle & Driver (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Card: Route & Trip Schedule */}
            <div className="flex flex-col gap-4">
              {/* Route Card */}
              <div className="p-4 bg-stone-50 rounded-xl border border-color-border-subtle flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-color-input-placeholder">
                    Trip Route
                  </span>
                  <div className="text-[11px] text-color-input-placeholder font-medium">
                    {activeBooking.serviceType?.replace("_", " ") || "Transfer"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <div className="w-0.5 h-10 bg-slate-300 my-1 border-dashed" />
                    <div className="size-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div>
                      <div className="text-[10px] text-color-input-placeholder font-medium uppercase">
                        Pick-up
                      </div>
                      <div className="text-xs font-semibold text-color-text-primary leading-tight mt-0.5">
                        {activeBooking.pickupLocation}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-color-input-placeholder font-medium uppercase">
                        Drop-off
                      </div>
                      <div className="text-xs font-semibold text-color-text-primary leading-tight mt-0.5">
                        {activeBooking.dropoffLocation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Pax Grid */}
              <div className="p-4 bg-white rounded-xl border border-color-border-subtle grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-color-input-placeholder text-[11px]">
                    <Calendar className="size-3.5 text-color-input-placeholder" />
                    <span>Pickup Date</span>
                  </div>
                  <div className="text-xs font-semibold text-color-text-primary mt-1">
                    {activeBooking.pickupDate}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-color-input-placeholder text-[11px]">
                    <Clock className="size-3.5 text-color-input-placeholder" />
                    <span>Pickup Time</span>
                  </div>
                  <div className="text-xs font-semibold text-color-text-primary mt-1">
                    {activeBooking.pickupTime}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-color-input-placeholder text-[11px]">
                    <Users className="size-3.5 text-color-input-placeholder" />
                    <span>Passengers</span>
                  </div>
                  <div className="text-xs font-semibold text-color-text-primary mt-1">
                    {activeBooking.passengers || 1} pax
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-color-input-placeholder text-[11px]">
                    <Briefcase className="size-3.5 text-color-input-placeholder" />
                    <span>Luggage</span>
                  </div>
                  <div className="text-xs font-semibold text-color-text-primary mt-1">
                    {activeBooking.luggageBags ?? activeBooking.luggage ?? 0} bags
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-color-input-placeholder text-[11px]">
                    <Sparkles className="size-3.5 text-color-input-placeholder" />
                    <span>Meet & Greet</span>
                  </div>
                  <div className="text-xs font-semibold text-color-text-primary mt-1">
                    {activeBooking.meetAndGreet ? "Yes (included)" : "No"}
                  </div>
                </div>

                {activeBooking.flightNumber ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-color-input-placeholder text-[11px]">
                      <Plane className="size-3.5 text-color-input-placeholder" />
                      <span>Flight No.</span>
                    </div>
                    <div className="text-xs font-semibold text-color-text-primary mt-1">
                      {activeBooking.flightNumber}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="text-color-input-placeholder text-[11px]">
                      Booked On
                    </div>
                    <div className="text-xs font-semibold text-color-text-primary mt-1 truncate">
                      {activeBooking.createdAt || "Recent"}
                    </div>
                  </div>
                )}
              </div>

              {/* Addons if any */}
              {activeBooking.addons && activeBooking.addons.length > 0 && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-900">Add-ons:</span>
                  <span className="text-blue-800 font-medium">
                    {activeBooking.addons.join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Right Card: Vehicle, Driver & Customer */}
            <div className="flex flex-col gap-4">
              {/* Vehicle & Driver Card */}
              <div className="rounded-xl border border-color-border-subtle overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-white flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded">
                      {vehiclePlate}
                    </span>
                    <h3 className="text-sm font-bold mt-1 text-white">
                      {activeBooking.vehicleName || "Maxi Cab"}
                    </h3>
                    <p className="text-xs text-white/70">
                      {formatService(activeBooking.serviceType)}
                    </p>
                  </div>
                  <Car className="size-8 text-amber-400/70" />
                </div>

                {/* Assigned Driver Row */}
                <div className="p-3 bg-color-background-selected border-t border-slate-100 flex flex-col gap-2.5">
                  {isEditingDriver ? (
                    <div className="flex flex-col gap-2 p-1">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                        {hasDriverAssigned ? "Update Driver Assignment" : "Assign Driver to Trip"}
                      </div>
                      <input
                        type="text"
                        value={inputDriverName}
                        onChange={(e) => setInputDriverName(e.target.value)}
                        placeholder="Driver Full Name (e.g. Ahmad Rizal)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={inputDriverPhone}
                        onChange={(e) => setInputDriverPhone(e.target.value)}
                        placeholder="Driver Phone (e.g. +65 9101 1234)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <div className="flex justify-end items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingDriver(false)}
                          disabled={isSavingDriver}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveDriver}
                          disabled={isSavingDriver}
                          className="px-3 py-1 bg-color-background-brand text-white rounded-md text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          {isSavingDriver ? "Saving..." : "Save Driver"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-9 rounded-full flex justify-center items-center text-xs font-bold flex-shrink-0 ${
                            hasDriverAssigned
                              ? "bg-color-background-brand text-white"
                              : "bg-stone-200 text-stone-500"
                          }`}
                        >
                          {driverInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-semibold text-color-input-placeholder">
                            Assigned Driver
                          </div>
                          <div
                            className={`text-xs font-bold truncate ${
                              hasDriverAssigned ? "text-color-text-primary" : "text-stone-400 italic"
                            }`}
                          >
                            {hasDriverAssigned ? driverName : "No Driver Assigned"}
                          </div>
                          {hasDriverAssigned && driverPhone && (
                            <div className="text-xs text-color-input-placeholder truncate">
                              {driverPhone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setInputDriverName(hasDriverAssigned ? driverName : "");
                            setInputDriverPhone(hasDriverAssigned ? driverPhone : "+65 ");
                            setIsEditingDriver(true);
                          }}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {hasDriverAssigned ? "Change" : "Assign"}
                        </button>

                        {hasDriverAssigned && driverPhone && (
                          <button
                            type="button"
                            onClick={openDriverWhatsApp}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            title="WhatsApp Driver"
                          >
                            <WhatsAppIcon className="size-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Contact Card */}
              <div className="p-4 bg-stone-50 rounded-xl border border-color-border-subtle flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-color-input-placeholder">
                  Customer Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <a
                    href={`tel:${activeBooking.phone}`}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5 hover:border-slate-300 transition-colors group"
                  >
                    <div className="size-7 rounded-md bg-stone-100 flex items-center justify-center text-slate-600 group-hover:text-color-text-primary">
                      <Phone className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-color-input-placeholder">Phone</div>
                      <div className="font-semibold text-color-text-primary truncate">
                        {activeBooking.phone}
                      </div>
                    </div>
                  </a>

                  <a
                    href={`mailto:${activeBooking.email}`}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5 hover:border-slate-300 transition-colors group"
                  >
                    <div className="size-7 rounded-md bg-stone-100 flex items-center justify-center text-slate-600 group-hover:text-color-text-primary">
                      <Mail className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-color-input-placeholder">Email</div>
                      <div className="font-semibold text-color-text-primary truncate">
                        {activeBooking.email}
                      </div>
                    </div>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={openCustomerWhatsApp}
                  title="Send full booking summary to customer via WhatsApp"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <WhatsAppIcon className="size-4" />
                  <span>WhatsApp Customer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Special Request or Notes */}
          {(activeBooking.specialRequest || activeBooking.notes) && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
              <div className="p-1 rounded bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                <Sparkles className="size-3.5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Special Request / Notes
                </div>
                <div className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {activeBooking.specialRequest || activeBooking.notes}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-color-border-subtle flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-color-input-placeholder">
            Ref: <strong className="text-color-text-primary">{activeBooking.refNumber}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDeleteBooking}
              disabled={isDeleting}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Permanently remove this booking"
            >
              <Trash2 className="size-3.5 text-red-600" />
              <span>{isDeleting ? "Deleting..." : "Delete Booking"}</span>
            </button>
            <button
              type="button"
              onClick={closeBookingDetails}
              className="px-4 py-2 bg-white hover:bg-stone-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
