"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    throw new Error("Only admins can manage this list");
  }

  return { supabase };
}

export async function createOutputType(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const { error } = await supabase.from("output_types").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function renameOutputType(id: string, name: string) {
  const { supabase } = await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");

  const { error } = await supabase.from("output_types").update({ name: trimmed }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function toggleOutputType(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("output_types")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

// Safe to hard-delete: tasks.output_type_id is ON DELETE SET NULL, so
// existing tasks just lose the reference rather than being blocked/cascaded.
export async function deleteOutputType(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("output_types").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function createWriter(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const { error } = await supabase.from("writers").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function renameWriter(id: string, name: string) {
  const { supabase } = await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");

  const { error } = await supabase.from("writers").update({ name: trimmed }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function toggleWriter(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("writers").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

// Safe to hard-delete: tasks.writer_id is ON DELETE SET NULL.
export async function deleteWriter(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("writers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function createSegment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const { error } = await supabase.from("segments").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function renameSegment(id: string, name: string) {
  const { supabase } = await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");

  const { error } = await supabase.from("segments").update({ name: trimmed }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function toggleSegment(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("segments").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

// Safe to hard-delete: tasks.segment_id is ON DELETE SET NULL.
export async function deleteSegment(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("segments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}
