import Link from "next/link";
import { login } from "../actions";
import { PasswordField } from "@/components/PasswordField";
import { ArrowRightIcon } from "@/components/icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div>
      <form action={login} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <PasswordField id="password" name="password" autoComplete="current-password" />
        </div>

        {message && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 flex items-center justify-center gap-2 rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5]"
        >
          Sign in
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        No account?{" "}
        <Link href="/signup" className="font-medium text-[#1565D8] underline dark:text-[#5B9BEA]">
          Sign up
        </Link>
      </p>
    </div>
  );
}
