import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { LuPackage, LuPlus } from "react-icons/lu";
import { LOG_PAGE_SIZE, LogList, fetchLogPage } from "../../../components/docKos/logList";
import CardFactor from "../../../components/docKos/kos4/cardFactor";
import FactorForm from "../../../components/docKos/kos4/factorForm";
import { EmptyState, GuideBox, KosPageHeader } from "../../../components/ui";
import { kosGuide } from "../../../data/kosGuides";
import DashboardLayout from "../../../layouts/dashboardLayout";
import { FactoryKos4, Pagination } from "../../../model";
import { GetFactorKos04ByPageService } from "../../../services/kos4";

const guide = kosGuide("kos4");

type Mode = { kind: "list" } | { kind: "add" } | { kind: "edit"; factor: FactoryKos4 };

function Kos04Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const kos04Id = typeof router.query.kos04Id === "string" ? router.query.kos04Id : undefined;
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<Mode>({ kind: "list" });

  const factors = useQuery({
    queryKey: ["factor", kos04Id, page],
    queryFn: () =>
      fetchLogPage(page, () => GetFactorKos04ByPageService({ dockKos4Id: kos04Id as string, page, limit: LOG_PAGE_SIZE })),
    enabled: !!kos04Id,
    placeholderData: keepPreviousData,
  });

  const switchTo = (next: Mode) => {
    setMode(next);
    window.scrollTo({ top: 0 });
  };

  // New records are added at the end, so show the last page where the farmer can see it.
  const handleSaved = (result: "added" | "updated") => {
    if (result === "added") {
      const lastPage = queryClient.getQueryData<Pagination<FactoryKos4>>(["factor", kos04Id, page])?.meta.lastPage;
      if (lastPage) setPage(lastPage);
    }
    switchTo({ kind: "list" });
  };

  const addButton = (
    <button type="button" onClick={() => switchTo({ kind: "add" })} className="btn btn-primary w-full sm:w-auto">
      <LuPlus aria-hidden="true" className="size-5" />
      เพิ่มบันทึกปัจจัยการผลิต
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
            query={factors}
            page={page}
            onPageChange={setPage}
            label="รายการปัจจัยการผลิต"
            renderItem={(factor) => <CardFactor factor={factor} onEdit={(selected) => switchTo({ kind: "edit", factor: selected })} />}
            empty={
              <EmptyState
                icon={<LuPackage aria-hidden="true" />}
                title="ยังไม่มีบันทึกปัจจัยการผลิต"
                description="จดปุ๋ย เมล็ดพันธุ์ หรือวัสดุที่ซื้อหรือทำเองทุกครั้งที่นำมาใช้ในแปลง"
                action={addButton}
              />
            }
          />
        </>
      ) : (
        <FactorForm
          key={mode.kind === "edit" ? mode.factor.id : "add"}
          docKos04Id={kos04Id}
          factor={mode.kind === "edit" ? mode.factor : undefined}
          onSaved={handleSaved}
          onCancel={() => switchTo({ kind: "list" })}
        />
      )}
    </DashboardLayout>
  );
}

export default Kos04Page;
