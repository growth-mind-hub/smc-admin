"use client";

import React, { useState, useEffect, useRef } from "react";

interface NumericInputProps {
  value: number | undefined | null;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  title?: string;
}

export default function NumericInput({
  value,
  onChange,
  className = "",
  placeholder = "0",
  disabled = false,
  min,
  max,
  title,
}: NumericInputProps) {
  const isFocusedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [localStr, setLocalStr] = useState<string>(() =>
    value === undefined || value === null ? "" : String(value)
  );

  useEffect(() => {
    // Only synchronize from props if the user is NOT actively typing/focused
    if (!isFocusedRef.current) {
      setLocalStr(value === undefined || value === null ? "" : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Keep only numbers
    const digitsOnly = raw.replace(/[^0-9]/g, "");
    // Remove leading zeros if followed by another digit (e.g. "085" -> "85", but single "0" stays "0")
    const normalized = digitsOnly.replace(/^0+(?=\d)/, "");

    if (normalized === "") {
      setLocalStr("");
      onChange(min !== undefined ? min : 0);
      return;
    }

    let num = Number(normalized);
    if (max !== undefined && num > max) num = max;
    if (min !== undefined && num < min) num = min;

    setLocalStr(String(num));
    onChange(num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    // Automatically select all text so user can immediately type over or delete it
    e.target.select();
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (localStr === "" || isNaN(Number(localStr))) {
      const defaultVal = min !== undefined ? min : 0;
      setLocalStr(String(defaultVal));
      onChange(defaultVal);
    } else {
      setLocalStr(String(Number(localStr)));
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      disabled={disabled}
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      title={title}
    />
  );
}

