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
  HarvestLogDocKos5,
} from "../../../model";
import DashboardLayout from "../../../layouts/dashboardLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { IoIosAddCircleOutline } from "react-icons/io";
import { Pagination, Skeleton } from "@mui/material";
import Swal from "sweetalert2";
import CreateHarvestLog from "../../../components/docKos/kos5/createHarvestLog";
import { GetHarvestLogKos5ByPageService } from "../../../services/kos5";
import CardHarvestLog from "../../../components/docKos/kos5/cardHarvestLog";
import UpdateHarvestLog from "../../../components/docKos/kos5/updateHarvestLog";

function Index({ farmer }: { farmer: Farmer }) {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [triggerCreateHarvestlog, setTriggetCreateHarvestlog] =
    useState<boolean>(false);
  const [triggerUpdateHarvestLog, setTriggerUpdateHarvestLog] =
    useState<boolean>(false);
  const [selectHarvestLog, setSelectHarvestLog] = useState<HarvestLogDocKos5>();

  const harvestLogs = useQuery({
    queryKey: ["harvestLog", page],
    queryFn: () =>
      GetHarvestLogKos5ByPageService({
        page: page,
        limit: 10,
        dockKos5Id: router.query.kos05Id as string,
      }),
    placeholderData: keepPreviousData,
  });
  if (triggerCreateHarvestlog) {
    return (
      <DashboardLayout farmer={farmer}>
        <Head>
          <title>กรอกข้อมูล KOS-5</title>
        </Head>
        <CreateHarvestLog
          harvestLogs={harvestLogs}
          setTriggetCreateHarvestlog={setTriggetCreateHarvestlog}
        />
      </DashboardLayout>
    );
  }
  if (triggerUpdateHarvestLog) {
    return (
      <DashboardLayout farmer={farmer}>
        <Head>
          <title>กรอกข้อมูล KOS-5</title>
        </Head>
        <UpdateHarvestLog
          selectHarvestLog={selectHarvestLog}
          harvestLogs={harvestLogs}
          setTriggerUpdateHarvestLog={setTriggerUpdateHarvestLog}
        />
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout farmer={farmer}>
      <Head>
        <title>กรอกข้อมูล KOS-5</title>
      </Head>
      <div className="flex min-h-screen w-full flex-col items-center bg-fourth-color pb-10  pt-10 font-Anuphan">
        <header className="flex w-full flex-col items-center justify-center gap-5">
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5 lg:h-20 lg:flex-row">
            <h1 className="text-xl font-semibold text-white">(KOS-05) </h1>
            <h2 className="text-balance text-center text-lg font-normal text-white">
              แบบบันทึก การเก็บเกี่ยวในแปลง ผลิตพืชอินทรีย์
            </h2>
          </section>
        </header>
        <main className="flex w-full flex-col items-center gap-5">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTriggetCreateHarvestlog(true);
            }}
            className="mt-10 
              flex w-52 items-center justify-center gap-2  rounded-lg bg-super-main-color px-5 py-1 font-semibold
             text-white drop-shadow-md transition duration-150 hover:scale-105 active:scale-110"
          >
            <IoIosAddCircleOutline />
            เพิ่มบันทึก
          </button>
          <ul className="flex w-full flex-col items-center gap-5 lg:grid lg:grid-cols-3 lg:place-items-start lg:p-5">
            {harvestLogs.isLoading
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
              : harvestLogs.data?.data.map((harvestLog, index) => {
                  return (
                    <CardHarvestLog
                      harvestLog={harvestLog}
                      key={index}
                      harvestLogs={harvestLogs}
                      setTriggetUpdateHarvestlog={setTriggerUpdateHarvestLog}
                      setSelectHarvestlog={setSelectHarvestLog}
                    />
                  );
                })}
          </ul>
        </main>
        <footer className="mt-5 flex justify-center">
          <Pagination
            onChange={(e, page) => setPage(() => page)}
            count={harvestLogs.data?.meta.total || 1}
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
