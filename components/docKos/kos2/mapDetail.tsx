import Image from "next/image";
import React from "react";
import { LuAlertCircle, LuPencil } from "react-icons/lu";
import { ResponseGetDocKos02Service } from "../../../services/kos2";

type MapDetailProps = {
  doc: ResponseGetDocKos02Service;
  onEdit: () => void;
};

/** What the farmer saved in KOS-02 part 1, with one button to change it. */
function MapDetail({ doc, onEdit }: MapDetailProps) {
  return (
    <section aria-labelledby="kos2-map-title" className="card flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-third-color/30 pb-4">
        <h2 id="kos2-map-title" className="text-xl font-bold sm:text-2xl">
          ผังแปลง
        </h2>
        <button type="button" onClick={onEdit} className="btn btn-secondary btn-sm">
          <LuPencil aria-hidden="true" className="size-5" />
          แก้ไขผังแปลง
        </button>
      </div>

      <dl className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <dt className="text-base text-super-main-color/70">หมายเลขแปลงที่ขอรับรอง</dt>
          <dd className="text-lg font-semibold">{doc.numberOfPlotForKosCertificated}</dd>
        </div>

        <div className="flex flex-col gap-2">
          <dt className="text-base text-super-main-color/70">รูปผังแปลง ({doc.files.length} รูป)</dt>
          <dd>
            {doc.files.length === 0 ? (
              <p className="flex items-start gap-2 rounded-xl border border-red-600/40 bg-red-50 p-3 text-base font-medium text-red-800">
                <LuAlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                ยังไม่มีรูปผังแปลง กด “แก้ไขผังแปลง” แล้วเพิ่มรูปอย่างน้อย 1 รูป
              </p>
            ) : (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                {doc.files.map((file, index) => (
                  <li key={file.id}>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`ดูรูปผังแปลงรูปที่ ${index + 1} ขนาดเต็ม`}
                      className="relative block aspect-[4/3] overflow-hidden rounded-xl border border-third-color/50 bg-fourth-color focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-main-color"
                    >
                      <Image src={file.url} alt="" fill sizes="(max-width: 640px) 33vw, 200px" className="object-cover" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-base text-super-main-color/70">การจัดการหลังเก็บเกี่ยวและการตลาด</dt>
          <dd className={`whitespace-pre-line text-lg ${doc.marketingDetail ? "" : "text-super-main-color/60"}`}>
            {doc.marketingDetail || "ยังไม่ได้กรอก (ไม่บังคับ)"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default MapDetail;
