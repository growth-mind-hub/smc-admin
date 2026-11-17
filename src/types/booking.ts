export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type BookingChannel = "whatsapp" | "website" | "phone" | "walkin" | "email";

export type ServiceType =
  | "airport_transfer"
  | "airport_departure"
  | "city_transfer"
  | "hourly_charter"
  | "special_occasions"
  | "corporate";

export type VehicleCategory =
  | "6_seater"
  | "7_seater"
  | "9_seater"
  | "13_seater"
  | "wheelchair"
  | "luxury_sedan";

export interface Booking {
  id: string;
  refNumber: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: ServiceType;
  vehicleType: VehicleCategory;
  vehicleName: string;
  fleetNumber?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  flightNumber?: string;
  passengers: number;
  luggageBags: number;
  luggage?: number;
  meetAndGreet: boolean;
  addons: string[];
  specialRequest?: string;
  notes?: string;
  status: BookingStatus;
  fare: number;
  channel: BookingChannel;
  createdAt: string;
  driverAssigned?: {
    name: string;
    phone: string;
    vehiclePlate: string;
  };
  assignedDriver?: {
    name: string;
    phone: string;
    vehiclePlate?: string;
  };
}
