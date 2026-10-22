import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LuClipboardList, LuPlus, LuRefreshCw } from "react-icons/lu";
import ActivityForm, { ActivityWithFiles } from "../../../components/docKos/kos3/activityForm";
import CardActivity from "../../../components/docKos/kos3/cardActivity";
import { LogPagination } from "../../../components/docKos/logList";
import { EmptyState, GuideBox, KosPageHeader, Skeleton } from "../../../components/ui";
import { kosGuide } from "../../../data/kosGuides";
import DashboardLayout from "../../../layouts/dashboardLayout";
import { GetAllDocKosService } from "../../../services/farmer";
import {
  GetActivityKos3ByPageService,
  ResponseGetActivityKos3ByPageService,
} from "../../../services/kos3";

const PAGE_SIZE = 10;
const guide = kosGuide("kos3");

type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; activity: ActivityWithFiles };

function Kos03Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>({ mode: "list" });

  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  const docKos3Id = docKos.data?.kos3?.id;

  const activitiesKey = ["activities", docKos3Id, page];
  const activities = useQuery({
    queryKey: activitiesKey,
    queryFn: () =>
      GetActivityKos3ByPageService({
        limit: PAGE_SIZE,
        page,
        docKos3Id: docKos3Id as string,
      }),
    enabled: !!docKos3Id,
    placeholderData: keepPreviousData,
  });
  const rows = activities.data?.data;
  const lastPage = Math.max(1, activities.data?.meta.lastPage ?? 1);

  // After deleting the last record on a page the server returns an empty page: step back.
  useEffect(() => {
    if (page > 1 && rows?.length === 0 && !activities.isPlaceholderData) {
      setPage((current) => Math.max(1, current - 1));
    }
  }, [page, rows, activities.isPlaceholderData]);

  const show = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const handleSaved = ({ created }: { created: boolean }) => {
    // New records are added at the end of the list, so show the last page.
    if (created) {
      const fresh = queryClient.getQueryData<ResponseGetActivityKos3ByPageService>(activitiesKey);
      if (fresh) setPage(Math.max(1, fresh.meta.lastPage));
    }
    show({ mode: "list" });
  };

  // Logbook order: oldest work first within the page, like the paper form.
  const sorted = [...(rows ?? [])].sort(
    (a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime() || a.plotNumber - b.plotNumber,
  );
  const isEmpty = !!docKos3Id && !!rows && rows.length === 0 && page === 1;
  const fewRecords = lastPage === 1 && sorted.length < 3;
  const tips = <GuideBox title="คำแนะนำ" items={guide.tips} />;

  const addButton = (
    <button type="button" onClick={() => show({ mode: "create" })} className="btn btn-primary w-full sm:w-auto">
      <LuPlus aria-hidden="true" className="size-5" />
      เพิ่มบันทึกกิจกรรม
    </button>
  );

  const renderList = () => {
    if (docKos.isLoading || (docKos3Id && activities.isLoading)) {
      return (
        <div aria-busy="true" className="flex flex-col gap-4">
          <p className="sr-only" role="status">
            กำลังโหลดรายการ
          </p>
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      );
    }
    if (docKos.isError || activities.isError) {
      return (
        <div className="card flex flex-col items-center gap-3 px-5 py-10 text-center">
          <p className="text-xl font-bold">โหลดรายการไม่สำเร็จ</p>
          <p className="hint">ตรวจสอบสัญญาณอินเทอร์เน็ต แล้วกดลองใหม่</p>
          <button
            type="button"
            onClick={() => (docKos.isError ? docKos.refetch() : activities.refetch())}
            className="btn btn-primary mt-2"
          >
            <LuRefreshCw aria-hidden="true" className="size-5" />
            ลองใหม่
          </button>
        </div>
      );
    }
    if (!docKos3Id) {
      return (
        <>
          <EmptyState
            icon={<LuClipboardList aria-hidden="true" />}
            title="ยังไม่ได้เริ่มสมุดบันทึกกิจกรรม"
            description={guide.summary}
            action={
              <Link href={guide.createHref} className="btn btn-primary">
                <LuPlus aria-hidden="true" className="size-5" />
                เริ่มบันทึกกิจกรรม
              </Link>
            }
          />
          <GuideBox title="สิ่งที่ต้องเตรียม" items={guide.prepare} />
        </>
      );
    }
    if (isEmpty) {
      return (
        <>
          <EmptyState
            icon={<LuClipboardList aria-hidden="true" />}
            title="ยังไม่มีบันทึกกิจกรรม"
            description="จดงานที่ทำในแปลงแต่ละครั้ง เช่น เตรียมดิน ปลูก ใส่ปุ๋ย กำจัดวัชพืช"
            action={addButton}
          />
          <GuideBox title="สิ่งที่ต้องเตรียม" items={guide.prepare} />
        </>
      );
    }
    return (
      <>
        {fewRecords && tips}
        <ul
          aria-busy={activities.isPlaceholderData}
          className={`grid gap-4 transition-opacity lg:grid-cols-2 ${activities.isPlaceholderData ? "opacity-60" : ""}`}
        >
          {sorted.map((activity) => (
            <CardActivity key={activity.id} activity={activity} onEdit={(selected) => show({ mode: "edit", activity: selected })} />
          ))}
        </ul>
        {/* Scrolls to the top itself; hidden when there is only one page. */}
        <LogPagination page={page} lastPage={lastPage} onChange={setPage} />
        {!fewRecords && tips}
      </>
    );
  };

  return (
    <DashboardLayout>
      <Head>
        <title>KOS-03 บันทึกกิจกรรมในแปลง | Korat KOS</title>
      </Head>
      <KosPageHeader
        code={guide.code}
        title={guide.name}
        description={guide.summary}
        action={view.mode === "list" && docKos3Id ? addButton : undefined}
      />
      {view.mode === "list" ? (
        renderList()
      ) : (
        <ActivityForm
          key={view.mode === "edit" ? view.activity.id : "new"}
          docKos3Id={docKos3Id}
          activity={view.mode === "edit" ? view.activity : undefined}
          onSaved={handleSaved}
          onCancel={() => show({ mode: "list" })}
        />
      )}
    </DashboardLayout>
  );
}

export default Kos03Page;
