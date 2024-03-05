import React, { ChangeEventHandler, useEffect, useState } from "react";
import {
  Button,
  FileTrigger,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "react-aria-components";
import { Calendar } from "primereact/calendar";
import { FaSave } from "react-icons/fa";
import { CiImageOn } from "react-icons/ci";
import Image from "next/image";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { ActivityKos3, FileActivityKos3 } from "../../../model";
import {
  CreateFileOnActivityKos3Service,
  DeleteFileOnActivityKos3Service,
  ResponseGetActivityKos3ByPageService,
  UpdateActivityKos3Service,
} from "../../../services/kos3";
import {
  GetSignURLService,
  UploadSignURLService,
} from "../../../services/google-storage";
import { UseQueryResult } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import { useDeviceType } from "../../../utils";

type UpdateActivityProps = {
  setTriggerUpdateActivity: React.Dispatch<React.SetStateAction<boolean>>;
  selectActivity:
    | (ActivityKos3 & {
        fileOnActivities: FileActivityKos3[];
      })
    | undefined;
  activities: UseQueryResult<ResponseGetActivityKos3ByPageService, Error>;
};
function UpdateActivity({
  setTriggerUpdateActivity,
  activities,
  selectActivity,
}: UpdateActivityProps) {
  const deviceType = useDeviceType();
  const router = useRouter();
  const [activity, setActivity] = useState<{
    plotNumber?: number;
    activityDate?: string;
    note?: string;
  }>();
  const [files, setFiles] = useState<
    {
      id?: string;
      url?: string;
      type?: string;
      file?: File;
      activitiesKos3Id?: string;
    }[]
  >();

  useEffect(() => {
    if (!selectActivity) return;
    setActivity(() => {
      return {
        plotNumber: selectActivity?.plotNumber,
        activityDate: selectActivity?.activityDate,
        note: selectActivity?.note,
      };
    });
    setFiles(() => {
      return selectActivity?.fileOnActivities.map((file) => {
        return { id: file.id, url: file.url, type: file.type };
      });
    });
  }, []);

  const handleChangeActivcity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setActivity((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummitActivity = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        icon: "info",
        title: "กำลังบันทึกข้อมูล",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const newFiles = files?.filter((file) => file.id === undefined);
      const update = await UpdateActivityKos3Service({
        query: {
          docKos03Id: selectActivity?.docKos03Id as string,
          activitiesKos3Id: selectActivity?.id as string,
        },
        body: {
          plotNumber: activity?.plotNumber,
          activityDate: activity?.activityDate,
          note: activity?.note,
        },
      });
      if (newFiles && newFiles?.length > 0) {
        for (const newFile of newFiles) {
          const signURL = await GetSignURLService({
            fileName: newFile.file?.name as string,
            fileType: newFile.file?.type as string,
          });
          const upload = await UploadSignURLService({
            contentType: signURL.contentType,
            file: newFile.file as File,
            signURL: signURL.signURL,
          });
          const createFile = await CreateFileOnActivityKos3Service({
            url: signURL.originalURL,
            type: signURL.contentType,
            activitiesKos3Id: update.id,
          });
        }
      }
      await activities.refetch();
      setTriggerUpdateActivity(() => false);
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (error: any) {
      console.log(error.message);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  const handleDeleteFile = async ({
    fileId,
    url,
  }: {
    fileId: string;
    url?: string;
  }) => {
    try {
      if (url && !fileId) {
        const unDeleteFiles = files?.filter((file) => file.url !== url);
        setFiles(() => unDeleteFiles);
      } else if (fileId) {
        Swal.fire({
          icon: "info",
          title: "กำลังลบข้อมูล",
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });
        await DeleteFileOnActivityKos3Service({ fileOnActivityId: fileId });
        const unDeleteFiles = files?.filter((file) => file.id !== fileId);
        setFiles(() => unDeleteFiles);
        await activities.refetch();
      }
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (error: any) {
      console.log(error.message);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center pb-5 ">
      <Form
        onSubmit={handleSummitActivity}
        className="mt-5 flex w-full flex-col items-center justify-start gap-5 lg:w-96 lg:rounded-lg lg:p-5 lg:ring-2 lg:ring-third-color"
      >
        <Label className="mt-10 w-80 rounded-lg bg-third-color  py-2 text-center text-lg font-bold text-white">
          เพิ่มกิจกรรม
        </Label>
        <TextField className="flex w-80 items-center justify-start">
          <Label className="w-28 text-xl font-semibold text-super-main-color">
            แปลงที่ :
          </Label>
          <Input
            required
            name="plotNumber"
            onChange={handleChangeActivcity}
            value={activity?.plotNumber}
            type="text"
            inputMode="numeric"
            className="w-10/12 rounded-lg p-3 ring-1 ring-gray-300"
            placeholder="ลำดับแปลง"
          />
        </TextField>
        <TextField className="flex w-80  flex-col items-start justify-start gap-2 ">
          <Label className=" text-xl font-semibold text-super-main-color">
            วันที่ดำเนินกิจกรรม :
          </Label>
          <Calendar
            required
            className="w-full"
            dateFormat="dd/MM/yy"
            locale="th"
            value={
              activity?.activityDate ? new Date(activity?.activityDate) : null
            }
            onChange={(e) =>
              setActivity((prev) => ({
                ...prev,
                activityDate: e.value?.toISOString(),
              }))
            }
            touchUI={deviceType === "mobile" ? true : false}
          />
        </TextField>

        <TextField className="mt-2 flex w-80 flex-col items-start gap-2 lg:w-full">
          <Label className="w-max text-balance text-center text-lg font-semibold text-super-main-color">
            รายละเอียด :{" "}
          </Label>
          <TextArea
            required
            name="note"
            onChange={(e) => {
              setActivity((prev) => {
                return { ...prev, note: e.target.value };
              });
            }}
            value={activity?.note}
            placeholder="...รายละเอียด"
            className="h-40 w-full rounded-lg p-3 ring-1 ring-blue-200 "
          />
        </TextField>

        <FileTrigger
          allowsMultiple
          acceptedFileTypes={[
            "image/png",
            "image/jpg",
            "image/jpeg",
            "image/gif",
            "image/bmp",
            "image/webp",
          ]}
          onSelect={(e) => {
            if (!e) return null;

            const files: FileList = e;

            Array.from(files).forEach((file) => {
              const url = URL.createObjectURL(file);
              const reader = new FileReader();

              setFiles((prev) => {
                if (!prev) return [{ file, url: url }];
                return [...prev, { file, url: url }];
              });

              reader.readAsDataURL(file);
            });
          }}
        >
          <div className="w-80">
            <Button
              className=" flex items-center justify-center gap-2 rounded-lg bg-third-color px-4 py-1 
          font-semibold text-white"
            >
              <CiImageOn />
              อัพโหลดรูป
            </Button>
          </div>
        </FileTrigger>
        <section className=" grid h-full w-11/12 grid-cols-2 place-items-center gap-2">
          {files?.map((file, index) => {
            return (
              <div
                onClick={() => {
                  window.open(file.url as string, "_blank");
                }}
                key={index}
                className="relative h-40 w-full cursor-pointer overflow-hidden bg-gray-300"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile({
                      fileId: file.id as string,
                      url: file.url,
                    });
                  }}
                  type="button"
                  className="absolute right-2 top-2 z-40 m-auto flex
                  items-center justify-center gap-1 rounded-lg bg-red-500 px-4 text-sm text-white drop-shadow-lg"
                >
                  <MdDelete />
                  ลบรูปภาพ
                </button>
                <Image
                  src={file.url as string}
                  fill
                  className="object-cover  transition duration-100 hover:scale-110 active:scale-125"
                  alt="image activity "
                />
              </div>
            );
          })}
        </section>
        <section className="flex w-full justify-center gap-2">
          <Button
            onPress={() => setTriggerUpdateActivity(() => false)}
            type="button"
            className="flex items-center justify-center gap-3 rounded-lg bg-red-700 px-10 py-1 
          text-base text-white drop-shadow-md"
          >
            <FaSave />
            ยกเลิก
          </Button>

          <Button
            type="submit"
            className="flex items-center justify-center gap-3 rounded-lg bg-super-main-color px-10 py-1 
          text-base text-white drop-shadow-md"
          >
            <FaSave />
            บันทึก
          </Button>
        </section>
      </Form>
    </div>
  );
}

export default UpdateActivity;
