"use client";

import { EyeIcon } from "@/components/icons";
import type { Role } from "@/types/database";

export function UserRow({
  fullName,
  email,
  role,
  onView,
}: {
  fullName: string;
  email: string;
  role: Role;
  onView: () => void;
}) {
  return (
    <tr>
      <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{fullName}</td>
      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{email}</td>
      <td className="px-4 py-2">
        <span className="border-l-4 border-slate-400 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {role}
        </span>
      </td>
      <td className="px-4 py-2">
        <button
          type="button"
          onClick={onView}
          aria-label="View user"
          title="View / Edit"
          className="text-slate-500 hover:text-[#0036AF] dark:text-slate-400"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
