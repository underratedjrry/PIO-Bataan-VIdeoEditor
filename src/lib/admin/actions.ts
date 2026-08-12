"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Only admins can manage users");
  }

  return { supabase, userId: user.id };
}

export async function updateUserRole(userId: string, role: Role) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function updateUserName(userId: string, fullName: string) {
  const { supabase } = await requireAdmin();
  const trimmed = fullName.trim();
  if (!trimmed) throw new Error("Name is required");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmed })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

// Creates a real Supabase Auth account directly (via the service-role admin
// API) instead of the user having to self-sign-up. The profiles row is
// auto-provisioned by the same trigger self-signup uses (defaults to
// 'editor'); we follow up with a role update only if a different role was
// requested.
export async function createUserAccount(formData: FormData) {
  const { supabase } = await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "editor") as Role;

  if (!fullName) throw new Error("Name is required");
  if (!email) throw new Error("Email is required");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create user");
  }

  if (role !== "editor") {
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", data.user.id);
    if (roleError) throw new Error(roleError.message);
  }

  revalidatePath("/settings");
}

// Deletes the Supabase Auth user outright (via the service-role admin API,
// which bypasses RLS - the admin check above is what actually gates this).
// The profiles row cascades away with it; tasks the user created or was
// assigned keep existing (see migration 0003 - created_by/assigned_to are
// set to null rather than cascading).
export async function deleteUserAccount(userId: string) {
  const { userId: actingUserId } = await requireAdmin();
  if (userId === actingUserId) {
    throw new Error("You can't delete your own account");
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}
