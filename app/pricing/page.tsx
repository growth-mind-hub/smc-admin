"use client";

import React, { useState } from "react";
import AdminLayout from "@/Components/Layout/AdminLayout";
import { usePricing } from "@/context/PricingContext";
import { VehiclePricingRate } from "@/types/pricing";
import { Save, Check } from "lucide-react";
import NumericInput from "@/Components/Common/NumericInput";

export default function PricingPage() {
  const {
    rates,
    updateRate,
    saveStatus,
    saveMessage,
    saveAllChanges,
    activeTab,
    setActiveTab,
    addOns,
    updateAddOnItem,
    deleteAddOnItem,
    distanceRules,
    updateDistancePricingRule,
    isLoading,
  } = usePricing();

  const [localAddOnPrices, setLocalAddOnPrices] = useState<Record<number, number>>({});
  const [localDistanceSurcharges, setLocalDistanceSurcharges] = useState<Record<number, number>>({});
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [deleteErrorAddon, setDeleteErrorAddon] = useState<{
    id: number;
    name: string;
    message: string;
  } | null>(null);
  const [actionNotice, setActionNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAddOnPriceChange = (id: number, val: number) => {
    setLocalAddOnPrices((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveAddOn = async (id: number, currentStatus: "ACTIVE" | "INACTIVE") => {
    const newPrice = localAddOnPrices[id];
    setSavingItem(`addon-${id}`);
    await updateAddOnItem(id, {
      price: newPrice !== undefined ? newPrice : undefined,
      status: currentStatus,
    });
    setSavingItem(null);
  };

  const handleToggleAddOnStatus = async (id: number, currentStatus: "ACTIVE" | "INACTIVE") => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setSavingItem(`addon-${id}`);
    await updateAddOnItem(id, { status: nextStatus });
    setSavingItem(null);
  };

  const handleDeleteAddOn = async (addon: (typeof addOns)[0]) => {
    if (!window.confirm(`Are you sure you want to permanently delete the add-on "${addon.name}"?`)) {
      return;
    }
    setSavingItem(`addon-del-${addon.id}`);
    const res = await deleteAddOnItem(addon.id);
    setSavingItem(null);
    if (res.success) {
      setActionNotice({ type: "success", text: `Add-on "${addon.name}" was permanently deleted.` });
      setTimeout(() => setActionNotice(null), 4000);
    } else if (res.code === "ADD_ON_IN_USE" || res.error?.includes("COMPLETED")) {
      setDeleteErrorAddon({
        id: addon.id,
        name: addon.name,
        message:
          res.error ||
          "This add-on is used by bookings that are not COMPLETED. Set its status to INACTIVE instead.",
      });
    } else {
      setActionNotice({ type: "error", text: res.error || "Failed to delete add-on." });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleDeactivateInUseAddon = async (id: number) => {
    setSavingItem(`addon-${id}`);
    await updateAddOnItem(id, { status: "INACTIVE" });
    setSavingItem(null);
    setDeleteErrorAddon(null);
    setActionNotice({ type: "success", text: "Add-on status has been updated to INACTIVE." });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDistanceSurchargeChange = (id: number, val: number) => {
    setLocalDistanceSurcharges((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveDistanceRule = async (id: number, rule: any) => {
    const newSurcharge = localDistanceSurcharges[id];
    setSavingItem(`dist-${id}`);
    await updateDistancePricingRule(id, {
      min_distance_km: rule.min_distance_km,
      max_distance_km: rule.max_distance_km,
      surcharge: newSurcharge !== undefined ? newSurcharge : rule.surcharge,
      is_contact_support: rule.is_contact_support,
      status: rule.status,
    });
    setSavingItem(null);
  };

  const handleToggleDistanceRuleSupport = async (id: number, rule: any) => {
    setSavingItem(`dist-${id}`);
    await updateDistancePricingRule(id, {
      min_distance_km: rule.min_distance_km,
      max_distance_km: rule.max_distance_km,
      surcharge: rule.is_contact_support ? 0 : rule.surcharge,
      is_contact_support: !rule.is_contact_support,
      status: rule.status,
    });
    setSavingItem(null);
  };

  return (
    <AdminLayout>
      <div className="w-full min-w-0 flex flex-col justify-start items-start gap-5 font-['Manrope']">
        {/* Header */}
        <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-color-text-primary text-xl font-bold font-['Manrope'] leading-8">
                Pricing & Surcharges Management
              </div>
            </div>
            <div className="pt-0.5 flex flex-col justify-start items-start">
              <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-5">
                Manage vehicle rates, add-on extras, and distance surcharge rules directly.
              </div>
            </div>
          </div>

          {activeTab === "vehicle_rates" && (
            <button
              type="button"
              onClick={saveAllChanges}
              disabled={saveStatus === "saving"}
              className="px-5 py-2.5 bg-color-background-accent rounded-lg flex justify-start items-center gap-2 hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
            >
              {saveStatus === "saved" ? (
                <Check className="size-4 text-slate-900" />
              ) : (
                <Save className="size-4 text-slate-900" />
              )}
              <div className="text-center justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
                {saveStatus === "saving"
                  ? "Saving to API..."
                  : saveStatus === "saved"
                  ? "Saved Successfully!"
                  : "Save All Changes"}
              </div>
            </button>
          )}
        </div>

        {/* Status Toast / Alert */}
        {saveMessage && (
          <div
            className={`self-stretch p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              saveStatus === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Action Notice Toast */}
        {actionNotice && (
          <div
            className={`self-stretch p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              actionNotice.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            <span>{actionNotice.text}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="font-bold ml-2 hover:opacity-75 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* In-use Add-on Deactivation Dialog/Prompt (409 Handler) */}
        {deleteErrorAddon && (
          <div className="self-stretch p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-amber-900">
                Cannot Delete &quot;{deleteErrorAddon.name}&quot; (In Use by Bookings)
              </span>
              <span className="text-amber-800 leading-relaxed">
                {deleteErrorAddon.message}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setDeleteErrorAddon(null)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-700 font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => handleDeactivateInUseAddon(deleteErrorAddon.id)}
                className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 cursor-pointer shadow-xs"
              >
                Set as INACTIVE Instead
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="self-stretch flex border-b border-color-border-subtle gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("vehicle_rates")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "vehicle_rates"
                ? "border-amber-600 text-amber-600 font-bold"
                : "border-transparent text-color-input-placeholder hover:text-color-text-primary"
            }`}
          >
            Vehicle Service Rates ({rates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("addons")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "addons"
                ? "border-amber-600 text-amber-600 font-bold"
                : "border-transparent text-color-input-placeholder hover:text-color-text-primary"
            }`}
          >
            Add-ons & Extras ({addOns.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("distance_rules")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "distance_rules"
                ? "border-amber-600 text-amber-600 font-bold"
                : "border-transparent text-color-input-placeholder hover:text-color-text-primary"
            }`}
          >
            Distance Surcharge Rules ({distanceRules.length})
          </button>
        </div>

        {/* TAB 1: Vehicle Rates */}
        {activeTab === "vehicle_rates" && (
          <>
            {/* 4 Overview Definition Cards from PricingPage.html */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle inline-flex flex-col justify-start items-start">
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div className="justify-start text-color-text-primary text-xs font-bold font-['Manrope'] leading-5">
                    Base Fare
                  </div>
                </div>
                <div className="w-full pt-0.5 flex flex-col justify-start items-start">
                  <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                    Point-to-point flat rate (SGD)
                  </div>
                </div>
              </div>

              <div className="p-4 bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle inline-flex flex-col justify-start items-start">
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div className="justify-start text-color-text-primary text-xs font-bold font-['Manrope'] leading-5">
                    Meet & Greet
                  </div>
                </div>
                <div className="w-full pt-0.5 flex flex-col justify-start items-start">
                  <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                    Airport meet & greet inclusive (SGD)
                  </div>
                </div>
              </div>

              <div className="p-4 bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle inline-flex flex-col justify-start items-start">
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div className="justify-start text-color-text-primary text-xs font-bold font-['Manrope'] leading-5">
                    3-Hour Charter
                  </div>
                </div>
                <div className="w-full pt-0.5 flex flex-col justify-start items-start">
                  <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                    Hourly charter, 3-hour package (SGD)
                  </div>
                </div>
              </div>

              <div className="p-4 bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle inline-flex flex-col justify-start items-start">
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div className="justify-start text-color-text-primary text-xs font-bold font-['Manrope'] leading-5">
                    8-Hour Charter
                  </div>
                </div>
                <div className="w-full pt-0.5 flex flex-col justify-start items-start">
                  <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                    Full-day charter, 8-hour package (SGD)
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Rates Table */}
            <div className="w-full bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-stone-100 border-b border-color-border-subtle text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase tracking-wide">
                      <th className="px-5 py-3.5 w-[280px] max-w-[280px]">Vehicle</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Capacity</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Base Fare</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Meet & Greet</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">3-Hour Charter</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">8-Hour Charter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {isLoading ? (
                      [...Array(6)].map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="px-5 py-4 w-[280px] max-w-[280px]">
                            <div className="h-4 w-44 bg-stone-200 rounded mb-1.5" />
                            <div className="h-3 w-28 bg-stone-100 rounded" />
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="h-3.5 w-24 bg-stone-100 rounded" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-9 w-20 bg-stone-100 rounded-md" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-9 w-20 bg-stone-100 rounded-md" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-9 w-20 bg-stone-100 rounded-md" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-9 w-20 bg-stone-100 rounded-md" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      rates.map((rate: VehiclePricingRate) => (
                        <tr
                          key={rate.id}
                          className="hover:bg-stone-50/60 transition-colors"
                        >
                          {/* Vehicle */}
                          <td className="px-5 py-4 w-[280px] max-w-[280px]">
                            <div className="flex flex-col justify-start items-start max-w-[280px]">
                              <div className="justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
                                {rate.name}
                              </div>
                              <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-relaxed break-words">
                                {rate.model}
                              </div>
                            </div>
                          </td>

                          {/* Capacity */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-5">
                              {rate.capacityText}
                            </div>
                          </td>

                          {/* Base Fare */}
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1 bg-stone-50 hover:bg-white border border-color-border-subtle rounded-md px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
                              <span className="text-orange-400 font-semibold text-sm font-['Manrope']">
                                $
                              </span>
                              <NumericInput
                                value={rate.baseFare}
                                onChange={(val) => updateRate(rate.id, "baseFare", val)}
                                className="w-16 text-center text-orange-400 font-semibold text-sm font-['Manrope'] bg-transparent outline-none"
                              />
                            </div>
                          </td>

                          {/* Meet & Greet */}
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1 bg-stone-50 hover:bg-white border border-color-border-subtle rounded-md px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
                              <span className="text-orange-400 font-semibold text-sm font-['Manrope']">
                                $
                              </span>
                              <NumericInput
                                value={rate.meetAndGreet}
                                onChange={(val) => updateRate(rate.id, "meetAndGreet", val)}
                                className="w-16 text-center text-orange-400 font-semibold text-sm font-['Manrope'] bg-transparent outline-none"
                              />
                            </div>
                          </td>

                          {/* 3-Hour Charter */}
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1 bg-stone-50 hover:bg-white border border-color-border-subtle rounded-md px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
                              <span className="text-orange-400 font-semibold text-sm font-['Manrope']">
                                $
                              </span>
                              <NumericInput
                                value={rate.charter3h}
                                onChange={(val) => updateRate(rate.id, "charter3h", val)}
                                className="w-16 text-center text-orange-400 font-semibold text-sm font-['Manrope'] bg-transparent outline-none"
                              />
                            </div>
                          </td>

                          {/* 8-Hour Charter */}
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1 bg-stone-50 hover:bg-white border border-color-border-subtle rounded-md px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
                              <span className="text-orange-400 font-semibold text-sm font-['Manrope']">
                                $
                              </span>
                              <NumericInput
                                value={rate.charter8h}
                                onChange={(val) => updateRate(rate.id, "charter8h", val)}
                                className="w-16 text-center text-orange-400 font-semibold text-sm font-['Manrope'] bg-transparent outline-none"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Add-Ons & Extras */}
        {activeTab === "addons" && (
          <div className="w-full bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-color-border-subtle text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase tracking-wide">
                    <th className="px-5 py-3.5">Code</th>
                    <th className="px-5 py-3.5">Add-On Name</th>
                    <th className="px-5 py-3.5">Pricing Type</th>
                    <th className="px-5 py-3.5">Rate (SGD)</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {isLoading ? (
                    [...Array(5)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 bg-stone-200 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-36 bg-stone-200 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 bg-stone-100 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-8 w-16 bg-stone-100 rounded-md" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-6 w-16 bg-stone-100 rounded-full" />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="h-7 w-20 bg-stone-200 rounded-lg inline-block" />
                        </td>
                      </tr>
                    ))
                  ) : addOns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                        No add-ons found.
                      </td>
                    </tr>
                  ) : (
                    addOns.map((addon) => {
                      const priceValue =
                        localAddOnPrices[addon.id] !== undefined
                          ? localAddOnPrices[addon.id]
                          : addon.price;
                      const isSaving = savingItem === `addon-${addon.id}`;

                      return (
                        <tr key={addon.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-xs text-slate-800">
                            {addon.code}
                          </td>
                          <td className="px-5 py-4 font-semibold text-color-text-primary">
                            {addon.name}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                              {addon.pricing_type}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1 bg-stone-50 hover:bg-white border border-color-border-subtle rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-amber-500">
                              <span className="text-orange-400 font-semibold text-sm">$</span>
                              <NumericInput
                                value={priceValue}
                                onChange={(val) => handleAddOnPriceChange(addon.id, val)}
                                className="w-12 text-center text-orange-400 font-semibold text-sm bg-transparent outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleAddOnStatus(addon.id, addon.status)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                                addon.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-stone-100 text-stone-500 border border-stone-200"
                              }`}
                            >
                              {addon.status}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveAddOn(addon.id, addon.status)}
                                disabled={isSaving}
                                className="px-3 py-1.5 bg-color-background-brand text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddOn(addon)}
                                disabled={savingItem === `addon-del-${addon.id}`}
                                className="px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                title="Permanently Delete Add-On"
                              >
                                {savingItem === `addon-del-${addon.id}` ? "..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Distance Surcharge Rules */}
        {activeTab === "distance_rules" && (
          <div className="w-full bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-color-border-subtle text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase tracking-wide">
                    <th className="px-5 py-3.5">Tier Range</th>
                    <th className="px-5 py-3.5">Min Distance</th>
                    <th className="px-5 py-3.5">Max Distance</th>
                    <th className="px-5 py-3.5">Surcharge (SGD)</th>
                    <th className="px-5 py-3.5">Special Behavior</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {isLoading ? (
                    [...Array(5)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 w-28 bg-stone-200 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 bg-stone-100 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 bg-stone-100 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-8 w-16 bg-stone-100 rounded-md" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-6 w-28 bg-stone-100 rounded-full" />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="h-7 w-16 bg-stone-200 rounded-lg inline-block" />
                        </td>
                      </tr>
                    ))
                  ) : distanceRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                        No distance rules found.
                      </td>
                    </tr>
                  ) : (
                    distanceRules.map((rule) => {
                      const surchargeValue =
                        localDistanceSurcharges[rule.id] !== undefined
                          ? localDistanceSurcharges[rule.id]
                          : rule.surcharge;
                      const isSaving = savingItem === `dist-${rule.id}`;

                      return (
                        <tr key={rule.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-5 py-4 font-bold text-slate-900">
                            {rule.min_distance_km} km – {rule.max_distance_km ? `${rule.max_distance_km} km` : "Unbounded"}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {rule.min_distance_km} km ({rule.min_inclusive ? "inclusive" : "exclusive"})
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {rule.max_distance_km !== null ? `${rule.max_distance_km} km` : "Infinity"}
                          </td>
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1 bg-stone-50 hover:bg-white border border-color-border-subtle rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-amber-500">
                              <span className="text-orange-400 font-semibold text-sm">$</span>
                              <NumericInput
                                disabled={rule.is_contact_support}
                                value={surchargeValue}
                                onChange={(val) => handleDistanceSurchargeChange(rule.id, val)}
                                className="w-12 text-center text-orange-400 font-semibold text-sm bg-transparent outline-none disabled:text-stone-400"
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleDistanceRuleSupport(rule.id, rule)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                                rule.is_contact_support
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {rule.is_contact_support ? "Contact Support" : "Standard Quote"}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSaveDistanceRule(rule.id, rule)}
                              disabled={isSaving}
                              className="px-3 py-1.5 bg-color-background-brand text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing Notes Card matching PricingPage.html */}
        <div className="self-stretch p-5 bg-color-background-selected rounded-xl outline outline-1 outline-offset-[-1px] outline-orange-400/20 flex flex-col justify-start items-start">
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="justify-start text-color-text-primary text-xs font-bold font-['Manrope'] leading-5">
              Pricing Notes & API Rules
            </div>
          </div>
          <div className="w-full pl-4 pt-1 flex flex-col justify-start items-start gap-1">
            <div className="self-stretch relative flex flex-col justify-start items-start">
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  All prices are in Singapore Dollars (SGD) and synchronized with the backend database.
                </div>
              </div>
              <div className="w-3 h-4 left-[-17px] top-0 absolute inline-flex justify-end items-center">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  •
                </div>
              </div>
            </div>

            <div className="self-stretch relative flex flex-col justify-start items-start">
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  Base fare applies to point-to-point departure/transfer trips.
                </div>
              </div>
              <div className="w-3 h-4 left-[-17px] top-0 absolute inline-flex justify-end items-center">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  •
                </div>
              </div>
            </div>

            <div className="self-stretch relative flex flex-col justify-start items-start">
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  Meet & Greet pricing applies to airport arrivals with name board service at Changi.
                </div>
              </div>
              <div className="w-3 h-4 left-[-17px] top-0 absolute inline-flex justify-end items-center">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  •
                </div>
              </div>
            </div>

            <div className="self-stretch relative flex flex-col justify-start items-start">
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  Distance surcharge tiers are evaluated automatically when customers calculate quotations.
                </div>
              </div>
              <div className="w-3 h-4 left-[-17px] top-0 absolute inline-flex justify-end items-center">
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
                  •
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
