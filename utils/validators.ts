// Field checks shared by every form. Each returns a Thai message that tells the
// farmer what to fix (with an example), or undefined when the value is fine.

export type FieldErrors = Record<string, string | undefined>;

export const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

export function checkRequired(value: unknown, message: string) {
  return isBlank(value) ? message : undefined;
}

export function checkText(
  value: string | undefined | null,
  rule: { label: string; example?: string; max?: number; required?: boolean },
) {
  if (isBlank(value)) {
    if (rule.required === false) return undefined;
    return `กรุณากรอก${rule.label}${rule.example ? ` เช่น ${rule.example}` : ""}`;
  }
  const max = rule.max ?? 255;
  if ((value as string).trim().length > max) {
    return `${rule.label}ยาวเกินไป ใส่ได้ไม่เกิน ${max.toLocaleString()} ตัวอักษร (ตอนนี้ ${(value as string).trim().length.toLocaleString()})`;
  }
  return undefined;
}

type NumberRule = {
  label: string;
  example?: string;
  unit?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  required?: boolean;
  /** Replaces the default "ต้องไม่เกิน …" message. */
  maxMessage?: string;
};

export function checkNumber(value: unknown, rule: NumberRule) {
  const example = rule.example ?? (rule.integer ? "2" : "1.5");
  const unit = rule.unit ? ` ${rule.unit}` : "";
  if (isBlank(value)) {
    if (rule.required === false) return undefined;
    return `กรุณากรอก${rule.label} เป็นตัวเลข เช่น ${example}${unit}`;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) return `กรอกเป็นตัวเลขเท่านั้น เช่น ${example}${unit}`;
  if (rule.integer && !Number.isInteger(number)) {
    return `กรอกเป็นจำนวนเต็ม ไม่มีจุดทศนิยม เช่น ${example}${unit}`;
  }
  const min = rule.min ?? 0;
  if (number < min) {
    return min === 0 ? "ตัวเลขต้องไม่ติดลบ" : `ต้องไม่น้อยกว่า ${min.toLocaleString()}${unit}`;
  }
  if (rule.max !== undefined && number > rule.max) {
    return rule.maxMessage ?? `ต้องไม่เกิน ${rule.max.toLocaleString()}${unit}`;
  }
  return undefined;
}

export function checkDate(
  iso: string | undefined | null,
  rule: { label: string; notFuture?: boolean; notPast?: boolean; required?: boolean },
) {
  if (isBlank(iso)) {
    if (rule.required === false) return undefined;
    return `กรุณาเลือก${rule.label}`;
  }
  const date = new Date(iso as string);
  if (Number.isNaN(date.getTime())) return `${rule.label}ไม่ถูกต้อง กรุณาเลือกใหม่`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (rule.notFuture && date.getTime() > today.getTime() + 86_399_999) {
    return `${rule.label}ต้องไม่เกินวันนี้ ให้เลือกวันที่ทำจริง`;
  }
  if (rule.notPast && date.getTime() < today.getTime()) {
    return `${rule.label}ต้องเป็นวันนี้หรือวันข้างหน้า`;
  }
  return undefined;
}

/** Thai national ID: 13 digits with a mod-11 check digit. */
export function checkThaiIdCard(value: string | undefined | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 0) return "กรุณากรอกเลขบัตรประชาชน 13 หลัก";
  if (digits.length !== 13) {
    return `เลขบัตรประชาชนต้องมี 13 หลัก (ตอนนี้กรอก ${digits.length} หลัก)`;
  }
  const sum = digits
    .slice(0, 12)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (13 - index), 0);
  if ((11 - (sum % 11)) % 10 !== Number(digits[12])) {
    return "เลขบัตรประชาชนไม่ถูกต้อง ลองตรวจดูตัวเลขบนบัตรอีกครั้ง";
  }
  return undefined;
}

export function checkThaiPhone(value: string | undefined | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 0) return "กรุณากรอกเบอร์โทรศัพท์ เช่น 081 234 5678";
  if (!digits.startsWith("0")) return "เบอร์โทรศัพท์ต้องขึ้นต้นด้วยเลข 0 เช่น 081 234 5678";
  if (digits.length !== 10 && digits.length !== 9) {
    return `เบอร์มือถือต้องมี 10 หลัก (ตอนนี้กรอก ${digits.length} หลัก)`;
  }
  return undefined;
}

// Rough bounding box of Thailand, enough to catch swapped or mistyped values.
const THAI_BOUNDS = { latMin: 5.5, latMax: 20.6, lngMin: 97.3, lngMax: 105.7 };

export function checkLatitude(value: string | undefined | null) {
  if (isBlank(value)) return "กรุณากรอกละติจูด หรือกดปุ่ม “ใช้ตำแหน่งปัจจุบัน”";
  const number = Number(value);
  if (!Number.isFinite(number)) return "ละติจูดต้องเป็นตัวเลข เช่น 14.7135";
  if (number < THAI_BOUNDS.latMin || number > THAI_BOUNDS.latMax) {
    return "ละติจูดของประเทศไทยอยู่ระหว่าง 5.6 ถึง 20.5 เช่น 14.7135 (อาจสลับกับลองจิจูด)";
  }
  return undefined;
}

export function checkLongitude(value: string | undefined | null) {
  if (isBlank(value)) return "กรุณากรอกลองจิจูด หรือกดปุ่ม “ใช้ตำแหน่งปัจจุบัน”";
  const number = Number(value);
  if (!Number.isFinite(number)) return "ลองจิจูดต้องเป็นตัวเลข เช่น 101.4207";
  if (number < THAI_BOUNDS.lngMin || number > THAI_BOUNDS.lngMax) {
    return "ลองจิจูดของประเทศไทยอยู่ระหว่าง 97.3 ถึง 105.7 เช่น 101.4207 (อาจสลับกับละติจูด)";
  }
  return undefined;
}

/** Keeps digits (Thai digits become Arabic) and at most one decimal point. */
export function sanitizeNumberInput(raw: string, allowDecimal = true) {
  const arabic = raw.replace(/[๐-๙]/g, (digit) => String(digit.charCodeAt(0) - 0x0e50));
  const cleaned = arabic.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
  if (!allowDecimal) return cleaned;
  const [whole, ...rest] = cleaned.split(".");
  return rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
}

export const hasErrors = (errors: FieldErrors) => Object.values(errors).some(Boolean);
