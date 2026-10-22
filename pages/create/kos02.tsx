import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Kos2Form, { kos02Steps } from "../../components/docKos/kos2/form/kos2Form";
import { FormStepper, GuideBox, KosPageHeader, Skeleton } from "../../components/ui";
import { kosGuide } from "../../data/kosGuides";
import DashboardLayout from "../../layouts/dashboardLayout";
import { GetDocKos02Service } from "../../services/kos2";

/** KOS-02 part 1, the farm map. Crop plans are added on /kos02/[id] once the map is saved. */
function CreateKos02() {
  const router = useRouter();
  const guide = kosGuide("kos2");
  // The server answers 404 until the farmer has saved a map.
  const docKos02 = useQuery({
    queryKey: ["docKos02"],
    queryFn: () => GetDocKos02Service(),
    retry: false,
  });
  const existingId = docKos02.data?.id;

  // A farmer has one KOS-02: if it is already saved, open it instead of starting a second.
  useEffect(() => {
    if (existingId) router.replace(guide.viewHref(existingId));
  }, [existingId, guide, router]);

  return (
    <DashboardLayout>
      <Head>
        <title>KOS-02 ผังแปลงและแผนการปลูก | Korat KOS</title>
      </Head>
      <KosPageHeader code={guide.code} title={guide.name} description={guide.summary} />
      <FormStepper steps={kos02Steps} current={0} />
      <GuideBox title="สิ่งที่ต้องเตรียม" items={guide.prepare} />
      {docKos02.isLoading || existingId ? <Skeleton className="h-96 w-full" /> : <Kos2Form />}
    </DashboardLayout>
  );
}

export default CreateKos02;
