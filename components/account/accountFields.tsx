import React, { ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { LuAlertCircle } from "react-icons/lu";
import { Field, FieldErrorText, TextField } from "../ui";
import {
  FieldErrors,
  checkRequired,
  checkText,
  checkThaiIdCard,
  checkThaiPhone,
  sanitizeNumberInput,
} from "../../utils/validators";

// Sign-in, sign-up and the profile page share these fields so the ID card and
// phone look and behave the same everywhere they are typed.

/** Digits only; Thai digits (๐-๙) become Arabic, dashes and spaces are dropped. */
export const toDigits = (value: string) => sanitizeNumberInput(value, false);

/** "1234567890123" → "1-2345-67890-12-3"; partial input is grouped as far as it goes. */
export function formatIdCard(value: string) {
  const digits = toDigits(value).slice(0, 13);
  const parts: string[] = [];
  let start = 0;
  for (const size of [1, 4, 5, 2, 1]) {
    if (start >= digits.length) break;
    parts.push(digits.slice(start, start + size));
    start += size;
  }
  return parts.join("-");
}

/** "0812345678" → "081-234-5678". A pasted "+66 81 234 5678" becomes "081-234-5678". */
export function formatPhone(value: string) {
  let digits = toDigits(value);
  if (digits.startsWith("66") && digits.length >= 11) digits = `0${digits.slice(2)}`;
  digits = digits.slice(0, 10);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join("-");
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type MaskedFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

/** Text box that inserts the dashes itself and keeps the cursor after the same digit. */
function MaskedField({
  value,
  onChange,
  onBlur,
  format,
  type,
  autoComplete,
  ...field
}: MaskedFieldProps & { format: (value: string) => string; type: "text" | "tel"; autoComplete: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digitsBeforeCaret = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const input = inputRef.current;
    const wanted = digitsBeforeCaret.current;
    digitsBeforeCaret.current = null;
    if (wanted === null || !input || document.activeElement !== input) return;
    let position = 0;
    for (let seen = 0; position < input.value.length && seen < wanted; position++) {
      if (/\d/.test(input.value[position])) seen++;
    }
    input.setSelectionRange(position, position);
  });

  return (
    <Field {...field}>
      {(control) => (
        <input
          {...control}
          ref={inputRef}
          name={field.id}
          type={type}
          inputMode="numeric"
          autoComplete={autoComplete}
          className="input tabular-nums tracking-wide"
          value={value}
          onChange={(event) => {
            const raw = event.target.value;
            let before = toDigits(raw.slice(0, event.target.selectionStart ?? raw.length)).length;
            let next = format(raw);
            const backspace = (event.nativeEvent as InputEvent).inputType === "deleteContentBackward";
            if (backspace && next === value && before > 0) {
              // Backspace over a dash: remove the digit in front of it instead of doing nothing.
              const digits = toDigits(raw);
              next = format(digits.slice(0, before - 1) + digits.slice(before));
              before -= 1;
            }
            digitsBeforeCaret.current = before;
            onChange(next);
          }}
          onBlur={onBlur}
        />
      )}
    </Field>
  );
}

export function IdCardField(props: MaskedFieldProps) {
  return <MaskedField {...props} format={formatIdCard} type="text" autoComplete="off" />;
}

export function PhoneField(props: MaskedFieldProps) {
  return <MaskedField {...props} format={formatPhone} type="tel" autoComplete="tel-national" />;
}

export const TITLE_OPTIONS = ["นาย", "นาง", "นางสาว"];
/** Choice value for a title typed by hand (ดร., ว่าที่ร้อยตรี …), which the old free-text box allowed. */
export const OTHER_TITLE = "other";

type TitleFieldProps = {
  id: string;
  /** "นาย" | "นาง" | "นางสาว" | OTHER_TITLE | "" */
  choice: string;
  otherTitle: string;
  onChoiceChange: (choice: string) => void;
  onOtherTitleChange: (value: string) => void;
  onOtherTitleBlur: () => void;
  errors: FieldErrors;
};

/** คำนำหน้าชื่อ as four big tap targets (2 × 2 on phones), plus a text box for "อื่น ๆ". */
export function TitleField({ id, choice, otherTitle, onChoiceChange, onOtherTitleChange, onOtherTitleBlur, errors }: TitleFieldProps) {
  const error = errors[id];
  const errorId = error ? `${id}-error` : undefined;
  const options = [...TITLE_OPTIONS.map((title) => ({ value: title, label: title })), { value: OTHER_TITLE, label: "อื่น ๆ" }];
  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex min-w-0 flex-col gap-1.5" aria-describedby={errorId}>
        <legend className="label mb-1.5">คำนำหน้าชื่อ</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {options.map((option, index) => {
            const checked = choice === option.value;
            return (
              <label
                key={option.value}
                className={`flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 bg-white px-3 text-lg font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-main-color ${
                  checked
                    ? "border-main-color bg-main-color/5"
                    : error
                      ? "border-red-600"
                      : "border-super-main-color/20 hover:border-super-main-color/40"
                }`}
              >
                <input
                  id={index === 0 ? id : undefined}
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={checked}
                  onChange={() => onChoiceChange(option.value)}
                  aria-invalid={error && index === 0 ? true : undefined}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    checked ? "border-main-color" : "border-super-main-color/40"
                  }`}
                >
                  {checked && <span className="size-2.5 rounded-full bg-main-color" />}
                </span>
                {option.label}
              </label>
            );
          })}
        </div>
        {error && <FieldErrorText id={errorId}>{error}</FieldErrorText>}
      </fieldset>
      {choice === OTHER_TITLE && (
        <TextField
          id="otherTitle"
          label="พิมพ์คำนำหน้าชื่อ"
          hint="เช่น ดร., ว่าที่ร้อยตรี, จ.ส.อ."
          value={otherTitle}
          onChange={onOtherTitleChange}
          onBlur={onOtherTitleBlur}
          error={errors.otherTitle}
          maxLength={255}
        />
      )}
    </div>
  );
}

export type AccountValues = {
  titleChoice: string;
  otherTitle: string;
  firstName: string;
  lastName: string;
  /** Formatted as shown ("1-2345-67890-12-3"); send toDigits(). */
  idCard: string;
  /** Formatted as shown ("081-234-5678"); send toDigits(). */
  phone: string;
};

export const emptyAccount: AccountValues = { titleChoice: "", otherTitle: "", firstName: "", lastName: "", idCard: "", phone: "" };

/** Splits a saved title back into the choice cards: anything that is not นาย/นาง/นางสาว goes to "อื่น ๆ". */
export function accountFromFarmer(farmer?: { title?: string; firstName?: string; lastName?: string; identityCardId?: string; phoneNumber?: string }): AccountValues {
  const title = farmer?.title?.trim() ?? "";
  const known = TITLE_OPTIONS.includes(title);
  return {
    titleChoice: known ? title : title ? OTHER_TITLE : "",
    otherTitle: known ? "" : title,
    firstName: farmer?.firstName ?? "",
    lastName: farmer?.lastName ?? "",
    idCard: formatIdCard(farmer?.identityCardId ?? ""),
    phone: formatPhone(farmer?.phoneNumber ?? ""),
  };
}

export const accountTitle = (values: AccountValues) =>
  values.titleChoice === OTHER_TITLE ? values.otherTitle.trim() : values.titleChoice;

export function validateAccount(values: AccountValues): FieldErrors {
  return {
    title: checkRequired(values.titleChoice, "กรุณาเลือกคำนำหน้าชื่อ เช่น นาย นาง หรือ นางสาว"),
    otherTitle:
      values.titleChoice === OTHER_TITLE ? checkText(values.otherTitle, { label: "คำนำหน้าชื่อ", example: "ดร." }) : undefined,
    firstName: checkText(values.firstName, { label: "ชื่อ", example: "สมชาย" }),
    lastName: checkText(values.lastName, { label: "นามสกุล", example: "ใจดี" }),
    idCard: checkThaiIdCard(values.idCard),
    phone: checkThaiPhone(values.phone),
  };
}

/** Red box for what the server said (wrong login, number already used, no signal). */
export function FormAlert({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border-2 border-red-600/60 bg-red-50 p-4">
      <LuAlertCircle aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-red-700" />
      <div className="flex min-w-0 flex-col gap-1 text-base leading-relaxed text-red-800">
        <p className="text-lg font-bold">{title}</p>
        {children}
      </div>
    </div>
  );
}

/** Calm note with an icon, for "what you need" or "be careful" messages. */
export function NoteBox({ icon, tone = "info", children }: { icon: ReactNode; tone?: "info" | "warn"; children: ReactNode }) {
  return (
    <div
      className={`flex gap-3 rounded-xl border p-3.5 text-base leading-relaxed ${
        tone === "info" ? "border-secondary-color/30 bg-secondary-color/10" : "border-third-color/60 bg-third-color/15"
      }`}
    >
      <span aria-hidden="true" className={`mt-0.5 shrink-0 [&>svg]:size-5 ${tone === "info" ? "text-secondary-color" : "text-super-main-color"}`}>
        {icon}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
