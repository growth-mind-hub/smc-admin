"use client";

import React, { useState, useMemo } from "react";
import { useBookings } from "@/context/BookingContext";
import { useFleet } from "@/context/FleetContext";
import { usePricing } from "@/context/PricingContext";
import { BookingChannel, VehicleCategory, BookingStatus } from "@/types/booking";
import { AdminManualBookingPayload } from "@/types/api";
import {
  X,
  Globe,
  PhoneCall,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Car,
  UserCheck,
} from "lucide-react";
import { WhatsAppIcon } from "@/Shared/Icons";
import PlacesAutocompleteInput from "@/Components/Common/PlacesAutocompleteInput";
import NumericInput from "@/Components/Common/NumericInput";

const SERVICES_CATALOG = [
  {
    id: 1,
    code: "departure_transfer",
    name: "Departure / Point-to-Point Transfer",
    desc: "Standard direct trip between pickup and destination",
    isHourly: false,
  },
  {
    id: 2,
    code: "arrival",
    name: "Airport Arrival (Meet & Greet)",
    desc: "Includes flight monitoring and paging board welcome",
    isHourly: false,
  },
  {
    id: 3,
    code: "hourly",
    name: "Hourly Charter / As-Directed",
    desc: "Flexible charter for business, tours, and hourly bookings",
    isHourly: true,
  },
];

export default function NewBookingModal() {
  const { isNewBookingModalOpen, closeNewBookingModal, createManualBooking, addBooking } =
    useBookings();
  const { vehicles } = useFleet();
  const { addOns: availableAddOns } = usePricing();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("+65 ");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<BookingChannel>("phone");

  // Service & Vehicle
  const [serviceId, setServiceId] = useState<number>(1);
  const [hours, setHours] = useState<number>(8); // default to 8h for hourly
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles[0]?.id || "3"
  );

  // Driver Assignment
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  // Trip Route & Schedule
  const [pickupLocation, setPickupLocation] = useState("Changi Airport Terminal 1");
  const [dropoffLocation, setDropoffLocation] = useState("Marina Bay Sands");
  const [pickupDate, setPickupDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pickupTime, setPickupTime] = useState("10:00");
  const [passengers, setPassengers] = useState(2);
  const [luggageBags, setLuggageBags] = useState(2);

  // Add-ons selection: map of add_on_id -> quantity
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBookingResult, setCreatedBookingResult] = useState<{
    id: string;
    booking_number: string;
    total_amount_minor?: string;
    currency: string;
    driver_name?: string | null;
  } | null>(null);

  // Active Vehicle Object
  const currentVehicle = useMemo(() => {
    return (
      vehicles.find((v) => v.id === selectedVehicleId || String(v.apiId) === selectedVehicleId) ||
      vehicles[0]
    );
  }, [vehicles, selectedVehicleId]);

  // Selected Service Object
  const currentService = useMemo(() => {
    return SERVICES_CATALOG.find((s) => s.id === serviceId) || SERVICES_CATALOG[0];
  }, [serviceId]);

  // Sync default driver when vehicle changes if not custom typed
  const handleSelectVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    const target = vehicles.find((v) => v.id === vId || String(v.apiId) === vId);
    if (target) {
      setDriverName(target.driverName);
      setDriverPhone(target.driverPhone);
    }
  };

  const handleToggleAddon = (addOnId: number) => {
    setSelectedAddons((prev) => {
      const copy = { ...prev };
      if (copy[addOnId]) {
        delete copy[addOnId];
      } else {
        copy[addOnId] = 1;
      }
      return copy;
    });
  };

  const handleAddonQtyChange = (addOnId: number, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[addOnId] || 1;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[addOnId];
        return copy;
      }
      return { ...prev, [addOnId]: next };
    });
  };

  // Estimated fare calculation
  const estimatedFare = useMemo(() => {
    if (!currentVehicle) return 65;
    let base = currentVehicle.baseRate;
    if (currentService.id === 2) {
      base = currentVehicle.baseRate + 10;
    } else if (currentService.id === 3) {
      if (hours === 8 && currentVehicle.prices?.hourly?.eightHourAmount) {
        base = currentVehicle.prices.hourly.eightHourAmount;
      } else {
        base = currentVehicle.hourlyRate * hours;
      }
    }

    let addOnTotal = 0;
    Object.entries(selectedAddons).forEach(([idStr, qty]) => {
      const addon = availableAddOns.find((a) => a.id === Number(idStr));
      if (addon) addOnTotal += addon.price * qty;
    });

    return base + addOnTotal;
  }, [currentVehicle, currentService, hours, selectedAddons, availableAddOns]);

  if (!isNewBookingModalOpen) return null;

  const handleResetAndClose = () => {
    setCreatedBookingResult(null);
    setSubmitError(null);
    closeNewBookingModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!customerName.trim()) {
      setSubmitError("Customer full name is required.");
      return;
    }
    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      setSubmitError("Both pickup and dropoff addresses are required.");
      return;
    }

    const vehicleApiId =
      currentVehicle?.apiId ||
      (!isNaN(Number(currentVehicle?.id)) ? Number(currentVehicle.id) : 3);

    // Format add_ons array as expected by API
    const addOnsPayload = Object.entries(selectedAddons).map(([idStr, qty]) => ({
      add_on_id: Number(idStr),
      quantity: qty,
    }));

    const payload: AdminManualBookingPayload = {
      customer: {
        name: customerName.trim(),
        email: email.trim() || "customer@example.com",
        phone: phone.trim() || "+65 9123 4567",
      },
      vehicle_id: vehicleApiId,
      service_id: currentService.id,
      pickup: { address: pickupLocation.trim() },
      drop: { address: dropoffLocation.trim() },
      add_ons: addOnsPayload,
      driver_name: driverName.trim() || undefined,
      driver_phone: driverPhone.trim() || undefined,
      hours: currentService.isHourly ? Number(hours) : undefined,
    };

    try {
      setIsSubmitting(true);
      const res = await createManualBooking(payload, {
        vehicleName: currentVehicle?.name || `Vehicle #${vehicleApiId}`,
        pickupDate,
        pickupTime,
        serviceName: currentService.name,
      });

      if (res.success && res.booking) {
        setCreatedBookingResult({
          id: res.booking.id,
          booking_number: res.booking.booking_number,
          total_amount_minor: res.booking.total_amount_minor,
          currency: res.booking.currency || "SGD",
          driver_name: res.booking.driver_name,
        });
      } else {
        // Fallback local booking creation if live API gave a non-blocking error
        addBooking({
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim() || "customer@example.com",
          channel,
          serviceType: "airport_transfer",
          vehicleType: (currentVehicle?.category || "7_seater") as VehicleCategory,
          vehicleName: currentVehicle?.name || "Maxi Cab",
          pickupLocation,
          dropoffLocation,
          pickupDate,
          pickupTime,
          passengers: Number(passengers),
          luggageBags: Number(luggageBags),
          fare: estimatedFare,
          status: "confirmed" as BookingStatus,
          driverAssigned: driverName
            ? {
                name: driverName,
                phone: driverPhone || "",
                vehiclePlate: currentVehicle?.plateNumber || "SMC-001",
              }
            : undefined,
        });

        if (res.error) {
          setSubmitError(
            `Notice: ${res.error}. Booking was added to local administration records.`
          );
        } else {
          handleResetAndClose();
        }
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to create manual booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div
        className="w-full max-w-[620px] max-h-[92vh] bg-color-background-white rounded-2xl shadow-2xl flex flex-col justify-start items-start overflow-hidden font-['Manrope']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="self-stretch px-6 py-4 bg-color-background-brand border-b border-color-border-subtle inline-flex justify-between items-center flex-shrink-0">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-orange-400 text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-widest">
                Admin Panel · Manual Entry
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-text-inverse text-base font-bold font-['Manrope'] leading-6">
                Create New Booking
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="size-8 flex justify-center items-center text-white/60 hover:text-white cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {createdBookingResult ? (
          <div className="self-stretch flex-1 p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-in zoom-in">
              <CheckCircle2 className="size-10" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-900">
                Manual Booking Confirmed!
              </h3>
              <p className="text-xs text-slate-600">
                Booking reference has been issued and stored in the database.
              </p>
            </div>

            <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Booking Number:</span>
                <span className="font-mono font-bold text-amber-600 text-sm">
                  {createdBookingResult.booking_number}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment Mode:</span>
                <span className="font-semibold text-slate-900">MANUAL (Admin)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Amount:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {createdBookingResult.total_amount_minor
                    ? `$${Number(createdBookingResult.total_amount_minor) / 100} ${createdBookingResult.currency}`
                    : `$${estimatedFare} SGD`}
                </span>
              </div>
              {createdBookingResult.driver_name && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Assigned Driver:</span>
                  <span className="font-semibold text-slate-900">
                    {createdBookingResult.driver_name}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-2 px-8 py-2.5 bg-color-background-accent text-slate-950 font-bold rounded-lg text-xs hover:brightness-105 transition-all cursor-pointer shadow-xs"
            >
              Done &amp; View Bookings
            </button>
          </div>
        ) : (
          /* Scrollable Form Body */
          <form
            onSubmit={handleSubmit}
            className="self-stretch flex-1 px-6 py-5 flex flex-col justify-start items-start gap-5 overflow-y-auto"
          >
            {/* Error Banner */}
            {submitError && (
              <div className="self-stretch p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{submitError}</div>
              </div>
            )}

            {/* Section 1: Customer Information */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                1. Customer Details
              </div>
              <div className="self-stretch pt-2.5 flex flex-col justify-start items-start gap-3">
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full h-10 px-3 py-2 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+65 9123 4567"
                      className="w-full h-10 px-3 py-2 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full h-10 px-3 py-2 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Channel Pill Selection */}
                <div className="self-stretch flex flex-col gap-1">
                  <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                    Booking Channel
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "phone" as BookingChannel, label: "Phone", icon: PhoneCall },
                      { id: "whatsapp" as BookingChannel, label: "WhatsApp", icon: WhatsAppIcon },
                      { id: "website" as BookingChannel, label: "Website", icon: Globe },
                      { id: "email" as BookingChannel, label: "Email", icon: Mail },
                    ].map((ch) => {
                      const Icon = ch.icon;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setChannel(ch.id)}
                          className={`py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            channel === ch.id
                              ? "bg-stone-900 text-white border-stone-900"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <Icon className="size-3.5" />
                          <span>{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Service Category & Duration */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                2. Select Service
              </div>
              <div className="self-stretch pt-2.5 flex flex-col gap-2">
                {SERVICES_CATALOG.map((svc) => {
                  const isSelected = serviceId === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => setServiceId(svc.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-50/50 border-amber-500 ring-1 ring-amber-500/50"
                          : "bg-white border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">
                          {svc.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {svc.desc}
                        </span>
                      </div>
                      <div className="size-4 rounded-full border flex items-center justify-center border-stone-300">
                        {isSelected && (
                          <div className="size-2 rounded-full bg-amber-600" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* If Hourly Charter selected: Hours Package Selection */}
                {currentService.isHourly && (
                  <div className="mt-1 p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col gap-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="size-3.5 text-amber-600" />
                        <span>Charter Duration (Hours)</span>
                      </label>
                      <span className="text-xs font-bold text-amber-600">
                        {hours === 8 ? "8-Hour Package Special" : `${hours} Hours`}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[3, 4, 6, 8].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHours(h)}
                          className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            hours === h
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white border-stone-300 text-slate-700 hover:bg-stone-100"
                          }`}
                        >
                          {h === 8 ? "8 hrs (Day)" : `${h} hrs`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Vehicle Selection */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                3. Vehicle Selection
              </div>
              <div className="self-stretch pt-2.5 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {vehicles
                  .filter((v) => v.status === "active")
                  .map((v) => {
                    const isSelected =
                      selectedVehicleId === v.id || String(v.apiId) === selectedVehicleId;
                    const fareDisplay =
                      currentService.id === 3
                        ? hours === 8 && v.prices?.hourly?.eightHourAmount
                          ? v.prices.hourly.eightHourAmount
                          : v.hourlyRate * hours
                        : currentService.id === 2
                        ? v.baseRate + 10
                        : v.baseRate;

                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVehicle(v.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-50/60 border-amber-500 ring-1 ring-amber-500"
                            : "bg-white border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] font-bold text-slate-700">
                              {v.fleetNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {v.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 pt-0.5">
                            {v.paxCapacity} pax · {v.luggageCapacity} bags · {v.model}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 pl-3">
                          <span className="text-xs font-bold text-orange-400">
                            ${fareDisplay}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {currentService.isHourly ? `${hours}h total` : "trip"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Section 4: Trip Locations & Schedule */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                4. Trip Route &amp; Schedule
              </div>
              <div className="self-stretch pt-2.5 flex flex-col gap-3">
                <PlacesAutocompleteInput
                  label="Pickup Address *"
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  placeholder="e.g. Changi Airport Terminal 1"
                />

                <PlacesAutocompleteInput
                  label="Dropoff Address *"
                  value={dropoffLocation}
                  onChange={setDropoffLocation}
                  placeholder="e.g. Marina Bay Sands"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as HTMLInputElement).showPicker?.();
                        } catch {}
                      }}
                      className="w-full h-10 px-3 py-2 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as HTMLInputElement).showPicker?.();
                        } catch {}
                      }}
                      className="w-full h-10 px-3 py-2 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Passengers
                    </label>
                    <NumericInput
                      min={1}
                      max={100}
                      value={passengers}
                      onChange={setPassengers}
                      className="w-full h-10 px-3 py-2 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Luggage Bags
                    </label>
                    <NumericInput
                      min={0}
                      max={100}
                      value={luggageBags}
                      onChange={setLuggageBags}
                      className="w-full h-10 px-3 py-2 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-slate-900 font-normal focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Add-ons & Extras */}
            {availableAddOns && availableAddOns.length > 0 && (
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                  5. Add-Ons &amp; Extras
                </div>
                <div className="self-stretch pt-2.5 flex flex-col gap-2">
                  {availableAddOns
                    .filter((a) => a.status === "ACTIVE")
                    .map((addon) => {
                      const isSelected = Boolean(selectedAddons[addon.id]);
                      const qty = selectedAddons[addon.id] || 0;

                      return (
                        <div
                          key={addon.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-amber-50/50 border-amber-400"
                              : "bg-white border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          <div
                            onClick={() => handleToggleAddon(addon.id)}
                            className="flex-1 flex items-center gap-2.5 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleAddon(addon.id)}
                              className="size-4 accent-amber-600 rounded cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-slate-900">
                                {addon.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                +${addon.price} SGD · {addon.pricing_type}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                type="button"
                                onClick={() => handleAddonQtyChange(addon.id, -1)}
                                className="size-6 rounded-md bg-stone-200 text-slate-800 font-bold flex items-center justify-center hover:bg-stone-300 cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-slate-900">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddonQtyChange(addon.id, 1)}
                                className="size-6 rounded-md bg-stone-200 text-slate-800 font-bold flex items-center justify-center hover:bg-stone-300 cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Section 6: Driver Details (Optional) */}
            <div className="self-stretch p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <UserCheck className="size-3.5 text-slate-700" />
                <span>Assigned Driver (Optional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver Name (e.g. Ahmad Rizal)"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="Driver Phone (e.g. +65 9123 4567)"
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="self-stretch -mx-6 -mb-5 px-6 py-4 bg-stone-100 border-t border-color-border-subtle inline-flex justify-between items-center flex-shrink-0 mt-2">
              <div className="inline-flex flex-col justify-start items-start">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  Backend Calculated Estimate
                </div>
                <div className="justify-start text-orange-400 text-xl font-bold font-['Manrope'] leading-8">
                  ${estimatedFare} SGD
                </div>
              </div>
              <div className="flex justify-start items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-color-input-placeholder text-xs font-semibold font-['Manrope'] leading-5 hover:bg-stone-200/50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-color-background-accent rounded-lg text-slate-950 font-bold text-xs font-['Manrope'] leading-5 hover:brightness-105 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting to API..." : "Create Manual Booking"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
