import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Image from "next/image";
import DocKosLists from "../components/docKos/docKosLists";
import StatusEvaluation from "../components/status/statusEvaluation";
import { GuideBox } from "../components/ui";
import { kosGuides } from "../data/kosGuides";
import DashboardLayout from "../layouts/dashboardLayout";
import { GetAllDocKosService } from "../services/farmer";
import { useFarmer } from "../utils/useFarmer";

function Overview() {
  const farmer = useFarmer();
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  const doneCount = kosGuides.filter((guide) => docKos.data?.[guide.key]).length;
  const percent = Math.round((doneCount / kosGuides.length) * 100);

  return (
    <>
      <section className="flex items-center gap-4">
        {farmer.data?.picture && (
          <span className="relative size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-third-color ring-offset-2 ring-offset-fourth-color sm:size-20">
            <Image src={farmer.data.picture} alt="" fill sizes="80px" className="object-cover" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
            สวัสดี คุณ{farmer.data?.firstName}
          </h1>
          <p className="text-lg text-super-main-color/80">
            กรอกเอกสาร 5 ฉบับให้ครบ แล้วส่งคำร้องขอรับการประเมิน
          </p>
        </div>
      </section>

      <section aria-labelledby="progress-title" className="card flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="progress-title" className="text-lg font-bold">
            ความคืบหน้า
          </h2>
          <p className="text-lg">
            บันทึกแล้ว <span className="text-2xl font-bold text-main-color">{doneCount}</span> จาก {kosGuides.length} ฉบับ
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={kosGuides.length}
          aria-valuenow={doneCount}
          aria-label="จำนวนเอกสารที่บันทึกแล้ว"
          className="h-3 overflow-hidden rounded-full bg-third-color/25"
        >
          <div className="h-full rounded-full bg-main-color transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </section>
    </>
  );
}

function HomePage() {
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  const doneCount = kosGuides.filter((guide) => docKos.data?.[guide.key]).length;

  return (
    <DashboardLayout>
      <Head>
        <title>หน้าหลัก | Korat KOS สำหรับเกษตรกร</title>
      </Head>
      <Overview />

      <section aria-labelledby="steps-title" className="flex flex-col gap-3">
        <h2 id="steps-title" className="text-xl font-bold">
          ขั้นตอนการขอรับรอง
        </h2>
        <DocKosLists docKos={docKos} />
        <ol start={6} className="flex flex-col">
          <StatusEvaluation step={6} doneCount={doneCount} />
        </ol>
      </section>

      <GuideBox
        title="วิธีใช้งาน"
        items={[
          "กรอกทีละฉบับตามลำดับ ปุ่มสีเขียวคือขั้นที่ควรทำต่อ",
          "บันทึกแล้วกลับมาแก้ไขได้ทุกเมื่อ ก่อนส่งคำร้อง",
          "KOS-03, 04 และ 05 เป็นสมุดบันทึก เพิ่มรายการใหม่ได้เรื่อย ๆ",
        ]}
      />
    </DashboardLayout>
  );
}

export default HomePage;
