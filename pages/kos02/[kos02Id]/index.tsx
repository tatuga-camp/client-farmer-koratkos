import { useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import React, { ReactNode, useMemo, useState } from "react";
import { LuArrowRight, LuMap, LuPlus, LuRefreshCw, LuSprout, LuWifiOff } from "react-icons/lu";
import CardOrgCropProd from "../../../components/docKos/kos2/cardOrgCropProd";
import Kos2Form, { kos02Steps } from "../../../components/docKos/kos2/form/kos2Form";
import OrgCropProdForm from "../../../components/docKos/kos2/form/orgCropProdForm";
import MapDetail from "../../../components/docKos/kos2/mapDetail";
import { EmptyState, FormStepper, KosPageHeader, Skeleton } from "../../../components/ui";
import { kosGuide } from "../../../data/kosGuides";
import DashboardLayout from "../../../layouts/dashboardLayout";
import { OrgCropProdCalForKos2 } from "../../../model";
import { DeleteOrgCropProdCalForKos2Service, GetDocKos02Service } from "../../../services/kos2";
import { confirmDelete, showError, showSaved, showSaving } from "../../../utils/confirm";
import { formatThaiYear } from "../../../utils/format";

type Mode = { kind: "view" } | { kind: "editMap" } | { kind: "plan"; plan?: OrgCropProdCalForKos2 };

const statusOf = (error: unknown) => (error as { statusCode?: number } | null)?.statusCode;

/** Newest year first, then by plot number. */
const byYearThenPlot = (a: OrgCropProdCalForKos2, b: OrgCropProdCalForKos2) =>
  new Date(b.yearPlan).getFullYear() - new Date(a.yearPlan).getFullYear() || a.plotNumber - b.plotNumber;

/** KOS-02 overview: the saved farm map, and the crop plan of each plot. */
function Kos02Detail() {
  const guide = kosGuide("kos2");
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>({ kind: "view" });
  const docKos02 = useQuery({
    queryKey: ["docKos02"],
    queryFn: () => GetDocKos02Service(),
    retry: (count, error) => statusOf(error) !== 404 && count < 1,
  });
  const doc = docKos02.data;
  const plans = useMemo(() => [...(doc?.orgCropProdCalForKos2s ?? [])].sort(byYearThenPlot), [doc]);

  const switchTo = (next: Mode) => {
    setMode(next);
    window.scrollTo({ top: 0 });
  };
  const backToView = () => switchTo({ kind: "view" });

  const handleDelete = async (plan: OrgCropProdCalForKos2) => {
    const confirmed = await confirmDelete({
      title: `ลบแผนการปลูก${plan.plantType} แปลงที่ ${plan.plotNumber}?`,
      text: `แผนปี ${formatThaiYear(plan.yearPlan)} ลบแล้วจะกู้คืนไม่ได้`,
    });
    if (!confirmed) return;
    try {
      showSaving("กำลังลบแผนการปลูก");
      await DeleteOrgCropProdCalForKos2Service({ orgCropProdCalForKos2Id: plan.id });
      await queryClient.invalidateQueries({ queryKey: ["docKos02"] });
      showSaved("ลบแผนการปลูกแล้ว");
    } catch (error) {
      showError(error, "ลบไม่สำเร็จ");
    }
  };

  const addButton = (label: string, className = "btn-primary") => (
    <button type="button" className={`btn ${className}`} onClick={() => switchTo({ kind: "plan" })}>
      <LuPlus aria-hidden="true" className="size-5" />
      {label}
    </button>
  );

  let content: ReactNode;
  if (docKos02.isLoading) {
    content = (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  } else if (!doc) {
    content =
      statusOf(docKos02.error) === 404 ? (
        <EmptyState
          icon={<LuMap aria-hidden="true" />}
          title="ยังไม่มีผังแปลง"
          description="เริ่มจากบันทึกผังแปลงก่อน แล้วจึงเพิ่มแผนการปลูกของแต่ละแปลง"
          action={
            <Link href={guide.createHref} className="btn btn-primary">
              เริ่มกรอก KOS-02
              <LuArrowRight aria-hidden="true" className="size-5" />
            </Link>
          }
        />
      ) : (
        <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
          <LuWifiOff aria-hidden="true" className="size-10 text-third-color" />
          <h2 className="text-xl font-bold">โหลดข้อมูลไม่สำเร็จ</h2>
          <p className="hint">ตรวจสอบสัญญาณอินเทอร์เน็ต แล้วกดลองใหม่</p>
          <button type="button" onClick={() => docKos02.refetch()} className="btn btn-primary mt-2">
            <LuRefreshCw aria-hidden="true" className="size-5" />
            ลองใหม่
          </button>
        </div>
      );
  } else if (mode.kind === "editMap") {
    content = <Kos2Form saved={doc} onCancel={backToView} onSaved={backToView} />;
  } else if (mode.kind === "plan") {
    content = <OrgCropProdForm docKos02={doc} plan={mode.plan} onDone={backToView} />;
  } else {
    content = (
      <>
        {plans.length === 0 && <FormStepper steps={kos02Steps} current={1} />}
        <MapDetail doc={doc} onEdit={() => switchTo({ kind: "editMap" })} />

        <section aria-labelledby="kos2-plans-title" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="kos2-plans-title" className="text-xl font-bold sm:text-2xl">
              แผนการปลูกแต่ละแปลง
            </h2>
            <p className="hint">
              {plans.length > 0
                ? `มีแล้ว ${plans.length} รายการ เพิ่ม 1 รายการต่อพืช 1 ชนิดในแต่ละแปลง`
                : "บอกว่าแต่ละแปลงปลูกอะไร เดือนไหน และคาดว่าจะได้ผลผลิตเท่าไร"}
            </p>
          </div>
          {plans.length === 0 ? (
            <EmptyState
              icon={<LuSprout aria-hidden="true" />}
              title="ยังไม่มีแผนการปลูก"
              description="ขั้นต่อไป: เพิ่มแผนการปลูกของแต่ละแปลง เช่น แปลงที่ 1 ปลูกผักคะน้า เดือน ม.ค. ถึง มี.ค."
              action={addButton("เพิ่มแผนการปลูกแปลงแรก")}
            />
          ) : (
            <>
              <ul className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                  <CardOrgCropProd
                    key={plan.id}
                    plan={plan}
                    onEdit={() => switchTo({ kind: "plan", plan })}
                    onDelete={() => handleDelete(plan)}
                  />
                ))}
              </ul>
              <div className="flex flex-col sm:items-start">{addButton("เพิ่มแผนการปลูกอีก", "btn-secondary")}</div>
            </>
          )}
        </section>
      </>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>KOS-02 ผังแปลงและแผนการปลูก | Korat KOS</title>
      </Head>
      <KosPageHeader
        code={guide.code}
        title={guide.name}
        description={guide.summary}
        action={doc && mode.kind === "view" ? addButton("เพิ่มแผนการปลูก") : undefined}
      />
      {content}
    </DashboardLayout>
  );
}

export default Kos02Detail;
