"use client";

import React from "react";
import AdminLayout from "@/Components/Layout/AdminLayout";
import FleetCard from "@/Components/Fleet/FleetCard";
import FleetCardSkeleton from "@/Components/Fleet/FleetCardSkeleton";
import { useFleet } from "@/context/FleetContext";
import { Plus } from "lucide-react";

export default function FleetPage() {
  const { vehicles, activeVehiclesCount, totalVehiclesCount, openAddVehicleModal, isLoading } =
    useFleet();
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");

  const displayedVehicles = vehicles.filter((v) => {
    if (statusFilter === "active") return v.status === "active";
    if (statusFilter === "inactive") return v.status === "inactive";
    return true;
  });

  const inactiveCount = Math.max(0, totalVehiclesCount - activeVehiclesCount);

  return (
    <AdminLayout>
      <div className="w-full min-w-0 flex flex-col justify-start items-start gap-5 font-['Manrope']">
        {/* Page Header matching FlletPage.html */}
        <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-text-primary text-xl font-bold font-['Manrope'] leading-8">
                Fleet Management
              </div>
            </div>
            <div className="pt-0.5 flex flex-col justify-start items-start">
              {isLoading ? (
                <div className="h-4 w-44 bg-stone-200 rounded animate-pulse mt-0.5" />
              ) : (
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-5">
                  {activeVehiclesCount} active of {totalVehiclesCount} total vehicles
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={openAddVehicleModal}
            className="px-4 py-2.5 bg-color-background-accent rounded-lg flex justify-start items-center gap-2 hover:brightness-105 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="size-4 text-slate-900" />
            <div className="text-center justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
              Add Vehicle
            </div>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="self-stretch flex items-center gap-2 border-b border-color-border-subtle pb-3">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Fleets {isLoading ? "" : `(${totalVehiclesCount})`}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Active {isLoading ? "" : `(${activeVehiclesCount})`}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "inactive"
                ? "bg-rose-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Inactive / Deactivated {isLoading ? "" : `(${inactiveCount})`}
          </button>
        </div>

        {/* Fleet Grid */}
        {isLoading ? (
          <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <FleetCardSkeleton key={i} />
            ))}
          </div>
        ) : displayedVehicles.length === 0 ? (
          <div className="w-full bg-white rounded-xl border border-stone-200 p-12 text-center text-xs text-stone-500">
            No vehicles match the selected status filter.
          </div>
        ) : (
          <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {displayedVehicles.map((vehicle) => (
              <FleetCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
