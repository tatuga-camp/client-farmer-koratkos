import React, { ReactNode } from "react";
import { LuCheck } from "react-icons/lu";
import { FieldErrorText } from "./Field";

export type ChoiceOption = { value: string; label: ReactNode; description?: ReactNode };

type GroupProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  options: ChoiceOption[];
  /** Extra content under an option while it is selected, e.g. a text box for "อื่น ๆ". */
  renderSelected?: (option: ChoiceOption) => ReactNode;
  columns?: 1 | 2;
};

function Group({
  id,
  label,
  hint,
  error,
  children,
}: Pick<GroupProps, "id" | "label" | "hint" | "error"> & { children: ReactNode }) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <fieldset
      className="flex min-w-0 flex-col gap-1.5"
      aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend className="label mb-1.5">{label}</legend>
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {children}
      {error && <FieldErrorText id={errorId}>{error}</FieldErrorText>}
    </fieldset>
  );
}

const cardClass = (checked: boolean, invalid: boolean) =>
  `flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-white p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-main-color ${
    checked
      ? "border-main-color bg-main-color/5"
      : invalid
        ? "border-red-600"
        : "border-super-main-color/20 hover:border-super-main-color/40"
  }`;

type RadioProps = GroupProps & { value: string | undefined; onChange: (value: string) => void };

/** One answer from a few: large tap targets instead of tiny radio dots. */
export function ChoiceCards({ id, value, onChange, options, renderSelected, columns = 1, ...group }: RadioProps) {
  return (
    <Group id={id} {...group}>
      <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((option, index) => {
          const checked = value === option.value;
          return (
            <div key={option.value} className="flex flex-col gap-2">
              <label className={cardClass(checked, !!group.error)}>
                <input
                  id={index === 0 ? id : undefined}
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={checked}
                  onChange={() => onChange(option.value)}
                  aria-invalid={group.error && index === 0 ? true : undefined}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    checked ? "border-main-color" : "border-super-main-color/40"
                  }`}
                >
                  {checked && <span className="size-3 rounded-full bg-main-color" />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold leading-snug">{option.label}</span>
                  {option.description && <span className="hint">{option.description}</span>}
                </span>
              </label>
              {checked && renderSelected?.(option)}
            </div>
          );
        })}
      </div>
    </Group>
  );
}

type CheckboxProps = GroupProps & { value: string[] | undefined; onChange: (value: string[]) => void };

/** Several answers allowed: same cards with a tick box. */
export function CheckboxCards({ id, value = [], onChange, options, renderSelected, columns = 1, ...group }: CheckboxProps) {
  const toggle = (optionValue: string) =>
    onChange(value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]);
  return (
    <Group id={id} {...group}>
      <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((option, index) => {
          const checked = value.includes(option.value);
          return (
            <div key={option.value} className="flex flex-col gap-2">
              <label className={cardClass(checked, !!group.error)}>
                <input
                  id={index === 0 ? id : undefined}
                  type="checkbox"
                  name={id}
                  value={option.value}
                  checked={checked}
                  onChange={() => toggle(option.value)}
                  aria-invalid={group.error && index === 0 ? true : undefined}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 ${
                    checked ? "border-main-color bg-main-color text-white" : "border-super-main-color/40"
                  }`}
                >
                  {checked && <LuCheck className="size-4" strokeWidth={3} />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold leading-snug">{option.label}</span>
                  {option.description && <span className="hint">{option.description}</span>}
                </span>
              </label>
              {checked && renderSelected?.(option)}
            </div>
          );
        })}
      </div>
    </Group>
  );
}
