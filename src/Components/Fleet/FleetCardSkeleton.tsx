"use client";

import React from "react";

export default function FleetCardSkeleton() {
  return (
    <div className="bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex flex-col justify-start items-start overflow-hidden font-['Manrope'] animate-pulse">
      {/* Top Banner Image Skeleton */}
      <div className="self-stretch h-40 bg-stone-200 relative overflow-hidden flex items-center justify-center">
        <div className="w-full px-3 py-2.5 left-0 top-0 absolute inline-flex justify-between items-start">
          <div className="h-5 w-16 bg-stone-300 rounded-md" />
          <div className="h-5 w-14 bg-stone-300 rounded-full" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="self-stretch flex-1 p-4 flex flex-col justify-start items-start gap-3 w-full">
        {/* Title & Model */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5 w-full">
          <div className="h-5 w-3/4 bg-stone-200 rounded" />
          <div className="h-3.5 w-1/2 bg-stone-200 rounded" />
          <div className="h-3 w-full bg-stone-100 rounded mt-0.5" />
        </div>

        {/* Assigned Driver Row Skeleton */}
        <div className="self-stretch px-3 py-2 bg-stone-100 rounded-lg inline-flex justify-between items-center gap-2 w-full">
          <div className="size-7 bg-stone-200 rounded-full flex-shrink-0" />
          <div className="flex-1 inline-flex flex-col gap-1">
            <div className="h-3.5 w-24 bg-stone-200 rounded" />
            <div className="h-3 w-28 bg-stone-200 rounded" />
          </div>
          <div className="size-7 bg-stone-200 rounded-md flex-shrink-0" />
        </div>

        {/* 6 Specs Rows Skeleton */}
        <div className="self-stretch grid grid-cols-2 gap-1.5 w-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="px-2.5 py-2 bg-stone-100 rounded-lg flex justify-between items-center"
            >
              <div className="h-3 w-12 bg-stone-200 rounded" />
              <div className="h-3 w-10 bg-stone-200 rounded" />
            </div>
          ))}
        </div>

        {/* Footer Actions Skeleton */}
        <div className="self-stretch pt-2 border-t border-color-border-subtle flex justify-between items-center w-full mt-auto">
          <div className="h-8 w-24 bg-stone-200 rounded-lg" />
          <div className="h-4 w-16 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

