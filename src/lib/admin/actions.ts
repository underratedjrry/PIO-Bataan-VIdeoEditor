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
