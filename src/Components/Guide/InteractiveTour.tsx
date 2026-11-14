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
  const cardRef = useRef<HTMLDivElement>(null);

  // Position and highlight target element
  useEffect(() => {
    if (!isTourOpen || !currentStepData) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      if (currentStepData.targetSelector) {
        const el = document.querySelector(currentStepData.targetSelector);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    // Small delay to allow any page transitions/rendering
    const timer = setTimeout(updatePosition, 150);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
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
          className="fixed pointer-events-none z-50 rounded-2xl ring-4 ring-amber-400 ring-offset-4 ring-offset-white/80 shadow-[0_0_0_9999px_rgba(7,30,59,0.55)] transition-all duration-300 ease-out"
        >
          <div className="absolute -top-3.5 left-4 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse">
            <Sparkles className="size-3" />
            <span>Spotlight</span>
          </div>
        </div>
      )}

      {/* Backdrop (if target not found or covering whole screen) */}
      {!targetRect && (
        <div
          onClick={closeTour}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Floating Tour Card */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-end sm:items-center justify-center p-3 sm:p-5 font-['Manrope']">
        <div
          ref={cardRef}
          className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 mb-2 sm:mb-0"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Progress Bar */}
          <div className="w-full h-1.5 bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Header */}
          <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-stone-100 flex justify-between items-center bg-stone-50/70">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#071E3B] text-white text-[11px] font-bold rounded-full tracking-wide shadow-2xs">
                Step {currentTourStep + 1} of {totalSteps}
              </span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full flex items-center gap-1">
                <Sparkles className="size-3 text-amber-600" />
                <span>
                  {tourMode === "page"
                    ? `${currentStepData.pageName} Quick Tour`
                    : "Full App Tour"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={closeTour}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
                aria-label="Close tour"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-3.5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
                {getStepIcon(currentStepData.iconName)}
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                  📍 {currentStepData.pageName} Page
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#071E3B] leading-snug">
                  {currentStepData.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Key Features Bullet points */}
            {currentStepData.keyPoints && currentStepData.keyPoints.length > 0 && (
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex flex-col gap-2">
                {currentStepData.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="size-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold">
                      ✓
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900">
                        {point.title}:{" "}
                      </span>
                      <span className="text-slate-600">{point.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tip Box */}
            {currentStepData.tip && (
              <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 flex items-start gap-2 text-xs text-amber-900">
                <Lightbulb className="size-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Pro Tip: </span>
                  <span>{currentStepData.tip}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Step Dots & Mode link */}
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={`transition-all duration-200 rounded-full cursor-pointer ${
                      idx === currentTourStep
                        ? "w-5 h-2 bg-[#071E3B]"
                        : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
                    }`}
                    title={`Go to step ${idx + 1}`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              {tourMode === "page" ? (
                <button
                  type="button"
                  onClick={startFullAppTour}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold ml-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="size-3" />
                  <span>Full App Tour</span>
                </button>
              ) : null}
            </div>

            {/* Next / Prev / Finish */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
              <button
                type="button"
                onClick={closeTour}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mr-auto sm:mr-0"
              >
                Skip
              </button>

              {currentTourStep > 0 && (
                <button
                  type="button"
                  onClick={prevTourStep}
                  className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-[#071E3B] text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={nextTourStep}
                className="px-4 py-1.5 bg-[#071E3B] hover:bg-[#0B2A4A] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>{isLastStep ? "Finish Tour" : "Next Step"}</span>
                {isLastStep ? (
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                ) : (
                  <ArrowRight className="size-3.5 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
