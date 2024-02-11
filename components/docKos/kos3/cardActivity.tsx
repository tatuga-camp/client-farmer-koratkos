import React from "react";
import { ActivityKos3, FileActivityKos3 } from "../../../model";
import moment from "moment";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import { UseQueryResult } from "@tanstack/react-query";
import {
  DeleteActivityKos3Service,
  ResponseGetActivityKos3ByPageService,
} from "../../../services/kos3";
import Swal from "sweetalert2";
type CardActivityProps = {
  activity: ActivityKos3 & { fileOnActivities: FileActivityKos3[] };
  activities: UseQueryResult<ResponseGetActivityKos3ByPageService, Error>;
  setTriggerUpdateActivity: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectActivity: React.Dispatch<
    React.SetStateAction<
      | (ActivityKos3 & {
          fileOnActivities: FileActivityKos3[];
        })
      | undefined
    >
  >;
};
function CardActivity({
  activity,
  activities,
  setTriggerUpdateActivity,
  setSelectActivity,
}: CardActivityProps) {
  const activityDate = moment(activity.activityDate)
    .locale("th")
    .format("DD/MMMM/YYYY");
  const image =
    activity.fileOnActivities.length > 0
      ? activity.fileOnActivities[0].url
      : "";

  const handleDeleteAcivity = async ({
    activitiesKos3Id,
    plotNumber,
  }: {
    activitiesKos3Id: string;
    plotNumber: number;
  }) => {
    let content = document.createElement("div");
    content.innerHTML =
      "<div>กรุณาพิมพ์ข้อความนี้</div> <strong>" +
      "ยืนยันการลบ" +
      "</strong> <div>เพื่อลบข้อมูล</div>";
    const { value } = await Swal.fire<{ value: string }>({
      title: `ลบ แปลงที่ ${plotNumber}`,
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
        const deletePlant = await DeleteActivityKos3Service({
          activitiesKos3Id: activitiesKos3Id,
        });
        await activities.refetch();
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
  return (
    <section
      className="flex  h-max w-full flex-col gap-4 bg-[#F1E4C3] p-4 py-5 font-Anuphan lg:rounded-lg lg:drop-shadow-md"
      key={activity.id}
    >
      <div className="flex w-full flex-row-reverse justify-between">
        <div className="my-0 flex justify-end gap-2">
          <button
            onClick={() => {
              setTriggerUpdateActivity(() => true);
              setSelectActivity(() => activity);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col 
                            items-center justify-center gap-1 transition duration-100 hover:scale-105 active:scale-110"
          >
            <div className="rounded-lg bg-[#597E52] p-2 text-white">
              <AiFillEdit />
            </div>
            <span className="text-sm font-semibold">แก้ไข</span>
          </button>
          <button
            onClick={() =>
              handleDeleteAcivity({
                activitiesKos3Id: activity.id,
                plotNumber: activity.plotNumber,
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

        <div
          className={` w-max flex-col ${image ? "hidden" : "flex px-6 py-2"}  items-start justify-between
           rounded-lg bg-[#597E52] `}
        >
          <h1 className="text-2xl font-semibold text-white">
            แปลงที่ {activity.plotNumber}
          </h1>
          <h2 className="text-base font-medium text-white">{activityDate}</h2>
        </div>
      </div>
      {image && (
        <div className="relative h-60 w-full overflow-hidden rounded-lg bg-slate-300">
          <Image
            src={image}
            alt="image of activity"
            fill
            className="object-cover"
          />
          <div
            className={` w-max flex-col ${image ? "flex px-4 py-2" : "hidden"} absolute bottom-2 right-2 z-40 m-auto  items-start justify-between
           rounded-lg bg-[#597E52] `}
          >
            <h1 className="text-xl font-semibold text-white">
              แปลงที่ {activity.plotNumber}
            </h1>
            <h2 className="text-sm font-medium text-white">{activityDate}</h2>
          </div>
        </div>
      )}
      {activities.isFetching ? (
        <div className="bg flex h-max w-full flex-col gap-2">
          {[...new Array(4)].map((_, index) => {
            return (
              <div
                key={index}
                className="h-3 w-full animate-pulse bg-slate-300"
              ></div>
            );
          })}
        </div>
      ) : (
        <div className=" line-clamp-4 text-pretty indent-5 font-medium text-super-main-color">
          {activity.note}
        </div>
      )}
    </section>
  );
}

export default CardActivity;
