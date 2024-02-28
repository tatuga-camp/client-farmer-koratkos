import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import {
  GetAllDocKosService,
  GetFarmerClientSideService,
  GetFarmerServerSideService,
} from "../services/farmer";
import { Farmer } from "../model";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../layouts/dashboardLayout";
import Image from "next/image";
import StatusEvaluation from "../components/status/statusEvaluation";
import DocKosLists from "../components/docKos/docKosLists";
import { use, useEffect, useState } from "react";
import EvaluationReport from "../components/status/evaluationReport";
import { GetFormEvaluatonsService } from "../services/evaluation";
import Head from "next/head";

function HomePage({ initialFarmer }: { initialFarmer: Farmer }) {
  const [triggerViewEvaluationReport, setTriggerViewEvaluationReport] =
    useState(false);
  const farmer = useQuery({
    queryKey: ["farmer"],
    queryFn: () => GetFarmerClientSideService(),
    initialData: initialFarmer,
  });
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });

  if (triggerViewEvaluationReport) {
    return (
      <DashboardLayout farmer={farmer.data}>
        <section className="mt-5 flex w-full justify-center">
          <EvaluationReport
            setTriggerViewEvaluationReport={setTriggerViewEvaluationReport}
          />
        </section>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout farmer={farmer.data}>
      <Head>
        <title>Korat KOS สำหรับเกษตรกร</title>
      </Head>
      <section className="mt-5 flex w-full justify-center">
        <StatusEvaluation
          setTriggerViewEvaluationReport={setTriggerViewEvaluationReport}
        />
      </section>

      <main className="flex w-full justify-center py-5">
        <DocKosLists docKos={docKos} />
      </main>
    </DashboardLayout>
  );
}

export default HomePage;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(ctx);
    const accessToken = cookies.access_token;
    if (accessToken) {
      const initialFarmer = await GetFarmerServerSideService({
        access_token: accessToken,
      });
      return {
        props: {
          initialFarmer,
        },
      };
    } else {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/sign-in",
        },
      };
    }
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
