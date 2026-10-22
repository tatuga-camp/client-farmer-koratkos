import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";
import { LuArrowRight, LuCheck, LuPencil } from "react-icons/lu";
import { KosPageHeader, Skeleton } from "../../../components/ui";
import { kos01Steps, kosGuide } from "../../../data/kosGuides";
import DashboardLayout from "../../../layouts/dashboardLayout";
import { GetDocKos1Service } from "../../../services/kos1";
import { formatArea, formatThaiDate } from "../../../utils/format";

type StepCardProps = {
  number: number;
  done: boolean;
  editHref: string;
  /** Label for the button when the step is not done yet. */
  todoLabel?: string;
  children?: ReactNode;
};

function StepCard({ number, done, editHref, todoLabel = "กรอกต่อ", children }: StepCardProps) {
  return (
    <li className="card flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
            done ? "bg-main-color text-white" : "border-2 border-third-color/70 text-super-main-color/70"
          }`}
        >
          {done ? <LuCheck className="size-5" strokeWidth={3} /> : number}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm text-super-main-color/70">ขั้นที่ {number}</p>
          <h2 className="text-xl font-bold leading-snug">{kos01Steps[number - 1]}</h2>
          {!done && <p className="hint">ยังไม่ได้กรอก</p>}
        </div>
        <Link href={editHref} className={`btn btn-sm shrink-0 ${done ? "btn-secondary" : "btn-primary"}`}>
          {done ? (
            <>
              <LuPencil aria-hidden="true" className="size-5" />
              แก้ไข
            </>
          ) : (
            <>
              {todoLabel}
              <LuArrowRight aria-hidden="true" className="size-5" />
            </>
          )}
          <span className="sr-only">{kos01Steps[number - 1]}</span>
        </Link>
      </div>
      {done && children}
    </li>
  );
}

function Detail({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-base text-super-main-color/70">{label}</dt>
      <dd className="break-words text-lg font-semibold">{children}</dd>
    </div>
  );
}

const fullAddress = (parts: { address?: string; villageNumber?: string; subdistrict?: string; district?: string; province?: string }) =>
  [parts.address, parts.villageNumber && `หมู่ ${parts.villageNumber}`, parts.subdistrict && `ต.${parts.subdistrict}`, parts.district && `อ.${parts.district}`, parts.province && `จ.${parts.province}`]
    .filter(Boolean)
    .join(" ");

/** KOS-01 overview: what has been filled in each of the four steps, with edit links. */
function Kos01Overview() {
  const guide = kosGuide("kos1");
  const docKos1 = useQuery({ queryKey: ["docKos1"], queryFn: () => GetDocKos1Service() });
  const doc = docKos1.data;
  const farm = doc?.farmKos1;
  const plants = doc?.plantKOS1s ?? [];

  return (
    <DashboardLayout>
      <Head>
        <title>KOS-01 ใบสมัคร | Korat KOS</title>
      </Head>
      <KosPageHeader code={guide.code} title="ใบสมัครขอรับการตรวจประเมิน" description="ตรวจข้อมูลที่กรอกไว้ กด “แก้ไข” ที่ขั้นที่ต้องการเปลี่ยน" />

      {docKos1.isLoading || !doc ? (
        <div className="flex flex-col gap-3">
          {kos01Steps.map((step) => (
            <Skeleton key={step} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          <StepCard number={1} done editHref={`/kos01/${doc.id}/basicInformation`}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="ที่อยู่" wide>
                {fullAddress(doc)}
              </Detail>
            </dl>
          </StepCard>

          <StepCard number={2} done={!!farm} editHref={farm ? `/kos01/${doc.id}/farmFieldInformation` : "/create/kos01?step=farmFieldInformation"}>
            {farm && (
              <div className="flex flex-col gap-4 sm:flex-row">
                {farm.mapHybrid && (
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-third-color/50 sm:aspect-square sm:w-40">
                    <Image src={farm.mapHybrid} alt="ภาพดาวเทียมของแปลง" fill sizes="(max-width: 640px) 100vw, 160px" className="object-cover" />
                  </div>
                )}
                <dl className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Detail label="ที่อยู่แปลง" wide>
                    {fullAddress(farm)}
                  </Detail>
                  <Detail label="พิกัด">
                    <span className="tabular-nums">
                      {farm.latitude}, {farm.longitude}
                    </span>
                  </Detail>
                  <Detail label="วันที่ยื่นขอการรับรอง">{formatThaiDate(farm.certRequestDate)}</Detail>
                </dl>
              </div>
            )}
          </StepCard>

          <StepCard number={3} done={!!farm} editHref={farm ? `/kos01/${doc.id}/productionProcess` : "/create/kos01?step=farmFieldInformation"}>
            {farm && (
              <dl className="grid gap-3 sm:grid-cols-2">
                <Detail label="การผลิต">{farm.productionProcess?.join(", ") || "-"}</Detail>
                <Detail label="วิธีแยกการผลิต">{farm.productionMethod || "-"}</Detail>
                <Detail label="พื้นที่ทั้งหมด">
                  {farm.plotsTotal ?? 0} แปลง, {formatArea(farm.raiTotal, farm.nganTotal)}
                </Detail>
                <Detail label="ขอรับรอง">
                  {farm.certicatedPlotTotal ?? 0} แปลง, {formatArea(farm.certicatedRaiTotal, farm.certicatedNganTotal)}
                </Detail>
              </dl>
            )}
          </StepCard>

          <StepCard
            number={4}
            done={plants.length > 0}
            editHref={farm ? `/kos01/${doc.id}/plantKos1` : "/create/kos01?step=farmFieldInformation"}
            todoLabel={farm ? "เพิ่มพืช" : "กรอกต่อ"}
          >
            <p className="text-lg">
              <span className="font-semibold">{plants.length} ชนิด:</span> {plants.map((plant) => plant.plant).join(", ")}
            </p>
          </StepCard>
        </ol>
      )}
    </DashboardLayout>
  );
}

export default Kos01Overview;
