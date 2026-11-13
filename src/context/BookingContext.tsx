"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { Booking, BookingStatus, BookingChannel } from "@/types/booking";
import {
  getAdminBookings,
  createAdminManualBooking,
  updateAdminBooking,
  deleteBookingApi,
} from "@/lib/api/services";
import { AdminManualBookingPayload, ApiBackendBooking } from "@/types/api";

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
  activeBookingId: string | null;
  activeBooking: Booking | null;
  isNewBookingModalOpen: boolean;
  openNewBookingModal: () => void;
  closeNewBookingModal: () => void;
  openBookingDetails: (id: string) => void;
  closeBookingDetails: () => void;
  addBooking: (data: Partial<Booking>) => Booking;
  createManualBooking: (
    payload: AdminManualBookingPayload,
    extraMeta?: {
      vehicleName?: string;
      pickupDate?: string;
      pickupTime?: string;
      serviceName?: string;
    }
  ) => Promise<{ success: boolean; booking?: any; error?: string }>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  assignDriver: (
    id: string,
    driver: { name: string; phone: string; vehiclePlate: string }
  ) => Promise<void>;
  deleteBooking: (id: string) => Promise<boolean>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  filteredBookings: Booking[];
  counts: {
    all: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

function mapBackendBookingToFrontend(
  b: ApiBackendBooking,
  index: number
): Booking {
  const vehicleName =
    b.quote_snapshot?.vehicle?.name ||
    (b.vehicle_id ? `Vehicle #${b.vehicle_id}` : "7-Seater Maxi Cab");

  let category: Booking["vehicleType"] = "7_seater";
  const lowerName = vehicleName.toLowerCase();
  if (lowerName.includes("wheelchair")) category = "wheelchair";
  else if (
    lowerName.includes("13") ||
    lowerName.includes("coach") ||
    lowerName.includes("minibus")
  )
    category = "13_seater";
  else if (lowerName.includes("9")) category = "9_seater";
  else if (
    lowerName.includes("6") ||
    lowerName.includes("alphard") ||
    lowerName.includes("vellfire")
  )
    category = "6_seater";
  else if (lowerName.includes("sedan") || lowerName.includes("class"))
    category = "luxury_sedan";

  let status: BookingStatus = "pending";
  const rawStatus = (b.booking_status || b.status || "").toUpperCase();
  if (rawStatus === "CONFIRMED" || rawStatus === "PAID") status = "confirmed";
  else if (rawStatus === "IN_PROGRESS") status = "in_progress";
  else if (rawStatus === "COMPLETED") status = "completed";
  else if (rawStatus === "CANCELLED") status = "cancelled";
  else if (rawStatus === "NEW" || rawStatus === "PENDING_PAYMENT")
    status = "pending";

  let serviceType: Booking["serviceType"] = "airport_transfer";
  const sName = (b.quote_snapshot?.service?.name || "").toLowerCase();
  if (sName.includes("departure")) serviceType = "airport_departure";
  else if (sName.includes("hourly") || (b.hours && b.hours > 0))
    serviceType = "hourly_charter";
  else if (sName.includes("city")) serviceType = "city_transfer";

  let pDate = new Date().toISOString().split("T")[0];
  let pTime = "12:00";
  if (b.created_at) {
    const d = new Date(b.created_at);
    if (!isNaN(d.getTime())) {
      pDate = d.toISOString().split("T")[0];
      pTime = d.toTimeString().substring(0, 5);
    }
  }

  const fare = b.total_amount_minor
    ? Number(b.total_amount_minor) / 100
    : (b.quote_snapshot?.total_amount || 65);

  const driverAssigned = b.driver_name
    ? {
        name: b.driver_name,
        phone: b.driver_phone || "+65 9101 1234",
        vehiclePlate: `SMC ${1001 + (index % 50)}`,
      }
    : undefined;

  let channel: BookingChannel = "website";
  if (b.payment_method === "STRIPE") channel = "website";
  else if (b.idempotency_key?.includes("manual") || b.idempotency_key?.includes("admin"))
    channel = "phone";
  else channel = "whatsapp";

  return {
    id: b.id,
    refNumber: b.booking_number || `BK${String(Date.now()).slice(-6)}`,
    customerName: b.customer_name || "Customer",
    phone: b.customer_phone || "",
    email: b.customer_email || "",
    serviceType,
    vehicleType: category,
    vehicleName,
    pickupLocation: b.pickup_address || "Singapore",
    dropoffLocation: b.drop_address || "Singapore",
    pickupDate: pDate,
    pickupTime: pTime,
    passengers: 2,
    luggageBags: 2,
    meetAndGreet: !!b.quote_snapshot?.add_ons?.some(
      (a: any) =>
        (a.code || "").includes("MEET") ||
        (a.name || "").toLowerCase().includes("meet")
    ),
    addons: (b.quote_snapshot?.add_ons || []).map(
      (a: any) => a.name || a.code
    ),
    status,
    fare,
    channel,
    createdAt: b.created_at
      ? b.created_at.replace("T", " ").substring(0, 16)
      : new Date().toISOString().replace("T", " ").substring(0, 16),
    driverAssigned,
    assignedDriver: driverAssigned,
  };
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const isFetchingRef = useRef(false);

  const refreshBookings = useCallback(async () => {
    // Avoid running on login page when unauthenticated
    if (typeof window !== "undefined") {
      const token = Cookies.get("accessToken");
      if (!token && pathname === "/login") {
        setIsLoading(false);
        return;
      }
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const res = await getAdminBookings();

      // Handle all possible response shapes: res.bookings, res.data, res.data.bookings, or array directly
      const rawList: any[] =
        (res && Array.isArray(res.bookings) && res.bookings) ||
        (res && Array.isArray(res.data) && res.data) ||
        (res && res.data && !Array.isArray(res.data) && Array.isArray(res.data.bookings) && res.data.bookings) ||
        (Array.isArray(res) && res) ||
        [];

      if (rawList) {
        const mapped = rawList.map((b, idx) =>
          mapBackendBookingToFrontend(b, idx)
        );
        setBookings(mapped);
      }
    } catch (err: any) {
      console.warn("Could not load bookings from live API:", err?.message);
      // Keep existing state or remain empty so fake mock bookings are never injected
      setBookings((prev) => prev);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [pathname]);

  // Initial load and route change trigger
  useEffect(() => {
    if (pathname === "/login") return;

    const token = typeof window !== "undefined" ? Cookies.get("accessToken") : null;
    if (token || isAuthenticated) {
      refreshBookings();
    }
  }, [isAuthenticated, pathname, refreshBookings]);

  // Listen to login/logout events across the app
  useEffect(() => {
    const handleAuthChange = () => {
      const token = typeof window !== "undefined" ? Cookies.get("accessToken") : null;
      if (token) {
        refreshBookings();
      } else {
        setBookings([]);
      }
    };

    window.addEventListener("smc_auth_change", handleAuthChange);
    return () => window.removeEventListener("smc_auth_change", handleAuthChange);
  }, [refreshBookings]);

  const openNewBookingModal = () => setIsNewBookingModalOpen(true);
  const closeNewBookingModal = () => setIsNewBookingModalOpen(false);

  const openBookingDetails = (id: string) => setActiveBookingId(id);
  const closeBookingDetails = () => setActiveBookingId(null);

  const activeBooking = useMemo(() => {
    return bookings.find((b) => b.id === activeBookingId) || null;
  }, [bookings, activeBookingId]);

  const addBooking = (data: Partial<Booking>): Booking => {
    const refNumber = `BK${String(Date.now()).slice(-6)}`;
    const newBooking: Booking = {
      id: String(Date.now()),
      refNumber,
      customerName: data.customerName || "Customer",
      phone: data.phone || "+65 9000 0000",
      email: data.email || "customer@example.com",
      serviceType: data.serviceType || "airport_transfer",
      vehicleType: data.vehicleType || "7_seater",
      vehicleName: data.vehicleName || "7-Seater Mercedes V-Class",
      pickupLocation: data.pickupLocation || "Changi Airport T3",
      dropoffLocation: data.dropoffLocation || "Marina Bay Sands",
      pickupDate: data.pickupDate || new Date().toISOString().split("T")[0],
      pickupTime: data.pickupTime || "12:00",
      flightNumber: data.flightNumber,
      passengers: data.passengers || 2,
      luggageBags: data.luggageBags || 2,
      meetAndGreet: !!data.meetAndGreet,
      addons: data.addons || [],
      specialRequest: data.specialRequest,
      status: data.status || "pending",
      fare: data.fare || 65,
      channel: data.channel || "whatsapp",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      driverAssigned: data.driverAssigned,
      assignedDriver: data.driverAssigned,
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    // 1. Optimistic update in state
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );

    // 2. Persist to backend database
    const target = bookings.find((b) => b.id === id);
    const identifier = target?.refNumber || id;
    try {
      const backendStatusMap: Record<BookingStatus, string> = {
        pending: "NEW",
        confirmed: "CONFIRMED",
        in_progress: "IN_PROGRESS",
        completed: "COMPLETED",
        cancelled: "CANCELLED",
      };
      await updateAdminBooking(identifier, {
        booking_status: backendStatusMap[status] || status.toUpperCase(),
      });
    } catch (err) {
      console.warn(`Failed to update booking status for ${identifier} on API:`, err);
    }
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const assignDriver = async (
    id: string,
    driver: { name: string; phone: string; vehiclePlate: string }
  ) => {
    // 1. Optimistic update in state
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              driverAssigned: driver,
              assignedDriver: driver,
              status: b.status === "pending" ? "confirmed" : b.status,
            }
          : b
      )
    );

    // 2. Persist to backend database
    const target = bookings.find((b) => b.id === id);
    const identifier = target?.refNumber || id;
    try {
      await updateAdminBooking(identifier, {
        booking_status: target?.status === "pending" ? "CONFIRMED" : undefined,
        driver_name: driver.name,
        driver_phone: driver.phone,
      });
    } catch (err) {
      console.warn(`Failed to assign driver for ${identifier} on API:`, err);
    }
  };

  const createManualBooking = async (
    payload: AdminManualBookingPayload,
    extraMeta?: {
      vehicleName?: string;
      pickupDate?: string;
      pickupTime?: string;
      serviceName?: string;
    }
  ): Promise<{ success: boolean; booking?: any; error?: string }> => {
    const idempotencyKey = `admin-manual-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    try {
      const res = await createAdminManualBooking(payload, idempotencyKey);
      if (res?.booking) {
        const b = res.booking;
        const newBooking = mapBackendBookingToFrontend(
          b as any,
          bookings.length
        );
        if (extraMeta?.vehicleName) newBooking.vehicleName = extraMeta.vehicleName;
        if (extraMeta?.pickupDate) newBooking.pickupDate = extraMeta.pickupDate;
        if (extraMeta?.pickupTime) newBooking.pickupTime = extraMeta.pickupTime;

        setBookings((prev) => [newBooking, ...prev]);
        return { success: true, booking: b };
      }
      return {
        success: false,
        error: "No booking data returned from backend.",
      };
    } catch (err: any) {
      console.error("Manual booking error:", err);
      return {
        success: false,
        error: err?.message || "Failed to create manual booking on backend.",
      };
    }
  };

  const deleteBooking = async (id: string): Promise<boolean> => {
    const target = bookings.find((b) => b.id === id);
    const identifier = target?.refNumber || id;

    try {
      await deleteBookingApi(identifier);
    } catch (err: any) {
      console.warn("API delete booking returned warning, removing locally:", err);
    }

    setBookings((prev) => prev.filter((b) => b.id !== id));
    if (activeBookingId === id) {
      setActiveBookingId(null);
    }
    return true;
  };

  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      in_progress: bookings.filter((b) => b.status === "in_progress").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      // Channel filter
      if (channelFilter !== "all" && item.channel !== channelFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.customerName.toLowerCase().includes(q);
        const matchesRef = item.refNumber.toLowerCase().includes(q);
        const matchesPhone = item.phone.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesLocation =
          item.pickupLocation.toLowerCase().includes(q) ||
          item.dropoffLocation.toLowerCase().includes(q);
        const matchesVehicle = item.vehicleName.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesRef &&
          !matchesPhone &&
          !matchesEmail &&
          !matchesLocation &&
          !matchesVehicle
        ) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, statusFilter, channelFilter, searchQuery]);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        isLoading,
        refreshBookings,
        activeBookingId,
        activeBooking,
        isNewBookingModalOpen,
        openNewBookingModal,
        closeNewBookingModal,
        openBookingDetails,
        closeBookingDetails,
        addBooking,
        createManualBooking,
        updateBookingStatus,
        updateBooking,
        assignDriver,
        deleteBooking,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        channelFilter,
        setChannelFilter,
        filteredBookings,
        counts,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}
