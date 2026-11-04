"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Check, AlertCircle } from "lucide-react";
import { fetchPlaceSuggestions, PlaceSuggestion } from "@/services/placesService";

interface PlacesAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  debounceMs?: number;
  error?: string;
  onBlur?: () => void;
}

export default function PlacesAutocompleteInput({
  value,
  onChange,
  placeholder = "Search Singapore location or airport...",
  label,
  required = false,
  className = "",
  debounceMs = 300,
  error,
  onBlur,
}: PlacesAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search logic
  const handleSearch = useCallback(
    (query: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      timerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const results = await fetchPlaceSuggestions(trimmed, controller.signal);
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setSelectedIndex(-1);
        } catch {
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    handleSearch(val);
  };

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    const displayVal = suggestion.mainText || suggestion.description;
    setInputValue(displayVal);
    onChange(displayVal);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-color-input-placeholder text-xs font-semibold font-['Manrope'] uppercase leading-4 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        {/* Left Icon */}
        <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
          <MapPin className="size-3.5 text-amber-600" />
        </div>

        {/* Input */}
        <input
          type="text"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          onFocus={() => {
            if (suggestions.length > 0 && inputValue.length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full h-10 pl-9 pr-8 rounded-lg outline outline-1 outline-offset-[-1px] text-xs text-slate-900 font-normal font-['Manrope'] placeholder:text-slate-900/50 focus:outline-none transition-all ${
            error
              ? "bg-red-50/50 outline-red-400 focus:ring-1 focus:ring-red-400"
              : "bg-stone-100 outline-color-border-subtle focus:ring-1 focus:ring-amber-500"
          }`}
        />

        {/* Right Status / Actions */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading && <Loader2 className="size-3.5 text-amber-600 animate-spin" />}
          {!isLoading && inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              aria-label="Clear location"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-[11px] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
          <AlertCircle className="size-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-xl border border-color-border-subtle overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1.5 flex flex-col gap-0.5">
            {suggestions.map((item, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={item.placeId || idx}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-lg flex items-start gap-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-amber-50 text-slate-900"
                      : "hover:bg-stone-50 text-slate-700"
                  }`}
                >
                  <div className="mt-0.5 size-6 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                    <MapPin className="size-3.5 text-amber-600" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="text-xs font-semibold font-['Manrope'] leading-4 text-slate-900 truncate">
                      {item.mainText}
                    </div>
                    {item.secondaryText && (
                      <div className="text-[11px] font-normal font-['Manrope'] leading-3.5 text-slate-500 truncate mt-0.5">
                        {item.secondaryText}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="size-3.5 text-amber-600 flex-shrink-0 self-center" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
