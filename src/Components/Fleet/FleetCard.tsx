"use client";

import React from "react";
import { Vehicle } from "@/types/fleet";
import { useFleet } from "@/context/FleetContext";
import { Pencil } from "lucide-react";
import { WhatsAppIcon } from "@/Shared/Icons";

interface FleetCardProps {
  vehicle: Vehicle;
}

export default function FleetCard({ vehicle }: FleetCardProps) {
  const { openEditVehicleModal, toggleVehicleStatus } = useFleet();

  const driverInitials = vehicle.driverName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `https://wa.me/${vehicle.driverPhone.replace(/[^0-9]/g, "")}`,
      "_blank"
    );
  };

  const charter3h = vehicle.baseRate * 3 - 15;
  const charter8h =
    vehicle.prices?.hourly?.eightHourAmount ?? (vehicle.hourlyRate * 8);

  return (
    <div className="bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden font-['Manrope']">
      {/* Top Banner Image */}
      <div className="self-stretch h-40 relative bg-slate-900 overflow-hidden flex items-center justify-center group">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={vehicle.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
              const fallback = e.currentTarget.parentElement?.querySelector(".img-fallback");
              if (fallback) (fallback as HTMLElement).style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback silhouette if no image or error */}
        <div
          className={`img-fallback w-full h-full ${
            vehicle.imageUrl ? "hidden" : "flex"
          } flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 text-center`}
        >
          <div className="size-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-1 text-slate-400">
            <svg
              className="size-6 text-amber-400/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2-3H10L8 7H5a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">
            No Photo Uploaded
          </span>
        </div>

        {/* Gradient vignette */}
        <div className="w-full h-full left-0 top-0 absolute bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

        <div className="w-full px-3 py-2.5 left-0 top-0 absolute inline-flex justify-between items-start z-10 pointer-events-none">
          <div className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm rounded-md inline-flex flex-col justify-start items-start border border-white/10">
            <div className="justify-start text-color-text-inverse text-xs font-bold font-['Manrope'] leading-4 tracking-wide">
              {vehicle.fleetNumber || "SMC-001"}
            </div>
          </div>
          <div
            className={`px-2 py-0.5 rounded-full outline outline-1 outline-offset-[-1px] backdrop-blur-sm inline-flex flex-col justify-start items-start ${
              vehicle.status === "active"
                ? "bg-green-500/20 outline-green-400/30 text-green-300"
                : "bg-stone-500/20 outline-stone-400/30 text-stone-300"
            }`}
          >
            <div className="justify-start text-[10px] font-semibold font-['Manrope'] leading-4">
              {vehicle.status === "active" ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="self-stretch flex-1 p-4 flex flex-col justify-start items-start gap-3">
        {/* Title & Description */}
        <div className="self-stretch flex flex-col justify-start items-start">
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="justify-start text-color-text-primary text-base font-bold font-['Manrope'] leading-6 truncate">
              {vehicle.name}
            </div>
          </div>
          {vehicle.description && (
            <div className="self-stretch pt-1">
              <p className="text-[11px] text-slate-600 font-normal leading-relaxed line-clamp-2" title={vehicle.description}>
                {vehicle.description}
              </p>
            </div>
          )}
        </div>

        {/* Assigned Driver Row */}
        <div className="self-stretch px-3 py-2 bg-color-background-selected rounded-lg inline-flex justify-between items-center gap-2">
          <div className="size-7 bg-color-background-brand rounded-full flex justify-center items-center flex-shrink-0">
            <div className="justify-start text-color-text-inverse text-[9px] font-bold font-['Manrope'] leading-3">
              {driverInitials}
            </div>
          </div>
          <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start">
            <div className="self-stretch h-4 flex flex-col justify-start items-start overflow-hidden">
              <div className="justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-4 truncate">
                {vehicle.driverName}
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4 truncate">
                {vehicle.driverPhone}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={openWhatsApp}
            className="size-7 bg-color-status-success rounded-md flex justify-center items-center flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity text-white"
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon className="size-4 text-white" />
          </button>
        </div>

        {/* 6 Specs Rows */}
        <div className="self-stretch grid grid-cols-2 gap-1.5">
          <div className="px-2.5 py-1.5 bg-stone-100 rounded-lg inline-flex justify-between items-center">
            <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
              Capacity
            </div>
            <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
              {vehicle.paxCapacity} pax
            </div>
          </div>

          <div className="px-2.5 py-1.5 bg-stone-100 rounded-lg inline-flex justify-between items-center">
            <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
              Luggage
            </div>
            <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
              {vehicle.luggageCapacity} bags
            </div>
          </div>

          <div className="px-2.5 py-1.5 bg-stone-100 rounded-lg inline-flex justify-between items-center">
            <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
              Base Fare
            </div>
            <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
              ${vehicle.baseRate}
            </div>
          </div>

          <div className="px-2.5 py-1.5 bg-stone-100 rounded-lg inline-flex justify-between items-center">
            <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
              Arrival Driveway Pickup
            </div>
            <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
              ${vehicle.prices?.arrival?.amount || vehicle.baseRate + 10}
            </div>
          </div>

          <div className="px-2.5 py-1.5 bg-stone-100 rounded-lg inline-flex justify-between items-center">
            <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
              3h Charter
            </div>
            <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
              ${charter3h}
            </div>
          </div>

          <div className="px-2.5 py-1.5 bg-stone-100 rounded-lg inline-flex justify-between items-center">
            <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
              8h Charter
            </div>
            <div className="justify-start text-orange-400 text-xs font-semibold font-['Manrope'] leading-4">
              ${charter8h}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="self-stretch pt-1 inline-flex justify-start items-center gap-2">
          <button
            type="button"
            onClick={() => openEditVehicleModal(vehicle)}
            className="flex-1 py-2 bg-color-background-brand rounded-lg flex justify-center items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Pencil className="size-3.5 text-color-text-inverse" />
            <div className="text-center justify-start text-color-text-inverse text-xs font-semibold font-['Manrope'] leading-4">
              Edit
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleVehicleStatus(vehicle.id)}
            className={`px-3.5 py-2 rounded-lg outline outline-1 outline-offset-[-1px] flex justify-center items-center gap-1.5 transition-colors cursor-pointer ${
              vehicle.status === "active"
                ? "outline-red-200 text-red-600 hover:bg-red-50"
                : "outline-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
            }`}
          >
            <div className="text-center justify-start text-xs font-semibold font-['Manrope'] leading-4">
              {vehicle.status === "active" ? "Deactivate" : "Activate"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
