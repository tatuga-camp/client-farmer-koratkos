import { UseQueryResult, useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import { FormStepper, GuideBox, KosPageHeader, Skeleton } from "../../ui";
import { kos01Steps } from "../../../data/kosGuides";
import { GetDocKos1Service, ResponseGetAllDocKos1Service } from "../../../services/kos1";

type Kos01EditPageProps = {
  /** Zero-based KOS-01 step. */
  step: number;
  tips?: string[];
  children: (docKos1: UseQueryResult<ResponseGetAllDocKos1Service, Error>) => ReactNode;
};

/** Shared frame for editing one step of a saved KOS-01: header, stepper, tips, then the form. */
function Kos01EditPage({ step, tips, children }: Kos01EditPageProps) {
  const router = useRouter();
  const docKos1 = useQuery({ queryKey: ["docKos1"], queryFn: () => GetDocKos1Service() });
  const kos01Id = router.query.kos01Id as string | undefined;

  return (
    <>
      <Head>
        <title>{`KOS-01 ${kos01Steps[step]} | Korat KOS`}</title>
      </Head>
      <KosPageHeader
        code="KOS-01"
        title={kos01Steps[step]}
        backHref={kos01Id ? `/kos01/${kos01Id}` : "/"}
        backLabel="กลับไปหน้าใบสมัคร"
      />
      <FormStepper steps={kos01Steps} current={step} />
      {tips && <GuideBox title="คำแนะนำ" items={tips} />}
      {docKos1.isLoading ? <Skeleton className="h-96 w-full" /> : children(docKos1)}
    </>
  );
}

export default Kos01EditPage;
