import { API_CONFIG } from "@/config/api";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
  idempotencyKey?: string;
  forceRefresh?: boolean;
  _isRetry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function executeRefreshToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const Cookies = require("js-cookie");
  const cookieLib = Cookies.default || Cookies;
  const refreshToken = cookieLib.get("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_CONFIG.PROXY_PREFIX}${API_CONFIG.ENDPOINTS.ADMIN_REFRESH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      cookieLib.remove("accessToken");
      cookieLib.remove("refreshToken");
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.token || data.accessToken || data.access_token;
    if (newAccessToken) {
      cookieLib.set("accessToken", newAccessToken, { expires: 1 });
      const newRefreshToken = data.refreshToken || data.refresh_token;
      if (newRefreshToken) {
        cookieLib.set("refreshToken", newRefreshToken, { expires: 7 });
      }
      return newAccessToken;
    }
  } catch (e) {
    console.error("Auto-refresh token failed:", e);
    cookieLib.remove("accessToken");
    cookieLib.remove("refreshToken");
  }
  return null;
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    code: string = "API_ERROR",
    details?: unknown,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

// In-memory cache for GET requests to prevent duplicate calls across contexts & navigations
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const RESPONSE_CACHE = new Map<string, CacheEntry<any>>();
const IN_FLIGHT_REQUESTS = new Map<string, Promise<any>>();
const GET_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL for read queries

/**
 * Manually invalidate cached API responses (e.g. after adding/updating vehicles or pricing)
 */
export function invalidateApiCache(pattern?: string) {
  if (!pattern) {
    RESPONSE_CACHE.clear();
    return;
  }
  for (const key of Array.from(RESPONSE_CACHE.keys())) {
    if (key.includes(pattern)) {
      RESPONSE_CACHE.delete(key);
    }
  }
}

/**
 * Universal API Request handler with in-flight deduplication and intelligent caching
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    params,
    requiresAuth = false,
    idempotencyKey,
    forceRefresh = false,
    headers: customHeaders = {},
    ...customOptions
  } = options;

  const method = (customOptions.method || "GET").toUpperCase();

  // Format query string if params are provided
  let queryString = "";
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      queryString = `?${qs}`;
    }
  }

  // Determine whether to use client-side proxy or direct backend URL
  const isClient = typeof window !== "undefined";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Use proxy on browser to eliminate CORS issues; direct URL on server
  const url = isClient
    ? `${API_CONFIG.PROXY_PREFIX}${cleanEndpoint}${queryString}`
    : `${API_CONFIG.BASE_URL}${cleanEndpoint}${queryString}`;

  const cacheKey = `${method}:${cleanEndpoint}${queryString}`;

  // If this is a mutation, invalidate cache for this endpoint family
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    invalidateApiCache(cleanEndpoint.split("/")[1] || cleanEndpoint);
  }

  // 1. For GET requests: check response cache
  if (method === "GET" && !forceRefresh) {
    const cached = RESPONSE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < GET_CACHE_TTL_MS) {
      return cached.data as T;
    }

    // 2. In-flight request deduplication: if identical GET request is in-flight, return the existing Promise!
    if (IN_FLIGHT_REQUESTS.has(cacheKey)) {
      return IN_FLIGHT_REQUESTS.get(cacheKey) as Promise<T>;
    }
  }

  // Execute request
  const fetchPromise = (async () => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(customHeaders as Record<string, string>),
    };

    // Set JSON Content-Type for mutation methods if body is present as string
    if (
      customOptions.body &&
      typeof customOptions.body === "string" &&
      !headers["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }

    // Never set Content-Type for FormData; browser/fetch calculates the multipart boundary
    if (typeof FormData !== "undefined" && customOptions.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    // Admin authentication header
    if (requiresAuth) {
      let token = "";
      if (typeof window !== "undefined") {
        const Cookies = require("js-cookie");
        token = Cookies.default ? Cookies.default.get("accessToken") : Cookies.get("accessToken");
      } else {
        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          token = cookieStore.get("accessToken")?.value || "";
        } catch (e) {
          // Ignore if called outside of request context
        }
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Idempotency key if supplied
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...customOptions,
        headers,
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized: Attempt token refresh and retry
      if (
        response.status === 401 &&
        !options._isRetry &&
        cleanEndpoint !== API_CONFIG.ENDPOINTS.ADMIN_LOGIN &&
        cleanEndpoint !== API_CONFIG.ENDPOINTS.ADMIN_REFRESH
      ) {
        if (!refreshPromise) {
          refreshPromise = executeRefreshToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        if (newToken) {
          return apiRequest<T>(endpoint, {
            ...options,
            _isRetry: true,
          });
        } else if (isClient && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }

      if (response.status === 204) {
        return undefined as unknown as T;
      }

      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        let errorCode = `HTTP_${response.status}`;
        let errorMessage = `Request failed with status ${response.status}`;

        if (data && typeof data === "object") {
          if (typeof data.error === "string") {
            errorCode = data.error;
            errorMessage = data.message || data.error;
          } else if (data.error && typeof data.error === "object") {
            errorCode = data.error.code || errorCode;
            errorMessage = data.error.message || errorMessage;
          } else {
            errorCode = data.code || errorCode;
            errorMessage = data.message || errorMessage;
          }
        }

        const requestId =
          data && typeof data === "object" ? data.requestId : undefined;

        throw new ApiClientError(
          errorMessage,
          response.status,
          errorCode,
          data,
          requestId
        );
      }

      // Store in GET cache
      if (method === "GET") {
        RESPONSE_CACHE.set(cacheKey, {
          timestamp: Date.now(),
          data,
        });
      }

      return data as T;
    } catch (error: any) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      if (error.name === "AbortError") {
        throw new ApiClientError("Request timed out", 408, "TIMEOUT");
      }
      throw new ApiClientError(
        error?.message || "Network request failed",
        500,
        "NETWORK_ERROR"
      );
    } finally {
      if (method === "GET") {
        IN_FLIGHT_REQUESTS.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    IN_FLIGHT_REQUESTS.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}
