"use client";

import React from "react";
import AdminLayout from "@/Components/Layout/AdminLayout";
import BookingsFilterTabs from "@/Components/Bookings/BookingsFilterTabs";
import BookingsTable from "@/Components/Bookings/BookingsTable";
import BookingDetailsModal from "@/Components/Bookings/BookingDetailsModal";
import NewBookingModal from "@/Components/Bookings/NewBookingModal";
import { useBookings } from "@/context/BookingContext";
import { Plus } from "lucide-react";

export default function BookingsPage() {
  const { counts, openNewBookingModal, isLoading, bookings, refreshBookings } = useBookings();

  React.useEffect(() => {
    if (bookings.length === 0) {
      refreshBookings();
    }
  }, [bookings.length, refreshBookings]);

  return (
    <AdminLayout>
      <div className="w-full flex flex-col justify-start items-start gap-5 font-['Manrope']">
        {/* Page Header */}
        <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <h1 className="justify-start text-color-text-primary text-xl font-bold font-['Manrope'] leading-8">
                Bookings
              </h1>
            </div>
            <div className="pt-0.5 flex flex-col justify-start items-start">
              {isLoading ? (
                <div className="h-4 w-28 bg-stone-200 rounded animate-pulse mt-0.5" />
              ) : (
                <div className="justify-start text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-5">
                  {counts.all} total bookings
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={openNewBookingModal}
            className="px-4 py-2.5 bg-color-background-accent rounded-lg flex justify-start items-center gap-2 hover:brightness-105 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="size-4 text-slate-900" />
            <div className="text-center justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
              New Booking
            </div>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <BookingsFilterTabs />

        {/* Bookings Table (Full Width) */}
        <div className="self-stretch w-full min-w-0">
          <BookingsTable />
        </div>

        {/* Existing Booking Details Popup Modal */}
        <BookingDetailsModal />

        {/* New Booking Modal Popup */}
        <NewBookingModal />
      </div>
    </AdminLayout>
  );
}
