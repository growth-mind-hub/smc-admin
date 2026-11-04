"use client";

import React, { useState, useRef, useMemo } from "react";
import { useFleet } from "@/context/FleetContext";
import { VehicleStatus } from "@/types/fleet";
import { X, AlertCircle } from "lucide-react";
import NumericInput from "@/Components/Common/NumericInput";

export default function AddVehicleModal() {
  const { isAddVehicleModalOpen, closeAddVehicleModal, addVehicle, totalVehiclesCount } =
    useFleet();

  const [fleetNumber, setFleetNumber] = useState(`SMC-00${totalVehiclesCount + 1}`);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("+65 ");
  const [paxCapacity, setPaxCapacity] = useState(6);
  const [luggageCapacity, setLuggageCapacity] = useState(4);
  const [baseFare, setBaseFare] = useState(65);
  const [meetAndGreet, setMeetAndGreet] = useState(75);
  const [charter3h, setCharter3h] = useState(180);
  const [charter8h, setCharter8h] = useState(480);
  const [isActive, setIsActive] = useState(true);

  // Validation & Submit State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Field Validation Rules
  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Fleet Number
    const trimmedFleet = fleetNumber.trim();
    if (!trimmedFleet) {
      errs.fleetNumber = "Fleet number is required (e.g. SMC-007)";
    } else if (trimmedFleet.length < 3) {
      errs.fleetNumber = "Fleet number must be at least 3 characters";
    }

    // Vehicle Name
    const trimmedName = name.trim();
    if (!trimmedName) {
      errs.name = "Vehicle name is required (e.g. 6 Seater Maxi Cab)";
    } else if (trimmedName.length < 3) {
      errs.name = "Vehicle name must be at least 3 characters";
    }

    // Model / Subtitle
    const trimmedModel = model.trim();
    if (!trimmedModel) {
      errs.model = "Vehicle model/make is required (e.g. Toyota Vellfire / Alphard)";
    }

    // Capacity checks
    if (paxCapacity < 1 || paxCapacity > 100) {
      errs.paxCapacity = "Passenger capacity must be between 1 and 100";
    }
    if (luggageCapacity < 0 || luggageCapacity > 100) {
      errs.luggageCapacity = "Luggage capacity must be between 0 and 100";
    }

    // Pricing checks
    if (baseFare <= 0) {
      errs.baseFare = "Base fare must be at least $1 SGD";
    }
    if (meetAndGreet < baseFare) {
      errs.meetAndGreet = "Meet & Greet rate should typically be equal to or greater than base fare";
    }
    if (charter3h <= 0) {
      errs.charter3h = "3-Hour charter rate must be at least $1 SGD";
    }
    if (charter8h <= charter3h) {
      errs.charter8h = "8-Hour charter rate must be greater than 3-Hour charter rate";
    }

    // Driver Phone check if entered
    if (driverPhone.trim()) {
      const dDigits = driverPhone.replace(/[^0-9]/g, "");
      if (dDigits.length > 0 && dDigits.length < 7) {
        errs.driverPhone = "Driver phone must have at least 7 digits";
      }
    }

    return errs;
  }, [
    fleetNumber,
    name,
    model,
    paxCapacity,
    luggageCapacity,
    baseFare,
    meetAndGreet,
    charter3h,
    charter8h,
    driverPhone,
  ]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  if (!isAddVehicleModalOpen) return null;

  const handleClose = () => {
    setSubmitError(null);
    setTouched({});
    closeAddVehicleModal();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setImageError("Only PNG, JPG, or WEBP images are supported");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setImageError("Image size must be under 2MB");
        return;
      }
      setImageError(null);
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all fields touched
    const allTouched: Record<string, boolean> = {
      fleetNumber: true,
      name: true,
      model: true,
      paxCapacity: true,
      luggageCapacity: true,
      baseFare: true,
      meetAndGreet: true,
      charter3h: true,
      charter8h: true,
      driverPhone: true,
    };
    setTouched(allTouched);

    if (hasErrors) {
      const firstErrorMessage = Object.values(validationErrors)[0];
      setSubmitError(
        firstErrorMessage || "Please correct the highlighted form errors before proceeding."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await addVehicle({
        fleetNumber: fleetNumber.trim() || `SMC-00${totalVehiclesCount + 1}`,
        name: name.trim(),
        model: model.trim() || "Toyota Vellfire / Alphard",
        description: description.trim(),
        category: "6_seater",
        plateNumber: "SHA 1234 X",
        paxCapacity: Number(paxCapacity),
        luggageCapacity: Number(luggageCapacity),
        baseRate: Number(baseFare),
        hourlyRate: Math.round(Number(charter8h) / 8),
        driverName: driverName.trim() || "Unassigned",
        driverPhone: driverPhone.trim() || "+65 9000 0000",
        status: (isActive ? "active" : "inactive") as VehicleStatus,
        features: ["Luggage Space", "Air Conditioning", "Executive Seating"],
        imageFile: selectedFile,
      } as any);

      handleClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to create vehicle in fleet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-color-overlay-hero flex justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-[520px] max-h-[90vh] bg-color-background-white rounded-2xl shadow-2xl flex flex-col justify-start items-start overflow-hidden font-['Manrope']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="self-stretch px-6 py-4 border-b border-color-border-subtle inline-flex justify-between items-center flex-shrink-0">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-start text-color-text-primary text-base font-bold font-['Manrope'] leading-6">
              Add New Vehicle
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="size-8 rounded-lg flex justify-center items-center text-gray-500 hover:text-gray-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="self-stretch flex-1 px-6 py-5 flex flex-col justify-start items-start gap-5 overflow-y-auto"
        >
          {/* Top Error Banner */}
          {submitError && (
            <div className="self-stretch p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{submitError}</div>
            </div>
          )}

          {/* Vehicle Identity */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                Vehicle Identity
              </div>
            </div>
            <div className="self-stretch pt-3 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Fleet Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fleetNumber}
                  onChange={(e) => {
                    setFleetNumber(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  onBlur={() => markTouched("fleetNumber")}
                  placeholder="e.g. SMC-007"
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none transition-all ${
                    touched.fleetNumber && validationErrors.fleetNumber
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.fleetNumber && validationErrors.fleetNumber && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.fleetNumber}</span>
                  </p>
                )}
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Vehicle Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  onBlur={() => markTouched("name")}
                  placeholder="e.g. 6 Seater Maxi Cab"
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none transition-all ${
                    touched.name && validationErrors.name
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.name && validationErrors.name && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.name}</span>
                  </p>
                )}
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Subtitle / Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  onBlur={() => markTouched("model")}
                  placeholder="e.g. Toyota Vellfire / Alphard"
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none transition-all ${
                    touched.model && validationErrors.model
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.model && validationErrors.model && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.model}</span>
                  </p>
                )}
              </div>

              {/* Description (max 1000 characters) */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch flex justify-between items-center">
                  <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                    Vehicle Description
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {description.length} / 1000
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                  placeholder="The Toyota Alphard / Vellfire is an executive MPV for families and small groups... (max 1000 chars)"
                  rows={3}
                  className="self-stretch p-3 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Vehicle Photo Selection */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2 pt-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Vehicle Photo <span className="text-stone-400 text-[10px] normal-case">(Optional)</span>
                </label>

                <div className="self-stretch h-32 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 flex items-center justify-center">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Vehicle Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                      <svg className="size-7 text-amber-400/80 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-300">Choose vehicle photo</span>
                      <span className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 2MB</span>
                    </div>
                  )}

                  {selectedFile && (
                    <div className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                {imageError && (
                  <p className="text-rose-600 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    <span>{imageError}</span>
                  </p>
                )}

                <div className="self-stretch flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-9 px-3 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold rounded-lg border border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {selectedFile ? "Change Selection" : "Select Photo File"}
                  </button>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreviewUrl(null);
                        setImageError(null);
                      }}
                      className="h-9 px-3 bg-stone-100 hover:bg-stone-200 text-slate-600 text-xs font-semibold rounded-lg border border-stone-300 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Driver */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                Assigned Driver <span className="text-stone-400 text-[10px] normal-case">(Optional)</span>
              </div>
            </div>
            <div className="self-stretch pt-3 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Ahmad Rizal"
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Driver Phone
                </label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => {
                    setDriverPhone(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  onBlur={() => markTouched("driverPhone")}
                  placeholder="+65 9101 1234"
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none transition-all ${
                    touched.driverPhone && validationErrors.driverPhone
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.driverPhone && validationErrors.driverPhone && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.driverPhone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                Capacity
              </div>
            </div>
            <div className="self-stretch pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Max Passengers <span className="text-red-500">*</span>
                </label>
                <NumericInput
                  min={1}
                  max={100}
                  value={paxCapacity}
                  onChange={(val) => {
                    setPaxCapacity(val);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none ${
                    touched.paxCapacity && validationErrors.paxCapacity
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.paxCapacity && validationErrors.paxCapacity && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.paxCapacity}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Max Luggage <span className="text-red-500">*</span>
                </label>
                <NumericInput
                  min={0}
                  max={100}
                  value={luggageCapacity}
                  onChange={(val) => {
                    setLuggageCapacity(val);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none ${
                    touched.luggageCapacity && validationErrors.luggageCapacity
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.luggageCapacity && validationErrors.luggageCapacity && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.luggageCapacity}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing (SGD) */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                Pricing (SGD)
              </div>
            </div>
            <div className="self-stretch pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Base Fare ($) <span className="text-red-500">*</span>
                </label>
                <NumericInput
                  min={1}
                  value={baseFare}
                  onChange={(val) => {
                    setBaseFare(val);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none ${
                    touched.baseFare && validationErrors.baseFare
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.baseFare && validationErrors.baseFare && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.baseFare}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  Meet &amp; Greet ($)
                </label>
                <NumericInput
                  min={1}
                  value={meetAndGreet}
                  onChange={(val) => {
                    setMeetAndGreet(val);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none ${
                    touched.meetAndGreet && validationErrors.meetAndGreet
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.meetAndGreet && validationErrors.meetAndGreet && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.meetAndGreet}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  3-Hour Charter ($) <span className="text-red-500">*</span>
                </label>
                <NumericInput
                  min={1}
                  value={charter3h}
                  onChange={(val) => {
                    setCharter3h(val);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none ${
                    touched.charter3h && validationErrors.charter3h
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.charter3h && validationErrors.charter3h && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.charter3h}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <label className="text-color-input-placeholder text-xs font-semibold uppercase tracking-wide">
                  8-Hour Charter ($) <span className="text-red-500">*</span>
                </label>
                <NumericInput
                  min={1}
                  value={charter8h}
                  onChange={(val) => {
                    setCharter8h(val);
                    if (submitError) setSubmitError(null);
                  }}
                  className={`self-stretch h-10 px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-color-text-primary font-normal focus:outline-none ${
                    touched.charter8h && validationErrors.charter8h
                      ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
                      : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
                  }`}
                />
                {touched.charter8h && validationErrors.charter8h && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
                    <AlertCircle className="size-3 flex-shrink-0" />
                    <span>{validationErrors.charter8h}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Active Switch Toggle */}
          <div
            onClick={() => setIsActive(!isActive)}
            className="self-stretch inline-flex justify-start items-center gap-3 cursor-pointer select-none"
          >
            <div
              className={`w-10 h-6 rounded-full inline-flex flex-col justify-center items-start transition-colors ${
                isActive ? "bg-color-background-accent" : "bg-stone-300"
              }`}
            >
              <div
                className={`size-4 bg-color-background-white rounded-full shadow transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <div className="justify-start text-color-text-primary text-xs font-normal font-['Manrope'] leading-5">
              Vehicle is active
            </div>
          </div>

          {/* Footer */}
          <div className="self-stretch pt-2 border-t border-color-border-subtle inline-flex justify-start items-start gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-11 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex justify-center items-center text-color-input-placeholder text-sm font-semibold font-['Manrope'] hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 py-2.5 bg-color-background-accent rounded-lg flex justify-center items-center text-color-text-primary text-sm font-semibold font-['Manrope'] hover:brightness-105 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
            >
              {isSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
