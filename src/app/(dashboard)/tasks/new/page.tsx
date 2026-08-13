import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { NewTaskContent } from "@/components/NewTaskContent";

export default async function NewTaskPage() {
  const { profile } = await getCurrentProfile();
  if (profile.role === "viewer") redirect("/tasks");

  return <NewTaskContent />;
}
