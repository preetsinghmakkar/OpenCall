"use client"

import { Input } from "./input"
import { FieldError } from "./field"

interface DatePickerProps {
  id?: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  min?: string // ISO date string (YYYY-MM-DD)
  max?: string // ISO date string (YYYY-MM-DD)
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string
  "aria-invalid"?: boolean | "false" | "true"
}

/**
 * Date Picker Component
 * Uses native HTML5 date input with validation
 * Format: YYYY-MM-DD (ISO format for API compatibility)
 */
export function DatePicker({
  id,
  name,
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  className = "",
  error,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  // Default min date to today if not provided
  const minDate = min || new Date().toISOString().split("T")[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className="w-full">
      <Input
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={handleChange}
        min={minDate}
        max={max}
        required={required}
        disabled={disabled}
        className={className}
        aria-invalid={ariaInvalid || (error ? "true" : "false")}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}
