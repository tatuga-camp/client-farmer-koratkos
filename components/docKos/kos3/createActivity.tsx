import React, { ChangeEventHandler, useState } from "react";
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
import {
  CreateActivityKos3Service,
  CreateDocKos3Service,
  CreateFileOnActivityKos3Service,
  ResponseGetActivityKos3ByPageService,
} from "../../../services/kos3";
import Swal from "sweetalert2";
import {
  GetSignURLService,
  UploadSignURLService,
} from "../../../services/google-storage";
import { useRouter } from "next/router";
import { UseQueryResult } from "@tanstack/react-query";
import { DocKos3 } from "../../../model";
import { ResponseGetAllDocKosService } from "../../../services/farmer";
import { useDeviceType } from "../../../utils";
type CreateActivityProps = {
  docKos?: UseQueryResult<ResponseGetAllDocKosService, Error>;
  activities?: UseQueryResult<ResponseGetActivityKos3ByPageService, Error>;
  setTriggerCreateActivity?: React.Dispatch<React.SetStateAction<boolean>>;
};
function CreateActivity({
  docKos,
  activities,
  setTriggerCreateActivity,
}: CreateActivityProps) {
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
      let docKos03Id: string | undefined;
      if (setTriggerCreateActivity && docKos) {
        docKos03Id = docKos.data?.kos3.id;
      } else {
        const docKos03 = await CreateDocKos3Service();
        docKos03Id = docKos03.id;
      }

      const activitiesKos3 = await CreateActivityKos3Service({
        plotNumber: activity?.plotNumber as number,
        activityDate: activity?.activityDate as string,
        note: activity?.note as string,
        docKos03Id: docKos03Id as string,
      });
      if (newFiles && newFiles?.length > 0) {
        for (const newFile of newFiles) {
          const signURL = await GetSignURLService({
            firstPath: "kos03",
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
            activitiesKos3Id: activitiesKos3.id,
          });
        }
      }
      await activities?.refetch();
      if (setTriggerCreateActivity) {
        setTriggerCreateActivity(() => false);
      } else {
        router.push({
          pathname: `/kos03/${docKos03Id}`,
        });
      }

      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
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
            type="number"
            inputMode="numeric"
            className="w-10/12 rounded-lg p-3 ring-1 ring-gray-300"
            placeholder="ลำดับแปลง"
          />
        </TextField>
        <TextField className="flex w-80  items-center justify-start gap-2 ">
          <Label className="w-20 text-xl font-semibold text-super-main-color">
            วันที่ :
          </Label>
          <Calendar
            required
            className="w-10/12"
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
        <section className=" grid  h-max w-11/12 grid-cols-2 place-items-center gap-2">
          {files?.map((file, index) => {
            return (
              <div
                onClick={() => {
                  window.open(file.url as string, "_blank");
                }}
                key={index}
                className="relative h-40 w-full cursor-pointer overflow-hidden bg-gray-300"
              >
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
          {setTriggerCreateActivity && (
            <Button
              type="button"
              onPress={() => setTriggerCreateActivity(() => false)}
              className="flex items-center justify-center gap-3 rounded-lg bg-red-700 px-10 py-1 
          text-base text-white drop-shadow-md"
            >
              <FaSave />
              ยกเลิก
            </Button>
          )}
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

export default CreateActivity;
