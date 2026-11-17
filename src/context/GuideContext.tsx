"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { TourStep, GuideTab } from "@/types/guide";
import {
  getTourStepsForPage,
  ALL_PAGE_STEPS,
  DASHBOARD_TOUR_STEPS,
} from "@/data/tourSteps";

interface GuideContextType {
  isTourOpen: boolean;
  tourMode: "page" | "all";
  currentTourStep: number;
  currentStepData: TourStep;
  activeSteps: TourStep[];
  totalSteps: number;
  startTour: (options?: number | { pageSpecific?: boolean; initialStep?: number }) => void;
  startFullAppTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToStep: (index: number) => void;
  closeTour: () => void;
  isGuideModalOpen: boolean;
  openGuideModal: (tab?: GuideTab) => void;
  closeGuideModal: () => void;
  activeGuideTab: GuideTab;
  setActiveGuideTab: (tab: GuideTab) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourMode, setTourMode] = useState<"page" | "all">("page");
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<GuideTab>("overview");

  // Determine active steps based on mode and current page
  const activeSteps =
    tourMode === "all"
      ? ALL_PAGE_STEPS
      : getTourStepsForPage(pathname);

  const totalSteps = activeSteps.length;
  const currentStepData = activeSteps[currentTourStep] || activeSteps[0] || DASHBOARD_TOUR_STEPS[0];

  // Start Tour (defaults to page-specific quick tour!)
  const startTour = useCallback(
    (options?: number | { pageSpecific?: boolean; initialStep?: number }) => {
      setIsGuideModalOpen(false);
      let isPageSpecific = true;
      let initialStep = 0;

      if (typeof options === "number") {
        initialStep = options;
        isPageSpecific = true;
      } else if (options && typeof options === "object") {
        isPageSpecific = options.pageSpecific !== false;
        initialStep = options.initialStep || 0;
      }

      const mode = isPageSpecific ? "page" : "all";
      setTourMode(mode);

      const steps = isPageSpecific
        ? getTourStepsForPage(pathname)
        : ALL_PAGE_STEPS;

      const safeIndex = Math.max(
        0,
        Math.min(initialStep, steps.length - 1)
      );

      setCurrentTourStep(safeIndex);
      setIsTourOpen(true);

      // If full app tour and step path is different from current pathname, route to it
      if (!isPageSpecific && steps[safeIndex]?.path && pathname !== steps[safeIndex].path) {
        router.push(steps[safeIndex].path);
      }
    },
    [pathname, router]
  );

  // Start Full App Tour helper
  const startFullAppTour = useCallback(() => {
    startTour({ pageSpecific: false, initialStep: 0 });
  }, [startTour]);

  // Close Tour
  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("smc_tour_completed", "true");
      }
    } catch {}
  }, []);

  // Jump to specific step
  const goToStep = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(index, totalSteps - 1));
      setCurrentTourStep(safeIndex);

      // If navigating in full tour mode and path changes:
      if (tourMode === "all" && activeSteps[safeIndex]?.path && pathname !== activeSteps[safeIndex].path) {
        router.push(activeSteps[safeIndex].path);
      }
    },
    [activeSteps, pathname, router, totalSteps, tourMode]
  );

  // Next step
  const nextTourStep = useCallback(() => {
    if (currentTourStep < totalSteps - 1) {
      goToStep(currentTourStep + 1);
    } else {
      closeTour();
    }
  }, [closeTour, currentTourStep, goToStep, totalSteps]);

  // Previous step
  const prevTourStep = useCallback(() => {
    if (currentTourStep > 0) {
      goToStep(currentTourStep - 1);
    }
  }, [currentTourStep, goToStep]);

  // Open guide modal
  const openGuideModal = useCallback((tab: GuideTab = "overview") => {
    setActiveGuideTab(tab);
    setIsGuideModalOpen(true);
  }, []);

  // Close guide modal
  const closeGuideModal = useCallback(() => {
    setIsGuideModalOpen(false);
  }, []);

  // Check for ?tour=true or ?guide=true in URL on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("tour") === "true") {
          startTour({ pageSpecific: true });
        } else if (params.get("fulltour") === "true") {
          startFullAppTour();
        } else if (params.get("guide") === "true") {
          openGuideModal();
        }
      } catch {}
    }
  }, [openGuideModal, startFullAppTour, startTour]);

  // Keyboard navigation for active tour
  useEffect(() => {
    if (!isTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight") {
        nextTourStep();
      } else if (e.key === "ArrowLeft") {
        prevTourStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourOpen, closeTour, nextTourStep, prevTourStep]);

  return (
    <GuideContext.Provider
      value={{
        isTourOpen,
        tourMode,
        currentTourStep,
        currentStepData,
        activeSteps,
        totalSteps,
        startTour,
        startFullAppTour,
        nextTourStep,
        prevTourStep,
        goToStep,
        closeTour,
        isGuideModalOpen,
        openGuideModal,
        closeGuideModal,
        activeGuideTab,
        setActiveGuideTab,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error("useGuide must be used within a GuideProvider");
  }
  return context;
}
