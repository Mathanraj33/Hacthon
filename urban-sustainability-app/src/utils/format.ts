/** Formats a number with locale separators and an optional unit suffix. */
export function formatNumber(value: number, unit?: string) {
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/** Formats a signed percentage change, e.g. "+4.2%". */
export function formatChange(change: number) {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

/** Clamps a value into the given range. */
export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

/** Human readable date used across dashboard widgets. */
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}