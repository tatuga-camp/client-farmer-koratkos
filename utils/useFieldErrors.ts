import { useCallback, useMemo, useState } from "react";
import { FieldErrors } from "./validators";

/**
 * Moves focus to the first field marked invalid, once React has rendered the errors.
 * Buttons standing in for a field (photo picker, map check, month chips) use data-invalid,
 * since aria-invalid isn't valid on a button.
 */
export function focusFirstInvalid() {
  window.requestAnimationFrame(() => {
    const field = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
    if (!field) return;
    field.scrollIntoView({ behavior: "smooth", block: "center" });
    field.focus({ preventScroll: true });
  });
}

/**
 * Shows a field's error only after the farmer has left that field, or after
 * they pressed submit, so an empty form doesn't open covered in red.
 * Errors are recalculated every render, so they disappear as soon as the value is fixed.
 *
 *   const form = useFieldErrors(validateBasic(values));
 *   <TextField error={form.errors.address} onBlur={() => form.touch("address")} … />
 *   const onSubmit = () => { if (!form.validate()) return; … };
 */
export function useFieldErrors(allErrors: FieldErrors) {
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const visible: FieldErrors = {};
    for (const [name, message] of Object.entries(allErrors)) {
      if (message && (submitted || touched[name])) visible[name] = message;
    }
    return visible;
  }, [allErrors, submitted, touched]);

  const touch = useCallback((name: string) => {
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }, []);

  const errorCount = Object.values(allErrors).filter(Boolean).length;

  /** Call on submit: reveals every error and focuses the first one. Returns true when valid. */
  const validate = () => {
    setSubmitted(true);
    if (errorCount > 0) {
      focusFirstInvalid();
      return false;
    }
    return true;
  };

  const reset = useCallback(() => {
    setSubmitted(false);
    setTouched({});
  }, []);

  return { errors, touch, validate, reset, submitted, errorCount };
}
