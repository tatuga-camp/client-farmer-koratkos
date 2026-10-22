import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import ActivityForm from "../../components/docKos/kos3/activityForm";
import { GuideBox, KosPageHeader, Skeleton } from "../../components/ui";
import { kosGuide } from "../../data/kosGuides";
import DashboardLayout from "../../layouts/dashboardLayout";
import { GetAllDocKosService } from "../../services/farmer";

const guide = kosGuide("kos3");

/** Starts the KOS-03 logbook: saving the first activity also creates the document. */
function CreateKos03Page() {
  const router = useRouter();
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });

  return (
    <DashboardLayout>
      <Head>
        <title>KOS-03 บันทึกกิจกรรมในแปลง | Korat KOS</title>
      </Head>
      <KosPageHeader code={guide.code} title={guide.name} description={guide.summary} />
      <GuideBox title="สิ่งที่ต้องเตรียม" items={guide.prepare} />
      {docKos.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ActivityForm
          // Reuse the logbook if it already exists, so a second visit here doesn't try to create it again.
          docKos3Id={docKos.data?.kos3?.id}
          onSaved={({ docKos3Id }) => router.push(guide.viewHref(docKos3Id))}
        />
      )}
    </DashboardLayout>
  );
}

export default CreateKos03Page;
