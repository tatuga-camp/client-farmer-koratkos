import { UseQueryResult, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { LuArrowRight, LuCheck, LuPencil } from "react-icons/lu";
import { KosGuide, kosGuides } from "../../data/kosGuides";
import { ResponseGetAllDocKosService } from "../../services/farmer";
import { GetDocKos1Service } from "../../services/kos1";
import { Skeleton } from "../ui";

type DocKosListsProps = {
  docKos: UseQueryResult<ResponseGetAllDocKosService, Error>;
};

type ItemState = {
  guide: KosGuide;
  done: boolean;
  /** Started but not finished (only KOS-01 has several steps). */
  partialNote?: string;
  href: string;
};

/** KOS-01 counts as saved after its first step, so look inside it to tell the farmer what is left. */
function useKos01Progress(docKos: DocKosListsProps["docKos"]) {
  const kos1Id = docKos.data?.kos1?.id;
  const docKos1 = useQuery({
    queryKey: ["docKos1"],
    queryFn: () => GetDocKos1Service(),
    enabled: !!kos1Id,
  });
  if (!kos1Id || !docKos1.data) return undefined;
  if (!docKos1.data.farmKos1) {
    return { note: "ยังกรอกไม่ครบ ต่อที่ขั้นที่ 2 ที่ตั้งแปลง", href: "/create/kos01?step=farmFieldInformation" };
  }
  if (docKos1.data.plantKOS1s.length === 0) {
    return { note: "ยังไม่ได้เพิ่มชนิดพืช (ขั้นที่ 4)", href: `/kos01/${kos1Id}/plantKos1` };
  }
  return undefined;
}

/** Numbered checklist of the five documents, highlighting the one to do next. */
function DocKosLists({ docKos }: DocKosListsProps) {
  const kos01Progress = useKos01Progress(docKos);

  if (docKos.isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {kosGuides.map((guide) => (
          <Skeleton key={guide.key} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const items: ItemState[] = kosGuides.map((guide) => {
    const doc = docKos.data?.[guide.key];
    const partial = guide.key === "kos1" ? kos01Progress : undefined;
    return {
      guide,
      done: !!doc && !partial,
      partialNote: partial?.note,
      href: partial?.href ?? (doc?.id ? guide.viewHref(doc.id) : guide.createHref),
    };
  });
  const nextIndex = items.findIndex((item) => !item.done);

  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, index) => {
        const { guide, done, partialNote, href } = item;
        const isNext = index === nextIndex;
        const started = done || !!partialNote;
        return (
          <li
            key={guide.key}
            className={`card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5 ${isNext ? "border-2 border-main-color ring-4 ring-main-color/10" : ""}`}
          >
            <div className="flex min-w-0 flex-1 gap-4">
              <span
                aria-hidden="true"
                className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  done ? "bg-main-color text-white" : isNext ? "border-2 border-main-color text-main-color" : "border-2 border-third-color/70 text-super-main-color/70"
                }`}
              >
                {done ? <LuCheck className="size-6" strokeWidth={3} /> : index + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-base font-bold text-super-main-color/80">{guide.code}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                      done ? "bg-main-color/10 text-main-color" : partialNote ? "bg-third-color/25 text-super-main-color" : "bg-super-main-color/5 text-super-main-color/80"
                    }`}
                  >
                    {done ? "บันทึกแล้ว" : partialNote ? "ยังไม่ครบ" : "ยังไม่ได้กรอก"}
                  </span>
                  {isNext && <span className="text-sm font-semibold text-main-color">ทำขั้นนี้ต่อ</span>}
                </div>
                <h3 className="text-xl font-bold leading-snug">{guide.name}</h3>
                <p className="hint">{partialNote ?? guide.summary}</p>
              </div>
            </div>
            <Link href={href} className={`btn shrink-0 ${isNext ? "btn-primary" : "btn-secondary"} sm:min-w-40`}>
              {started ? (
                <>
                  {partialNote ? "กรอกต่อ" : "ดู / แก้ไข"}
                  {partialNote ? <LuArrowRight aria-hidden="true" className="size-5" /> : <LuPencil aria-hidden="true" className="size-5" />}
                </>
              ) : (
                <>
                  เริ่มกรอก
                  <LuArrowRight aria-hidden="true" className="size-5" />
                </>
              )}
              <span className="sr-only">{guide.code}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export default DocKosLists;
