import React from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import { OrgCropProdCalForKos2 } from "../../../model";
import { formatNumber, formatThaiYear, thaiMonths, thaiMonthsShort } from "../../../utils/format";

type CardOrgCropProdProps = {
  plan: OrgCropProdCalForKos2;
  onEdit: () => void;
  onDelete: () => void;
};

/** One crop plan: plot, year, plant, area, months, expected yield and seed. */
function CardOrgCropProd({ plan, onEdit, onDelete }: CardOrgCropProdProps) {
  const months = Array.from(new Set(plan.rangeDate.map((iso) => new Date(iso).getMonth())))
    .filter((month) => !Number.isNaN(month))
    .sort((a, b) => a - b);
  const name = `${plan.plantType} แปลงที่ ${plan.plotNumber}`;

  return (
    <li className="card flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-super-main-color px-2.5 py-0.5 text-base font-bold text-white">
            แปลงที่ {plan.plotNumber}
          </span>
          <span className="text-base font-semibold text-super-main-color/80">{formatThaiYear(plan.yearPlan)}</span>
        </div>
        <h3 className="text-2xl font-bold leading-snug">{plan.plantType}</h3>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-base text-super-main-color/70">พื้นที่</dt>
          <dd className="text-lg font-semibold">{formatNumber(plan.landArea)} ไร่</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-base text-super-main-color/70">ผลผลิต</dt>
          <dd className="text-lg font-semibold">{formatNumber(plan.yieldPerRai)} กก./ไร่</dd>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <dt className="text-base text-super-main-color/70">เดือนที่ปลูก</dt>
          <dd>
            {months.length === 0 ? (
              <span className="text-lg">-</span>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {months.map((month) => (
                  <li key={month} className="rounded-lg bg-main-color/10 px-2.5 py-0.5 text-base font-semibold text-main-color">
                    <span aria-hidden="true">{thaiMonthsShort[month]}</span>
                    <span className="sr-only">{thaiMonths[month]}</span>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="text-base text-super-main-color/70">เมล็ด / ส่วนขยายพันธุ์</dt>
          <dd className="text-lg">{plan.seed}</dd>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="text-base text-super-main-color/70">แหล่งที่มา</dt>
          <dd className="text-lg">{plan.source}</dd>
        </div>
      </dl>

      <div className="mt-auto flex gap-2 border-t border-third-color/30 pt-3 [&>*]:flex-1 sm:[&>*]:flex-none">
        <button type="button" onClick={onEdit} className="btn btn-secondary btn-sm">
          <LuPencil aria-hidden="true" className="size-5" />
          แก้ไข<span className="sr-only"> {name}</span>
        </button>
        <button type="button" onClick={onDelete} className="btn btn-danger-soft btn-sm">
          <LuTrash2 aria-hidden="true" className="size-5" />
          ลบ<span className="sr-only"> {name}</span>
        </button>
      </div>
    </li>
  );
}

export default CardOrgCropProd;
