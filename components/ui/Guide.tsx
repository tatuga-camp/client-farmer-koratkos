import React, { ReactNode } from "react";
import { LuChevronDown, LuLightbulb } from "react-icons/lu";

type GuideBoxProps = {
  title: ReactNode;
  /** Short bullet points; keep each to one idea. */
  items?: ReactNode[];
  children?: ReactNode;
  className?: string;
};

/** Warm tip panel: "what to prepare" before a form, or advice inside a step. */
export function GuideBox({ title, items, children, className = "" }: GuideBoxProps) {
  return (
    <aside className={`flex gap-3 rounded-2xl border border-third-color/60 bg-third-color/10 p-4 sm:p-5 ${className}`}>
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-third-color/25 text-super-main-color">
        <LuLightbulb className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-lg font-bold leading-snug">{title}</p>
        {items && items.length > 0 && (
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-base leading-relaxed marker:text-third-color">
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
        {children && <div className="text-base leading-relaxed">{children}</div>}
      </div>
    </aside>
  );
}

/** Collapsed "ดูตัวอย่างการกรอก" panel for a filled-in example. */
export function ExampleDetails({ title = "ดูตัวอย่างการกรอก", children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-secondary-color/30 bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 text-base font-semibold text-secondary-color [&::-webkit-details-marker]:hidden">
        {title}
        <LuChevronDown aria-hidden="true" className="size-5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-secondary-color/20 px-4 py-3 text-base leading-relaxed">{children}</div>
    </details>
  );
}
