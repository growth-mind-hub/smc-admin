"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useBookings } from "@/context/BookingContext";
import { useFleet } from "@/context/FleetContext";
import { usePricing } from "@/context/PricingContext";
import { BookingChannel } from "@/types/booking";
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
  AlertTriangle,
} from "lucide-react";
import { WhatsAppIcon } from "@/Shared/Icons";
import PlacesAutocompleteInput from "@/Components/Common/PlacesAutocompleteInput";

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
    name: "Airport Arrival (Driveway Pickup)",
    desc: "Terminal curb-side arrival pickup with flight monitoring (select Meet & Greet add-on below for paging board welcome)",
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
  const { isNewBookingModalOpen, closeNewBookingModal, createManualBooking } =
    useBookings();
  const { vehicles } = useFleet();
  const { addOns: availableAddOns } = usePricing();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<BookingChannel | "">("");

  // Service & Vehicle
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  // Driver Assignment
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  // Trip Route & Schedule
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [passengers, setPassengers] = useState<number | "">("");
  const [luggageBags, setLuggageBags] = useState<number | "">("");

  // Add-ons selection: map of add_on_id -> quantity
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});

  // Field Touched Tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

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
    if (!selectedVehicleId) return null;
    return (
      vehicles.find((v) => v.id === selectedVehicleId || String(v.apiId) === selectedVehicleId) ||
      null
    );
  }, [vehicles, selectedVehicleId]);

  // Selected Service Object
  const currentService = useMemo(() => {
    if (!serviceId) return null;
    return SERVICES_CATALOG.find((s) => s.id === serviceId) || null;
  }, [serviceId]);

  // Vehicle selection (no auto-filling driver details - user may enter their own)
  const handleSelectVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    if (submitError) setSubmitError(null);
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
    if (!currentVehicle || !currentService) return 0;
    let base = currentVehicle.baseRate;
    if (currentService.id === 2) {
      base = currentVehicle.baseRate + 10;
    } else if (currentService.id === 3) {
      const h = hours || 3;
      if (h === 8 && currentVehicle.prices?.hourly?.eightHourAmount) {
        base = currentVehicle.prices.hourly.eightHourAmount;
      } else {
        base = currentVehicle.hourlyRate * h;
      }
    }

    let addOnTotal = 0;
    Object.entries(selectedAddons).forEach(([idStr, qty]) => {
      const addon = availableAddOns.find((a) => a.id === Number(idStr));
      if (addon) addOnTotal += addon.price * qty;
    });

    return base + addOnTotal;
  }, [currentVehicle, currentService, hours, selectedAddons, availableAddOns]);

  // Comprehensive Form Validation Logic
  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Customer Name
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      errs.customerName = "Customer full name is required";
    } else if (trimmedName.length < 2) {
      errs.customerName = "Customer name must be at least 2 characters";
    }

    // Phone Validation
    const rawDigits = phone.replace(/[^0-9]/g, "");
    if (!rawDigits) {
      errs.phone = "Phone number is required";
    } else if (rawDigits.length < 7) {
      errs.phone = "Phone number must have at least 7 digits";
    } else if (rawDigits.length > 15) {
      errs.phone = "Phone number cannot exceed 15 digits";
    }

    // Email Validation (optional, but if provided must match pattern)
    if (email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        errs.email = "Please enter a valid email address";
      }
    }

    // Channel Validation
    if (!channel) {
      errs.channel = "Please select a booking channel";
    }

    // Service Selection
    if (!serviceId) {
      errs.serviceId = "Please select a service type";
    }

    // Vehicle Selection
    if (!selectedVehicleId) {
      errs.selectedVehicleId = "Please select a vehicle";
    }

    // Pickup & Dropoff Addresses
    if (!pickupLocation.trim()) {
      errs.pickupLocation = "Pickup address is required";
    }
    if (!dropoffLocation.trim()) {
      errs.dropoffLocation = "Dropoff address is required";
    } else if (
      pickupLocation.trim() &&
      dropoffLocation.trim() &&
      pickupLocation.trim().toLowerCase() === dropoffLocation.trim().toLowerCase()
    ) {
      errs.dropoffLocation = "Dropoff address cannot be identical to pickup address";
    }

    // Date Validation (cannot book in the past)
    if (!pickupDate) {
      errs.pickupDate = "Pickup date is required";
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (pickupDate < today) {
        errs.pickupDate = "Pickup date cannot be in the past";
      }
    }

    // Time Validation
    if (!pickupTime) {
      errs.pickupTime = "Pickup time is required";
    }

    // Passenger Capacity Check
    if (passengers === "" || Number(passengers) < 1) {
      errs.passengers = "Passenger count is required (min 1)";
    } else if (currentVehicle?.paxCapacity && Number(passengers) > currentVehicle.paxCapacity) {
      errs.passengers = `Exceeds vehicle capacity (${currentVehicle.paxCapacity} pax)`;
    }

    // Luggage Capacity Check
    if (luggageBags !== "" && Number(luggageBags) < 0) {
      errs.luggageBags = "Luggage count cannot be negative";
    } else if (
      luggageBags !== "" &&
      currentVehicle?.luggageCapacity &&
      Number(luggageBags) > currentVehicle.luggageCapacity
    ) {
      errs.luggageBags = `Exceeds vehicle capacity (${currentVehicle.luggageCapacity} bags)`;
    }

    // Driver Phone Check if entered
    if (driverPhone.trim()) {
      const dDigits = driverPhone.replace(/[^0-9]/g, "");
      if (dDigits.length > 0 && dDigits.length < 7) {
        errs.driverPhone = "Driver phone must have at least 7 digits";
      }
    }

    // Hourly Duration Check
    if (currentService?.isHourly && (!hours || hours < 1 || hours > 24)) {
      errs.hours = "Charter duration must be between 1 and 24 hours";
    }

    return errs;
  }, [
    customerName,
    phone,
    email,
    channel,
    serviceId,
    selectedVehicleId,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    pickupTime,
    passengers,
    luggageBags,
    currentVehicle,
    driverPhone,
    currentService,
    hours,
  ]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  const handleResetAndClose = useCallback(() => {
    setCustomerName("");
    setPhone("");
    setEmail("");
    setChannel("");
    setServiceId(null);
    setHours(null);
    setSelectedVehicleId("");
    setDriverName("");
    setDriverPhone("");
    setPickupLocation("");
    setDropoffLocation("");
    setPickupDate("");
    setPickupTime("");
    setPassengers("");
    setLuggageBags("");
    setSelectedAddons({});
    setCreatedBookingResult(null);
    setSubmitError(null);
    setTouched({});
    closeNewBookingModal();
  }, [closeNewBookingModal]);

  // Reset form to blank on every modal open
  useEffect(() => {
    if (isNewBookingModalOpen) {
      setCustomerName("");
      setPhone("");
      setEmail("");
      setChannel("");
      setServiceId(null);
      setHours(null);
      setSelectedVehicleId("");
      setDriverName("");
      setDriverPhone("");
      setPickupLocation("");
      setDropoffLocation("");
      setPickupDate("");
      setPickupTime("");
      setPassengers("");
      setLuggageBags("");
      setSelectedAddons({});
      setCreatedBookingResult(null);
      setSubmitError(null);
      setTouched({});
    }
  }, [isNewBookingModalOpen]);

  // Lock background scrolling and handle Escape key when modal is open
  useEffect(() => {
    if (!isNewBookingModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleResetAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNewBookingModalOpen, handleResetAndClose]);

  if (!isNewBookingModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all fields as touched to display errors immediately
    const allTouched: Record<string, boolean> = {
      customerName: true,
      phone: true,
      email: true,
      channel: true,
      serviceId: true,
      selectedVehicleId: true,
      pickupLocation: true,
      dropoffLocation: true,
      pickupDate: true,
      pickupTime: true,
      passengers: true,
      luggageBags: true,
      driverPhone: true,
      hours: true,
    };
    setTouched(allTouched);

    if (hasErrors || !currentVehicle || !currentService) {
      const firstErrorMessage =
        Object.values(validationErrors)[0] ||
        (!currentService
          ? "Please select a service type"
          : !currentVehicle
          ? "Please select a vehicle"
          : "Please correct the highlighted form errors before proceeding.");
      setSubmitError(firstErrorMessage);
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

    // Normalize phone number to start with + and strip spaces/symbols as required by backend contract
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    const formattedPhone = phone.trim().startsWith("+")
      ? `+${digitsOnly}`
      : `+65${digitsOnly}`;

    const payload: AdminManualBookingPayload = {
      customer: {
        name: customerName.trim(),
        email: email.trim() || "customer@example.com",
        phone: formattedPhone.length >= 8 ? formattedPhone : "+6591234567",
      },
      vehicle_id: vehicleApiId,
      service_id: currentService.id,
      pickup: { address: pickupLocation.trim() },
      drop: { address: dropoffLocation.trim() },
      add_ons: addOnsPayload,
      driver_name: driverName.trim() || undefined,
      driver_phone: driverPhone.trim()
        ? driverPhone.trim().startsWith("+")
          ? driverPhone.trim()
          : `+65${driverPhone.replace(/[^0-9]/g, "")}`
        : undefined,
      hours: currentService.isHourly ? Number(hours || 3) : undefined,
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
        setSubmitError(
          res.error || "Could not save booking to the backend database."
        );
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
            noValidate
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
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (submitError) setSubmitError(null);
                    }}
                    onBlur={() => markTouched("customerName")}
                    placeholder="Enter customer full name"
                    className={`w-full h-10 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal focus:outline-none transition-all ${
                      touched.customerName && validationErrors.customerName
                        ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                        : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                    }`}
                  />
                  {touched.customerName && validationErrors.customerName && (
                    <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                      <AlertCircle className="size-3 flex-shrink-0" />
                      <span>{validationErrors.customerName}</span>
                    </p>
                  )}
                </div>

                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (submitError) setSubmitError(null);
                      }}
                      onBlur={() => markTouched("phone")}
                      placeholder="Enter phone number"
                      className={`w-full h-10 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal focus:outline-none transition-all ${
                        touched.phone && validationErrors.phone
                          ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                          : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {touched.phone && validationErrors.phone && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                        <AlertCircle className="size-3 flex-shrink-0" />
                        <span>{validationErrors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-start items-start gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Email Address <span className="text-stone-400 text-[10px] normal-case">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (submitError) setSubmitError(null);
                      }}
                      onBlur={() => markTouched("email")}
                      placeholder="Enter email address (optional)"
                      className={`w-full h-10 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal focus:outline-none transition-all ${
                        touched.email && validationErrors.email
                          ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                          : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {touched.email && validationErrors.email && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                        <AlertCircle className="size-3 flex-shrink-0" />
                        <span>{validationErrors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Channel Pill Selection */}
                <div className="self-stretch flex flex-col gap-1">
                  <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                    Booking Channel <span className="text-red-500">*</span>
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
                          onClick={() => {
                            setChannel(ch.id);
                            if (submitError) setSubmitError(null);
                          }}
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
                  {touched.channel && validationErrors.channel && (
                    <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                      <AlertCircle className="size-3 flex-shrink-0" />
                      <span>{validationErrors.channel}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Service Category & Duration */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                2. Select Service <span className="text-red-500">*</span>
              </div>
              <div className="self-stretch pt-2.5 flex flex-col gap-2">
                {SERVICES_CATALOG.map((svc) => {
                  const isSelected = serviceId === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => {
                        setServiceId(svc.id);
                        if (svc.id === 3 && !hours) setHours(3);
                        if (submitError) setSubmitError(null);
                      }}
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
                {currentService?.isHourly && (
                  <div className="mt-1 p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col gap-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="size-3.5 text-amber-600" />
                        <span>Charter Duration (Hours)</span>
                      </label>
                      <span className="text-xs font-bold text-amber-600">
                        {hours === 8 ? "8-Hour Package Special" : `${hours || 3} Hours`}
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
                    {touched.hours && validationErrors.hours && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="size-3" />
                        <span>{validationErrors.hours}</span>
                      </p>
                    )}
                  </div>
                )}
                {touched.serviceId && validationErrors.serviceId && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.serviceId}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Vehicle Selection */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                3. Vehicle Selection <span className="text-red-500">*</span>
              </div>
              <div className="self-stretch pt-2.5 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {vehicles
                  .filter((v) => v.status === "active")
                  .map((v) => {
                    const isSelected =
                      Boolean(selectedVehicleId) &&
                      (selectedVehicleId === v.id || String(v.apiId) === selectedVehicleId);
                    const fareDisplay =
                      currentService?.id === 3
                        ? (hours || 3) === 8 && v.prices?.hourly?.eightHourAmount
                          ? v.prices.hourly.eightHourAmount
                          : v.hourlyRate * (hours || 3)
                        : currentService?.id === 2
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
                            {currentService?.isHourly ? `${hours || 3}h total` : "trip"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {touched.selectedVehicleId && validationErrors.selectedVehicleId && (
                <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertCircle className="size-3 flex-shrink-0" />
                  <span>{validationErrors.selectedVehicleId}</span>
                </p>
              )}
            </div>

            {/* Section 4: Trip Locations & Schedule */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                4. Trip Route &amp; Schedule
              </div>
              <div className="self-stretch pt-2.5 flex flex-col gap-3">
                <PlacesAutocompleteInput
                  label="Pickup Address"
                  required
                  value={pickupLocation}
                  onChange={(val) => {
                    setPickupLocation(val);
                    if (submitError) setSubmitError(null);
                  }}
                  onBlur={() => markTouched("pickupLocation")}
                  error={touched.pickupLocation ? validationErrors.pickupLocation : undefined}
                  placeholder="Enter pickup address"
                />

                <PlacesAutocompleteInput
                  label="Dropoff Address"
                  required
                  value={dropoffLocation}
                  onChange={(val) => {
                    setDropoffLocation(val);
                    if (submitError) setSubmitError(null);
                  }}
                  onBlur={() => markTouched("dropoffLocation")}
                  error={touched.dropoffLocation ? validationErrors.dropoffLocation : undefined}
                  placeholder="Enter dropoff address"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        if (submitError) setSubmitError(null);
                      }}
                      onBlur={() => markTouched("pickupDate")}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as HTMLInputElement).showPicker?.();
                        } catch {}
                      }}
                      className={`w-full h-10 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal focus:outline-none cursor-pointer transition-all ${
                        touched.pickupDate && validationErrors.pickupDate
                          ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                          : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {touched.pickupDate && validationErrors.pickupDate && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                        <AlertCircle className="size-3 flex-shrink-0" />
                        <span>{validationErrors.pickupDate}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                      Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => {
                        setPickupTime(e.target.value);
                        if (submitError) setSubmitError(null);
                      }}
                      onBlur={() => markTouched("pickupTime")}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as HTMLInputElement).showPicker?.();
                        } catch {}
                      }}
                      className={`w-full h-10 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal focus:outline-none cursor-pointer transition-all ${
                        touched.pickupTime && validationErrors.pickupTime
                          ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                          : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {touched.pickupTime && validationErrors.pickupTime && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                        <AlertCircle className="size-3 flex-shrink-0" />
                        <span>{validationErrors.pickupTime}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                        Passengers <span className="text-red-500">*</span>
                      </label>
                      {currentVehicle && (
                        <span className="text-[10px] text-slate-400">
                          Max: {currentVehicle.paxCapacity}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={currentVehicle?.paxCapacity || 100}
                      value={passengers}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPassengers(val === "" ? "" : Number(val));
                        if (submitError) setSubmitError(null);
                      }}
                      onBlur={() => markTouched("passengers")}
                      placeholder="Enter passenger count"
                      className={`w-full h-10 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal focus:outline-none transition-all ${
                        touched.passengers && validationErrors.passengers
                          ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                          : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {touched.passengers && validationErrors.passengers && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                        <AlertTriangle className="size-3 flex-shrink-0" />
                        <span>{validationErrors.passengers}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                        Luggage Bags
                      </label>
                      {currentVehicle && (
                        <span className="text-[10px] text-slate-400">
                          Max: {currentVehicle.luggageCapacity}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={currentVehicle?.luggageCapacity || 100}
                      value={luggageBags}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLuggageBags(val === "" ? "" : Number(val));
                        if (submitError) setSubmitError(null);
                      }}
                      onBlur={() => markTouched("luggageBags")}
                      placeholder="Enter luggage count"
                      className={`w-full h-10 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal focus:outline-none transition-all ${
                        touched.luggageBags && validationErrors.luggageBags
                          ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                          : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {touched.luggageBags && validationErrors.luggageBags && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                        <AlertTriangle className="size-3 flex-shrink-0" />
                        <span>{validationErrors.luggageBags}</span>
                      </p>
                    )}
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
                      const isMeetGreet =
                        addon.code === "MEET_GREET" ||
                        (addon.code || "").toUpperCase().includes("MEET") ||
                        (addon.name || "").toLowerCase().includes("driveway");
                      const displayName = isMeetGreet
                        ? "Meet & Greet"
                        : addon.name;

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
                                {displayName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                +${addon.price} SGD · {addon.pricing_type}
                                {isMeetGreet ? " · Inside terminal welcome with name board" : ""}
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
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter driver name (optional)"
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => {
                      setDriverPhone(e.target.value);
                      if (submitError) setSubmitError(null);
                    }}
                    onBlur={() => markTouched("driverPhone")}
                    placeholder="Enter driver phone (optional)"
                    className={`w-full h-9 px-3 bg-white rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                      touched.driverPhone && validationErrors.driverPhone
                        ? "border border-red-400 focus:ring-1 focus:ring-red-400"
                        : "border border-slate-300 focus:ring-1 focus:ring-amber-500"
                    }`}
                  />
                  {touched.driverPhone && validationErrors.driverPhone && (
                    <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="size-3 flex-shrink-0" />
                      <span>{validationErrors.driverPhone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="self-stretch -mx-6 -mb-5 px-6 py-4 bg-stone-100 border-t border-color-border-subtle inline-flex justify-between items-center flex-shrink-0 mt-2">
              <div className="inline-flex flex-col justify-start items-start">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  Backend Calculated Estimate
                </div>
                <div className="justify-start text-orange-400 text-xl font-bold font-['Manrope'] leading-8">
                  {estimatedFare > 0 ? `$${estimatedFare} SGD` : "—"}
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
