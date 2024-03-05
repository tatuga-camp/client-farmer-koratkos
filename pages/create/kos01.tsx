import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/dashboardLayout";
import Head from "next/head";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetFarmerServerSideService } from "../../services/farmer";
import { Farmer } from "../../model";
import Image from "next/image";
import BasicInformation from "../../components/docKos/kos1/forms/basicInformation";
import { useRouter } from "next/router";
import FarmFieldInformation from "../../components/docKos/kos1/forms/farmFieldInformation";
import ProductionInformation from "../../components/docKos/kos1/forms/productionInformation";
import PlantKos1 from "../../components/docKos/kos1/forms/cardPlantKos1";
export type Step =
  | "basicInformation"
  | "farmFieldInformation"
  | "productionInformation"
  | "plantKos1"
  | undefined;
function Kos1({ farmer }: { farmer: Farmer }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basicInformation");
  useEffect(() => {
    if (router.isReady) {
      if (router.query.step === undefined) {
        router.push({
          pathname: "/create/kos01",
          query: { step: "basicInformation" },
        });
      }
      if (router.query.step) {
        setStep(() => router.query.step as Step);
      }
    }
  }, [router.isReady, router.query.step]);

  return (
    <DashboardLayout farmer={farmer}>
      <Head>
        <title>กรอกข้อมูล KOS-1</title>
      </Head>
      <div className="min-h-screen bg-fourth-color pb-10  pt-5 font-Anuphan">
        <header className="flex flex-col items-center justify-center gap-5">
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5">
            <h1 className="text-xl font-semibold text-white">(KOS-01) </h1>
            <h2 className="text-balance text-center text-lg font-normal text-white">
              ใบสมัครขอรับการตรวจ ประเมินมาตรฐานเกษตร อินทรีย์ขั้นพื้นฐาน
            </h2>
          </section>
        </header>
        <main className="mt-5">
          {step === "basicInformation" && <BasicInformation />}
          {step === "farmFieldInformation" && <FarmFieldInformation />}
          {step === "productionInformation" && (
            <ProductionInformation farmer={farmer} />
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Kos1;
export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(ctx);
    const accessToken = cookies.access_token;
    if (accessToken) {
      const farmer = await GetFarmerServerSideService({
        access_token: accessToken,
      });
      return {
        props: {
          farmer,
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
