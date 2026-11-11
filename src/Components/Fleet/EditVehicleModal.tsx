"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFleet } from "@/context/FleetContext";
import { VehicleStatus } from "@/types/fleet";
import { X, AlertCircle } from "lucide-react";
import NumericInput from "@/Components/Common/NumericInput";

export default function EditVehicleModal() {
  const {
    isEditVehicleModalOpen,
    editingVehicle,
    closeEditVehicleModal,
    updateVehicle,
    uploadVehicleImage,
    deleteVehicleImage,
  } = useFleet();

  const [fleetNumber, setFleetNumber] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState("/assets/2edae.png");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [paxCapacity, setPaxCapacity] = useState(6);
  const [luggageCapacity, setLuggageCapacity] = useState(5);
  const [baseFare, setBaseFare] = useState(65);
  const [meetAndGreet, setMeetAndGreet] = useState(75);
  const [charter3h, setCharter3h] = useState(180);
  const [charter8h, setCharter8h] = useState(480);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingVehicle) {
      setFleetNumber(editingVehicle.fleetNumber || "SMC-001");
      setName(editingVehicle.name);
      setModel(editingVehicle.model);
      setDescription(editingVehicle.description || "");
      setImagePath(editingVehicle.imagePath || "/assets/2edae.png");
      setCurrentImageUrl(editingVehicle.imageUrl);
      setSelectedFile(null);
      setImagePreviewUrl(null);
      setImageMessage(null);
      setDriverName(editingVehicle.driverName);
      setDriverPhone(editingVehicle.driverPhone);
      setPaxCapacity(editingVehicle.paxCapacity);
      setLuggageCapacity(editingVehicle.luggageCapacity);
      setBaseFare(editingVehicle.baseRate);
      setMeetAndGreet(editingVehicle.baseRate + 10);
      setCharter3h(editingVehicle.baseRate * 3 - 15);
      const pkg8h =
        editingVehicle.prices?.hourly?.eightHourAmount ??
        (editingVehicle.hourlyRate * 8);
      setCharter8h(pkg8h);
      setIsActive(editingVehicle.status === "active");
    }
  }, [editingVehicle]);

  // Description word count
  const wordCount = useMemo(() => {
    const trimmed = description.trim();
    return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  }, [description]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > 300) {
      setDescription(words.slice(0, 300).join(" "));
    } else {
      setDescription(val);
    }
  };

  // Lock background scrolling and handle Escape key when modal is open
  useEffect(() => {
    if (!isEditVehicleModalOpen || !editingVehicle) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeEditVehicleModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditVehicleModalOpen, editingVehicle, closeEditVehicleModal]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isEditVehicleModalOpen || !editingVehicle) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageMessage({ type: "error", text: "Image size must be under 2MB" });
        return;
      }
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setImageMessage(null);
    }
  };

  const handleUploadImageNow = async () => {
    if (!selectedFile || !editingVehicle) return;
    try {
      setIsUploadingImage(true);
      setImageMessage(null);
      const res = await uploadVehicleImage(editingVehicle.id, selectedFile);
      setImageMessage({ type: "success", text: "Photo uploaded successfully!" });
      if (res.imageUrl) setCurrentImageUrl(res.imageUrl);
      setSelectedFile(null);
      setImagePreviewUrl(null);
    } catch (err: any) {
      setImageMessage({ type: "error", text: err?.message || "Failed to upload photo" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImageNow = async () => {
    if (!editingVehicle) return;
    if (!window.confirm("Are you sure you want to delete this vehicle photo?")) return;
    try {
      setIsDeletingImage(true);
      setImageMessage(null);
      await deleteVehicleImage(editingVehicle.id);
      setImageMessage({ type: "success", text: "Photo deleted successfully" });
      setCurrentImageUrl(undefined);
      setSelectedFile(null);
      setImagePreviewUrl(null);
    } catch (err: any) {
      setImageMessage({ type: "error", text: err?.message || "Failed to delete photo" });
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError("Vehicle name is required.");
      return;
    }
    if (paxCapacity < 1 || paxCapacity > 100) {
      setSubmitError("Passenger capacity must be between 1 and 100.");
      return;
    }
    if (luggageCapacity < 0 || luggageCapacity > 100) {
      setSubmitError("Luggage capacity must be between 0 and 100.");
      return;
    }
    if (baseFare <= 0) {
      setSubmitError("Base fare must be at least $1 SGD.");
      return;
    }
    if (wordCount > 300) {
      setSubmitError("Vehicle description cannot exceed 300 words.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Auto-upload selected file if user didn't hit Upload Now separately
      if (selectedFile) {
        try {
          await uploadVehicleImage(editingVehicle.id, selectedFile);
        } catch (uploadErr) {
          console.warn("Image upload during save error:", uploadErr);
        }
      }

      await updateVehicle(editingVehicle.id, {
        fleetNumber: fleetNumber.trim(),
        name: name.trim(),
        model: model.trim() || name.trim() || "Vehicle",
        description: description.trim(),
        plateNumber: fleetNumber.trim(),
        imagePath,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        paxCapacity: Number(paxCapacity),
        luggageCapacity: Number(luggageCapacity),
        baseRate: Number(baseFare),
        meetAndGreet: Number(meetAndGreet),
        charter8h: Number(charter8h),
        hourlyRate: Math.round(Number(charter8h) / 8),
        status: (isActive ? "active" : "inactive") as VehicleStatus,
      });

      closeEditVehicleModal();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to update vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-color-overlay-hero flex justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={closeEditVehicleModal}
    >
      <div
        className="w-full max-w-[520px] max-h-[90vh] bg-color-background-white rounded-2xl shadow-2xl flex flex-col justify-start items-start overflow-hidden font-['Manrope']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="self-stretch px-6 py-4 border-b border-color-border-subtle inline-flex justify-between items-center flex-shrink-0">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-start text-color-text-primary text-base font-bold font-['Manrope'] leading-6">
              Edit Vehicle
            </div>
          </div>
          <button
            type="button"
            onClick={closeEditVehicleModal}
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
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Fleet Number Plate
                </div>
                <input
                  type="text"
                  required
                  value={fleetNumber}
                  onChange={(e) => setFleetNumber(e.target.value)}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                  Vehicle Name
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="self-stretch h-10 px-3 py-2.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none"
                />
              </div>

              {/* Description (max 300 words) */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch flex justify-between items-center">
                  <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                    Vehicle Description
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      wordCount > 300 ? "text-red-500" : "text-slate-400"
                    }`}
                  >
                    {wordCount} / 300 words
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="The Toyota Alphard / Vellfire is an executive MPV for families and small groups... (max 300 words)"
                  rows={3}
                  className="self-stretch p-3 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-color-border-subtle text-xs text-color-text-primary font-normal font-['Manrope'] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Vehicle Photo Management */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2 pt-1">
                <div className="self-stretch flex justify-between items-center">
                  <div className="justify-start text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
                    Vehicle Photo
                  </div>
                  {currentImageUrl && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Photo Uploaded
                    </span>
                  )}
                </div>

                {/* Preview Box */}
                <div className="self-stretch h-36 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 flex items-center justify-center">
                  {imagePreviewUrl || currentImageUrl ? (
                    <img
                      src={imagePreviewUrl || currentImageUrl}
                      alt="Vehicle Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <svg className="size-8 text-amber-400/80 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-300">No photo uploaded</span>
                      <span className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 2MB</span>
                    </div>
                  )}

                  {selectedFile && (
                    <div className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                      New Photo Selected
                    </div>
                  )}
                </div>

                {/* File actions */}
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
                    {selectedFile ? "Change Selection" : "Select Photo"}
                  </button>

                  {selectedFile && (
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={handleUploadImageNow}
                      className="h-9 px-3 bg-color-background-brand hover:opacity-90 text-color-text-inverse text-xs font-semibold rounded-lg transition-opacity flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingImage ? "Uploading..." : "Upload Now"}
                    </button>
                  )}

                  {currentImageUrl && !selectedFile && (
                    <button
                      type="button"
                      disabled={isDeletingImage}
                      onClick={handleDeleteImageNow}
                      className="h-9 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Delete current photo"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {isDeletingImage ? "Deleting..." : "Delete Photo"}
                    </button>
                  )}
                </div>

                {imageMessage && (
                  <div
                    className={`self-stretch text-xs px-3 py-1.5 rounded-lg ${
                      imageMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {imageMessage.text}
                  </div>
                )}
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
              onClick={closeEditVehicleModal}
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
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
