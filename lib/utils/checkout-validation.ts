/**
 * RFC Store — Checkout Form Validation
 *
 * NOT a server action file — pure utility functions.
 * Safe to import in both server actions and client components.
 */

import type { CheckoutFormData, CheckoutFormErrors } from '@/types/order';

// ── Indian States ──────────────────────────────────────────

export const INDIAN_STATES = new Set([
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
]);

// ── Form Validation ────────────────────────────────────────

export function validateForm(data: CheckoutFormData): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  } else if (data.fullName.trim().length > 100) {
    errors.fullName = "Full name must be under 100 characters.";
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailRx.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  const phoneRx = /^(\+?\d{7,15}|[6-9]\d{9})$/;
  const cleanPhone = data.phone.replace(/[\s\-()]/g, "");
  if (!cleanPhone) {
    errors.phone = "Phone number is required.";
  } else if (!phoneRx.test(cleanPhone)) {
    errors.phone = "Please enter a valid 10-digit mobile number.";
  }

  if (!data.line1.trim()) {
    errors.line1 = "Address is required.";
  } else if (data.line1.trim().length < 5) {
    errors.line1 = "Please enter your full address.";
  } else if (data.line1.trim().length > 200) {
    errors.line1 = "Address must be under 200 characters.";
  }

  if (!data.city.trim()) {
    errors.city = "City is required.";
  } else if (data.city.trim().length > 100) {
    errors.city = "City name must be under 100 characters.";
  }

  if (!data.state.trim()) {
    errors.state = "State is required.";
  } else if (data.country === "IN" && !INDIAN_STATES.has(data.state.trim())) {
    errors.state = "Please select a valid Indian state.";
  }

  if (!data.postalCode.trim()) {
    errors.postalCode = "PIN code is required.";
  } else if (data.country === "IN" && !/^\d{6}$/.test(data.postalCode.trim())) {
    errors.postalCode = "Please enter a valid 6-digit PIN code.";
  }

  if (data.notes && data.notes.length > 500) {
    errors.notes = "Notes must be under 500 characters.";
  }

  return errors;
}
