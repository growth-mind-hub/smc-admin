import { TourStep } from "@/types/guide";

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: "dash-1",
    stepNumber: 1,
    totalStepsInPage: 3,
    pageKey: "dashboard",
    pageName: "Dashboard",
    path: "/",
    title: "Live Revenue & Fleet Metrics",
    targetSelector: '[data-tour="dashboard-metrics"]',
    badge: "Live KPIs",
    iconName: "LayoutGrid",
    description:
      "Monitor your live operations at a glance. Total revenue, active maxicabs, and confirmed/completed trips are dynamically calculated in real time.",
    keyPoints: [
      {
        title: "Dynamic Revenue",
        description: "Updates automatically as trips are marked as Completed.",
      },
      {
        title: "Active Fleet Count",
        description: "Shows vehicles currently available for booking versus in maintenance.",
      },
    ],
    tip: "Hover over each metric card for quick breakdowns.",
  },
  {
    id: "dash-2",
    stepNumber: 2,
    totalStepsInPage: 3,
    pageKey: "dashboard",
    pageName: "Dashboard",
    path: "/",
    title: "Today's Dispatch Schedule",
    targetSelector: '[data-tour="dashboard-schedule"]',
    badge: "Schedule",
    iconName: "CalendarDays",
    description:
      "Review today's immediate pickup schedule. Check pickup times, passenger names, flight numbers, vehicle types, and assigned drivers.",
    keyPoints: [
      {
        title: "Immediate Awareness",
        description: "Spot unassigned trips that need driver allocation.",
      },
      {
        title: "Flight Paging",
        description: "Arrival flights are tracked with airport terminal driveway pickup details.",
      },
    ],
    tip: "Click on any booking in this table to view its full details.",
  },
  {
    id: "dash-3",
    stepNumber: 3,
    totalStepsInPage: 3,
    pageKey: "dashboard",
    pageName: "Dashboard",
    path: "/",
    title: "Quick Action Triggers",
    targetSelector: '[data-tour="dashboard-hero"]',
    badge: "Quick Actions",
    iconName: "Sparkles",
    description:
      "Create direct reservations or jump straight into fleet management using the quick actions on your executive banner.",
    keyPoints: [
      {
        title: "+ New Booking",
        description: "Create phone-in reservations with capacity validation in seconds.",
      },
      {
        title: "Manage Fleet",
        description: "Check vehicle availability and maintenance logs with 1 click.",
      },
    ],
    tip: "You can also press '+ New Booking' anytime from the Bookings page.",
  },
];

export const BOOKINGS_TOUR_STEPS: TourStep[] = [
  {
    id: "book-1",
    stepNumber: 1,
    totalStepsInPage: 4,
    pageKey: "bookings",
    pageName: "Bookings",
    path: "/bookings",
    title: "+ New Booking Dispatch Modal",
    targetSelector: '[data-tour="bookings-new-btn"]',
    badge: "New Booking",
    iconName: "CalendarDays",
    description:
      "Click '+ New Booking' to create telephone or walk-in reservations. It validates luggage and passenger counts, looks up Singapore addresses, and calculates fares.",
    keyPoints: [
      {
        title: "Google Places Autocomplete",
        description: "Instant address suggestions for Singapore landmarks and terminals.",
      },
      {
        title: "Capacity Safety Check",
        description: "Warns if passengers or bags exceed the vehicle capacity.",
      },
    ],
    tip: "For Airport Arrival bookings, be sure to enter the Flight Number.",
  },
  {
    id: "book-2",
    stepNumber: 2,
    totalStepsInPage: 4,
    pageKey: "bookings",
    pageName: "Bookings",
    path: "/bookings",
    title: "Live Status Filter Tabs",
    targetSelector: '[data-tour="bookings-tabs"]',
    badge: "Filter Tabs",
    iconName: "CheckCircle2",
    description:
      "Easily toggle between Confirmed, Completed, Cancelled, and Pending bookings to stay on top of daily dispatch operations.",
    keyPoints: [
      {
        title: "Pending Tab",
        description: "Trips awaiting driver assignment or passenger confirmation.",
      },
      {
        title: "Confirmed & In Progress",
        description: "Active jobs currently on the road.",
      },
    ],
    tip: "Status counts update automatically as bookings are created or updated.",
  },
  {
    id: "book-3",
    stepNumber: 3,
    totalStepsInPage: 4,
    pageKey: "bookings",
    pageName: "Bookings",
    path: "/bookings",
    title: "Real-Time Search Bar",
    targetSelector: '[data-tour="bookings-search"]',
    badge: "Quick Search",
    iconName: "LayoutGrid",
    description:
      "Find any booking instantly by searching passenger name, Singapore mobile number (+65), vehicle plate, or booking reference code.",
    keyPoints: [
      {
        title: "Instant Filtering",
        description: "Results filter as you type with zero delay.",
      },
    ],
    tip: "Type the customer's phone number or booking ref for the fastest lookup.",
  },
  {
    id: "book-4",
    stepNumber: 4,
    totalStepsInPage: 4,
    pageKey: "bookings",
    pageName: "Bookings",
    path: "/bookings",
    title: "Driver Assignment & One-Click WhatsApp",
    targetSelector: '[data-tour="bookings-table"]',
    badge: "WhatsApp Dispatch",
    iconName: "MessageSquare",
    description:
      "Assign drivers from the roster, then use the 1-click WhatsApp buttons to dispatch trip manifests to drivers and confirmations to passengers.",
    keyPoints: [
      {
        title: "WhatsApp Driver Manifest",
        description: "Sends full pickup, flight, passenger, and luggage details.",
      },
      {
        title: "Customer Confirmation",
        description: "Sends a professional confirmation message to the passenger.",
      },
    ],
    tip: "Click on any booking row to slide open the complete details drawer on the right.",
  },
];

export const FLEET_TOUR_STEPS: TourStep[] = [
  {
    id: "fleet-1",
    stepNumber: 1,
    totalStepsInPage: 3,
    pageKey: "fleet",
    pageName: "Fleet",
    path: "/fleet",
    title: "+ Add New Maxicab",
    targetSelector: '[data-tour="fleet-add-btn"]',
    badge: "Fleet Expansion",
    iconName: "Car",
    description:
      "Register new vehicles into your fleet. Configure license plate numbers, vehicle categories (6, 7, 9, 13-seater), passenger capacity, and luggage limits.",
    keyPoints: [
      {
        title: "Standard Capacities",
        description: "6/7-Seater: 6-7 Pax · 5 Bags | 9-Seater: 9 Pax · 7 Bags | 13-Seater: 13 Pax · 10 Bags.",
      },
      {
        title: "Vehicle Photo Upload",
        description: "Upload high-res imagery for client presentation.",
      },
    ],
    tip: "Assign a primary driver during vehicle registration for streamlined dispatching.",
  },
  {
    id: "fleet-2",
    stepNumber: 2,
    totalStepsInPage: 3,
    pageKey: "fleet",
    pageName: "Fleet",
    path: "/fleet",
    title: "Fleet Filters & Availability",
    targetSelector: '[data-tour="fleet-filters"]',
    badge: "Status Tabs",
    iconName: "CheckCircle2",
    description:
      "Filter your fleet between All Fleets, Active vehicles on the road, and vehicles currently in Maintenance or Inactive.",
    keyPoints: [
      {
        title: "Maintenance Exclusion",
        description: "Inactive vehicles are excluded from public booking selection lists automatically.",
      },
    ],
    tip: "Use the filter pills to quickly see how many cars are available for dispatch right now.",
  },
  {
    id: "fleet-3",
    stepNumber: 3,
    totalStepsInPage: 3,
    pageKey: "fleet",
    pageName: "Fleet",
    path: "/fleet",
    title: "Vehicle Cards & Driver Contacts",
    targetSelector: '[data-tour="fleet-cards"]',
    badge: "Vehicle Profiles",
    iconName: "Car",
    description:
      "Each vehicle card displays the plate number, driver details, phone number, capacity limits, and direct WhatsApp contact trigger.",
    keyPoints: [
      {
        title: "Active Switch Toggle",
        description: "Toggle availability on and off directly from the Edit Vehicle modal.",
      },
      {
        title: "Direct WhatsApp Driver",
        description: "Click the green WhatsApp button on any card to message that driver immediately.",
      },
    ],
    tip: "Click 'Edit' on any vehicle card to update pricing rates, driver details, or photos.",
  },
];

export const PRICING_TOUR_STEPS: TourStep[] = [
  {
    id: "price-1",
    stepNumber: 1,
    totalStepsInPage: 3,
    pageKey: "pricing",
    pageName: "Pricing",
    path: "/pricing",
    title: "Rate Matrix & Service Overview",
    targetSelector: '[data-tour="pricing-cards"]',
    badge: "Rate Overview",
    iconName: "DollarSign",
    description:
      "Configure your base rate card. Review point-to-point flat rates, airport arrival driveway pickup rates, and hourly charter packages.",
    keyPoints: [
      {
        title: "Base Fare",
        description: "Point-to-point transfer rate within mainland Singapore.",
      },
      {
        title: "Arrival Driveway Pickup",
        description: "Airport arrival rate inclusive of flight delay buffer.",
      },
    ],
    tip: "Rates apply across all booking calculations and customer checkout flows.",
  },
  {
    id: "price-2",
    stepNumber: 2,
    totalStepsInPage: 3,
    pageKey: "pricing",
    pageName: "Pricing",
    path: "/pricing",
    title: "1-Hour Charter & Auto-Calculated Packages",
    targetSelector: '[data-tour="pricing-table"]',
    badge: "Auto-Calculation",
    iconName: "Sparkles",
    description:
      "Enter your 1-Hour Charter rate in the table. The system automatically computes and syncs 3-Hour (1hr × 3) and 8-Hour (1hr × 8) packages to guarantee pricing integrity.",
    keyPoints: [
      {
        title: "1-Hour Charter (Editable)",
        description: "Change this number to re-calculate all charter packages instantly.",
      },
      {
        title: "3h & 8h Charters (Locked)",
        description: "These fields are cursor-not-allowed to eliminate human arithmetic errors.",
      },
    ],
    tip: "Notice the 'Auto (1hr × 3)' badge indicating mathematical synchronization.",
  },
  {
    id: "price-3",
    stepNumber: 3,
    totalStepsInPage: 3,
    pageKey: "pricing",
    pageName: "Pricing",
    path: "/pricing",
    title: "Save Rates to Live Database",
    targetSelector: '[data-tour="pricing-save-btn"]',
    badge: "Database Sync",
    iconName: "CheckCircle2",
    description:
      "Whenever you adjust pricing or charter rates, click 'Save Pricing Rates' to push your changes to the live database.",
    keyPoints: [
      {
        title: "Live Database Sync",
        description: "Updates backend endpoints and invalidates cached vehicle rates.",
      },
      {
        title: "Instant Confirmation",
        description: "A green badge confirms when all vehicle rates have updated successfully.",
      },
    ],
    tip: "Remember to save before leaving the Pricing page.",
  },
];

export function getTourStepsForPage(pathname: string): TourStep[] {
  if (pathname.startsWith("/bookings")) {
    return BOOKINGS_TOUR_STEPS;
  }
  if (pathname.startsWith("/fleet") || pathname.startsWith("/fleets")) {
    return FLEET_TOUR_STEPS;
  }
  if (pathname.startsWith("/pricing")) {
    return PRICING_TOUR_STEPS;
  }
  return DASHBOARD_TOUR_STEPS;
}

export const ALL_PAGE_STEPS: TourStep[] = [
  ...DASHBOARD_TOUR_STEPS,
  ...BOOKINGS_TOUR_STEPS,
  ...FLEET_TOUR_STEPS,
  ...PRICING_TOUR_STEPS,
];
