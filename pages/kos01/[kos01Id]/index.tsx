import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import { GetFarmerServerSideService } from "../../../services/farmer";
import { Farmer } from "../../../model";
import DashboardLayout from "../../../layouts/dashboardLayout";
import Head from "next/head";
import Image from "next/image";
import PlantKos1 from "../../../components/docKos/kos1/forms/plantKos1";
import { useRouter } from "next/router";
import { Step } from "../../create/kos1";
import { menuKos01 } from "../../../data/menus";
import Link from "next/link";
import { AiFillEdit } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { GetDocKos1Service } from "../../../services/kos1";

function Index({ farmer }: { farmer: Farmer }) {
  const router = useRouter();
  const docKos1 = useQuery({
    queryKey: ["docKos1"],
    queryFn: () => GetDocKos1Service(),
  });
  return (
    <DashboardLayout>
      <Head>
        <title>กรอกข้อมูล KOS-1</title>
      </Head>
      <div className="min-h-screen bg-fourth-color pb-10 pt-40 font-Anuphan">
        <header className="flex flex-col items-center justify-center gap-5">
          <section className="flex w-10/12  justify-between">
            <div>
              <h1 className="text-2xl font-bold text-super-main-color">
                สวัสดี!
              </h1>
              <h2 className="fo w-52 truncate text-2xl font-semibold text-super-main-color">
                {farmer.title}
                {farmer.firstName} {farmer.lastName}
              </h2>
            </div>
            <div
              className="relative h-20 w-20 overflow-hidden rounded-full 
        ring-2 ring-super-main-color ring-offset-2"
            >
              <Image
                src={farmer.picture}
                fill
                className="object-cover"
                alt="profile picture"
              />
            </div>
          </section>
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5">
            <h1 className="text-xl font-semibold text-white">(KOS-01) </h1>
            <h2 className="text-balance text-center text-base font-normal text-white">
              ใบสมัครขอรับการตรวจ ประเมินมาตรฐานเกษตร อินทรีย์ขั้นพื้นฐาน
            </h2>
          </section>
        </header>

        <main className="mt-5">
          <ul className="flex flex-col items-center justify-center gap-5">
            {menuKos01({ kos1Id: router.query.kos01Id as string }).map(
              (menu, index) => (
                <Link
                  className="flex h-max w-80 justify-between gap-2 rounded-lg bg-third-color p-5 ring-white drop-shadow-md  transition duration-150 hover:scale-105 active:scale-110 active:ring-2"
                  href={menu.href}
                  key={index}
                >
                  <span className="text-xl font-semibold text-super-main-color">
                    {menu.title}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg
                 bg-super-main-color text-2xl text-white"
                  >
                    <AiFillEdit />
                  </div>
                </Link>
              ),
            )}
          </ul>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Index;
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
