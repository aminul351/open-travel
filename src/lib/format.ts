export function formatMoney(
  value: number | { toString(): string },
  currency = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" || currency === "EUR" ? 0 : 2,
  }).format(Number(value));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDuration(days: number, nights: number): string {
  const parts = [];
  if (days > 0) parts.push(`${days} days`);
  if (nights > 0) parts.push(`${nights} nights`);
  return parts.join(" · ");
}