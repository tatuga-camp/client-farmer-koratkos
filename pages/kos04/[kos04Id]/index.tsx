import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import {
  GetAllDocKosService,
  GetFarmerServerSideService,
} from "../../../services/farmer";
import {
  ActivityKos3,
  FactoryKos4,
  Farmer,
  FileActivityKos3,
} from "../../../model";
import DashboardLayout from "../../../layouts/dashboardLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { IoIosAddCircleOutline } from "react-icons/io";
import { Pagination, Skeleton } from "@mui/material";
import UpdateActivity from "../../../components/docKos/kos3/updateActivity";
import Swal from "sweetalert2";
import { GetFactorKos04ByPageService } from "../../../services/kos4";
import CardFactor from "../../../components/docKos/kos4/cardFactor";
import CreateFactor from "../../../components/docKos/kos4/createFactor";
import UpdateFactor from "../../../components/docKos/kos4/updateFactor";

function Index({ farmer }: { farmer: Farmer }) {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [triggerCreateFactor, setTriggerCreateFactor] =
    useState<boolean>(false);
  const [triggerUpdateFactor, setTriggerUpdateFactor] =
    useState<boolean>(false);
  const [selectFactor, setSelectFactor] = useState<FactoryKos4>();
  const factors = useQuery({
    queryKey: ["factor", page],
    queryFn: () =>
      GetFactorKos04ByPageService({
        page: page,
        limit: 10,
        dockKos4Id: router.query.kos04Id as string,
      }),
  });

  if (triggerCreateFactor) {
    return (
      <DashboardLayout farmer={farmer}>
        <Head>
          <title>กรอกข้อมูล KOS-4</title>
        </Head>

        <CreateFactor
          factors={factors}
          setTriggerCreateFactor={setTriggerCreateFactor}
        />
      </DashboardLayout>
    );
  }

  if (triggerUpdateFactor) {
    return (
      <DashboardLayout farmer={farmer}>
        <Head>
          <title>กรอกข้อมูล KOS-4</title>
        </Head>

        <UpdateFactor
          factors={factors}
          selectFactor={selectFactor as FactoryKos4}
          setTriggerUpdateFactor={setTriggerUpdateFactor}
        />
      </DashboardLayout>
    );
  }

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
              แบบบันทึก ปัจจัยการผลิตในแปลง ผลิตพืชอินทรีย์
            </h2>
          </section>
        </header>
        <main className="flex w-full flex-col items-center gap-5">
          <button
            onClick={() => {
              setTriggerCreateFactor(() => true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-10 
              flex w-52 items-center justify-center gap-2  rounded-lg bg-super-main-color px-5 py-1 font-semibold
             text-white drop-shadow-md transition duration-150 hover:scale-105 active:scale-110"
          >
            <IoIosAddCircleOutline />
            เพิ่มปัจจัยการผลิต
          </button>
          <ul className="flex w-full flex-col items-center gap-5 lg:grid lg:grid-cols-3 lg:place-items-start lg:p-5">
            {factors.isLoading
              ? [...new Array(10)].map((value, index) => (
                  <div
                    key={index}
                    className="flex h-40 w-full animate-pulse flex-col items-start justify-center gap-2 rounded-none bg-slate-300 p-10 lg:rounded-lg"
                  >
                    <div className="h-5 w-full animate-pulse rounded-sm bg-slate-400"></div>
                    <div className="h-5 w-10/12 animate-pulse rounded-sm bg-slate-400"></div>
                    <div className="h-5 w-10/12 animate-pulse rounded-sm bg-slate-400"></div>
                  </div>
                ))
              : factors.data?.data.map((factor, index) => {
                  return (
                    <CardFactor
                      key={index}
                      factors={factors}
                      setSelectFactor={setSelectFactor}
                      setTriggerUpdateFactor={setTriggerUpdateFactor}
                      index={index}
                      factor={factor}
                    />
                  );
                })}
          </ul>
        </main>
        <footer className="mt-5 flex justify-center">
          <Pagination
            onChange={(e, page) => setPage(() => page)}
            count={factors.data?.meta.total}
            color="primary"
          />
        </footer>
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
