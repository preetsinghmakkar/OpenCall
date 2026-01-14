"use client"

import { Input } from "./input"
import { FieldError } from "./field"

interface TimePickerProps {
  id?: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  min?: string // HH:MM format
  max?: string // HH:MM format
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string
  "aria-invalid"?: boolean | "false" | "true"
}

/**
 * Time Picker Component
 * Uses native HTML5 time input
 * Format: HH:MM (24-hour format for API compatibility)
 */
export function TimePicker({
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
}: TimePickerProps) {
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
        type="time"
        value={value}
        onChange={handleChange}
        min={min}
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
