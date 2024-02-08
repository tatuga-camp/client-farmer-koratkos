import React from "react";
import DashboardLayout from "../../layouts/dashboardLayout";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import {
  GetAllDocKosService,
  GetFarmerServerSideService,
} from "../../services/farmer";
import { Farmer } from "../../model";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import Kos2Form from "../../components/docKos/kos2/form/kos2Form";

function Kos02({ farmer }: { farmer: Farmer }) {
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  return (
    <DashboardLayout farmer={farmer}>
      <Head>
        <title>กรอกข้อมูล KOS-2</title>
      </Head>
      <div className="min-h-screen bg-fourth-color pb-10  pt-10 font-Anuphan">
        <header className="flex flex-col items-center justify-center gap-5">
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5">
            <h1 className="text-xl font-semibold text-white">(KOS-02) </h1>
            <h2 className="text-balance text-center text-base font-normal text-white">
              ผังแปลง ขอรับการตรวจประเมิน มาตรฐานเกษตรอินทรีย์ ์ขั้นพื้นฐาน
            </h2>
          </section>
        </header>
        <main>
          <Kos2Form docKos={docKos} />
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Kos02;
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
