"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import { BookingProvider } from "./BookingContext";
import { FleetProvider } from "./FleetContext";
import { PricingProvider } from "./PricingContext";
import { GuideProvider } from "./GuideContext";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <BookingProvider>
        <FleetProvider>
          <PricingProvider>
            <GuideProvider>{children}</GuideProvider>
          </PricingProvider>
        </FleetProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
