import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import {
  GetAllDocKosService,
  GetFarmerServerSideService,
} from "../../../services/farmer";
import { ActivityKos3, Farmer, FileActivityKos3 } from "../../../model";
import DashboardLayout from "../../../layouts/dashboardLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetDocKos1Service } from "../../../services/kos1";
import { IoIosAddCircleOutline } from "react-icons/io";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import {
  DeleteActivityKos3Service,
  GetActivityKos3ByPageService,
} from "../../../services/kos3";
import { act } from "react-dom/test-utils";
import CardActivity from "../../../components/docKos/kos3/cardActivity";
import CreateActivity from "../../../components/docKos/kos3/createActivity";
import { Pagination, Skeleton } from "@mui/material";
import UpdateActivity from "../../../components/docKos/kos3/updateActivity";
import Swal from "sweetalert2";

function Index({ farmer }: { farmer: Farmer }) {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [triggerUpdateActivity, setTriggerUpdateActivity] =
    useState<boolean>(false);
  const [triggerCreateActivity, setTriggerCreateActivity] =
    useState<boolean>(false);
  const [selectActivity, setSelectActivity] = useState<
    ActivityKos3 & {
      fileOnActivities: FileActivityKos3[];
    }
  >();
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  const activities = useQuery({
    queryKey: ["activities", page],
    queryFn: () =>
      GetActivityKos3ByPageService({
        limit: 10,
        page: page,
        docKos3Id: docKos.data?.kos3.id as string,
      }),
    placeholderData: keepPreviousData,
    enabled: docKos.isSuccess,
  });

  if (triggerCreateActivity) {
    return (
      <DashboardLayout farmer={farmer}>
        <Head>
          <title>กรอกข้อมูล KOS-3</title>
        </Head>
        <CreateActivity
          docKos={docKos}
          activities={activities}
          setTriggerCreateActivity={setTriggerCreateActivity}
        />
      </DashboardLayout>
    );
  }

  if (triggerUpdateActivity) {
    return (
      <DashboardLayout farmer={farmer}>
        <Head>
          <title>กรอกข้อมูล KOS-3</title>
        </Head>
        <UpdateActivity
          activities={activities}
          selectActivity={selectActivity}
          setTriggerUpdateActivity={setTriggerUpdateActivity}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout farmer={farmer}>
      <Head>
        <title>กรอกข้อมูล KOS-3</title>
      </Head>

      <div className="flex min-h-screen w-full flex-col items-center bg-fourth-color pb-10  pt-10 font-Anuphan">
        <header className="flex w-full flex-col items-center justify-center gap-5">
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5 lg:h-20 lg:flex-row">
            <h1 className="text-xl font-semibold text-white">(KOS-03) </h1>
            <h2 className="text-balance text-center text-base font-normal text-white">
              แบบบันทึก กิจกรรมในแปลง ผลิตพืชอินทรีย์
            </h2>
          </section>
        </header>
        <main className="flex w-full flex-col items-center gap-5">
          <button
            onClick={() => {
              setTriggerCreateActivity(() => true);
            }}
            className="mt-10 
              flex w-40 items-center justify-center gap-2  rounded-lg bg-super-main-color px-5 py-1 font-semibold
             text-white drop-shadow-md transition duration-150 hover:scale-105 active:scale-110"
          >
            <IoIosAddCircleOutline />
            เพิ่มกิจกรรม
          </button>

          <ul className="flex w-full flex-col items-center gap-5 lg:grid lg:grid-cols-3 lg:place-items-start lg:p-5">
            {activities.isLoading
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
              : activities.data?.data
                  .sort((a, b) => a.plotNumber - b.plotNumber) // Sort activities by ID in ascending order
                  .map((activity) => {
                    return (
                      <CardActivity
                        key={activity.id}
                        setSelectActivity={setSelectActivity}
                        setTriggerUpdateActivity={setTriggerUpdateActivity}
                        activities={activities}
                        activity={activity}
                      />
                    );
                  })}
          </ul>
        </main>
        <footer className="mt-5 flex justify-center">
          <Pagination
            onChange={(e, page) => setPage(() => page)}
            count={activities.data?.meta.total as number}
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
