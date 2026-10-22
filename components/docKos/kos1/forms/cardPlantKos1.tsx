import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";
import { LuCheckCircle2, LuPencil, LuPlus, LuSprout, LuTrash2 } from "react-icons/lu";
import { EmptyState, GuideBox, Skeleton } from "../../../ui";
import PlantKos1Form from "./plantKos1Form";
import { PlantKos1 } from "../../../../model";
import { DeletePlantKos1Service, ResponseGetAllDocKos1Service } from "../../../../services/kos1";
import { confirmDelete, showError, showSaved } from "../../../../utils/confirm";
import { formatNumber, formatThaiDate, formatThaiMonth } from "../../../../utils/format";

type CardPlantKos1Props = {
  docKos1: UseQueryResult<ResponseGetAllDocKos1Service, Error>;
};

type Mode = { kind: "list" } | { kind: "add" } | { kind: "edit"; plant: PlantKos1 };

/** KOS-01 step 4: the crops to certify, as cards with add / edit / delete. */
function CardPlantKos1({ docKos1 }: CardPlantKos1Props) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const farmKOS1Id = docKos1.data?.farmKos1?.id;
  const plants = docKos1.data?.plantKOS1s ?? [];

  const switchTo = (next: Mode) => {
    setMode(next);
    window.scrollTo({ top: 0 });
  };

  const handleDelete = async (plant: PlantKos1) => {
    const confirmed = await confirmDelete({ title: `ลบ${plant.plant}ออกจากใบสมัคร?` });
    if (!confirmed) return;
    try {
      await DeletePlantKos1Service({ plantKOS1Id: plant.id });
      await queryClient.invalidateQueries({ queryKey: ["docKos1"] });
      showSaved("ลบเรียบร้อย");
    } catch (error) {
      showError(error, "ลบไม่สำเร็จ");
    }
  };

  if (docKos1.isLoading) return <Skeleton className="h-64 w-full" />;

  if (!farmKOS1Id) {
    return (
      <EmptyState
        icon={<LuSprout />}
        title="ยังเพิ่มพืชไม่ได้"
        description="ต้องกรอกขั้นที่ 2 ที่ตั้งแปลง และขั้นที่ 3 การผลิตและพื้นที่ ให้ครบก่อน"
        action={
          <Link href="/create/kos01?step=farmFieldInformation" className="btn btn-primary">
            ไปกรอกขั้นที่ 2
          </Link>
        }
      />
    );
  }

  if (mode.kind !== "list") {
    return (
      <PlantKos1Form
        farmKOS1Id={farmKOS1Id}
        plant={mode.kind === "edit" ? mode.plant : undefined}
        onDone={() => switchTo({ kind: "list" })}
      />
    );
  }

  const addButton = (
    <button type="button" onClick={() => switchTo({ kind: "add" })} className="btn btn-primary">
      <LuPlus aria-hidden="true" className="size-5" />
      {plants.length === 0 ? "เพิ่มพืชชนิดแรก" : "เพิ่มชนิดพืช"}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      {plants.length === 0 ? (
        <EmptyState
          icon={<LuSprout />}
          title="ยังไม่มีพืชในใบสมัคร"
          description="เพิ่มพืชที่จะขอรับรองอย่างน้อย 1 ชนิด ใบสมัคร KOS-01 จึงจะครบ"
          action={addButton}
        />
      ) : (
        <>
          <GuideBox title="ใบสมัคร KOS-01 ครบแล้ว">
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-1.5">
                <LuCheckCircle2 aria-hidden="true" className="size-5 text-main-color" />
                มีพืช {plants.length} ชนิด ถ้ายังมีพืชอื่น กดเพิ่มได้อีก
              </p>
              <Link href="/" className="btn btn-secondary btn-sm w-full sm:w-fit">
                ไปกรอกเอกสารฉบับต่อไป
              </Link>
            </div>
          </GuideBox>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">พืชที่ขอรับรอง ({plants.length} ชนิด)</h2>
            {addButton}
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {plants.map((plant, index) => (
              <li key={plant.id} className="card flex flex-col gap-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-super-main-color/70">ชนิดที่ {index + 1}</p>
                    <h3 className="break-words text-2xl font-bold">{plant.plant}</h3>
                  </div>
                  <LuSprout aria-hidden="true" className="size-7 shrink-0 text-main-color" />
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-base">
                  <div>
                    <dt className="text-super-main-color/70">พื้นที่ปลูก</dt>
                    <dd className="text-lg font-semibold">{formatNumber(plant.raiTotal)} ไร่</dd>
                  </div>
                  <div>
                    <dt className="text-super-main-color/70">ปลูกปีละ</dt>
                    <dd className="text-lg font-semibold">{plant.annualProdCycles} รอบ</dd>
                  </div>
                  <div>
                    <dt className="text-super-main-color/70">ช่วงเดือนที่ปลูก</dt>
                    <dd className="text-lg font-semibold">
                      {formatThaiMonth(plant.seasonProd[0])} – {formatThaiMonth(plant.seasonProd[1])}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-super-main-color/70">ผลผลิตที่คาด</dt>
                    <dd className="text-lg font-semibold">{formatNumber(plant.expYieldAmt)} กก.</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-super-main-color/70">คาดว่าจะเก็บเกี่ยว</dt>
                    <dd className="text-lg font-semibold">{formatThaiDate(plant.expHarvestDate)}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex gap-2 border-t border-third-color/30 pt-4 [&>*]:flex-1">
                  <button type="button" onClick={() => switchTo({ kind: "edit", plant })} className="btn btn-secondary btn-sm">
                    <LuPencil aria-hidden="true" className="size-5" />
                    แก้ไข
                  </button>
                  <button type="button" onClick={() => handleDelete(plant)} className="btn btn-danger-soft btn-sm">
                    <LuTrash2 aria-hidden="true" className="size-5" />
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default CardPlantKos1;
