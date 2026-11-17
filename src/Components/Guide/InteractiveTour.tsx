"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGuide } from "@/context/GuideContext";
import {
  LayoutGrid,
  CalendarDays,
  Car,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  X,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Compass,
} from "lucide-react";

interface PositionState {
  isAttached: boolean;
  placement: "bottom" | "top" | "center";
  top?: number;
  bottom?: number;
  left?: number;
  arrowLeft?: number;
}

export default function InteractiveTour() {
  const {
    isTourOpen,
    tourMode,
    currentTourStep,
    currentStepData,
    totalSteps,
    nextTourStep,
    prevTourStep,
    goToStep,
    closeTour,
    startFullAppTour,
    openGuideModal,
  } = useGuide();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [pos, setPos] = useState<PositionState>({
    isAttached: false,
    placement: "center",
  });
  const cardRef = useRef<HTMLDivElement>(null);

  // Position and highlight target element
  useEffect(() => {
    if (!isTourOpen || !currentStepData) {
      setTargetRect(null);
      setPos({ isAttached: false, placement: "center" });
      return;
    }

    const getTargetEl = () => {
      if (!currentStepData.targetSelector) return null;
      return document.querySelector(currentStepData.targetSelector);
    };

    const updateCoordinates = () => {
      const el = getTargetEl();
      if (!el) {
        setTargetRect(null);
        setPos({ isAttached: false, placement: "center" });
        return;
      }

      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      if (typeof window === "undefined") return;

      const winH = window.innerHeight;
      const winW = window.innerWidth;
      const cardH = cardRef.current?.offsetHeight || 150;
      const cardW = Math.min(340, winW - 32);

      const spaceBelow = winH - rect.bottom;
      const spaceAbove = rect.top;

      let placement: "bottom" | "top" | "center" = "bottom";
      let top: number | undefined;
      let bottom: number | undefined;

      // Smart placement: prioritize placing card where there is ample unobstructed room
      if (spaceBelow >= cardH + 16) {
        placement = "bottom";
        top = Math.max(12, rect.bottom + 12);
      } else if (spaceAbove >= cardH + 16) {
        placement = "top";
        bottom = Math.max(12, winH - rect.top + 12);
      } else if (spaceBelow >= spaceAbove) {
        placement = "bottom";
        top = Math.max(12, rect.bottom + 8);
      } else {
        placement = "top";
        bottom = Math.max(12, winH - rect.top + 8);
      }

      // Horizontal alignment: align with target element left edge, clamped to viewport margins
      let left: number;
      if (winW < 640) {
        left = 16;
      } else {
        const idealLeft = rect.left;
        const maxLeft = winW - cardW - 20;
        const minLeft = 20;
        left = Math.max(minLeft, Math.min(maxLeft, idealLeft));
      }

      // Arrow position pointing at target center
      const targetCenter = rect.left + rect.width / 2;
      const arrowLeft = Math.max(24, Math.min(cardW - 24, targetCenter - left));

      setPos({
        isAttached: true,
        placement,
        top,
        bottom,
        left,
        arrowLeft,
      });
    };

    // 1. One-time smooth scroll when step changes to position target cleanly in upper viewport
    const el = getTargetEl();
    if (el) {
      const rect = el.getBoundingClientRect();
      const cardH = 150;
      const spaceNeeded = rect.height + cardH + 30;
      const elPageTop = rect.top + window.scrollY;

      if (rect.top < 70 || rect.bottom > window.innerHeight - 80) {
        if (spaceNeeded <= window.innerHeight - 70) {
          window.scrollTo({
            top: Math.max(0, elPageTop - 80),
            behavior: "smooth",
          });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    // 2. Initial calculation with small delay for DOM layout / smooth scroll
    const timer1 = setTimeout(updateCoordinates, 80);
    const timer2 = setTimeout(updateCoordinates, 360);

    // 3. Keep coordinates synced on scroll or resize without triggering new scrolls
    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates);
    };
  }, [isTourOpen, currentStepData, currentTourStep]);

  if (!isTourOpen || !currentStepData) return null;

  const getStepIcon = (name: string) => {
    switch (name) {
      case "LayoutGrid":
        return <LayoutGrid className="size-5 text-amber-500" />;
      case "CalendarDays":
        return <CalendarDays className="size-5 text-amber-500" />;
      case "Car":
        return <Car className="size-5 text-amber-500" />;
      case "DollarSign":
        return <DollarSign className="size-5 text-amber-500" />;
      case "MessageSquare":
        return <MessageSquare className="size-5 text-amber-500" />;
      default:
        return <Sparkles className="size-5 text-amber-500" />;
    }
  };

  const progressPercent = ((currentTourStep + 1) / totalSteps) * 100;
  const isLastStep = currentTourStep === totalSteps - 1;

  return (
    <>
      {/* Target Element Spotlight Cutout / Ring */}
      {targetRect && (
        <div
          style={{
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          className="fixed pointer-events-none z-50 rounded-2xl ring-4 ring-amber-400 ring-offset-4 ring-offset-white/80 shadow-[0_0_0_9999px_rgba(7,30,59,0.55)] transition-all duration-200 ease-out"
        >
          <div className="absolute -top-3 left-3 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="size-2.5" />
            <span>Guide</span>
          </div>
        </div>
      )}

      {/* Backdrop: click anywhere outside to dismiss */}
      <div
        onClick={closeTour}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity duration-200 cursor-default"
        title="Click outside to exit tour"
      />

      {/* Floating Tour Card positioned near target element or centered if modal */}
      <div
        className={
          pos.isAttached
            ? "fixed z-50 pointer-events-none font-['Manrope'] transition-all duration-200 ease-out"
            : "fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-3 font-['Manrope']"
        }
        style={
          pos.isAttached
            ? {
                top: pos.top !== undefined ? `${pos.top}px` : undefined,
                bottom: pos.bottom !== undefined ? `${pos.bottom}px` : undefined,
                left: pos.left !== undefined ? `${pos.left}px` : undefined,
                width: "min(340px, calc(100vw - 32px))",
              }
            : undefined
        }
      >
        <div
          ref={cardRef}
          className="relative pointer-events-auto w-full bg-white rounded-xl shadow-xl border border-stone-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          role="dialog"
          aria-modal="true"
        >
          {/* Directional pointer arrow pointing to the spotlighted element */}
          {pos.isAttached && pos.placement === "bottom" && (
            <div
              style={{ left: pos.arrowLeft ? `${pos.arrowLeft}px` : "24px" }}
              className="absolute -top-1.5 size-3 bg-white border-t border-l border-stone-200 rotate-45 z-20 -translate-x-1/2"
            />
          )}
          {pos.isAttached && pos.placement === "top" && (
            <div
              style={{ left: pos.arrowLeft ? `${pos.arrowLeft}px` : "24px" }}
              className="absolute -bottom-1.5 size-3 bg-stone-50 border-b border-r border-stone-200 rotate-45 z-20 -translate-x-1/2"
            />
          )}

          {/* Header row: Step pill & Close */}
          <div className="px-3.5 pt-3 pb-1 flex justify-between items-center">
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 tracking-wide">
              Step {currentTourStep + 1} of {totalSteps}
            </span>
            <button
              type="button"
              onClick={closeTour}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close tour"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Compact Body Content */}
          <div className="px-3.5 py-1.5 flex flex-col gap-1">
            <h3 className="text-sm font-bold text-[#071E3B] leading-tight">
              {currentStepData.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Compact Footer Controls */}
          <div className="px-3.5 py-2.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={closeTour}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Skip
            </button>

            <div className="flex items-center gap-1.5">
              {currentTourStep > 0 && (
                <button
                  type="button"
                  onClick={prevTourStep}
                  className="px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-50 text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={nextTourStep}
                className="px-3 py-1 bg-[#071E3B] hover:bg-[#0B2A4A] text-white text-xs font-semibold rounded-md inline-flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <span>{isLastStep ? "Finish" : "Next"}</span>
                {isLastStep ? (
                  <CheckCircle2 className="size-3 text-emerald-400" />
                ) : (
                  <ArrowRight className="size-3 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
