import Link from "next/link";
import React, { ReactNode } from "react";
import { LuAlertCircle, LuArrowLeft } from "react-icons/lu";

type KosPageHeaderProps = {
  /** "KOS-01" */
  code: string;
  title: ReactNode;
  /** One plain sentence: what this document is for. */
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Right side on wide screens, e.g. an "add" button. */
  action?: ReactNode;
};

export function KosPageHeader({ code, title, description, backHref = "/", backLabel = "กลับหน้าหลัก", action }: KosPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <Link href={backHref} className="btn btn-ghost btn-sm -ml-3 self-start">
        <LuArrowLeft aria-hidden="true" className="size-5" />
        {backLabel}
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="w-fit rounded-lg bg-super-main-color px-2.5 py-0.5 text-base font-bold tracking-wide text-white">{code}</span>
          <h1 className="text-balance text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>
          {description && <p className="max-w-2xl text-lg leading-relaxed text-super-main-color/80">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

/** White panel holding one form or section. */
export function FormCard({ title, description, children, className = "" }: { title?: ReactNode; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card flex flex-col gap-5 p-4 sm:p-6 ${className}`}>
      {(title || description) && (
        <div className="flex flex-col gap-1 border-b border-third-color/30 pb-4">
          {title && <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>}
          {description && <p className="hint">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Back / Next or Cancel / Save. Sticks to the bottom of the screen on phones so the
 * main button is always within thumb reach; sits under the form on desktop.
 */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-2 flex gap-3 border-t border-third-color/40 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none [&>*]:flex-1 sm:[&>*]:flex-none">
      {children}
    </div>
  );
}

/** Banner after a failed submit: how many fields need attention, each one a link to it. */
export function ErrorSummary({ errors, show }: { errors: Record<string, string | undefined>; show: boolean }) {
  const entries = Object.entries(errors).filter(([, message]) => message);
  if (!show || entries.length === 0) return null;
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border-2 border-red-600/60 bg-red-50 p-4">
      <LuAlertCircle aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-red-700" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-lg font-bold text-red-800">ยังมี {entries.length} ช่องที่ต้องแก้ไข</p>
        <ul className="flex flex-col gap-1 text-base">
          {entries.map(([field, message]) => (
            <li key={field}>
              <a
                href={`#${field}`}
                onClick={(event) => {
                  const target = document.getElementById(field);
                  if (!target) return;
                  event.preventDefault();
                  target.scrollIntoView({ behavior: "smooth", block: "center" });
                  target.focus({ preventScroll: true });
                }}
                className="text-red-800 underline underline-offset-2"
              >
                {message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 border-dashed px-5 py-10 text-center">
      {icon && <span className="flex size-14 items-center justify-center rounded-full bg-third-color/20 text-super-main-color [&>svg]:size-7">{icon}</span>}
      <p className="text-xl font-bold">{title}</p>
      {description && <p className="hint max-w-md">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-third-color/20 ${className}`} />;
}

/** "บันทึกแล้ว" / "ยังไม่ได้กรอก" pill. */
export function StatusPill({ done, doneText = "บันทึกแล้ว", todoText = "ยังไม่ได้กรอก" }: { done: boolean; doneText?: string; todoText?: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold ${
        done ? "bg-main-color/10 text-main-color" : "bg-third-color/20 text-super-main-color"
      }`}
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${done ? "bg-main-color" : "bg-third-color"}`} />
      {done ? doneText : todoText}
    </span>
  );
}
