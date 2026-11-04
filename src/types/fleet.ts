import { VehiclePrices } from "./api";

export type VehicleStatus = "active" | "maintenance" | "inactive";

export interface Vehicle {
  id: string;
  apiId?: number;
  fleetNumber: string;
  name: string;
  model: string;
  description?: string;
  category: "6_seater" | "7_seater" | "9_seater" | "13_seater" | "wheelchair" | "luxury_sedan";
  plateNumber: string;
  paxCapacity: number;
  luggageCapacity: number;
  baseRate: number;
  meetAndGreet?: number;
  hourlyRate: number;
  charter8h?: number;
  status: VehicleStatus;
  driverName: string;
  driverPhone: string;
  features: string[];
  imageUrl?: string;
  imagePath?: string;
  lastServiceDate?: string;
  prices?: VehiclePrices;
}
