"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGuide } from "@/context/GuideContext";
import {
  LayoutGrid,
  CalendarDays,
  Car,
  DollarSign,
  LogOut,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { startTour, openGuideModal } = useGuide();

  const isDashboard = pathname === "/" || pathname === "/dashboard";
  const isBookings = pathname.startsWith("/bookings");
  const isFleet = pathname.startsWith("/fleet");
  const isPricing = pathname.startsWith("/pricing");

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      active: isDashboard,
      icon: LayoutGrid,
    },
    {
      name: "Bookings",
      href: "/bookings",
      active: isBookings,
      icon: CalendarDays,
    },
    {
      name: "Fleet",
      href: "/fleet",
      active: isFleet,
      icon: Car,
    },
    {
      name: "Pricing",
      href: "/pricing",
      active: isPricing,
      icon: DollarSign,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar matching Figma design */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-color-background-brand flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="self-stretch flex-1 flex flex-col justify-start items-start">
          {/* Logo / Header */}
          <div className="self-stretch p-3 border-b border-white/10 flex flex-col justify-start items-start gap-2">
            <div className="w-full flex justify-between items-center">
              <Link
                href="/"
                className="flex-1 flex flex-col items-start group"
                title="Singapore Maxicabs Dashboard"
              >
                <div className="w-full bg-white/5 group-hover:bg-white/10 border border-white/10 group-hover:border-amber-400/30 rounded-xl p-3 flex flex-col items-start gap-2.5 transition-all shadow-2xs">
                  <div className="w-full flex items-center justify-start">
                    <Image
                      src="/logo.png"
                      alt="Singapore Maxicabs"
                      width={600}
                      height={206}
                      className="w-full max-w-[190px] h-auto max-h-12 object-contain object-left group-hover:scale-[1.02] transition-transform"
                      priority
                    />
                  </div>
                  <div className="w-full flex items-center justify-between pt-1.5 border-t border-white/10">
                    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold tracking-widest uppercase text-amber-400 font-['Manrope']">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Admin Portal
                    </span>
                    <span className="text-[9.5px] text-white/40 font-medium font-['Manrope'] tracking-wider uppercase">
                      Operations
                    </span>
                  </div>
                </div>
              </Link>

              {/* Mobile close button */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden text-white/60 hover:text-white p-1 ml-1 flex-shrink-0 cursor-pointer self-start mt-1"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nav Items */}
          <div className="self-stretch flex-1 px-3 py-4 flex flex-col justify-start items-start gap-1 overflow-hidden">
            <div className="w-52 h-6 px-3 pb-2 flex flex-col justify-start items-start">
              <div className="justify-start text-white/30 text-[10px] font-semibold font-['Manrope'] uppercase leading-4 tracking-wider">
                Management
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`self-stretch px-3 py-2.5 rounded-lg inline-flex justify-start items-center gap-3 transition-colors ${
                    item.active
                      ? "bg-color-background-accent text-color-text-primary"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`size-4.5 flex-shrink-0 ${
                      item.active ? "text-slate-900" : "text-white/70"
                    }`}
                  />
                  <div
                    className={`justify-start text-sm font-['Manrope'] leading-5 ${
                      item.active
                        ? "text-color-text-primary font-semibold"
                        : "text-white/70 font-medium"
                    }`}
                  >
                    {item.name}
                  </div>
                </Link>
              );
            })}

            {/* Assistance / Tour section */}
            <div className="w-52 h-6 px-3 pt-4 pb-1 flex flex-col justify-start items-start">
              <div className="justify-start text-white/30 text-[10px] font-semibold font-['Manrope'] uppercase leading-4 tracking-wider">
                Assistance
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                startTour({ pageSpecific: true });
              }}
              className="w-full px-3 py-2.5 rounded-lg inline-flex justify-between items-center text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="size-4.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Quick Page Tour</span>
              </div>
              <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded">
                Tour
              </span>
            </button>

            <Link
              href="/guide"
              onClick={onCloseMobile}
              className={`w-full px-3 py-2.5 rounded-lg inline-flex items-center gap-3 transition-colors ${
                pathname === "/guide"
                  ? "bg-color-background-accent text-color-text-primary font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white font-medium"
              }`}
            >
              <BookOpen
                className={`size-4.5 ${
                  pathname === "/guide" ? "text-slate-900" : "text-white/60"
                }`}
              />
              <span className="text-sm">Operations Guide</span>
            </Link>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="self-stretch px-3 pt-3 pb-8 sm:pb-6 border-t border-white/10 flex flex-col justify-start items-start gap-1">
          <button
            type="button"
            onClick={logout}
            className="w-full px-3 py-2.5 rounded-lg inline-flex justify-start items-center gap-3 text-red-400 hover:bg-red-950/20 transition-colors text-left cursor-pointer"
          >
            <LogOut className="size-4 text-red-400 flex-shrink-0" />
            <div className="justify-start text-red-400 text-xs font-normal font-['Manrope'] leading-5">
              Sign Out
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
