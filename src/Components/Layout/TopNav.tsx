"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopNavProps {
  onOpenMobileMenu: () => void;
}

export default function TopNav({ onOpenMobileMenu }: TopNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    if (pathname === "/" || pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/bookings")) return "Bookings";
    if (pathname.startsWith("/fleet")) return "Fleet";
    if (pathname.startsWith("/pricing")) return "Pricing";
    return "Dashboard";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="self-stretch h-14 px-4 sm:px-6 bg-color-background-white border-b border-color-border-subtle inline-flex justify-between items-center sticky top-0 z-30 font-['Manrope']">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex justify-start items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="inline-flex flex-col justify-start items-start">
          <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-5">
            Singapore Maxicabs
          </div>
        </div>
        <div className="inline-flex flex-col justify-start items-start">
          <div className="justify-start text-gray-300 text-base font-normal font-['Manrope'] leading-6">
            /
          </div>
        </div>
        <div className="inline-flex flex-col justify-start items-start">
          <div className="justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] capitalize leading-5">
            {getPageTitle()}
          </div>
        </div>
      </div>

      {/* Right: User Avatar & Dropdown */}
      <div className="flex-1 flex justify-end items-center relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="User profile menu"
        >
          <div className="size-8 bg-color-background-brand rounded-full flex justify-center items-center flex-shrink-0 shadow-xs">
            <div className="justify-start text-color-text-inverse text-xs font-bold font-['Manrope'] leading-4">
              {user?.initials || "AD"}
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-11 mt-1 w-56 bg-white rounded-xl shadow-xl border border-color-border-subtle overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-3.5 border-b border-gray-100 bg-stone-50/50">
              <p className="text-xs font-bold text-slate-900 capitalize truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {user?.email || "admin@singaporemaxicabs.com.sg"}
              </p>
              <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded capitalize">
                {user?.role || "admin"}
              </span>
            </div>

            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
