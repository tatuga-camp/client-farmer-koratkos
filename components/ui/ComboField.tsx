import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
} from "react-aria-components";
import { LuAlertCircle, LuCheck, LuChevronDown } from "react-icons/lu";

export type ComboItem = { id: string; label: string };

type ComboFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  items: ComboItem[];
  /** The chosen or typed text, e.g. "ผักคะน้า". */
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Let farmers type something that isn't in the list (a plant or unit we didn't think of). */
  allowsCustomValue?: boolean;
  placeholder?: string;
};

/** Type to search a list, or tap the arrow to see it all. */
export function ComboField({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  items,
  value,
  onChange,
  onBlur,
  allowsCustomValue,
  placeholder = "พิมพ์เพื่อค้นหา หรือแตะลูกศร",
}: ComboFieldProps) {
  const [inputValue, setInputValue] = useState(value ?? "");
  // Follow outside changes (prefilled data arriving after the first render).
  useEffect(() => setInputValue(value ?? ""), [value]);
  const selected = items.find((item) => item.label === value);

  return (
    <ComboBox
      id={id}
      className={`group flex min-w-0 flex-col gap-1.5 ${className}`}
      defaultItems={items}
      inputValue={inputValue}
      selectedKey={selected?.id ?? null}
      allowsCustomValue={allowsCustomValue}
      menuTrigger="input"
      isInvalid={!!error}
      onInputChange={(text) => {
        setInputValue(text);
        if (allowsCustomValue) onChange(text);
      }}
      onSelectionChange={(key) => {
        const item = items.find((candidate) => candidate.id === key);
        if (item) {
          setInputValue(item.label);
          onChange(item.label);
        }
      }}
      onBlur={onBlur}
    >
      <Label className="label">
        {label}
        {optional && <span className="font-normal text-super-main-color/70"> (ถ้ามี)</span>}
      </Label>
      {hint && (
        <Text slot="description" className="hint">
          {hint}
        </Text>
      )}
      <div className="relative">
        <Input className="input pr-14" placeholder={placeholder} />
        <Button
          aria-label="แสดงรายการทั้งหมด"
          className="absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-lg text-super-main-color hover:bg-third-color/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-main-color"
        >
          <LuChevronDown aria-hidden="true" className="size-6" />
        </Button>
      </div>
      {error && (
        <Text slot="errorMessage" className="field-error">
          <LuAlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <span>{error}</span>
        </Text>
      )}
      <Popover
        offset={6}
        className="w-[--trigger-width] overflow-hidden rounded-xl border border-third-color/50 bg-white shadow-lg shadow-super-main-color/10 rac-entering:animate-in rac-entering:fade-in rac-exiting:animate-out rac-exiting:fade-out"
      >
        <ListBox
          className="max-h-72 overflow-auto p-1 outline-none"
          renderEmptyState={() => (
            <p className="px-4 py-3 text-base text-super-main-color/75">
              {allowsCustomValue ? "ไม่มีในรายการ ใช้คำที่พิมพ์ได้เลย" : "ไม่พบรายการ ลองพิมพ์คำอื่น"}
            </p>
          )}
        >
          {(item: ComboItem) => (
            <ListBoxItem
              id={item.id}
              textValue={item.label}
              className="flex min-h-12 cursor-pointer items-center justify-between gap-2 rounded-lg px-4 text-lg text-super-main-color outline-none rac-focused:bg-third-color/20 rac-selected:font-semibold"
            >
              {({ isSelected }) => (
                <>
                  <span className="truncate">{item.label}</span>
                  {isSelected && <LuCheck aria-hidden="true" className="size-5 shrink-0 text-main-color" />}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}
