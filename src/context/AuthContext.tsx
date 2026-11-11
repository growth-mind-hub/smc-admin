"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import Cookies from "js-cookie";
import { adminLogin, adminRefreshToken } from "@/lib/api/services";

export interface User {
  name: string;
  email: string;
  role: "owner" | "dispatcher" | "admin";
  initials: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
}

// Removed default user to ensure proper auth flow
// We will only have a user if they actually log in.

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we have a token but no user object, restore from localStorage or construct placeholder
    const token = Cookies.get("accessToken");
    if (token && !user) {
      let restoredUser: User | null = null;
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("smc_user");
          if (stored) restoredUser = JSON.parse(stored);
        }
      } catch {}

      const activeUser = restoredUser || {
        name: "Admin",
        email: "admin@singaporemaxicabs.com.sg",
        role: "admin",
        initials: "AD",
      };
      setUser(activeUser);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("smc_auth_change"));
      }
    }
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    const storedRefreshToken = Cookies.get("refreshToken");
    if (!storedRefreshToken) return false;
    try {
      const res = await adminRefreshToken(storedRefreshToken);
      const newToken = res.token || res.accessToken || res.access_token;
      if (newToken) {
        Cookies.set("accessToken", newToken, { expires: 1 });
        const newRefreshToken = res.refreshToken || res.refresh_token;
        if (newRefreshToken) {
          Cookies.set("refreshToken", newRefreshToken, { expires: 7 });
        }
        return true;
      }
    } catch (err) {
      console.error("Manual refresh token error:", err);
      logout();
    }
    return false;
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    if (username && pass) {
      try {
        const data = await adminLogin({
          username: username,
          password: pass,
        });

        if (data && (data.token || data.accessToken || data.access_token)) {
          const tokenToStore = data.token || data.accessToken || data.access_token;
          
          if (tokenToStore) {
            Cookies.set("accessToken", tokenToStore, { expires: 1 });
          }

          const refreshTokenToStore = data.refreshToken || data.refresh_token;
          if (refreshTokenToStore) {
            Cookies.set("refreshToken", refreshTokenToStore, { expires: 7 });
          }

          const loggedUser: User = {
            name: data.user?.username || username,
            email: data.user?.email || `${username}@singaporemaxicabs.com.sg`,
            role: (data.user?.role as any) || "admin",
            initials: (data.user?.username || username).substring(0, 2).toUpperCase(),
          };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("smc_user", JSON.stringify(loggedUser));
            } catch {}
          }
          setUser(loggedUser);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("smc_auth_change"));
          }
          router.push("/");
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Login API error:", error);
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("smc_user");
        window.dispatchEvent(new Event("smc_auth_change"));
      } catch {}
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        refreshToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
