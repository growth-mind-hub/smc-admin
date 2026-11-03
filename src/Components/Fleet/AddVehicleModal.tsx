"use client";

import React, { useState, useRef } from "react";
import { useFleet } from "@/context/FleetContext";
import { VehicleStatus } from "@/types/fleet";
import { X } from "lucide-react";
import NumericInput from "@/Components/Common/NumericInput";

export default function AddVehicleModal() {
  const { isAddVehicleModalOpen, closeAddVehicleModal, addVehicle, totalVehiclesCount } =
    useFleet();

  const [fleetNumber, setFleetNumber] = useState(`SMC-00${totalVehiclesCount + 1}`);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState("/assets/2edae.png");
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddVehicleModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    if (!name) {
      alert("Please enter Vehicle Name.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addVehicle({
        fleetNumber: fleetNumber || `SMC-00${totalVehiclesCount + 1}`,
        name,
        model: model || "Toyota Vellfire / Alphard",
        description: description.trim(),
        category: "6_seater",
        plateNumber: "SHA 1234 X",
        paxCapacity: Number(paxCapacity),
        luggageCapacity: Number(luggageCapacity),
        baseRate: Number(baseFare),
        hourlyRate: Math.round(Number(charter8h) / 8),
        driverName: driverName || "Unassigned",
        driverPhone: driverPhone || "+65 9000 0000",
        status: (isActive ? "active" : "inactive") as VehicleStatus,
        features: ["Luggage Space", "Air Conditioning", "Executive Seating"],
        imageFile: selectedFile,
      } as any);
    } finally {
      setIsSubmitting(false);
      closeAddVehicleModal();
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
            onClick={closeAddVehicleModal}
            className="size-8 rounded-lg flex justify-center items-center text-gray-500 hover:text-gray-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="self-stretch flex-1 px-6 py-5 flex flex-col justify-start items-start gap-5 overflow-y-auto"
        >
          {/* Vehicle Identity */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-wider">
                Vehicle Identity
              </div>
            </div>
            <div className="self-stretch pt-3 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Fleet Number
                </div>
                <input
                  type="text"
                  required
                  value={fleetNumber}
                  onChange={(e) => setFleetNumber(e.target.value)}
                  placeholder="e.g. SMC-007"
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Vehicle Name *
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 6 Seater Maxi Cab"
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Subtitle / Model
                </div>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Toyota Vellfire / Alphard"
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              {/* Description (max 1000 characters) */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch flex justify-between items-center">
                  <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                    Vehicle Description
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {description.length} / 1000
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                  placeholder="The Toyota Alphard / Vellfire is an executive MPV for families and small groups... (max 1000 chars)"
                  rows={3}
                  className="self-stretch p-3 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Vehicle Photo Selection */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2 pt-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Vehicle Photo (Optional)
                </div>

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
                  <div className="text-rose-600 text-xs font-medium">{imageError}</div>
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
                Assigned Driver
              </div>
            </div>
            <div className="self-stretch pt-3 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Driver Full Name
                </div>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Ahmad Rizal"
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Driver Phone
                </div>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+65 9101 1234"
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
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
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Max Passengers
                </div>
                <NumericInput
                  min={1}
                  max={100}
                  value={paxCapacity}
                  onChange={setPaxCapacity}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Max Luggage
                </div>
                <NumericInput
                  min={0}
                  max={100}
                  value={luggageCapacity}
                  onChange={setLuggageCapacity}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
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
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Base Fare ($)
                </div>
                <NumericInput
                  min={0}
                  value={baseFare}
                  onChange={setBaseFare}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Meet & Greet ($)
                </div>
                <NumericInput
                  min={0}
                  value={meetAndGreet}
                  onChange={setMeetAndGreet}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  3-Hour Charter ($)
                </div>
                <NumericInput
                  min={0}
                  value={charter3h}
                  onChange={setCharter3h}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  8-Hour Charter ($)
                </div>
                <NumericInput
                  min={0}
                  value={charter8h}
                  onChange={setCharter8h}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
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
              onClick={closeAddVehicleModal}
              className="flex-1 h-11 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex justify-center items-center text-color-input-placeholder text-sm font-semibold font-['Manrope'] hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 py-2.5 bg-color-background-accent rounded-lg flex justify-center items-center text-color-text-primary text-sm font-semibold font-['Manrope'] hover:brightness-105 cursor-pointer"
            >
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
