"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HeroBanner() {
  const { user } = useAuth();
  return (
    <div className="self-stretch p-8 bg-color-background-brand rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="max-w-md inline-flex flex-col justify-start items-start">
        <div className="self-stretch flex flex-col justify-start items-start">
          <div className="justify-start text-orange-400 text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-widest">
            Good Morning
          </div>
        </div>
        <div className="self-stretch pt-1 flex flex-col justify-start items-start">
          <div className="justify-start text-color-text-inverse text-2xl sm:text-3xl font-bold font-['Manrope'] leading-10 capitalize">
            Welcome back, {user?.name || "Owner"}
          </div>
        </div>
        <div className="self-stretch pt-1 flex flex-col justify-start items-start">
          <div className="justify-start text-white/60 text-xs font-normal font-['Manrope'] leading-5">
            Here&apos;s what&apos;s happening with your business today
          </div>
        </div>
      </div>

      <div className="flex justify-start items-start gap-3 flex-shrink-0">
        <Link
          href="/bookings"
          className="px-5 py-2.5 bg-color-background-accent rounded-lg inline-flex flex-col justify-start items-start hover:brightness-105 transition-all cursor-pointer"
        >
          <div className="justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
            View Bookings
          </div>
        </Link>
        <Link
          href="/fleet"
          className="px-5 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/20 inline-flex flex-col justify-start items-start hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="justify-start text-color-text-inverse text-xs font-semibold font-['Manrope'] leading-5">
            Manage Fleet
          </div>
        </Link>
      </div>
    </div>
  );
}
