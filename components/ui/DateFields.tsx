import React, { ReactNode } from "react";
import { Field, FieldErrorText } from "./Field";
import {
  formatThaiDate,
  fromDateInputValue,
  isoFromLocalDate,
  thaiMonths,
  thaiMonthsShort,
  toDateInputValue,
} from "../../utils/format";

type DateFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  /** ISO string (local midnight), as the old pickers sent. */
  value: string | undefined;
  onChange: (iso: string | undefined) => void;
  onBlur?: () => void;
  min?: string;
  max?: string;
};

/**
 * Native date input (the phone's own calendar) plus a Thai read-out in พ.ศ.,
 * because many phones show the Christian-era year in the picker.
 */
export function DateField({ value, onChange, onBlur, min, max, ...field }: DateFieldProps) {
  return (
    <Field {...field}>
      {(control) => (
        <div className="flex flex-col gap-1">
          <input
            {...control}
            name={field.id}
            type="date"
            className="input"
            value={toDateInputValue(value)}
            min={toDateInputValue(min) || undefined}
            max={toDateInputValue(max) || undefined}
            onChange={(event) => onChange(fromDateInputValue(event.target.value))}
            onBlur={onBlur}
          />
          {value && (
            <p className="text-base font-medium text-main-color">วันที่เลือก: {formatThaiDate(value)}</p>
          )}
        </div>
      )}
    </Field>
  );
}

const monthOptions = thaiMonths.map((name, index) => ({ value: String(index), label: name }));

type MonthRangeFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** [start, end] ISO strings; the year only orders them (an end before the start rolls into the next year). */
  value: (string | undefined)[] | undefined;
  onChange: (value: (string | undefined)[]) => void;
  onBlur?: () => void;
};

/** "From month … to month …" as two plain selects instead of a range calendar. */
export function MonthRangeField({ id, label, hint, error, value, onChange, onBlur }: MonthRangeFieldProps) {
  const start = value?.[0] ? new Date(value[0]) : undefined;
  const end = value?.[1] ? new Date(value[1]) : undefined;
  const baseYear = start?.getFullYear() ?? new Date().getFullYear();

  const update = (startMonth?: number, endMonth?: number) => {
    const startIso = startMonth === undefined ? undefined : isoFromLocalDate(baseYear, startMonth);
    let endIso: string | undefined;
    if (endMonth !== undefined) {
      const rollsOver = startMonth !== undefined && endMonth < startMonth;
      endIso = isoFromLocalDate(baseYear + (rollsOver ? 1 : 0), endMonth);
    }
    onChange([startIso, endIso]);
  };

  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const select = (part: "start" | "end") => {
    const current = part === "start" ? start : end;
    return (
      <select
        id={part === "start" ? id : `${id}-end`}
        aria-label={part === "start" ? "เริ่มเดือน" : "ถึงเดือน"}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`input ${current ? "" : "text-super-main-color/50"}`}
        value={current ? String(current.getMonth()) : ""}
        onBlur={onBlur}
        onChange={(event) => {
          const month = Number(event.target.value);
          if (part === "start") update(month, end?.getMonth());
          else update(start?.getMonth(), month);
        }}
      >
        <option value="" disabled>
          เลือกเดือน
        </option>
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value} className="text-super-main-color">
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="label mb-1.5">{label}</legend>
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {select("start")}
        <span className="text-lg text-super-main-color/70">ถึง</span>
        {select("end")}
      </div>
      {error && <FieldErrorText id={errorId}>{error}</FieldErrorText>}
    </fieldset>
  );
}

type MonthChipsFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** ISO strings, one per selected month. */
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  /** Year the chosen months belong to. */
  year?: number;
};

/** Twelve big toggle buttons, for "which months" questions with several answers. */
export function MonthChipsField({ id, label, hint, error, value, onChange, year }: MonthChipsFieldProps) {
  const selected = new Set((value ?? []).map((iso) => new Date(iso).getMonth()));
  const targetYear = year ?? (value?.[0] ? new Date(value[0]).getFullYear() : new Date().getFullYear());
  const toggle = (month: number) => {
    const next = new Set(selected);
    if (next.has(month)) next.delete(month);
    else next.add(month);
    onChange(
      Array.from(next)
        .sort((a, b) => a - b)
        .map((m) => isoFromLocalDate(targetYear, m)),
    );
  };
  const errorId = error ? `${id}-error` : undefined;
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5" aria-describedby={errorId}>
      <legend className="label mb-1.5">{label}</legend>
      {hint && <p className="hint">{hint}</p>}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {thaiMonthsShort.map((name, month) => {
          const isOn = selected.has(month);
          return (
            <button
              key={name}
              id={month === 0 ? id : undefined}
              type="button"
              aria-pressed={isOn}
              data-invalid={error && month === 0 ? true : undefined}
              aria-label={thaiMonths[month]}
              onClick={() => toggle(month)}
              className={`min-h-12 rounded-xl border text-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-main-color ${
                isOn
                  ? "border-main-color bg-main-color text-white"
                  : `bg-white text-super-main-color hover:bg-third-color/10 ${error ? "border-red-600" : "border-super-main-color/30"}`
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
      {error && <FieldErrorText id={errorId}>{error}</FieldErrorText>}
    </fieldset>
  );
}

type YearFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** ISO string of any date in the year. */
  value: string | undefined;
  onChange: (iso: string) => void;
  /** Years either side of this year to offer. */
  span?: number;
};

/** Year select labelled in พ.ศ.; stores 1 January of that year. */
export function YearField({ value, onChange, span = 3, ...field }: YearFieldProps) {
  const thisYear = new Date().getFullYear();
  const selected = value ? new Date(value).getFullYear() : undefined;
  const years = Array.from({ length: span * 2 + 1 }, (_, index) => thisYear - span + index);
  if (selected && !years.includes(selected)) years.push(selected);
  return (
    <Field {...field}>
      {(control) => (
        <select
          {...control}
          name={field.id}
          className="input"
          value={selected ? String(selected) : ""}
          onChange={(event) => onChange(isoFromLocalDate(Number(event.target.value), 0, 1))}
        >
          <option value="" disabled>
            เลือกปี
          </option>
          {years
            .sort((a, b) => a - b)
            .map((year) => (
              <option key={year} value={year}>
                พ.ศ. {year + 543}
              </option>
            ))}
        </select>
      )}
    </Field>
  );
}
