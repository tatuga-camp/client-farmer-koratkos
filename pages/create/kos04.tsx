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
import CreateFactor from "../../components/docKos/kos4/createFactor";

function Kos02({ farmer }: { farmer: Farmer }) {
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  return (
    <DashboardLayout farmer={farmer}>
      <Head>
        <title>กรอกข้อมูล KOS-4</title>
      </Head>
      <div className="flex min-h-screen w-full flex-col items-center bg-fourth-color pb-10  pt-10 font-Anuphan">
        <header className="flex w-full flex-col items-center justify-center gap-5">
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5 lg:h-20 lg:flex-row">
            <h1 className="text-xl font-semibold text-white">(KOS-04) </h1>
            <h2 className="text-balance text-center text-lg font-normal text-white">
              แบบบันทึก ปัจจัยการผลิตในแปลง ผลิตพืชอินทรีย์{" "}
            </h2>
          </section>
        </header>
        <main>
          <CreateFactor />
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
