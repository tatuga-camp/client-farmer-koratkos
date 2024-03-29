import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React from "react";
import { GetFarmerServerSideService } from "../../../services/farmer";
import DashboardLayout from "../../../layouts/dashboardLayout";
import { Farmer } from "../../../model";
import Head from "next/head";
import Image from "next/image";
import CardPlantKos1 from "../../../components/docKos/kos1/forms/cardPlantKos1";
import { useQuery } from "@tanstack/react-query";
import { GetDocKos1Service } from "../../../services/kos1";

function PlantKos1({ farmer }: { farmer: Farmer }) {
  const docKos1 = useQuery({
    queryKey: ["docKos1"],
    queryFn: () => GetDocKos1Service(),
  });
  return (
    <DashboardLayout farmer={farmer}>
      <Head>
        <title>กรอกข้อมูล ชนิดพืชที่ขอการรับรอง KOS-1</title>
      </Head>
      <div className="min-h-screen bg-fourth-color pb-10 pt-10 font-Anuphan">
        <header className="flex flex-col items-center justify-center gap-5">
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5">
            <h1 className="text-xl font-semibold text-white">(KOS-01) </h1>
            <h2 className="text-balance text-center text-base font-normal text-white">
              ใบสมัครขอรับการตรวจ ประเมินมาตรฐานเกษตร อินทรีย์ขั้นพื้นฐาน
            </h2>
          </section>
        </header>
        <main className="mt-10 flex justify-center  ">
          <CardPlantKos1
            docKos1={docKos1}
            farmKOS1Id={docKos1.data?.farmKos1?.id as string}
          />
        </main>
      </div>
    </DashboardLayout>
  );
}

export default PlantKos1;
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
