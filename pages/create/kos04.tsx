import Head from "next/head";
import React from "react";
import FactorForm from "../../components/docKos/kos4/factorForm";
import { GuideBox, KosPageHeader } from "../../components/ui";
import { kosGuide } from "../../data/kosGuides";
import DashboardLayout from "../../layouts/dashboardLayout";

const guide = kosGuide("kos4");

/** Starts KOS-04 with its first record; the document itself is created on save. */
function CreateKos04() {
  return (
    <DashboardLayout>
      <Head>
        <title>{`${guide.code} ${guide.name} | Korat KOS`}</title>
      </Head>
      <KosPageHeader code={guide.code} title={guide.name} description={guide.summary} />
      <GuideBox title="สิ่งที่ต้องเตรียม" items={guide.prepare} />
      <FactorForm />
    </DashboardLayout>
  );
}

export default CreateKos04;
