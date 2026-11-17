export interface TourStep {
  id: string;
  stepNumber: number;
  totalStepsInPage: number;
  pageKey: "dashboard" | "bookings" | "fleet" | "pricing" | "all";
  pageName: string;
  path: string;
  title: string;
  targetSelector?: string;
  badge: string;
  iconName: "LayoutGrid" | "CalendarDays" | "Car" | "DollarSign" | "MessageSquare" | "CheckCircle2" | "Sparkles";
  description: string;
  keyPoints?: {
    title: string;
    description: string;
  }[];
  tip?: string;
}

export type GuideTab =
  | "overview"
  | "bookings"
  | "fleet"
  | "pricing"
  | "whatsapp"
  | "faq";
