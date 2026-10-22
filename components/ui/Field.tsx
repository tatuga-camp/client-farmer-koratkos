import React, { ReactNode, useId } from "react";
import { LuAlertCircle } from "react-icons/lu";
import { sanitizeNumberInput } from "../../utils/validators";

export type ControlProps = {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

type FieldProps = {
  /** Also the input id; ErrorSummary links to it, so keep it equal to the error key. */
  id: string;
  label: ReactNode;
  /** Shown between the label and the input: what to type, or why it is asked. */
  hint?: ReactNode;
  error?: string;
  /** Adds "(ถ้ามี)" to the label. Fields are required unless marked optional. */
  optional?: boolean;
  className?: string;
  children: (control: ControlProps) => ReactNode;
};

/** Label, hint, control and error message, wired together for screen readers. */
export function Field({ id, label, hint, error, optional, className = "", children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="label">
        {label}
        {optional && <span className="font-normal text-super-main-color/70"> (ถ้ามี)</span>}
      </label>
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error && <FieldErrorText id={errorId}>{error}</FieldErrorText>}
    </div>
  );
}

export function FieldErrorText({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="field-error">
      <LuAlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <span className="whitespace-pre-line">{children}</span>
    </p>
  );
}

type CommonProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
};

type TextFieldProps = CommonProps & {
  value: string | undefined;
  onChange: (value: string) => void;
  type?: "text" | "tel";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
};

export function TextField({ value, onChange, type = "text", inputMode, autoComplete, maxLength, placeholder, disabled, onBlur, ...field }: TextFieldProps) {
  return (
    <Field {...field}>
      {(control) => (
        <input
          {...control}
          name={field.id}
          type={type}
          className="input"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </Field>
  );
}

type NumberFieldProps = CommonProps & {
  /** Kept as a string while typing so "1." or "" don't jump; convert with Number() on submit. */
  value: string | number | undefined;
  onChange: (value: string) => void;
  /** Shown inside the box on the right, e.g. "ไร่", "กก.". */
  unit?: string;
  /** Whole numbers only (plot counts, rounds per year). */
  integer?: boolean;
};

export function NumberField({ value, onChange, unit, integer, placeholder, disabled, onBlur, ...field }: NumberFieldProps) {
  return (
    <Field {...field}>
      {(control) => (
        <div className="relative">
          <input
            {...control}
            name={field.id}
            type="text"
            inputMode={integer ? "numeric" : "decimal"}
            autoComplete="off"
            className={`input tabular-nums ${unit ? "pr-20" : ""}`}
            value={value ?? ""}
            onChange={(event) => onChange(sanitizeNumberInput(event.target.value, !integer))}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
          />
          {unit && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg text-super-main-color/70"
            >
              {unit}
            </span>
          )}
        </div>
      )}
    </Field>
  );
}

type TextAreaFieldProps = CommonProps & {
  value: string | undefined;
  onChange: (value: string) => void;
  /** Shows a live "120/500" counter. */
  maxLength?: number;
  rows?: number;
};

export function TextAreaField({ value, onChange, maxLength, rows = 4, placeholder, disabled, onBlur, ...field }: TextAreaFieldProps) {
  const length = value?.length ?? 0;
  return (
    <Field {...field}>
      {(control) => (
        <div className="flex flex-col gap-1">
          <textarea
            {...control}
            name={field.id}
            className="input"
            rows={rows}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
          />
          {maxLength && (
            <p className={`self-end text-sm tabular-nums ${length > maxLength ? "font-semibold text-red-700" : "text-super-main-color/60"}`}>
              {length.toLocaleString()}/{maxLength.toLocaleString()} ตัวอักษร
            </p>
          )}
        </div>
      )}
    </Field>
  );
}

export type SelectOption = { value: string; label: string };

type SelectFieldProps = CommonProps & {
  value: string | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
};

/** Native select: the phone's own picker is the most familiar choice list for farmers. */
export function SelectField({ value, onChange, options, placeholder = "แตะเพื่อเลือก", disabled, onBlur, ...field }: SelectFieldProps) {
  return (
    <Field {...field}>
      {(control) => (
        <select
          {...control}
          name={field.id}
          className={`input ${value ? "" : "text-super-main-color/50"}`}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-super-main-color">
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** Groups related fields under a heading, e.g. "พื้นที่ทั้งหมด". */
export function FieldGroup({ title, description, children, className = "" }: { title: ReactNode; description?: ReactNode; children: ReactNode; className?: string }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col gap-1">
        <h3 id={id} className="text-xl font-bold text-super-main-color">
          {title}
        </h3>
        {description && <p className="hint">{description}</p>}
      </div>
      {children}
    </section>
  );
}
