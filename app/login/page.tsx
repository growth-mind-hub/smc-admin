"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Car } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(username, password);
    if (!success) {
      setError("Please enter valid admin credentials.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-color-input-background flex flex-col lg:flex-row justify-start items-stretch font-['Manrope']">
      {/* Left Column: Brand & Value Proposition matching loginpage.html */}
      <div className="w-full lg:w-[540px] lg:min-h-screen relative bg-color-background-brand p-8 lg:p-12 flex flex-col justify-between overflow-hidden flex-shrink-0">
        {/* Top Accent Line */}
        <div className="w-full h-1 left-0 top-0 absolute bg-color-background-accent" />

        {/* Brand Header */}
        <div className="self-stretch flex flex-col justify-start items-start">
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <div className="size-10 bg-color-background-accent rounded-xl flex justify-center items-center flex-shrink-0">
              <Car className="size-5 text-slate-900" />
            </div>
            <div className="inline-flex flex-col justify-start items-start">
              <div className="justify-start text-color-text-inverse text-sm font-bold font-['Manrope'] leading-4">
                Singapore Maxicabs
              </div>
              <div className="pt-0.5 justify-start text-orange-400 text-[10px] font-normal font-['Manrope'] uppercase leading-4 tracking-widest">
                Premium Transport
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="py-8 sm:py-12 lg:py-16 flex flex-col justify-start items-start">
          <div className="justify-start text-orange-400 text-xs font-bold font-['Manrope'] uppercase leading-4 tracking-[2.50px]">
            Owner Portal
          </div>
          <div className="pt-4">
            <h1 className="justify-start text-color-text-inverse text-3xl sm:text-4xl lg:text-5xl font-bold font-['Manrope'] leading-tight lg:leading-[52.80px]">
              Manage your
              <br />
              fleet with ease.
            </h1>
          </div>
          <div className="pt-6">
            <p className="max-w-sm justify-start text-white/60 text-base font-normal font-['Manrope'] leading-6">
              Control bookings, manage vehicles, update pricing, and track your business — all from one place.
            </p>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="flex flex-col justify-start items-start gap-4">
          <div className="self-stretch inline-flex justify-start items-center gap-3.5">
            <div className="size-9 bg-white/10 rounded-xl flex justify-center items-center flex-shrink-0 text-base">
              📋
            </div>
            <div className="inline-flex flex-col justify-start items-start">
              <div className="justify-start text-color-text-inverse text-xs font-semibold font-['Manrope'] leading-5">
                Booking Management
              </div>
              <div className="justify-start text-white/50 text-xs font-normal font-['Manrope'] leading-4">
                Process and track all incoming rides
              </div>
            </div>
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-3.5">
            <div className="size-9 bg-white/10 rounded-xl flex justify-center items-center flex-shrink-0 text-base">
              🚗
            </div>
            <div className="inline-flex flex-col justify-start items-start">
              <div className="justify-start text-color-text-inverse text-xs font-semibold font-['Manrope'] leading-5">
                Fleet Control
              </div>
              <div className="justify-start text-white/50 text-xs font-normal font-['Manrope'] leading-4">
                Add, edit or deactivate vehicles
              </div>
            </div>
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-3.5">
            <div className="size-9 bg-white/10 rounded-xl flex justify-center items-center flex-shrink-0 text-base">
              💰
            </div>
            <div className="inline-flex flex-col justify-start items-start">
              <div className="justify-start text-color-text-inverse text-xs font-semibold font-['Manrope'] leading-5">
                Live Pricing
              </div>
              <div className="justify-start text-white/50 text-xs font-normal font-['Manrope'] leading-4">
                Update fares instantly across the board
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="pt-8 sm:pt-12">
          <div className="justify-start text-white/30 text-xs font-normal font-['Manrope'] leading-4">
            © 2026 Singapore Maxicabs · Authorised personnel only
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex-1 self-stretch px-6 sm:px-8 py-12 bg-gray-100 flex flex-col justify-center items-center">
        <div className="w-full max-w-96 flex flex-col justify-start items-start">
          {/* Header */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <h2 className="justify-start text-color-text-primary text-3xl font-bold font-['Manrope'] leading-10">
              Welcome back
            </h2>
            <div className="pt-1.5 justify-start text-color-input-placeholder text-sm font-normal font-['Manrope'] leading-5">
              Sign in to access the admin dashboard.
            </div>
          </div>

          {error && (
            <div className="w-full mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full pt-8 flex flex-col justify-start items-start gap-5">
            {/* Username */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label className="justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
                Username
              </label>
              <div className="w-full px-4 py-3 bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex justify-start items-center gap-3 focus-within:outline-color-border-focus focus-within:ring-1 focus-within:ring-amber-500">
                <Mail className="size-4 text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="flex-1 text-color-text-primary text-sm font-normal font-['Manrope'] outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label className="justify-start text-color-text-primary text-xs font-semibold font-['Manrope'] leading-5">
                Password
              </label>
              <div className="w-full px-4 py-3 bg-color-background-white rounded-xl outline outline-1 outline-offset-[-1px] outline-color-border-subtle flex justify-start items-center gap-3 focus-within:outline-color-border-focus focus-within:ring-1 focus-within:ring-amber-500">
                <Lock className="size-4 text-gray-500 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 text-color-text-primary text-sm font-normal font-['Manrope'] outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full pt-1">
              <button
                type="submit"
                className="w-full py-3.5 bg-color-background-brand hover:brightness-110 active:scale-[0.99] rounded-xl flex justify-center items-center gap-2.5 cursor-pointer transition-all"
              >
                <span className="text-center text-color-text-inverse text-base font-semibold font-['Manrope'] leading-6">
                  Sign In
                </span>
                <ArrowRight className="size-4 text-color-text-inverse" />
              </button>
            </div>
          </form>

          {/* Footer Back Link */}
          <div className="self-stretch pt-6 text-center">
            <span className="text-color-input-placeholder text-xs font-normal font-['Manrope'] leading-4">
              This portal is for authorised personnel only.{" "}
            </span>
            <a
              href="https://singaporemaxicabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 text-xs font-medium font-['Manrope'] leading-4 hover:underline"
            >
              Back to site →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
