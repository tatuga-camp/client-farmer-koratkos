import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import BasicInformation from "../../components/docKos/kos1/forms/basicInformation";
import FarmFieldInformation from "../../components/docKos/kos1/forms/farmFieldInformation";
import ProductionInformation from "../../components/docKos/kos1/forms/productionInformation";
import { FormStepper, GuideBox, KosPageHeader, Skeleton } from "../../components/ui";
import { kos01Steps, kosGuide } from "../../data/kosGuides";
import DashboardLayout from "../../layouts/dashboardLayout";
import { GetDocKos1Service } from "../../services/kos1";

export type Step =
  | "basicInformation"
  | "farmFieldInformation"
  | "productionInformation"
  | "plantKos1"
  | undefined;

const stepIndex: Record<string, number> = {
  basicInformation: 0,
  farmFieldInformation: 1,
  productionInformation: 2,
};

const stepTips: Record<number, string[]> = {
  1: [
    "ถ้าตอนนี้อยู่ที่แปลง กด “ใช้ตำแหน่งปัจจุบัน” ระบบจะใส่พิกัดให้เอง",
    "จากนั้นกด “ดูแผนที่แปลง” แล้วตรวจว่าหมุดอยู่ตรงแปลงของคุณ",
  ],
  2: [
    "1 ไร่ = 4 งาน ถ้ามีเศษน้อยกว่า 1 งาน ให้ปัดเป็นงานที่ใกล้ที่สุด",
    "พื้นที่ที่ขอรับรองต้องไม่มากกว่าพื้นที่ทั้งหมด",
  ],
};

/** KOS-01 application, steps 1–3 (step 4, plants, lives on /kos01/[id]/plantKos1). */
function Kos1() {
  const router = useRouter();
  const guide = kosGuide("kos1");
  const step = (router.query.step as Step) ?? "basicInformation";
  const current = stepIndex[step as string] ?? 0;

  // Already-started applications prefill step 1 and update instead of creating twice.
  const docKos1 = useQuery({
    queryKey: ["docKos1"],
    queryFn: () => GetDocKos1Service(),
    retry: false,
  });

  return (
    <DashboardLayout>
      <Head>
        <title>KOS-01 ใบสมัคร | Korat KOS</title>
      </Head>
      <KosPageHeader code={guide.code} title="ใบสมัครขอรับการตรวจประเมิน" description={guide.summary} />
      <FormStepper steps={kos01Steps} current={current} />

      {current === 0 && <GuideBox title="สิ่งที่ต้องเตรียม" items={guide.prepare} />}
      {stepTips[current] && <GuideBox title="คำแนะนำ" items={stepTips[current]} />}

      {!router.isReady || docKos1.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : current === 0 ? (
        <BasicInformation docKos1={docKos1.data ? docKos1 : undefined} />
      ) : current === 1 ? (
        <FarmFieldInformation />
      ) : (
        <ProductionInformation />
      )}
    </DashboardLayout>
  );
}

export default Kos1;
