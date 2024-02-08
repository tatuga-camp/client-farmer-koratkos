import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Button,
  FieldError,
  FileTrigger,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { CiImageOn } from "react-icons/ci";
import { FaSave } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  CreateDocKos2Service,
  UpdateDocKos2Service,
} from "../../../../services/kos2";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetAllDocKosService } from "../../../../services/farmer";
import { useRouter } from "next/router";
type Kos2FormProps = {
  docKos: UseQueryResult<ResponseGetAllDocKosService, Error>;
  isUpdate?: boolean;
};
function Kos2Form({ docKos, isUpdate }: Kos2FormProps) {
  const [docKos2Data, setDocKos2Data] = useState<{
    file?: File;
    numberOfPlotForKosCertificated?: string;
    image?: string;
  }>();
  const router = useRouter();

  useEffect(() => {
    if (docKos.isSuccess && isUpdate) {
      setTimeout(() => {
        setDocKos2Data(() => {
          return {
            numberOfPlotForKosCertificated:
              docKos.data?.kos2?.numberOfPlotForKosCertificated,
            image: docKos.data.kos2.map,
          };
        });
      }, 500);
    }
  }, [docKos.isSuccess]);
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
          file: docKos2Data?.file as File,
          numberOfPlotForKosCertificated:
            docKos2Data?.numberOfPlotForKosCertificated as string,
        });
      } else {
        if (!docKos2Data?.file) {
          throw new Error("กรุณาเลือกไฟล์รูปภาพแปลง");
        }
        const create = await CreateDocKos2Service({
          file: docKos2Data?.file as File,
          numberOfPlotForKosCertificated:
            docKos2Data?.numberOfPlotForKosCertificated as string,
        });

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

  return (
    <div className="mt-10 flex flex-col items-center justify-center">
      <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white lg:w-96">
        แผนผังแปลง
      </h2>
      <Form
        onSubmit={handleSumitDocKos2}
        className="mt-10 flex w-full flex-col items-center justify-start gap-3 lg:w-96"
      >
        <Label className="w-80 text-balance text-center text-lg font-semibold text-super-main-color">
          แปลงที่ขอรับ KOS ระบุให้ สอดคล้องกับแผนผังฟาร์ม{" "}
        </Label>
        <TextField className="flex  w-11/12 flex-col items-center gap-2">
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
          <Button
            type="submit"
            className="flex items-center justify-center gap-3 rounded-lg bg-super-main-color px-10 py-1 
          text-base text-white drop-shadow-md"
          >
            <FaSave />
            บันทึก
          </Button>
        </TextField>
        <FileTrigger
          onSelect={(e) => {
            const file = e?.[0];
            const reader = new FileReader();
            reader.onload = function (e: ProgressEvent<FileReader>) {
              const result = e.target?.result;
              setDocKos2Data((prev) => {
                return {
                  ...prev,
                  image: result as string,
                };
              });
            };

            if (file) {
              reader.readAsDataURL(file);
            }
            setDocKos2Data((prev) => {
              return {
                ...prev,
                file: file,
              };
            });
          }}
        >
          <Button className=" flex items-center justify-center gap-2 rounded-lg bg-third-color px-4 py-1 font-semibold text-white">
            <CiImageOn />
            อัพโหลดรูปภาพแปลง
          </Button>
        </FileTrigger>
        <div className="relative mt-5 flex h-60 w-11/12 flex-col items-center justify-center overflow-hidden rounded-lg bg-slate-300 p-2 text-7xl text-white drop-shadow-md">
          {docKos2Data?.image ? (
            <Image
              onClick={() => {
                window.open(docKos2Data?.image, "_ blank");
              }}
              src={docKos2Data?.image as string}
              fill
              alt="รูปภาพแบบแปลง"
              className="object-contain"
            />
          ) : (
            <CiImageOn />
          )}
        </div>
      </Form>
    </div>
  );
}

export default Kos2Form;
