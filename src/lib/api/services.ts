import { API_CONFIG } from "@/config/api";
import { apiRequest } from "./client";
import {
  VehiclesResponse,
  SingleVehicleResponse,
  ServicesResponse,
  VehicleTypesResponse,
  CatalogPriceResponse,
  AddOnsResponse,
  SingleAddOnResponse,
  QuoteRequest,
  QuoteResponse,
  CheckoutRequest,
  CheckoutResponse,
  AdminCreateVehiclePayload,
  AdminUpdateVehiclePayload,
  AdminSetPricePayload,
  AdminCreateVehicleTypePayload,
  AdminUpdateVehicleTypePayload,
  AdminCreateServicePayload,
  AdminUpdateServicePayload,
  AdminCreateAddOnPayload,
  AdminUpdateAddOnPayload,
  DistanceRulesResponse,
  SingleDistanceRuleResponse,
  AdminCreateDistanceRulePayload,
  AdminUpdateDistanceRulePayload,
  AdminLoginPayload,
  AdminLoginResponse,
  AdminRefreshPayload,
  AdminRefreshResponse,
  VehicleImageResponse,
  HealthResponse,
  ReadyResponse,
  ApiService,
  ApiVehicleType,
  AdminManualBookingPayload,
  AdminManualBookingResponse,
  BookingsListResponse,
  AdminUpdateBookingPayload,
  ApiBackendBooking,
} from "@/types/api";

// ==========================================
// 1-6. Public Catalog Services
// ==========================================

/**
 * 1. List vehicle cards with current rates
 * GET /api/vehicles
 */
export async function getVehicles(params?: {
  persons?: number;
  luggage?: number;
}): Promise<VehiclesResponse> {
  return apiRequest<VehiclesResponse>(API_CONFIG.ENDPOINTS.VEHICLES, {
    method: "GET",
    params,
  });
}

/**
 * 2. Recommend a vehicle based on passenger and luggage counts
 * GET /api/vehicles/recommend?persons=x&luggage=y
 */
export async function recommendVehicle(
  persons: number,
  luggage: number
): Promise<VehiclesResponse> {
  return apiRequest<VehiclesResponse>(API_CONFIG.ENDPOINTS.VEHICLE_RECOMMEND, {
    method: "GET",
    params: { persons, luggage },
  });
}

/**
 * 3. Get one vehicle by ID
 * GET /api/vehicles/:id
 */
export async function getVehicleById(
  id: number | string
): Promise<SingleVehicleResponse> {
  return apiRequest<SingleVehicleResponse>(
    API_CONFIG.ENDPOINTS.VEHICLE_DETAIL(id),
    {
      method: "GET",
    }
  );
}

/**
 * 4. List active services (Arrival, Departure, Hourly, etc.)
 * GET /api/services
 */
export async function getServices(): Promise<ServicesResponse> {
  return apiRequest<ServicesResponse>(API_CONFIG.ENDPOINTS.SERVICES, {
    method: "GET",
  });
}

/**
 * 5. List vehicle types (MPV, Minibus, Coach, etc.)
 * GET /api/vehicle-types
 */
export async function getVehicleTypes(): Promise<VehicleTypesResponse> {
  return apiRequest<VehicleTypesResponse>(API_CONFIG.ENDPOINTS.VEHICLE_TYPES, {
    method: "GET",
  });
}

/**
 * 6. Resolve a vehicle/service price by catalogId
 * GET /api/catalog/:catalogId
 */
export async function getCatalogPrice(
  catalogId: number | string
): Promise<CatalogPriceResponse> {
  return apiRequest<CatalogPriceResponse>(
    API_CONFIG.ENDPOINTS.CATALOG_PRICE(catalogId),
    {
      method: "GET",
    }
  );
}

// ==========================================
// 7-9. Public Booking & Quotation Services
// ==========================================

/**
 * 7. List active add-ons (Baby seat, Meet & Greet, Night travel, etc.)
 * GET /api/add-ons
 */
export async function getAddOns(): Promise<AddOnsResponse> {
  return apiRequest<AddOnsResponse>(API_CONFIG.ENDPOINTS.ADD_ONS, {
    method: "GET",
  });
}

/**
 * 8. Calculate a quotation for a trip
 * POST /api/booking/quote
 */
export async function calculateQuote(
  payload: QuoteRequest
): Promise<QuoteResponse> {
  return apiRequest<QuoteResponse>(API_CONFIG.ENDPOINTS.QUOTE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 9. Create a booking and generate Stripe Checkout URL
 * POST /api/bookings/checkout
 */
export async function checkoutBooking(
  payload: CheckoutRequest,
  idempotencyKey?: string
): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>(API_CONFIG.ENDPOINTS.CHECKOUT, {
    method: "POST",
    body: JSON.stringify(payload),
    idempotencyKey,
  });
}

/**
 * List all bookings from backend
 * GET /api/v1/bookings
 */
export async function getAdminBookings(): Promise<BookingsListResponse> {
  return apiRequest<BookingsListResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_BOOKINGS,
    {
      method: "GET",
      requiresAuth: true,
      forceRefresh: true,
    }
  );
}

/**
 * Create a manual booking from admin
 * POST /api/v1/bookings
 */
export async function createAdminManualBooking(
  payload: AdminManualBookingPayload,
  idempotencyKey?: string
): Promise<AdminManualBookingResponse> {
  return apiRequest<AdminManualBookingResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_CREATE_BOOKING,
    {
      method: "POST",
      body: JSON.stringify(payload),
      requiresAuth: true,
      idempotencyKey,
    }
  );
}

/**
 * Update booking status or driver assignment
 * PATCH /api/v1/bookings/:idOrBookingNumber
 */
export async function updateAdminBooking(
  idOrBookingNumber: string,
  payload: AdminUpdateBookingPayload
): Promise<{ booking: ApiBackendBooking }> {
  return apiRequest<{ booking: ApiBackendBooking }>(
    API_CONFIG.ENDPOINTS.ADMIN_UPDATE_BOOKING(idOrBookingNumber),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * Permanently delete a booking
 * DELETE /api/v1/bookings/:idOrBookingNumber
 */
export async function deleteBookingApi(
  idOrBookingNumber: string
): Promise<void> {
  return apiRequest<void>(
    API_CONFIG.ENDPOINTS.ADMIN_DELETE_BOOKING(idOrBookingNumber),
    {
      method: "DELETE",
      requiresAuth: true,
    }
  );
}

// ==========================================
// 10-14. Admin Vehicle & Type Management
// ==========================================

/**
 * 10. Create a vehicle type
 * POST /api/vehicle-types
 */
export async function createVehicleType(
  payload: AdminCreateVehicleTypePayload
): Promise<{ vehicleType: ApiVehicleType }> {
  return apiRequest<{ vehicleType: ApiVehicleType }>(
    API_CONFIG.ENDPOINTS.ADMIN_CREATE_VEHICLE_TYPE,
    {
      method: "POST",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * 11. Update a vehicle type
 * PATCH /api/vehicle-types/:id
 */
export async function updateVehicleType(
  id: number | string,
  payload: AdminUpdateVehicleTypePayload
): Promise<{ vehicleType: ApiVehicleType }> {
  return apiRequest<{ vehicleType: ApiVehicleType }>(
    API_CONFIG.ENDPOINTS.ADMIN_UPDATE_VEHICLE_TYPE(id),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * 12. Create vehicle and all initial service rates
 * POST /api/vehicles
 */
export async function createVehicle(
  payload: AdminCreateVehiclePayload
): Promise<SingleVehicleResponse> {
  return apiRequest<SingleVehicleResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_CREATE_VEHICLE,
    {
      method: "POST",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * 13. Update vehicle metadata and capacities
 * PATCH /api/vehicles/:id
 */
export async function updateVehicle(
  id: number | string,
  payload: AdminUpdateVehiclePayload
): Promise<SingleVehicleResponse> {
  return apiRequest<SingleVehicleResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_UPDATE_VEHICLE(id),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * Activate or deactivate a fleet vehicle
 * PATCH /api/v1/vehicles/:id with { status: "active" | "inactive" }
 */
export async function setVehicleStatus(
  id: number | string,
  status: "active" | "inactive"
): Promise<SingleVehicleResponse> {
  return apiRequest<SingleVehicleResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_UPDATE_VEHICLE(id),
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      requiresAuth: true,
    }
  );
}

/**
 * 14. Set or replace one service rate for a vehicle
 * PUT /api/vehicles/:vehicleId/prices/:serviceCode
 */
export async function setVehicleServiceRate(
  vehicleId: number | string,
  serviceCode: string,
  payload: AdminSetPricePayload
): Promise<SingleVehicleResponse> {
  return apiRequest<SingleVehicleResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_SET_PRICE(vehicleId, serviceCode),
    {
      method: "PUT",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

// ==========================================
// 15-16. Admin Service Management
// ==========================================

/**
 * 15. Create a new service category
 * POST /api/services
 */
export async function createService(
  payload: AdminCreateServicePayload
): Promise<{ service: ApiService }> {
  return apiRequest<{ service: ApiService }>(
    API_CONFIG.ENDPOINTS.ADMIN_CREATE_SERVICE,
    {
      method: "POST",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * 16. Update a service
 * PATCH /api/services/:serviceCode
 */
export async function updateService(
  serviceCode: string,
  payload: AdminUpdateServicePayload
): Promise<{ service: ApiService }> {
  return apiRequest<{ service: ApiService }>(
    API_CONFIG.ENDPOINTS.ADMIN_UPDATE_SERVICE(serviceCode),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

// ==========================================
// 17-18. Admin Add-ons Management
// ==========================================

/**
 * 17. Create an add-on item
 * POST /api/add-ons
 */
export async function createAddOn(
  payload: AdminCreateAddOnPayload
): Promise<SingleAddOnResponse> {
  return apiRequest<SingleAddOnResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_CREATE_ADDON,
    {
      method: "POST",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * 18. Update an add-on item
 * PATCH /api/add-ons/:id
 */
export async function updateAddOn(
  id: number | string,
  payload: AdminUpdateAddOnPayload
): Promise<SingleAddOnResponse> {
  return apiRequest<SingleAddOnResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_UPDATE_ADDON(id),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * Delete an add-on item permanently
 * DELETE /api/v1/add-ons/:id
 * Allowed when unused or all linked bookings have operational status COMPLETED.
 */
export async function deleteAddOn(id: number | string): Promise<void> {
  return apiRequest<void>(API_CONFIG.ENDPOINTS.ADMIN_DELETE_ADDON(id), {
    method: "DELETE",
    requiresAuth: true,
  });
}

// ==========================================
// 19-21. Admin Distance Pricing Rules
// ==========================================

/**
 * 19. List distance pricing rules
 * GET /api/distance-pricing-rules
 */
export async function getDistanceRules(): Promise<DistanceRulesResponse> {
  return apiRequest<DistanceRulesResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_DISTANCE_RULES,
    {
      method: "GET",
      requiresAuth: true,
    }
  );
}

/**
 * 20. Create a distance pricing rule
 * POST /api/distance-pricing-rules
 */
export async function createDistanceRule(
  payload: AdminCreateDistanceRulePayload
): Promise<SingleDistanceRuleResponse> {
  return apiRequest<SingleDistanceRuleResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_CREATE_DISTANCE_RULE,
    {
      method: "POST",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

/**
 * 21. Update a distance pricing rule
 * PATCH /api/distance-pricing-rules/:id
 */
export async function updateDistanceRule(
  id: number | string,
  payload: AdminUpdateDistanceRulePayload
): Promise<SingleDistanceRuleResponse> {
  return apiRequest<SingleDistanceRuleResponse>(
    API_CONFIG.ENDPOINTS.ADMIN_UPDATE_DISTANCE_RULE(id),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requiresAuth: true,
    }
  );
}

// ==========================================
// 22-24. Health & Operations
// ==========================================

/**
 * 22. Check process health
 * GET /health
 */
export async function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH, {
    method: "GET",
  });
}

/**
 * 23. Check database readiness
 * GET /ready
 */
export async function getReadiness(): Promise<ReadyResponse> {
  return apiRequest<ReadyResponse>(API_CONFIG.ENDPOINTS.READY, {
    method: "GET",
  });
}

// ==========================================
// 25. Auth & Login
// ==========================================

/**
 * Admin Login
 * POST /api/v1/admin/login
 */
export async function adminLogin(
  payload: AdminLoginPayload
): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
    method: "POST",
    body: JSON.stringify(payload),
    // we don't pass requiresAuth: true because login itself doesn't need the admin key
  });
}

/**
 * 26. Refresh Admin Token
 * POST /api/v1/admin/refresh
 */
export async function adminRefreshToken(
  refreshToken: string
): Promise<AdminRefreshResponse> {
  return apiRequest<AdminRefreshResponse>(API_CONFIG.ENDPOINTS.ADMIN_REFRESH, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// ==========================================
// 27-28. Vehicle Image Management
// ==========================================

/**
 * 27. Upload Vehicle Image
 * POST /api/v1/vehicles/:id/image
 */
export async function uploadVehicleImage(
  vehicleId: number | string,
  imageFile: File | Blob
): Promise<VehicleImageResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  return apiRequest<VehicleImageResponse>(
    API_CONFIG.ENDPOINTS.VEHICLE_IMAGE(vehicleId),
    {
      method: "POST",
      body: formData,
      requiresAuth: true,
    }
  );
}

/**
 * 28. Delete Vehicle Image
 * DELETE /api/v1/vehicles/:id/image
 */
export async function deleteVehicleImage(
  vehicleId: number | string
): Promise<VehicleImageResponse> {
  return apiRequest<VehicleImageResponse>(
    API_CONFIG.ENDPOINTS.VEHICLE_IMAGE(vehicleId),
    {
      method: "DELETE",
      requiresAuth: true,
    }
  );
}
