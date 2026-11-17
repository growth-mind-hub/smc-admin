"use client";

import React from "react";
import { useGuide } from "@/context/GuideContext";
import { GuideTab } from "@/types/guide";
import {
  X,
  BookOpen,
  Sparkles,
  CalendarDays,
  Car,
  DollarSign,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  Zap,
} from "lucide-react";

export default function GuideModal() {
  const {
    isGuideModalOpen,
    closeGuideModal,
    activeGuideTab,
    setActiveGuideTab,
    startTour,
  } = useGuide();

  if (!isGuideModalOpen) return null;

  const tabs: { id: GuideTab; label: string; icon: any }[] = [
    { id: "overview", label: "Operations Overview", icon: Compass },
    { id: "bookings", label: "Bookings & Dispatch", icon: CalendarDays },
    { id: "fleet", label: "Fleet & Drivers", icon: Car },
    { id: "pricing", label: "Pricing & Charters", icon: DollarSign },
    { id: "whatsapp", label: "WhatsApp Templates", icon: MessageSquare },
    { id: "faq", label: "Operator FAQ", icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 font-['Manrope']">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-[#071E3B] text-white">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  Admin Operations Walkthrough & Guide
                </h2>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Official Manual
                </span>
              </div>
              <p className="text-xs text-white/70">
                Complete walkthrough of Singapore Maxicabs management workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => startTour(0)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              <span>Start Interactive Tour</span>
            </button>
            <button
              type="button"
              onClick={closeGuideModal}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close guide"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-2 bg-stone-50 border-b border-stone-200 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeGuideTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveGuideTab(tab.id)}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? "border-amber-500 text-[#071E3B]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    isActive ? "text-amber-500" : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-sm leading-relaxed space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeGuideTab === "overview" && (
            <div className="space-y-6">
              {/* Interactive Tour CTA Banner */}
              <div className="p-4 bg-gradient-to-r from-[#071E3B] to-[#123F6B] rounded-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-white">
                      Prefer a Live Walkthrough?
                    </h3>
                  </div>
                  <p className="text-xs text-white/80 max-w-lg">
                    Launch the 6-step interactive on-screen tour. It takes you
                    directly through each page of the application with
                    step-by-step pointers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startTour(0)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-all shadow cursor-pointer whitespace-nowrap"
                >
                  <span>Launch Live Tour</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {/* 4 Pillars of the Application */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Core Modules of the Admin Portal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm mb-1.5">
                      <div className="size-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <CalendarDays className="size-4" />
                      </div>
                      <span>Bookings & Dispatch</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Capture manual bookings, monitor status transitions, assign
                      drivers, and send automated WhatsApp dispatch confirmations.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm mb-1.5">
                      <div className="size-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Car className="size-4" />
                      </div>
                      <span>Fleet & Driver Roster</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Manage 6-seater, 7-seater, 9-seater, and 13-seater vehicles,
                      driver contact numbers, luggage capacity, and availability.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm mb-1.5">
                      <div className="size-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <DollarSign className="size-4" />
                      </div>
                      <span>Dynamic Pricing Engine</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Configure base fares, arrival driveway rates, and 1-hour
                      charters with auto-calculated 3h & 8h charter packages.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm mb-1.5">
                      <div className="size-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <MessageSquare className="size-4" />
                      </div>
                      <span>WhatsApp Integration</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      1-click WhatsApp web triggers to notify drivers of assigned
                      trips and send structured confirmations to customers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard Daily Workflow */}
              <div className="p-5 bg-white rounded-xl border border-stone-200 space-y-3">
                <h3 className="text-sm font-bold text-[#071E3B] flex items-center gap-2">
                  <Clock className="size-4 text-amber-500" />
                  <span>The 4-Step Daily Dispatch Routine</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                    <span className="font-bold text-amber-600 block mb-1">
                      Step 1: Check Schedule
                    </span>
                    <span>
                      Review today’s trips on the Dashboard to see pending and
                      upcoming pickups.
                    </span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                    <span className="font-bold text-amber-600 block mb-1">
                      Step 2: Assign Driver
                    </span>
                    <span>
                      Open the booking row in Bookings and select an active
                      driver from the roster.
                    </span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                    <span className="font-bold text-amber-600 block mb-1">
                      Step 3: WhatsApp Dispatch
                    </span>
                    <span>
                      Click the green WhatsApp icons to dispatch trip details to
                      both driver and customer.
                    </span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                    <span className="font-bold text-amber-600 block mb-1">
                      Step 4: Mark Complete
                    </span>
                    <span>
                      Once dropped off, toggle status to "Completed" to record
                      live revenue.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeGuideTab === "bookings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#071E3B] mb-1">
                  Creating & Dispatching Bookings
                </h3>
                <p className="text-xs text-slate-600">
                  How to handle customer reservations, capacity validation, and
                  driver assignments.
                </p>
              </div>

              {/* Step-by-step breakdown */}
              <div className="space-y-3">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="size-6 rounded-full bg-[#071E3B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#071E3B]">
                      Opening the Booking Modal
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click the{" "}
                      <span className="font-semibold text-slate-900">
                        "+ New Booking"
                      </span>{" "}
                      button in the top right of the Bookings page or Dashboard.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="size-6 rounded-full bg-[#071E3B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#071E3B]">
                      Select Service Type & Enter Flight Information
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Choose from Point-to-Point, Airport Arrival, Airport
                      Departure, or Hourly Charter. When Airport Arrival is
                      selected, enter the Flight Number to track arrival terminal
                      driveway pickups.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="size-6 rounded-full bg-[#071E3B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#071E3B]">
                      Google Places Address Lookup
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Type pickup and drop-off destinations. The autocomplete
                      suggests verified Singapore street addresses, hotel names,
                      and airport terminals.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="size-6 rounded-full bg-[#071E3B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#071E3B]">
                      Capacity Validation & Automatic Warnings
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The modal actively checks the selected vehicle's capacity.
                      If the passenger or luggage bag count exceeds the vehicle
                      limit, an instant warning banner appears to prevent
                      overloading.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="size-6 rounded-full bg-[#071E3B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    5
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#071E3B]">
                      Fare Calculation & Add-ons
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Select extra add-ons (Child booster seats, midnight
                      surcharges, extra stops). The fare auto-updates in real time
                      before you click "Confirm & Create Booking".
                    </p>
                  </div>
                </div>
              </div>

              {/* Status explanation */}
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/70">
                <h4 className="text-xs font-bold text-amber-900 mb-2">
                  Booking Status Lifecycle
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-700 block">Pending</span>
                    <span className="text-[11px] text-slate-600">
                      Initial booking placed, waiting for driver assignment.
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="font-bold text-blue-700 block">Confirmed</span>
                    <span className="text-[11px] text-slate-600">
                      Driver assigned & manifest dispatched.
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="font-bold text-purple-700 block">In Progress</span>
                    <span className="text-[11px] text-slate-600">
                      Vehicle on the way or passenger on board.
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                    <span className="font-bold text-emerald-700 block">Completed</span>
                    <span className="text-[11px] text-slate-600">
                      Drop-off complete; revenue added to metrics.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FLEET */}
          {activeGuideTab === "fleet" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#071E3B] mb-1">
                  Fleet & Driver Roster Management
                </h3>
                <p className="text-xs text-slate-600">
                  Manage your vehicle catalog, capacity limits, and driver contact
                  profiles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#071E3B]">
                    <Car className="size-4 text-amber-500" />
                    <span>Adding a New Vehicle (+ Add Vehicle)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Set the fleet license plate (e.g. SHA 1234 X), vehicle model
                    (Toyota Vellfire, Alphard, Hiace), passenger capacity, and
                    luggage capacity.
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-stone-200 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Capacity Standards:
                    </span>
                    <br />• 6-Seater: 6 Pax · 5 Bags
                    <br />• 7-Seater: 7 Pax · 5 Bags
                    <br />• 9-Seater: 9 Pax · 7 Bags
                    <br />• 13-Seater: 13 Pax · 10 Bags
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#071E3B]">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span>Driver Assignment & WhatsApp Roster</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Attach a primary driver and Singapore mobile number (+65).
                    This allows you to message drivers directly or assign them to
                    incoming trips with 1 click.
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-stone-200 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Active vs Maintenance Toggle:
                    </span>
                    <br />
                    Switching a vehicle to Inactive or Maintenance automatically
                    prevents it from being booked or dispatched until serviced.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRICING */}
          {activeGuideTab === "pricing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#071E3B] mb-1">
                  Dynamic Pricing & Auto-Calculated Charters
                </h3>
                <p className="text-xs text-slate-600">
                  How the system auto-calculates multi-hour charter packages to
                  prevent pricing discrepancies.
                </p>
              </div>

              {/* 1-Hour Charter rule explanation */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Zap className="size-4 text-amber-600" />
                  <span>The 1-Hour Charter Auto-Calculation Rule</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  To eliminate calculation mistakes and ensure strict pricing
                  integrity across your fleet, the admin portal enforces
                  automated charter calculation:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-xs">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      1-Hour Charter (Editable)
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Enter your base hourly rate (e.g. $60). This is the master
                      value that drives the calculations.
                    </span>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-lg border border-stone-300 shadow-xs cursor-not-allowed">
                    <span className="font-bold text-stone-700 block mb-0.5">
                      3-Hour Charter (Locked)
                    </span>
                    <span className="text-stone-600 text-[11px]">
                      Auto-calculated as: <strong>1-Hour × 3</strong> (e.g. $60 ×
                      3 = $180). Locked with cursor-not-allowed.
                    </span>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-lg border border-stone-300 shadow-xs cursor-not-allowed">
                    <span className="font-bold text-stone-700 block mb-0.5">
                      8-Hour Charter (Locked)
                    </span>
                    <span className="text-stone-600 text-[11px]">
                      Auto-calculated as: <strong>1-Hour × 8</strong> (e.g. $60 ×
                      8 = $480). Locked with cursor-not-allowed.
                    </span>
                  </div>
                </div>
              </div>

              {/* Base Fare & Meet and Greet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">
                    Base Fare (Point-to-Point)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    The standard transfer rate within mainland Singapore. Used for
                    city transfers and airport departures.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">
                    Arrival Driveway Pickup
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Airport arrival pickup inclusive of flight delay buffer,
                    driveway coordination, and passenger paging.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WHATSAPP */}
          {activeGuideTab === "whatsapp" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#071E3B] mb-1">
                  Automated WhatsApp Dispatch Formats
                </h3>
                <p className="text-xs text-slate-600">
                  Preview how messages are generated for passengers and drivers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Driver Manifest */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#071E3B] flex items-center gap-1.5">
                      <Send className="size-4 text-emerald-600" />
                      <span>Driver Trip Manifest</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Sent to Driver
                    </span>
                  </div>
                  <pre className="p-3 bg-stone-900 text-emerald-400 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`🚗 *NEW TRIP ASSIGNMENT*
Ref: #BK-78923
Type: Airport Arrival

👤 Customer: Sarah Tan
📞 Phone: +65 9123 4567
✈️ Flight: SQ 321
📍 From: Changi Airport T3
📍 To: Marina Bay Sands
📅 Date: 15 Nov 2026, 14:30
👥 Pax: 5 | 🧳 Bags: 4
💰 Fare: SGD $85

Please reply to confirm receipt.`}
                  </pre>
                </div>

                {/* Customer Confirmation */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#071E3B] flex items-center gap-1.5">
                      <MessageSquare className="size-4 text-emerald-600" />
                      <span>Customer Confirmation</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                      Sent to Passenger
                    </span>
                  </div>
                  <pre className="p-3 bg-stone-900 text-amber-300 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`✨ *SINGAPORE MAXICABS BOOKING CONFIRMATION*
Booking Ref: #BK-78923
Status: CONFIRMED

Dear Sarah Tan,
Your maxicab has been confirmed!

🚗 Vehicle: 7 Seater Maxi Cab
👤 Driver: Ahmad Rizal (+65 9876 5432)
📅 Date: 15 Nov 2026 at 14:30
📍 Pickup: Changi Airport T3
📍 Drop-off: Marina Bay Sands
💰 Total Fare: SGD $85

Thank you for choosing Singapore Maxicabs!`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeGuideTab === "faq" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#071E3B] mb-1">
                  Operator FAQ & Best Practices
                </h3>
                <p className="text-xs text-slate-600">
                  Quick answers to common questions about operating the admin
                  system.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h4 className="font-bold text-[#071E3B]">
                    Q: Why are the 3-Hour and 8-Hour Charter boxes locked with
                    "cursor not allowed"?
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    A: This is an intentional feature! To prevent calculation
                    errors, the system auto-calculates 3-Hour (1hr × 3) and
                    8-Hour (1hr × 8) rates directly from your 1-Hour Charter
                    input. Simply edit the 1-Hour Charter rate, and the packages
                    update automatically.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h4 className="font-bold text-[#071E3B]">
                    Q: How do WhatsApp notifications work?
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    A: Clicking the green WhatsApp buttons opens WhatsApp Web or
                    the desktop WhatsApp application with the customer's or
                    driver's phone number and the complete, pre-formatted message
                    ready to send.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h4 className="font-bold text-[#071E3B]">
                    Q: What happens if a vehicle is placed under Maintenance?
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    A: Vehicles marked as Maintenance or Inactive are
                    automatically excluded from the booking vehicle selection
                    list, ensuring clients are never assigned a car that is in the
                    workshop.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h4 className="font-bold text-[#071E3B]">
                    Q: How is live revenue calculated on the Dashboard?
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    A: Revenue is computed live from all completed bookings in
                    the system. As you mark trips as "Completed" in the bookings
                    list, your dashboard revenue increments immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => startTour(0)}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="size-4 text-amber-500" />
            <span>Take On-Screen Interactive Tour</span>
          </button>

          <button
            type="button"
            onClick={closeGuideModal}
            className="px-4 py-2 bg-[#071E3B] hover:bg-[#0B2A4A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

