// All displayed/edited timestamps in this app should read as Philippine
// Standard Time (Asia/Manila, UTC+8, no DST) regardless of the viewing
// browser's or the server's own local timezone - `Date`'s local getters
// and bare `toLocaleString()` calls both silently fall back to the host
// system's timezone otherwise, which is wrong for a PIO Bataan-only app.
export const PH_TIME_ZONE = "Asia/Manila";
const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

function shiftToPH(value: string | Date): Date {
  const ms = (value instanceof Date ? value : new Date(value)).getTime();
  return new Date(ms + PH_OFFSET_MS);
}

// Value for a `<input type="datetime-local">` showing the PH wall-clock
// time for a stored UTC timestamp. Uses UTC getters on a shifted instant
// (rather than the browser's local getters) so it's correct no matter what
// timezone the visitor's device is actually set to.
export function toDatetimeLocalPH(value: string | null | undefined): string {
  if (!value) return "";
  const shifted = shiftToPH(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

// Inverse of toDatetimeLocalPH: takes a "YYYY-MM-DDTHH:mm" value from a
// datetime-local input, interprets it as PH wall-clock time (fixed +08:00,
// no DST to worry about), and returns the correct UTC ISO string to store.
export function fromDatetimeLocalPH(value: string): string {
  return new Date(`${value}:00+08:00`).toISOString();
}

export function formatPHDateTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleString("en-PH", {
    timeZone: PH_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPHDate(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-PH", {
    timeZone: PH_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Calendar-day parts (0-indexed month) for a UTC timestamp, as they fall in
// PH time - used to group tasks by due-date day on the Dashboard calendar,
// since the server itself usually runs in UTC.
export function getPHDateParts(value: string | Date): { year: number; month: number; day: number } {
  const shifted = shiftToPH(value);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
  };
}
