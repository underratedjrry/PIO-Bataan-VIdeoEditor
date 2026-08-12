import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { createOutputType, toggleOutputType } from "@/lib/lookups/actions";
import { ActiveToggle } from "@/components/ActiveToggle";

export default async function OutputTypesPage() {
  const { profile } = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/tasks");

  const supabase = await createClient();
  const { data: outputTypes } = await supabase
    .from("output_types")
    .select("*")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Output Types</h1>

      <form action={createOutputType} className="flex max-w-md gap-2">
        <input
          name="name"
          placeholder="e.g. Livestream Highlights"
          required
          className="form-input flex-1"
        />
        <button
          type="submit"
          className="rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5]"
        >
          Add
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(outputTypes ?? []).map((ot) => (
              <tr key={ot.id}>
                <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{ot.name}</td>
                <td className="px-4 py-3">
                  <ActiveToggle id={ot.id} isActive={ot.is_active} onToggle={toggleOutputType} />
                </td>
              </tr>
            ))}
            {(outputTypes ?? []).length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                  No output types yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
