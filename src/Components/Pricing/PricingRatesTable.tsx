"use client";

import React from "react";
import { usePricing } from "@/context/PricingContext";
import { VehiclePricingRate } from "@/types/pricing";
import NumericInput from "@/Components/Common/NumericInput";

export default function PricingRatesTable() {
  const { rates, updateRate, isLoading } = usePricing();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3.5">Vehicle</th>
              <th className="px-5 py-3.5">Capacity</th>
              <th className="px-5 py-3.5">Base Fare</th>
              <th className="px-5 py-3.5">Arrival Driveway Pickup</th>
              <th className="px-5 py-3.5">3-Hour Charter</th>
              <th className="px-5 py-3.5">8-Hour Charter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-[#071E3B]">
            {isLoading ? (
              [...Array(6)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-4 w-[280px]">
                    <div className="h-4 w-40 bg-slate-200 rounded mb-1.5" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3.5 w-24 bg-slate-100 rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-8 w-20 bg-slate-100 rounded-md" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-8 w-20 bg-slate-100 rounded-md" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-8 w-20 bg-slate-100 rounded-md" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-8 w-20 bg-slate-100 rounded-md" />
                  </td>
                </tr>
              ))
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No vehicle pricing rates found.
                </td>
              </tr>
            ) : (
              rates.map((rate: VehiclePricingRate) => (
                <tr
                  key={rate.id}
                  className="hover:bg-[#FBF7EC]/40 transition-colors"
                >
                  {/* Vehicle Name & Model */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-xs text-[#071E3B]">
                      {rate.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{rate.model}</div>
                  </td>

                  {/* Capacity */}
                  <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                    {rate.capacityText}
                  </td>

                  {/* Base Fare Input */}
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1 bg-slate-50 hover:bg-white border border-slate-200 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-[#C6A45A] focus-within:border-[#C6A45A]">
                      <span className="text-[#C6A45A] font-semibold">$</span>
                      <NumericInput
                        value={rate.baseFare}
                        onChange={(val) => updateRate(rate.id, "baseFare", val)}
                        className="w-12 text-center text-[#C6A45A] font-semibold text-sm bg-transparent outline-none"
                      />
                    </div>
                  </td>

                  {/* Arrival Driveway Pickup Input */}
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1 bg-slate-50 hover:bg-white border border-slate-200 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-[#C6A45A] focus-within:border-[#C6A45A]">
                      <span className="text-[#C6A45A] font-semibold">$</span>
                      <NumericInput
                        value={rate.meetAndGreet}
                        onChange={(val) => updateRate(rate.id, "meetAndGreet", val)}
                        className="w-12 text-center text-[#C6A45A] font-semibold text-sm bg-transparent outline-none"
                      />
                    </div>
                  </td>

                  {/* 3-Hour Charter Input */}
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1 bg-slate-50 hover:bg-white border border-slate-200 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-[#C6A45A] focus-within:border-[#C6A45A]">
                      <span className="text-[#C6A45A] font-semibold">$</span>
                      <NumericInput
                        value={rate.charter3h}
                        onChange={(val) => updateRate(rate.id, "charter3h", val)}
                        className="w-14 text-center text-[#C6A45A] font-semibold text-sm bg-transparent outline-none"
                      />
                    </div>
                  </td>

                  {/* 8-Hour Charter Input */}
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1 bg-slate-50 hover:bg-white border border-slate-200 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-[#C6A45A] focus-within:border-[#C6A45A]">
                      <span className="text-[#C6A45A] font-semibold">$</span>
                      <NumericInput
                        value={rate.charter8h}
                        onChange={(val) => updateRate(rate.id, "charter8h", val)}
                        className="w-14 text-center text-[#C6A45A] font-semibold text-sm bg-transparent outline-none"
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
  );
}
