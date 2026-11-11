"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { VehiclePricingRate, PricingTab } from "@/types/pricing";
import {
  getVehicles,
  setVehicleServiceRate,
  getAddOns,
  updateAddOn,
  createAddOn,
  deleteAddOn,
  getDistanceRules,
  updateDistanceRule,
  createDistanceRule,
} from "@/lib/api/services";
import { invalidateApiCache } from "@/lib/api/client";
import {
  ApiAddOn,
  ApiDistanceRule,
  AdminCreateAddOnPayload,
  AdminUpdateAddOnPayload,
  AdminCreateDistanceRulePayload,
  AdminUpdateDistanceRulePayload,
} from "@/types/api";

interface PricingContextType {
  // Vehicle Rates
  rates: VehiclePricingRate[];
  updateRate: (
    id: string,
    field: keyof VehiclePricingRate,
    value: number
  ) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  saveMessage: string | null;
  saveAllChanges: () => Promise<void>;
  resetToDefaults: () => void;
  isLoading: boolean;
  refreshPricingData: (forceFresh?: boolean) => Promise<void>;

  // Tabs
  activeTab: PricingTab;
  setActiveTab: (tab: PricingTab) => void;

  // Add-ons
  addOns: ApiAddOn[];
  updateAddOnItem: (
    id: number,
    updates: AdminUpdateAddOnPayload
  ) => Promise<boolean>;
  createAddOnItem: (payload: AdminCreateAddOnPayload) => Promise<boolean>;
  deleteAddOnItem: (
    id: number
  ) => Promise<{ success: boolean; error?: string; code?: string }>;

  // Distance Rules
  distanceRules: ApiDistanceRule[];
  updateDistancePricingRule: (
    id: number,
    updates: AdminUpdateDistanceRulePayload
  ) => Promise<boolean>;
  createDistancePricingRule: (
    payload: AdminCreateDistanceRulePayload
  ) => Promise<boolean>;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<VehiclePricingRate[]>([]);
  const [addOns, setAddOns] = useState<ApiAddOn[]>([]);
  const [distanceRules, setDistanceRules] = useState<ApiDistanceRule[]>([]);
  const [activeTab, setActiveTab] = useState<PricingTab>("vehicle_rates");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const isFetchingRef = useRef(false);

  const refreshPricingData = useCallback(async (forceFresh?: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    if (forceFresh) {
      invalidateApiCache();
    }
    try {
      // 1. Fetch live vehicles & rates (deduplicated by client)
      try {
        const vRes = await getVehicles();
        const vList: any[] =
          (vRes && Array.isArray(vRes.data) && vRes.data) ||
          (vRes && Array.isArray(vRes.vehicles) && vRes.vehicles) ||
          (Array.isArray(vRes) && vRes) ||
          [];

        if (vList && vList.length > 0) {
          const liveRates: VehiclePricingRate[] = vList.map((v) => {
            const baseFare =
              v.prices?.departure_transfer?.amount ||
              v.prices?.arrival?.amount ||
              65;
            const meetAndGreet =
              v.prices?.arrival?.amount ||
              baseFare + 10;
            const charter3h =
              v.prices?.hourly?.amount ? v.prices.hourly.amount * 3 - 15 : 180;
            const charter8h =
              v.prices?.hourly?.eightHourAmount ??
              (v.prices?.hourly?.amount ? v.prices.hourly.amount * 8 : 480);

            const pax = v.passengerCapacity ? `${v.passengerCapacity} Passengers` : "6 Passengers";
            const luggage = v.luggageCapacity ? `${v.luggageCapacity} Luggage` : "4 Luggage";

            return {
              id: String(v.id),
              apiId: v.id,
              name: v.name,
              model: v.description || v.vehicleType || "Executive Maxi Cab",
              capacityText: `${pax} · ${luggage}`,
              baseFare,
              meetAndGreet,
              charter3h,
              charter8h,
            };
          });
          setRates(liveRates);
        }
      } catch (err) {
        console.warn("Could not load vehicles for pricing rates:", err);
        setRates((prev) => prev);
      }

      // 2. Fetch add-ons (deduplicated by client)
      try {
        const aRes = await getAddOns();
        const aList: any[] =
          (aRes && Array.isArray(aRes.data) && aRes.data) ||
          (Array.isArray(aRes) && aRes) ||
          [];
        if (aList && aList.length >= 0) {
          setAddOns(aList);
        }
      } catch (err) {
        console.warn("Could not load add-ons:", err);
        setAddOns((prev) => prev);
      }

      // 3. Fetch distance rules (deduplicated by client)
      try {
        const dRes = await getDistanceRules();
        const dList: any[] =
          (dRes && Array.isArray(dRes.data) && dRes.data) ||
          (Array.isArray(dRes) && dRes) ||
          [];
        if (dList && dList.length >= 0) {
          setDistanceRules(dList);
        }
      } catch (err) {
        console.warn("Could not load distance rules:", err);
        setDistanceRules((prev) => prev);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refreshPricingData();
  }, [pathname, refreshPricingData]);

  useEffect(() => {
    const handleAuthChange = () => {
      refreshPricingData(true);
    };
    window.addEventListener("smc_auth_change", handleAuthChange);
    return () => window.removeEventListener("smc_auth_change", handleAuthChange);
  }, [refreshPricingData]);

  const updateRate = (
    id: string,
    field: keyof VehiclePricingRate,
    value: number
  ) => {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const saveAllChanges = async () => {
    setSaveStatus("saving");
    setSaveMessage(null);
    let successCount = 0;
    let failCount = 0;

    for (const rate of rates) {
      const numId = rate.apiId || (!isNaN(Number(rate.id)) ? Number(rate.id) : null);
      if (numId) {
        try {
          // Update Departure Transfer
          await setVehicleServiceRate(numId, "departure_transfer", {
            amount: rate.baseFare,
            currency: "SGD",
            status: "active",
          });

          // Update Arrival (Meet & Greet)
          await setVehicleServiceRate(numId, "arrival", {
            amount: rate.meetAndGreet,
            currency: "SGD",
            status: "active",
          });

          // Update Hourly
          const hourlyAmount = Math.round(rate.charter8h / 8) || 65;
          await setVehicleServiceRate(numId, "hourly", {
            amount: hourlyAmount,
            eightHourAmount: rate.charter8h,
            currency: "SGD",
            minimumHours: 3,
            status: "active",
          });

          successCount++;
        } catch (err: any) {
          console.error(`Failed to update rates for vehicle ${numId}:`, err);
          failCount++;
        }
      }
    }

    if (failCount === 0) {
      invalidateApiCache();
      setSaveStatus("saved");
      setSaveMessage("All pricing rates updated successfully in database!");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus(successCount > 0 ? "saved" : "error");
      setSaveMessage(
        successCount > 0
          ? `Updated ${successCount} vehicle rates. ${failCount} had errors.`
          : "Failed to update rates. Using local state."
      );
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const resetToDefaults = () => {
    refreshPricingData(true);
  };

  const updateAddOnItem = async (
    id: number,
    updates: AdminUpdateAddOnPayload
  ): Promise<boolean> => {
    try {
      await updateAddOn(id, updates);
      setAddOns((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...updates,
                price: updates.price !== undefined ? updates.price : a.price,
                status: updates.status || a.status,
              }
            : a
        )
      );
      return true;
    } catch (err: any) {
      console.error("Failed to update add-on:", err);
      return false;
    }
  };

  const createAddOnItem = async (
    payload: AdminCreateAddOnPayload
  ): Promise<boolean> => {
    try {
      const res = await createAddOn(payload);
      if (res && res.add_on) {
        setAddOns((prev) => [...prev, res.add_on]);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Failed to create add-on:", err);
      return false;
    }
  };

  const deleteAddOnItem = async (
    id: number
  ): Promise<{ success: boolean; error?: string; code?: string }> => {
    try {
      await deleteAddOn(id);
      setAddOns((prev) => prev.filter((a) => a.id !== id));
      invalidateApiCache("add-ons");
      return { success: true };
    } catch (err: any) {
      console.warn("Failed to delete add-on:", err);
      const code = err?.code || err?.details?.error?.code || "DELETE_FAILED";
      const message =
        err?.message ||
        err?.details?.error?.message ||
        "Failed to delete add-on.";
      return { success: false, code, error: message };
    }
  };

  const updateDistancePricingRule = async (
    id: number,
    updates: AdminUpdateDistanceRulePayload
  ): Promise<boolean> => {
    try {
      await updateDistanceRule(id, updates);
      setDistanceRules((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
      return true;
    } catch (err: any) {
      console.error("Failed to update distance rule:", err);
      return false;
    }
  };

  const createDistancePricingRule = async (
    payload: AdminCreateDistanceRulePayload
  ): Promise<boolean> => {
    try {
      const res = await createDistanceRule(payload);
      if (res && res.distance_rule) {
        setDistanceRules((prev) => [...prev, res.distance_rule]);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Failed to create distance rule:", err);
      return false;
    }
  };

  return (
    <PricingContext.Provider
      value={{
        rates,
        updateRate,
        saveStatus,
        saveMessage,
        saveAllChanges,
        resetToDefaults,
        isLoading,
        refreshPricingData,
        activeTab,
        setActiveTab,
        addOns,
        updateAddOnItem,
        createAddOnItem,
        deleteAddOnItem,
        distanceRules,
        updateDistancePricingRule,
        createDistancePricingRule,
      }}
    >
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
}
