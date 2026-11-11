import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

const BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  API_CONFIG.BASE_URL;

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const targetPath = (path || []).join("/");
    const search = request.nextUrl.search;
    const targetUrl = `${BACKEND_URL.replace(/\/$/, "")}/${targetPath}${search}`;

    const headers = new Headers();
    const allowedHeaders = [
      "content-type",
      "authorization",
      "idempotency-key",
      "accept",
    ];

    allowedHeaders.forEach((header) => {
      const val = request.headers.get(header);
      if (val) headers.set(header, val);
    });

    // Check Authorization header: prefer accessToken cookie if authorization is missing or is the fallback key
    const currentAuth = headers.get("authorization");
    if (!currentAuth || currentAuth.includes(API_CONFIG.ADMIN_API_KEY)) {
      const cookieToken = request.cookies.get("accessToken")?.value;
      if (cookieToken) {
        headers.set("authorization", `Bearer ${cookieToken}`);
      } else if (API_CONFIG.ADMIN_API_KEY && !currentAuth) {
        headers.set("authorization", `Bearer ${API_CONFIG.ADMIN_API_KEY}`);
      }
    }

    let body: BodyInit | undefined = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      try {
        const reqContentType = request.headers.get("content-type") || "";
        if (
          reqContentType.includes("multipart/form-data") ||
          reqContentType.includes("image/") ||
          reqContentType.includes("application/octet-stream")
        ) {
          const buffer = await request.arrayBuffer();
          if (buffer.byteLength > 0) {
            body = Buffer.from(buffer);
          }
        } else {
          const text = await request.text();
          if (text) body = text;
        }
      } catch {
        // No body provided
      }
    }

    const backendRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const contentType = backendRes.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await backendRes.json();
      return NextResponse.json(data, {
        status: backendRes.status,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const textData = await backendRes.text();
    return new NextResponse(textData, {
      status: backendRes.status,
      headers: {
        "Content-Type": contentType || "text/plain",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "PROXY_ERROR",
        message: error?.message || "Failed to reach backend API service",
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}
