import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Button,
  FieldError,
  FileTrigger,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "react-aria-components";
import { CiImageOn } from "react-icons/ci";
import { FaSave } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  CreateDocKos2Service,
  CreateFileOnDocKos02Service,
  DeleteFileOnDocKos02Service,
  ResponseGetDocKos02Service,
  UpdateDocKos2Service,
} from "../../../../services/kos2";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetAllDocKosService } from "../../../../services/farmer";
import { useRouter } from "next/router";
import {
  GetSignURLService,
  UploadSignURLService,
} from "../../../../services/google-storage";
import { MdDelete } from "react-icons/md";
type Kos2FormProps = {
  docKos: UseQueryResult<ResponseGetAllDocKosService, Error>;
  isUpdate?: boolean;
  dockos02: UseQueryResult<ResponseGetDocKos02Service, Error>;
};
function Kos2Form({ docKos, isUpdate, dockos02 }: Kos2FormProps) {
  const [docKos2Data, setDocKos2Data] = useState<{
    numberOfPlotForKosCertificated?: string;
    marketingDetail?: string;
  }>();
  const [files, setFiles] = useState<
    {
      id?: string;
      url?: string;
      type?: string;
      file?: File;
      docKos02Id?: string;
    }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    if (isUpdate && dockos02.isSuccess) {
      setTimeout(() => {
        setDocKos2Data(() => {
          return {
            numberOfPlotForKosCertificated:
              dockos02.data?.numberOfPlotForKosCertificated,
            marketingDetail: dockos02.data?.marketingDetail,
          };
        });
        setFiles(() => {
          return dockos02.data?.files.map((file) => {
            return {
              id: file.id,
              url: file.url,
              type: file.type,
              docKos02Id: file.docKos02Id,
            };
          });
        });
      }, 100);
    }
  }, [dockos02.data]);
  const handleSumitDocKos2 = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      Swal.fire({
        title: "กำลังบันทึกข้อมูล",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      if (isUpdate) {
        const update = await UpdateDocKos2Service({
          numberOfPlotForKosCertificated:
            docKos2Data?.numberOfPlotForKosCertificated as string,
          marketingDetail: docKos2Data?.marketingDetail as string,
        });
        const newFile = files?.filter((file) => !file.id);
        for (const file of newFile) {
          const signURL = await GetSignURLService({
            fileName: file.file?.name as string,
            fileType: file.file?.type as string,
          });

          const upload = await UploadSignURLService({
            contentType: file.file?.type as string,
            file: file.file as File,
            signURL: signURL.signURL,
          });

          const createFile = await CreateFileOnDocKos02Service({
            url: signURL.originalURL,
            type: file.file?.type as string,
            docKos02Id: update.id,
          });
        }
      } else {
        if (!files) {
          throw new Error("กรุณาเลือกไฟล์รูปภาพแปลง");
        }
        if (files?.length === 0) {
          throw new Error("กรุณาเลือกไฟล์รูปภาพแปลง");
        }
        const create = await CreateDocKos2Service({
          numberOfPlotForKosCertificated:
            docKos2Data?.numberOfPlotForKosCertificated as string,
          marketingDetail: docKos2Data?.marketingDetail as string,
        });
        for (const file of files) {
          const signURL = await GetSignURLService({
            fileName: file.file?.name as string,
            fileType: file.file?.type as string,
          });

          const upload = await UploadSignURLService({
            contentType: file.file?.type as string,
            file: file.file as File,
            signURL: signURL.signURL,
          });

          const createFile = await CreateFileOnDocKos02Service({
            url: signURL.originalURL,
            type: file.file?.type as string,
            docKos02Id: create.id,
          });
        }

        router.push({
          pathname: `/kos02/${create.id}`,
        });
      }
      await docKos.refetch();
      Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: error.message,
      });
    }
  };

  const handleDeleteFile = async ({
    fileOnDocKos02Id,
    url,
  }: {
    fileOnDocKos02Id: string;
    url: string;
  }) => {
    try {
      Swal.fire({
        title: "กำลังลบ",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      if (!fileOnDocKos02Id) {
        const unDeleteFiles = files?.filter((file) => file.url !== url);
        setFiles(() => unDeleteFiles);
      } else {
        const deleteFile = await DeleteFileOnDocKos02Service({
          fileOnDocKos02Id: fileOnDocKos02Id,
        });
        await dockos02.refetch();
      }

      Swal.fire({
        icon: "success",
        title: "ลบไฟล์สำเร็จ",
        timer: 1500,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: error.message,
      });
    }
  };
  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center">
      <h2 className="w-80 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white lg:w-96">
        แผนผังแปลง
      </h2>
      <Form
        onSubmit={handleSumitDocKos2}
        className="lg: mt-10 flex w-full  flex-col items-center justify-start gap-3 border-b-2 border-b-super-main-color pb-10 lg:w-8/12 lg:rounded-lg lg:border-b-0 lg:p-5 lg:ring-2 lg:ring-third-color"
      >
        <TextField className="flex  w-11/12 flex-col items-center gap-2 lg:w-full ">
          <Label className="w-80 text-balance text-center text-lg font-semibold text-super-main-color lg:w-max">
            แปลงที่ขอรับ KOS ระบุให้ สอดคล้องกับแผนผังฟาร์ม{" "}
          </Label>
          <Label className="text-lg font-semibold text-super-main-color">
            ได้แก่แปลงที่ :{" "}
          </Label>
          <Input
            value={docKos2Data?.numberOfPlotForKosCertificated}
            onChange={(e) =>
              setDocKos2Data((prev) => {
                return {
                  ...prev,
                  numberOfPlotForKosCertificated: e.target.value,
                };
              })
            }
            required
            className="h-10 rounded-lg bg-white p-2 ring-1"
          />

          <FieldError className="text-red-700">กรุณาใส่ข้อมูล</FieldError>
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
          <Button
            className=" flex items-center justify-center gap-2 rounded-lg bg-third-color px-4 py-1 
          font-semibold text-white"
          >
            <CiImageOn />
            อัพโหลดรูปภาพแปลง
          </Button>
        </FileTrigger>
        {files && files?.length > 0 && (
          <div className="grid w-10/12 grid-cols-2">
            {files?.map((file, index) => {
              return (
                <div key={index} className="relative h-60 w-full">
                  <div
                    onClick={() => {
                      handleDeleteFile({
                        fileOnDocKos02Id: file.id as string,
                        url: file.url as string,
                      });
                    }}
                    className="absolute right-2 top-2 z-40 flex
                     cursor-pointer items-center justify-center gap-2 rounded-md bg-red-500 p-1 px-5 text-sm text-white"
                  >
                    ลบรูป <MdDelete />
                  </div>
                  <Image
                    onClick={() => {
                      window.open(file.url as string, "_blank");
                    }}
                    src={file.url as string}
                    fill
                    alt="รูปภาพแบบแปลง"
                    className="cursor-pointer object-cover"
                  />
                </div>
              );
            })}
          </div>
        )}
        <TextField className="mt-2 flex flex-col items-start gap-2 lg:w-full">
          <Label className="w-max text-balance text-center text-lg font-semibold text-super-main-color">
            การจัดการหลังการเก็บเกี่ยว และการตลาด :{" "}
          </Label>
          <TextArea
            onChange={(e) => {
              setDocKos2Data((prev) => {
                return {
                  ...prev,
                  marketingDetail: e.target.value,
                };
              });
            }}
            value={docKos2Data?.marketingDetail}
            placeholder="...อธิบายการตลาด"
            className="h-40 w-full rounded-lg p-3 ring-1 ring-blue-200 "
          />
        </TextField>
        <Button
          type="submit"
          className="flex items-center justify-center gap-3 rounded-lg bg-super-main-color px-10 py-1 
          text-base text-white drop-shadow-md"
        >
          <FaSave />
          บันทึก
        </Button>
      </Form>
    </div>
  );
}

export default Kos2Form;
