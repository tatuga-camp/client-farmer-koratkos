import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../layouts/dashboardLayout";
import { Farmer, OrgCropProdCalForKos2 } from "../../../model";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import {
  GetAllDocKosService,
  GetFarmerServerSideService,
} from "../../../services/farmer";
import Head from "next/head";
import Kos2Form from "../../../components/docKos/kos2/form/kos2Form";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { IoIosAddCircleOutline } from "react-icons/io";
import {
  DeleteOrgCropProdCalForKos2Service,
  GetDocKos02Service,
} from "../../../services/kos2";
import { MdDelete, MdLandslide } from "react-icons/md";
import { AiFillEdit } from "react-icons/ai";
import { FaSeedling } from "react-icons/fa";
import { GiWeight } from "react-icons/gi";
import UpdateOrgCropProd from "../../../components/docKos/kos2/form/updateOrgCropProd";
import Swal from "sweetalert2";
import CreateOrgCropProd from "../../../components/docKos/kos2/form/createOrgCropProd";

function Index({ farmer }: { farmer: Farmer }) {
  const [
    triggerCreateOrgCropProdCalForKos2,
    setTriggerCreateOrgCropProdCalForKos2,
  ] = useState(false);
  const [selectOrgCropProd, setSelectOrgCropProd] =
    useState<OrgCropProdCalForKos2>();
  const [
    triggerUpdateOrgCropProdCalForKos2,
    setTriggerUpdateOrgCropProdCalForKos2,
  ] = useState(false);
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  const dockos02 = useQuery({
    queryKey: ["docKos02"],
    queryFn: () => GetDocKos02Service(),
  });

  const handleDeleteOrgCrop = async ({
    orgCropProdCalForKos2Id,
  }: {
    orgCropProdCalForKos2Id: string;
  }) => {
    let content = document.createElement("div");
    content.innerHTML =
      "<div>กรุณาพิมพ์ข้อความนี้</div> <strong>" +
      "ยืนยันการลบ" +
      "</strong> <div>เพื่อลบข้อมูล</div>";
    const { value } = await Swal.fire<{ value: string }>({
      title: "ยืนยันการลบข้อมูล",
      input: "text",
      html: content,
      footer: "<strong>หากลบแล้วคุณจะไม่สามารถกู้คืนข้อมูลได้</strong>",
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== "ยืนยันการลบ") {
          return "กรุณาพิมพ์ข้อความยืนยันให้ถูกต้อง";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "กำลังลบข้อมูล",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const deletePlant = await DeleteOrgCropProdCalForKos2Service({
          orgCropProdCalForKos2Id: orgCropProdCalForKos2Id,
        });
        await dockos02.refetch();
        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          text: "ลบข้อมูลสำเร็จ",
        });
      } catch (error: any) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error.message,
        });
      }
    }
  };

  useEffect(() => {
    if (dockos02?.data?.orgCropProdCalForKos2s?.length === 0) {
      document.getElementById("เพิ่มแปลงปลูก")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [dockos02.data]);
  return (
    <DashboardLayout farmer={farmer}>
      <Head>
        <title>กรอกข้อมูล KOS-1</title>
      </Head>
      <div className="flex min-h-screen w-full flex-col items-center bg-fourth-color pb-10  pt-10 font-Anuphan">
        <header className="flex w-full flex-col items-center justify-center gap-5">
          <section className="flex h-40 w-10/12 flex-col items-center justify-center gap-3 rounded-xl bg-super-main-color p-5 lg:h-20 lg:flex-row">
            <h1 className="text-xl font-semibold text-white">(KOS-02) </h1>
            <h2 className="text-balance text-center text-lg font-normal text-white">
              ผังแปลง ขอรับการตรวจประเมิน มาตรฐานเกษตรอินทรีย์ ขั้นพื้นฐาน{" "}
            </h2>
          </section>
        </header>
        {triggerCreateOrgCropProdCalForKos2 ? (
          <CreateOrgCropProd
            setTriggerCreateOrgCropProdCalForKos2={
              setTriggerCreateOrgCropProdCalForKos2
            }
            dockos02={dockos02}
          />
        ) : triggerUpdateOrgCropProdCalForKos2 ? (
          <UpdateOrgCropProd
            dockos02={dockos02}
            selectOrgCropProd={selectOrgCropProd}
            setTriggerUpdateOrgCropProdCalForKos2={
              setTriggerUpdateOrgCropProdCalForKos2
            }
          />
        ) : (
          <div className="flex w-full flex-col items-center">
            <Kos2Form isUpdate={true} dockos02={dockos02} docKos={docKos} />
            <h2 className="mt-10 w-80 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white lg:w-96">
              แผนการผลิตพืชอินทรีย์
            </h2>
            <button
              onClick={() => {
                setTriggerCreateOrgCropProdCalForKos2(() => true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-10 
              
              flex w-40 items-center justify-center gap-2  rounded-lg bg-super-main-color px-5 py-1 font-semibold
             text-white drop-shadow-md transition duration-150 hover:scale-105 active:scale-110"
            >
              <IoIosAddCircleOutline />
              เพิ่มแปลงปลูก
            </button>
            <ul className="mt-10 flex w-full flex-col items-center gap-5 lg:grid lg:grid-cols-2 lg:place-items-center lg:p-10 xl:grid-cols-3">
              {dockos02?.data?.orgCropProdCalForKos2s?.length === 0 ? (
                <li
                  id="เพิ่มแปลงปลูก"
                  className="flex h-60 w-10/12 items-center justify-center rounded-lg bg-third-color text-xl font-medium"
                >
                  ไม่มีข้อมูลแปลงปลูก
                </li>
              ) : (
                dockos02.data?.orgCropProdCalForKos2s.map(
                  (orgCropProd, index) => {
                    const rangeDate = orgCropProd.rangeDate.map((time) => {
                      const date = new Date(time);
                      return ` ${date.toLocaleDateString("th-TH", {
                        month: "short",
                      })}  `;
                    });
                    const yearPlan = new Date(
                      orgCropProd.yearPlan,
                    ).toLocaleDateString("th-TH", {
                      year: "numeric",
                    });
                    return (
                      <li
                        key={orgCropProd.id}
                        className="flex h-max w-11/12 flex-col items-center justify-start gap-1 rounded-lg bg-[#F1E4C3] p-4"
                      >
                        <section className="flex w-full justify-between ">
                          <h2
                            className="flex items-center justify-center rounded-lg bg-[#502D16]
                            px-3 py-1 text-xl font-semibold text-white"
                          >
                            แปลงที่ {orgCropProd.plotNumber}
                          </h2>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setTriggerUpdateOrgCropProdCalForKos2(
                                  () => true,
                                );
                                setSelectOrgCropProd(() => orgCropProd);
                              }}
                              className="flex flex-col 
                            items-center justify-center gap-1 transition duration-100 hover:scale-105 active:scale-110"
                            >
                              <div className="rounded-lg bg-[#597E52] p-2 text-white">
                                <AiFillEdit />
                              </div>
                              <span className="text-sm font-semibold">
                                แก้ไข
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteOrgCrop({
                                  orgCropProdCalForKos2Id: orgCropProd.id,
                                })
                              }
                              className="flex flex-col 
                            items-center justify-center gap-1 transition duration-100 hover:scale-105 active:scale-110"
                            >
                              <div className="rounded-lg bg-red-700 p-2 text-white">
                                <MdDelete />
                              </div>
                              <span className="text-sm font-semibold">ลบ</span>
                            </button>
                          </div>
                        </section>
                        <section className="mt-2 flex w-full flex-col items-start">
                          <h1 className="text-4xl font-semibold text-super-main-color">
                            <span className="text-sm">ชนิดพืช</span>{" "}
                            {orgCropProd.plantType}
                          </h1>
                          <span className="text-blue-600">
                            แหล่งที่มา: {orgCropProd.source}
                          </span>
                        </section>
                        <section className="mt-5 flex w-full flex-col items-start justify-center gap-2">
                          <div className="flex w-full items-center justify-start gap-2">
                            <div className="rounded-full bg-super-main-color p-2 text-lg text-white">
                              <MdLandslide />
                            </div>
                            <span className="font-semibold">
                              พื้นที่ {orgCropProd.landArea} ไร่
                            </span>
                          </div>
                          <div className="flex w-full items-center justify-start   gap-2">
                            <div className="rounded-full bg-super-main-color p-2 text-lg text-white">
                              <GiWeight />
                            </div>
                            <div className="text-xs font-semibold">
                              <span className="text-base">
                                ผลผลิต{" "}
                                {orgCropProd.yieldPerRai.toLocaleString()}{" "}
                                กก./ไร่
                              </span>
                            </div>
                          </div>
                        </section>
                        <section className="mt-5 flex flex-col items-center justify-center gap-2 border-b-2 border-[#502D16]">
                          <div className="rounded-full bg-super-main-color p-3 text-3xl text-white">
                            <FaSeedling />
                          </div>
                          <h1 className="text-2xl font-semibold text-[#502D16]">
                            <span className="text-sm">เมล็ด</span>{" "}
                            {orgCropProd.seed}
                          </h1>
                        </section>
                        <section className="mt-5 flex w-full flex-col items-center justify-center gap-3">
                          <span className="font-bold text-[#502D16]">
                            เดือน:{" "}
                            <span className="text-super-main-color ">
                              {rangeDate}
                            </span>
                          </span>
                          <span className="font-bold text-[#502D16]">
                            แผนการผลิตพืชอินทรีย์ ประจำปีการผลิต
                          </span>
                          <span className="text-xl font-bold text-third-color ">
                            {yearPlan}
                          </span>
                        </section>
                      </li>
                    );
                  },
                )
              )}
            </ul>
          </div>
        )}
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
