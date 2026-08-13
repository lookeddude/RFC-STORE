"use server";
/**
 * RFC Store — Address Server Actions (Phase 7)
 *
 * addAddressAction      — creates a new saved address
 * updateAddressAction   — updates an existing address (ownership verified)
 * deleteAddressAction   — deletes an address (ownership verified)
 * setDefaultAddressAction — atomically sets one address as default
 *
 * Security:
 *   - All ownership derived from auth session, never from client input
 *   - RLS on addresses table (ALL own) enforces server-side
 *   - set_default_address() SECURITY DEFINER function enforces atomicity
 *   - address IDs validated by ownership check before mutation
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AddressFormData,
  AddressFormErrors,
  AddressMutationResult,
} from "@/types/account";

// ── Indian States (same set as checkout) ──────────────────

const INDIAN_STATES = new Set([
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
]);

// ── Validation ─────────────────────────────────────────────

function validateAddress(data: AddressFormData): AddressFormErrors {
  const errors: AddressFormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else {
    const clean = data.phone.replace(/[\s\-()]/g, "");
    if (!/^(\+?\d{7,15}|[6-9]\d{9})$/.test(clean)) {
      errors.phone = "Please enter a valid phone number.";
    }
  }

  if (!data.line1.trim()) {
    errors.line1 = "Address is required.";
  } else if (data.line1.trim().length < 5) {
    errors.line1 = "Please enter your full address.";
  }

  if (!data.city.trim()) {
    errors.city = "City is required.";
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

  return errors;
}

// ── Helper: get authenticated user ────────────────────────

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ── Actions ────────────────────────────────────────────────

export async function addAddressAction(
  data: AddressFormData
): Promise<AddressMutationResult> {
  const fieldErrors = validateAddress(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const supabase = await createClient();

  // Check if this is the first address (auto-set as default)
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isFirst = (count ?? 0) === 0;

  const { data: newAddress, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: data.label.trim() || "Home",
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      line1: data.line1.trim(),
      line2: data.line2.trim() || null,
      city: data.city.trim(),
      state: data.state.trim(),
      postal_code: data.postalCode.trim(),
      country: data.country || "IN",
      is_default: isFirst,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[RFC Store] Add address error:", error.message);
    return { success: false, error: "Address could not be saved. Please try again." };
  }

  return { success: true, addressId: (newAddress as { id: string }).id };
}

export async function updateAddressAction(
  addressId: string,
  data: AddressFormData
): Promise<AddressMutationResult> {
  if (!addressId) return { success: false, error: "Invalid address." };

  const fieldErrors = validateAddress(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("addresses")
    .update({
      label: data.label.trim() || "Home",
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      line1: data.line1.trim(),
      line2: data.line2.trim() || null,
      city: data.city.trim(),
      state: data.state.trim(),
      postal_code: data.postalCode.trim(),
      country: data.country || "IN",
      updated_at: new Date().toISOString(),
    })
    .eq("id", addressId)
    .eq("user_id", user.id); // RLS enforces ownership; this is an extra guard

  if (error) {
    console.error("[RFC Store] Update address error:", error.message);
    return { success: false, error: "Address could not be updated. Please try again." };
  }

  return { success: true, addressId };
}

export async function deleteAddressAction(
  addressId: string
): Promise<AddressMutationResult> {
  if (!addressId) return { success: false, error: "Invalid address." };

  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id); // ownership enforced

  if (error) {
    console.error("[RFC Store] Delete address error:", error.message);
    return { success: false, error: "Address could not be deleted. Please try again." };
  }

  return { success: true };
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<AddressMutationResult> {
  if (!addressId) return { success: false, error: "Invalid address." };

  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be logged in." };

  // Use SECURITY DEFINER function for atomic single-default enforcement
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).rpc("set_default_address", {
    p_user_id: user.id,
    p_address_id: addressId,
  });

  if (error) {
    console.error("[RFC Store] Set default address error:", error.message);
    return { success: false, error: "Could not update default address. Please try again." };
  }

  return { success: true };
}
