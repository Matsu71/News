export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidDateTimeString(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

export function toMonthId(date: string): string {
  return date.slice(0, 7);
}

export function monthToRouteParts(month: string): { year: string; monthNumber: string } {
  const [year, monthNumber] = month.split("-");
  return { year, monthNumber };
}

export function formatDateJa(date: string): string {
  const parsed = new Date(`${date}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo"
  }).format(parsed);
}

export function formatMonthJa(month: string): string {
  const parsed = new Date(`${month}-01T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    timeZone: "Asia/Tokyo"
  }).format(parsed);
}

export function formatPublishedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  }).format(parsed);
}

export function dateToRfc822(date: string): string {
  return new Date(`${date}T00:00:00+09:00`).toUTCString();
}

export function compareDateDesc(a: { date: string }, b: { date: string }): number {
  return b.date.localeCompare(a.date);
}

export function compareDateAsc(a: { date: string }, b: { date: string }): number {
  return a.date.localeCompare(b.date);
}
