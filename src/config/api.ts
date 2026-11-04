/**
 * API Configuration for Singapore Maxicabs Admin Portal
 * Based on frontend-api-handoff.html specifications (24 endpoint contracts)
 */

export const API_CONFIG = {
  // Live deployed backend URL with fallback
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "https://api.singaporemaxicabs.com.sg",

  // Next.js internal proxy route to bypass browser CORS restrictions during local development & production
  PROXY_PREFIX: "/api/proxy",

  // Admin secret key for authenticated endpoints
  ADMIN_API_KEY:
    process.env.NEXT_PUBLIC_ADMIN_API_KEY ||
    process.env.ADMIN_API_KEY ||
    "smc_live_admin_secret_key",

  // Timeout in milliseconds
  TIMEOUT: 15000,

  // All 24 API Endpoint paths documented in frontend-api-handoff.html
  ENDPOINTS: {
    // 1-6. Public Catalog Endpoints
    VEHICLES: "/api/vehicles",
    VEHICLE_RECOMMEND: "/api/vehicles/recommend",
    VEHICLE_DETAIL: (id: number | string) => `/api/vehicles/${id}`,
    SERVICES: "/api/services",
    VEHICLE_TYPES: "/api/vehicle-types",
    CATALOG_PRICE: (catalogId: number | string) => `/api/catalog/${catalogId}`,

    // 7-9. Public Booking & Quotation Endpoints
    ADD_ONS: "/api/add-ons",
    QUOTE: "/api/booking/quote",
    CHECKOUT: "/api/bookings/checkout",

    // 10-14. Admin Vehicle & Type Management
    ADMIN_CREATE_VEHICLE_TYPE: "/api/vehicle-types",
    ADMIN_UPDATE_VEHICLE_TYPE: (id: number | string) => `/api/vehicle-types/${id}`,
    ADMIN_CREATE_VEHICLE: "/api/vehicles",
    ADMIN_UPDATE_VEHICLE: (id: number | string) => `/api/vehicles/${id}`,
    ADMIN_SET_PRICE: (vehicleId: number | string, serviceCode: string) =>
      `/api/vehicles/${vehicleId}/prices/${serviceCode}`,

    // 15-16. Admin Service Management
    ADMIN_CREATE_SERVICE: "/api/services",
    ADMIN_UPDATE_SERVICE: (serviceCode: string) => `/api/services/${serviceCode}`,

    // 17-18. Admin Extras & Add-ons
    ADMIN_CREATE_ADDON: "/api/add-ons",
    ADMIN_UPDATE_ADDON: (id: number | string) => `/api/add-ons/${id}`,
    ADMIN_DELETE_ADDON: (id: number | string) => `/api/v1/add-ons/${id}`,

    // Admin Booking Management
    ADMIN_BOOKINGS: "/api/v1/bookings",
    ADMIN_CREATE_BOOKING: "/api/v1/bookings",
    ADMIN_BOOKING_DETAIL: (idOrBookingNumber: string) =>
      `/api/v1/bookings/${idOrBookingNumber}`,
    ADMIN_UPDATE_BOOKING: (idOrBookingNumber: string) =>
      `/api/v1/bookings/${idOrBookingNumber}`,
    ADMIN_DELETE_BOOKING: (idOrBookingNumber: string) =>
      `/api/v1/bookings/${idOrBookingNumber}`,

    // 19-21. Admin Distance Pricing Rules
    ADMIN_DISTANCE_RULES: "/api/distance-pricing-rules",
    ADMIN_CREATE_DISTANCE_RULE: "/api/distance-pricing-rules",
    ADMIN_UPDATE_DISTANCE_RULE: (id: number | string) =>
      `/api/distance-pricing-rules/${id}`,

    // 22-24. Operations & Health Checks
    HEALTH: "/health",
    READY: "/ready",
    STRIPE_WEBHOOK: "/api/payments/stripe/webhook",

    // Admin Auth
    ADMIN_LOGIN: "/api/v1/admin/login",
    ADMIN_REFRESH: "/api/v1/admin/refresh",

    // Vehicle Image Endpoints
    VEHICLE_IMAGE: (id: number | string) => `/api/v1/vehicles/${id}/image`,
  },
};
