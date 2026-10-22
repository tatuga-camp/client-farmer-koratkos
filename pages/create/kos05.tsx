import Head from "next/head";
import React from "react";
import HarvestLogForm from "../../components/docKos/kos5/harvestLogForm";
import { GuideBox, KosPageHeader } from "../../components/ui";
import { kosGuide } from "../../data/kosGuides";
import DashboardLayout from "../../layouts/dashboardLayout";

const guide = kosGuide("kos5");

/** Starts KOS-05 with its first record; the document itself is created on save. */
function CreateKos05() {
  return (
    <DashboardLayout>
      <Head>
        <title>{`${guide.code} ${guide.name} | Korat KOS`}</title>
      </Head>
      <KosPageHeader code={guide.code} title={guide.name} description={guide.summary} />
      <GuideBox title="สิ่งที่ต้องเตรียม" items={guide.prepare} />
      <HarvestLogForm />
    </DashboardLayout>
  );
}

export default CreateKos05;
