import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { LuPlus, LuWheat } from "react-icons/lu";
import { LOG_PAGE_SIZE, LogList, fetchLogPage } from "../../../components/docKos/logList";
import CardHarvestLog from "../../../components/docKos/kos5/cardHarvestLog";
import HarvestLogForm from "../../../components/docKos/kos5/harvestLogForm";
import { EmptyState, GuideBox, KosPageHeader } from "../../../components/ui";
import { kosGuide } from "../../../data/kosGuides";
import DashboardLayout from "../../../layouts/dashboardLayout";
import { HarvestLogDocKos5, Pagination } from "../../../model";
import { GetHarvestLogKos5ByPageService } from "../../../services/kos5";

const guide = kosGuide("kos5");

type Mode = { kind: "list" } | { kind: "add" } | { kind: "edit"; harvestLog: HarvestLogDocKos5 };

function Kos05Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const kos05Id = typeof router.query.kos05Id === "string" ? router.query.kos05Id : undefined;
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<Mode>({ kind: "list" });

  const harvestLogs = useQuery({
    queryKey: ["harvestLog", kos05Id, page],
    queryFn: () =>
      fetchLogPage(page, () => GetHarvestLogKos5ByPageService({ dockKos5Id: kos05Id as string, page, limit: LOG_PAGE_SIZE })),
    enabled: !!kos05Id,
    placeholderData: keepPreviousData,
  });

  const switchTo = (next: Mode) => {
    setMode(next);
    window.scrollTo({ top: 0 });
  };

  // New records are added at the end, so show the last page where the farmer can see it.
  const handleSaved = (result: "added" | "updated") => {
    if (result === "added") {
      const lastPage = queryClient.getQueryData<Pagination<HarvestLogDocKos5>>(["harvestLog", kos05Id, page])?.meta.lastPage;
      if (lastPage) setPage(lastPage);
    }
    switchTo({ kind: "list" });
  };

  const addButton = (
    <button type="button" onClick={() => switchTo({ kind: "add" })} className="btn btn-primary w-full sm:w-auto">
      <LuPlus aria-hidden="true" className="size-5" />
      เพิ่มบันทึกการเก็บเกี่ยว
    </button>
  );

  return (
    <DashboardLayout>
      <Head>
        <title>{`${guide.code} ${guide.name} | Korat KOS`}</title>
      </Head>
      <KosPageHeader
        code={guide.code}
        title={guide.name}
        description={guide.summary}
        action={mode.kind === "list" ? addButton : undefined}
      />
      {mode.kind === "list" ? (
        <>
          <GuideBox title="คำแนะนำ" items={guide.tips} />
          <LogList
            query={harvestLogs}
            page={page}
            onPageChange={setPage}
            label="รายการเก็บเกี่ยว"
            renderItem={(harvestLog) => (
              <CardHarvestLog harvestLog={harvestLog} onEdit={(selected) => switchTo({ kind: "edit", harvestLog: selected })} />
            )}
            empty={
              <EmptyState
                icon={<LuWheat aria-hidden="true" />}
                title="ยังไม่มีบันทึกการเก็บเกี่ยว"
                description="จดทุกครั้งที่เก็บผลผลิต ว่าเก็บพืชอะไร จากแปลงไหน ได้เท่าไร และนำไปขายที่ไหน"
                action={addButton}
              />
            }
          />
        </>
      ) : (
        <HarvestLogForm
          key={mode.kind === "edit" ? mode.harvestLog.id : "add"}
          docKos05Id={kos05Id}
          harvestLog={mode.kind === "edit" ? mode.harvestLog : undefined}
          onSaved={handleSaved}
          onCancel={() => switchTo({ kind: "list" })}
        />
      )}
    </DashboardLayout>
  );
}

export default Kos05Page;
