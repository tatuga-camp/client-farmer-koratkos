import React, { ReactNode } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";

export type RecordDetail = {
  label: string;
  value: ReactNode;
  /** Spans the whole card, for longer text such as where the harvest was sold. */
  wide?: boolean;
};

type RecordCardProps = {
  title: ReactNode;
  /** Small chip above the title, e.g. "แปลงที่ 2". */
  badge?: ReactNode;
  details: RecordDetail[];
  /** Read after "แก้ไข" / "ลบ" by screen readers, so each button names its record. */
  recordName: string;
  onEdit: () => void;
  onDelete: () => void;
};

/** One logbook entry: labelled values plus "แก้ไข" and "ลบ" buttons with text. */
function RecordCard({ title, badge, details, recordName, onEdit, onDelete }: RecordCardProps) {
  return (
    <article className="card flex w-full flex-col gap-4 p-4 sm:p-5">
      <header className="flex flex-col gap-1.5">
        {badge && (
          <span className="w-fit rounded-full bg-third-color/20 px-3 py-0.5 text-base font-semibold text-super-main-color">
            {badge}
          </span>
        )}
        <h3 className="break-words text-xl font-bold leading-snug">{title}</h3>
      </header>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {details.map((detail) => (
          <div key={detail.label} className={`flex min-w-0 flex-col gap-0.5 ${detail.wide ? "col-span-2" : ""}`}>
            <dt className="text-base text-super-main-color/70">{detail.label}</dt>
            <dd className="whitespace-pre-line break-words text-lg font-semibold leading-snug">{detail.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex gap-2 border-t border-third-color/30 pt-4 sm:justify-end [&>*]:flex-1 sm:[&>*]:flex-none">
        <button type="button" onClick={onEdit} className="btn btn-secondary btn-sm">
          <LuPencil aria-hidden="true" className="size-5" />
          แก้ไข
          <span className="sr-only"> {recordName}</span>
        </button>
        <button type="button" onClick={onDelete} className="btn btn-danger-soft btn-sm">
          <LuTrash2 aria-hidden="true" className="size-5" />
          ลบ
          <span className="sr-only"> {recordName}</span>
        </button>
      </div>
    </article>
  );
}

export default RecordCard;
