"use client";

import { useState } from "react";

export function PasswordField({
  id,
  name,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="form-input w-full pr-16"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-[#0036AF] dark:text-slate-400"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
