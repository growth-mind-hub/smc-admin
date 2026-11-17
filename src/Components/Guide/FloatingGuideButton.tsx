"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGuide } from "@/context/GuideContext";
import { Sparkles, BookOpen, X, HelpCircle, ChevronUp, Compass } from "lucide-react";
import Link from "next/link";

export default function FloatingGuideButton() {
  const { isTourOpen, startTour, startFullAppTour, openGuideModal } = useGuide();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isTourOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-40 font-['Manrope'] select-none"
    >
      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="p-3.5 bg-[#071E3B] text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-400" />
              <span className="text-xs font-bold">Client Walkthrough & Help</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                startTour({ pageSpecific: true });
              }}
              className="w-full p-2.5 rounded-xl hover:bg-amber-50/70 text-left flex items-start gap-3 transition-colors cursor-pointer group"
            >
              <div className="size-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <Sparkles className="size-4 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Quick Page Tour (Here)
                </div>
                <div className="text-[11px] text-slate-500">
                  Spotlight walkthrough of this screen only
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                startFullAppTour();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 text-left flex items-start gap-3 transition-colors cursor-pointer group"
            >
              <div className="size-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <Compass className="size-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Full App Walkthrough
                </div>
                <div className="text-[11px] text-slate-500">
                  Step-by-step tour across every module
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openGuideModal();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 text-left flex items-start gap-3 transition-colors cursor-pointer group"
            >
              <div className="size-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <BookOpen className="size-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Operations Manual Modal
                </div>
                <div className="text-[11px] text-slate-500">
                  Browse SOPs, WhatsApp templates & FAQ
                </div>
              </div>
            </button>

            <Link
              href="/guide"
              onClick={() => setIsOpen(false)}
              className="w-full p-2 rounded-lg text-center block text-[11px] font-bold text-amber-700 hover:bg-stone-100 transition-colors"
            >
              Go to Full Documentation Page (/guide) →
            </Link>
          </div>
        </div>
      )}

      {/* Main Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2.5 bg-[#071E3B] hover:bg-[#0B2A4A] text-white rounded-full shadow-lg hover:shadow-xl inline-flex items-center gap-2 border border-amber-400/30 transition-all cursor-pointer group"
        aria-label="Open client walkthrough guide"
        title="Open client walkthrough guide"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <Sparkles className="size-4 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold">App Tour & Guide</span>
        <ChevronUp
          className={`size-3.5 text-white/70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}

