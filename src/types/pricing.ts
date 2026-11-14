import { ApiAddOn, ApiDistanceRule } from "./api";

export interface VehiclePricingRate {
  id: string;
  apiId?: number;
  name: string;
  model: string;
  capacityText: string;
  baseFare: number;
  meetAndGreet: number;
  hourlyRate: number;
  charter3h: number;
  charter8h: number;
}

export type PricingTab = "vehicle_rates" | "addons" | "distance_rules";

export type { ApiAddOn, ApiDistanceRule };
