"use client";

import React, { useState } from "react";
import AdminLayout from "@/Components/Layout/AdminLayout";
import { useGuide } from "@/context/GuideContext";
import { GuideTab } from "@/types/guide";
import {
  BookOpen,
  Sparkles,
  CalendarDays,
  Car,
  DollarSign,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Compass,
  Clock,
  ShieldCheck,
  Send,
  Zap,
} from "lucide-react";

export default function GuidePage() {
  const { startTour, openGuideModal } = useGuide();
  const [activeTab, setActiveTab] = useState<GuideTab>("overview");

  const tabs: { id: GuideTab; label: string; icon: any }[] = [
    { id: "overview", label: "Operations Overview", icon: Compass },
    { id: "bookings", label: "Bookings & Dispatch", icon: CalendarDays },
    { id: "fleet", label: "Fleet & Drivers", icon: Car },
    { id: "pricing", label: "Pricing & Charters", icon: DollarSign },
    { id: "whatsapp", label: "WhatsApp Templates", icon: MessageSquare },
    { id: "faq", label: "Operator FAQ", icon: HelpCircle },
  ];

  return (
    <AdminLayout>
      <div className="w-full flex flex-col justify-start items-start gap-5 font-['Manrope']">
        {/* Page Header */}
        <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="size-3.5 text-amber-600" />
                Documentation & Manual
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Singapore Maxicabs
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#071E3B] tracking-tight">
              Admin Operations Guide & Walkthrough
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl">
              Complete reference manual for managing daily dispatch routines,
              fleet assignments, automated WhatsApp confirmations, and dynamic
              pricing calculations.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => startTour(0)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#071E3B] hover:bg-[#0B2A4A] text-white text-xs font-bold rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-400" />
              <span>Start Interactive On-Screen Tour</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="self-stretch bg-white rounded-xl border border-stone-200 p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3.5 text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#071E3B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-stone-100"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    isActive ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Card */}
        <div className="self-stretch bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Tour Promotion Banner */}
              <div className="p-6 bg-gradient-to-r from-[#071E3B] via-[#0B2A4A] to-[#123F6B] rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full">
                    <Sparkles className="size-3.5" />
                    Interactive Step-by-Step Walkthrough
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Want an automated tour of the app?
                  </h2>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Click the button to take a 6-step interactive tour that
                    walks you through Dashboard metrics, booking creation,
                    driver dispatch, fleet controls, and pricing rules directly on
                    the live screens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startTour(0)}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  <span>Launch Live Tour Now</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {/* 4 Core Pillars */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#071E3B] uppercase tracking-wider">
                  The Four Operational Pillars
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-all space-y-2">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm">
                      <div className="size-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <CalendarDays className="size-4.5" />
                      </div>
                      <span>1. Bookings & Instant Dispatch</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Capture incoming phone bookings with Google Places address
                      validation, automatic passenger and luggage capacity checks,
                      flight tracking, and seamless status management.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-all space-y-2">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm">
                      <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Car className="size-4.5" />
                      </div>
                      <span>2. Fleet & Driver Roster</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Manage 6, 7, 9, and 13-seater maxicabs. Configure vehicle
                      details, driver profiles, contact numbers, and toggle
                      availability with the Active/Maintenance switch.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-all space-y-2">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm">
                      <div className="size-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <DollarSign className="size-4.5" />
                      </div>
                      <span>3. Dynamic Pricing & 1-Hour Charters</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Set point-to-point flat rates and arrival driveway pickup
                      rates. Enter your 1-Hour Charter base rate, and 3-hour (1hr ×
                      3) and 8-hour (1hr × 8) packages calculate automatically.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-all space-y-2">
                    <div className="flex items-center gap-2.5 text-[#071E3B] font-bold text-sm">
                      <div className="size-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <MessageSquare className="size-4.5" />
                      </div>
                      <span>4. WhatsApp Dispatch Automation</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      1-click WhatsApp web triggers format full trip assignments
                      for drivers and professional confirmation messages for
                      passengers with Singapore country code support (+65).
                    </p>
                  </div>
                </div>
              </div>

              {/* 4-Step Routine */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-[#071E3B]">
                    Standard Dispatch Routine
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="font-bold text-amber-700 block">
                      Step 1: Check Schedule
                    </span>
                    <p className="text-slate-600">
                      Review today's schedule on the Dashboard to see immediate
                      transfers.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="font-bold text-amber-700 block">
                      Step 2: Assign Driver
                    </span>
                    <p className="text-slate-600">
                      Open Bookings and assign an available driver to each
                      pending ride.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="font-bold text-amber-700 block">
                      Step 3: WhatsApp
                    </span>
                    <p className="text-slate-600">
                      Click the green WhatsApp icons to dispatch job sheets in 1
                      click.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="font-bold text-amber-700 block">
                      Step 4: Complete
                    </span>
                    <p className="text-slate-600">
                      Mark trips as "Completed" after drop-off to record live
                      revenue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#071E3B] mb-1">
                  Bookings Lifecycle & Dispatch
                </h2>
                <p className="text-xs text-slate-600">
                  Comprehensive walkthrough of managing rides, address lookups,
                  and capacity checks.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-4">
                  <div className="size-8 rounded-xl bg-[#071E3B] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Creating a Manual Reservation
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Click <strong>"+ New Booking"</strong> on the Bookings page
                      or Dashboard. Enter customer contact info, select date and
                      time, and pick the service type (Point-to-Point, Airport
                      Arrival, Airport Departure, or Hourly Charter).
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-4">
                  <div className="size-8 rounded-xl bg-[#071E3B] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Google Places Autocomplete
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Start typing any Singapore location, hotel, tourist
                      destination, or Changi Airport terminal. The system suggests
                      verified addresses instantly.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-4">
                  <div className="size-8 rounded-xl bg-[#071E3B] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Vehicle Selection & Capacity Validation
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Select your desired vehicle from the fleet list. If the
                      number of passengers or luggage bags exceeds the vehicle’s
                      capacity, an active safety warning prompts you to upgrade
                      to a larger maxicab (e.g. from 7-seater to 9 or 13-seater).
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-4">
                  <div className="size-8 rounded-xl bg-[#071E3B] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Add-on Extras & Real-Time Fare Total
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Add child safety booster seats, extra stopovers, or bulky
                      luggage handling. Fares re-calculate instantly before you
                      confirm the booking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FLEET */}
          {activeTab === "fleet" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#071E3B] mb-1">
                  Fleet & Driver Roster Management
                </h2>
                <p className="text-xs text-slate-600">
                  How to manage your vehicle fleet, driver contact roster, and
                  service status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <h3 className="font-bold text-sm text-[#071E3B] flex items-center gap-2">
                    <Car className="size-4 text-amber-500" />
                    <span>Adding & Editing Vehicles</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Use <strong>"+ Add Vehicle"</strong> or the Edit button on
                    any vehicle card. You can configure:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Fleet Number & Singapore License Plate</li>
                    <li>Vehicle Model & Marketing Name</li>
                    <li>Passenger Capacity & Luggage Capacity</li>
                    <li>Primary Assigned Driver & Contact Number</li>
                    <li>Vehicle Photo Uploads</li>
                  </ul>
                </div>

                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <h3 className="font-bold text-sm text-[#071E3B] flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span>Active vs Maintenance Status</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Every vehicle card has an availability toggle. When toggled
                    to <strong>Inactive</strong> or <strong>Maintenance</strong>:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>The vehicle is excluded from online booking choices</li>
                    <li>Dispatchers see the vehicle marked for service</li>
                    <li>Prevents accidental assignment of cars undergoing repair</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#071E3B] mb-1">
                  Dynamic Pricing & Auto-Calculated Charters
                </h2>
                <p className="text-xs text-slate-600">
                  Detailed guide to the automated 1-hour, 3-hour, and 8-hour
                  charter pricing engine.
                </p>
              </div>

              <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Zap className="size-4 text-amber-600" />
                  <span>The 1-Hour Charter Auto-Calculation Rule</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  To eliminate calculation mistakes and ensure strict pricing
                  integrity across your fleet, the admin portal enforces
                  automated charter calculation:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      1-Hour Charter (Editable)
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Enter your base hourly rate (e.g. $60). This is the master
                      input.
                    </span>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 cursor-not-allowed">
                    <span className="font-bold text-stone-700 block mb-0.5">
                      3-Hour Charter (Locked)
                    </span>
                    <span className="text-stone-600 text-[11px]">
                      Auto-calculated as: <strong>1-Hour × 3</strong> ($180).
                      Locked with cursor-not-allowed.
                    </span>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 cursor-not-allowed">
                    <span className="font-bold text-stone-700 block mb-0.5">
                      8-Hour Charter (Locked)
                    </span>
                    <span className="text-stone-600 text-[11px]">
                      Auto-calculated as: <strong>1-Hour × 8</strong> ($480).
                      Locked with cursor-not-allowed.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">
                    Base Fare (Point-to-Point)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Point-to-point flat transfer rate within mainland Singapore.
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">
                    Arrival Driveway Pickup
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Airport arrival driveway pickup inclusive of flight delay
                    buffer and greeting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WHATSAPP */}
          {activeTab === "whatsapp" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#071E3B] mb-1">
                  Automated WhatsApp Dispatch Formats
                </h2>
                <p className="text-xs text-slate-600">
                  Pre-formatted message templates dispatched with 1 click to
                  drivers and passengers.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#071E3B] flex items-center gap-1.5">
                      <Send className="size-4 text-emerald-600" />
                      <span>Driver Trip Assignment Manifest</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      To Driver
                    </span>
                  </div>
                  <pre className="p-3.5 bg-stone-900 text-emerald-400 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
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

                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#071E3B] flex items-center gap-1.5">
                      <MessageSquare className="size-4 text-emerald-600" />
                      <span>Customer Confirmation</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                      To Passenger
                    </span>
                  </div>
                  <pre className="p-3.5 bg-stone-900 text-amber-300 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
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
          {activeTab === "faq" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#071E3B] mb-1">
                  Operator FAQ & Best Practices
                </h2>
                <p className="text-xs text-slate-600">
                  Quick answers to common questions about operating the admin
                  system.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h3 className="font-bold text-[#071E3B]">
                    Q: Why are the 3-Hour and 8-Hour Charter boxes locked with
                    "cursor not allowed"?
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    A: This is an intentional feature! To prevent calculation
                    errors, the system auto-calculates 3-Hour (1hr × 3) and
                    8-Hour (1hr × 8) rates directly from your 1-Hour Charter
                    input. Simply edit the 1-Hour Charter rate, and the packages
                    update automatically.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h3 className="font-bold text-[#071E3B]">
                    Q: How do WhatsApp notifications work?
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    A: Clicking the green WhatsApp buttons opens WhatsApp Web or
                    the desktop WhatsApp application with the customer's or
                    driver's phone number and the complete, pre-formatted message
                    ready to send.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h3 className="font-bold text-[#071E3B]">
                    Q: What happens if a vehicle is placed under Maintenance?
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    A: Vehicles marked as Maintenance or Inactive are
                    automatically excluded from the booking vehicle selection
                    list, ensuring clients are never assigned a car that is in the
                    workshop.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <h3 className="font-bold text-[#071E3B]">
                    Q: How is live revenue calculated on the Dashboard?
                  </h3>
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
      </div>
    </AdminLayout>
  );
}

