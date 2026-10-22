// Display helpers. Dates use the Thai Buddhist calendar (พ.ศ.), as on official documents.

const toDate = (value?: string | Date | null) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export function formatThaiDate(value?: string | Date | null, month: "long" | "short" = "long") {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month, year: "numeric" }).format(date);
}

export function formatThaiMonth(value?: string | Date | null, month: "long" | "short" = "short") {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", { month }).format(date);
}

export function formatThaiYear(value?: string | Date | null) {
  const date = toDate(value);
  if (!date) return "-";
  return `พ.ศ. ${date.getFullYear() + 543}`;
}

export function formatNumber(value?: number | string | null, maximumFractionDigits = 2) {
  if (value === undefined || value === null || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return number.toLocaleString("th-TH", { maximumFractionDigits });
}

/** "3 ไร่ 2 งาน", skipping a zero part. */
export function formatArea(rai?: number | string | null, ngan?: number | string | null) {
  const parts = [];
  if (Number(rai) > 0) parts.push(`${formatNumber(rai)} ไร่`);
  if (Number(ngan) > 0) parts.push(`${formatNumber(ngan)} งาน`);
  return parts.length > 0 ? parts.join(" ") : "0 ไร่";
}

export const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const thaiMonthsShort = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** Local-midnight ISO string, matching what the old date pickers sent to the server. */
export function isoFromLocalDate(year: number, monthIndex: number, day = 1) {
  return new Date(year, monthIndex, day).toISOString();
}

/** "2026-10-22" for <input type="date"> from an ISO string, using the local date. */
export function toDateInputValue(iso?: string | null) {
  const date = toDate(iso);
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateInputValue(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return isoFromLocalDate(year, month - 1, day);
}
