import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { BasicInformation, TypeSetBasicInformation } from "./basicInformation";
import { Button, Form, Input, Label, TextField } from "react-aria-components";
import ProviceComBox from "../combox/proviceComBox";
import AmphureComBox from "../combox/amphureComBox";
import TambonComBox from "../combox/tambonComBox";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
import Image from "next/image";
import { backgroundImageBase64 } from "../../../../data/base64Images";
import { useRouter } from "next/router";
import { Calendar } from "primereact/calendar";
import { addLocale } from "primereact/api";
import { GetStaticMapService } from "../../../../services/map";
import { Step } from "../../../../pages/create/kos01";
import { UseQueryResult } from "@tanstack/react-query";
import {
  ResponseGetAllDocKos1Service,
  UpdateFarmKos01Service,
} from "../../../../services/kos1";
import { IoMdCloseCircle } from "react-icons/io";
import { FaSave } from "react-icons/fa";
import Link from "next/link";
import { useDeviceType, useGeolocation } from "../../../../utils";

type FarmFieldInformationProps = {
  isUpdate?: boolean;
  docKos1?: UseQueryResult<ResponseGetAllDocKos1Service, Error>;
};
function FarmFieldInformation({
  isUpdate,
  docKos1,
}: FarmFieldInformationProps) {
  const router = useRouter();
  const deviceType = useDeviceType();
  const { location, error, getLocation, isLoading } = useGeolocation();
  const [baicInformation, setBasicInformation] = useState<
    | (BasicInformation & {
        certRequestDate?: Date;
        longitude?: string;
        latitude?: string;
        mapTerrain?: string;
        mapHybrid?: string;
      })
    | undefined
  >();
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (docKos1?.isSuccess) {
      setBasicInformation(() => {
        return {
          address: docKos1.data?.farmKos1?.address as string,
          moo: docKos1.data?.farmKos1?.villageNumber as string,
          province: {
            name_th: docKos1.data?.farmKos1?.province as string,
          },
          amphure: {
            name_th: docKos1.data?.farmKos1?.district as string,
          },
          tambon: {
            name_th: docKos1.data?.farmKos1?.subdistrict as string,
          },
          certRequestDate: docKos1.data?.farmKos1?.certRequestDate,
          longitude: docKos1.data?.farmKos1?.longitude as string,
          latitude: docKos1.data?.farmKos1?.latitude as string,
          mapTerrain: docKos1.data?.farmKos1?.mapTerrain as string,
          mapHybrid: docKos1.data?.farmKos1?.mapHybrid as string,
        };
      });
    }
  }, [docKos1?.isSuccess]);
  const handleChangeOnBasicInformation = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setBasicInformation((prev: any) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  useEffect(() => {
    if (location) {
      setBasicInformation((prev: any) => {
        return {
          ...prev,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
        };
      });
    }
  }, [location]);

  useEffect(() => {
    const farmFieldInformation = localStorage.getItem("farmFieldInformation");

    if (farmFieldInformation) {
      const parseFarmFieldInformation = JSON.parse(farmFieldInformation);
      setBasicInformation(() => parseFarmFieldInformation);
    }
  }, []);

  const handleSummitFarmFieldInformation = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!baicInformation?.mapHybrid || !baicInformation?.mapTerrain) {
        throw new Error(
          "กรุณาตรวจสอบพิกัดแปลง (UTM) 47/48 P และกดตรวจสอบแผนที่",
        );
      }

      if (isUpdate) {
        Swal.fire({
          text: "กำลังบันทึกข้อมูล",
          html: "กรุณารอสักครู่",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });
        await UpdateFarmKos01Service({
          body: {
            address: baicInformation?.address,
            villageNumber: baicInformation?.moo,
            subdistrict: baicInformation?.tambon?.name_th,
            district: baicInformation?.amphure?.name_th,
            province: baicInformation?.province?.name_th,
            latitude: baicInformation?.latitude,
            longitude: baicInformation?.longitude,
            certRequestDate: baicInformation?.certRequestDate,
            mapTerrain: baicInformation?.mapTerrain,
            mapHybrid: baicInformation?.mapHybrid,
          },
        });
        router.push({
          pathname: `/kos01/${docKos1?.data?.id}`,
        });
        await docKos1?.refetch();
        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          text: "บันทึกข้อมูลสำเร็จ",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        localStorage.setItem(
          "farmFieldInformation",
          JSON.stringify(baicInformation),
        );

        router.push({
          pathname: "/create/kos01",
          query: { step: "productionInformation" as Step },
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  const handleGetStaticMap = async () => {
    try {
      setLoadingMap(() => true);
      const [hybrid, terrain] = await Promise.all([
        GetStaticMapService({
          maptype: "hybrid",
          lat: baicInformation?.latitude as string,
          lng: baicInformation?.longitude as string,
        }),
        GetStaticMapService({
          maptype: "terrain",
          lat: baicInformation?.latitude as string,
          lng: baicInformation?.longitude as string,
        }),
      ]);

      setBasicInformation((prev: any) => {
        return {
          ...prev,
          mapHybrid: hybrid.imageURL,
          mapTerrain: terrain.imageURL,
        };
      });
      setTimeout(() => {
        setLoadingMap(() => false);
      }, 2000);
    } catch (error: any) {
      setLoadingMap(() => false);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  const handleClickOnBack = () => {
    router.push({
      pathname: "/create/kos01",
      query: { step: "basicInformation" as Step },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white lg:w-96">
        ที่ตั้งสถานที่ผลิตพืชอินทรีย์
      </h2>
      <Form
        onSubmit={handleSummitFarmFieldInformation}
        className="mt-5 flex w-11/12 flex-col items-center justify-start gap-5  lg:grid 
         lg:grid-cols-2 lg:place-items-start lg:gap-12 "
      >
        <section className="flex h-full flex-col gap-4 lg:w-full lg:rounded-xl lg:p-7 lg:ring-2 lg:ring-third-color">
          <TextField
            className="flex w-full items-center justify-center  gap-2"
            name="address"
            type="text"
            isRequired
          >
            <Label className="w-40 text-xl font-bold text-super-main-color">
              ที่อยู่เลขที่ :
            </Label>
            <Input
              onChange={handleChangeOnBasicInformation}
              value={baicInformation?.address}
              className="h-10 w-full  p-2 text-xl"
            />
          </TextField>
          <TextField
            className="flex w-full items-center justify-center  gap-2"
            name="moo"
            type="text"
            isRequired
          >
            <Label className="w-40 text-xl font-bold text-super-main-color">
              หมู่ที่ :
            </Label>
            <Input
              onChange={handleChangeOnBasicInformation}
              value={baicInformation?.moo}
              className="h-10 w-full  p-2 text-xl"
            />
          </TextField>

          <ProviceComBox
            baicInformation={baicInformation as BasicInformation}
            setBasicInformation={setBasicInformation as TypeSetBasicInformation}
          />

          <AmphureComBox
            selectProvinceId={baicInformation?.province?.originalId as number}
            baicInformation={baicInformation as BasicInformation}
            setBasicInformation={setBasicInformation as TypeSetBasicInformation}
          />

          <TambonComBox
            selectAmphureId={baicInformation?.amphure?.originalId as number}
            baicInformation={baicInformation as BasicInformation}
            setBasicInformation={setBasicInformation as TypeSetBasicInformation}
          />
        </section>

        <section className="mt-5 flex h-full flex-col gap-4 lg:mt-0 lg:w-full lg:rounded-xl lg:p-7 lg:ring-2 lg:ring-third-color">
          <Label className="text-xl font-semibold text-super-main-color ">
            พิกัดแปลง:
          </Label>
          <button
            disabled={isLoading}
            onClick={getLocation}
            className="rounded-lg bg-super-main-color px-2 py-2 text-white drop-shadow-md transition duration-1000
            hover:scale-105 active:scale-110"
          >
            {isLoading ? "กำลังโหลด" : "ใช้ตำแหน่งปัจจุบัน"}
          </button>
          <TextField
            className="flex w-full items-center justify-start gap-2  "
            name="latitude "
            type="text"
            isRequired
          >
            <Label className="w-max text-xl font-bold text-super-main-color">
              Latitude:
            </Label>
            <Input
              onChange={(e) =>
                setBasicInformation((prev: any) => ({
                  ...prev,
                  latitude: e.target.value,
                }))
              }
              value={baicInformation?.latitude}
              className="h-10 w-40  p-2 text-xl"
            />
          </TextField>
          <TextField
            className="flex w-full items-center justify-start gap-2  "
            name="longitude "
            type="text"
            isRequired
          >
            <Label className="w-max text-xl font-bold text-super-main-color">
              Longitude:
            </Label>
            <Input
              onChange={(e) =>
                setBasicInformation((prev: any) => ({
                  ...prev,
                  longitude: e.target.value,
                }))
              }
              value={baicInformation?.longitude}
              className="h-10 w-40  p-2 text-xl"
            />
          </TextField>

          {baicInformation?.latitude && baicInformation?.longitude && (
            <Button
              isDisabled={loadingMap}
              onPress={handleGetStaticMap}
              className={`${(!baicInformation.mapHybrid || !baicInformation.mapTerrain) && "animate-pulse "}rounded-lg bg-super-main-color px-2 py-2 text-white drop-shadow-md transition duration-1000
            hover:scale-105 active:scale-110`}
              type="button"
            >
              ตรวจสอบแผนที่
            </Button>
          )}
          {loadingMap === true ? (
            <div className="grid h-60 w-full grid-cols-2 gap-2 ">
              <div className="h-full w-full animate-pulse bg-slate-500"></div>
              <div className="h-full w-full animate-pulse bg-slate-500"></div>
            </div>
          ) : (
            baicInformation?.mapHybrid &&
            baicInformation?.mapTerrain && (
              <div className="grid h-[35rem] w-full grid-cols-1 gap-2 lg:h-60 lg:grid-cols-2 ">
                <div className="relative h-full w-full ">
                  <Image
                    src={`${baicInformation?.mapHybrid}`}
                    alt="baicInformation"
                    fill
                    quality={50}
                    priority
                    placeholder="blur"
                    blurDataURL={backgroundImageBase64}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative h-full w-full ">
                  <Image
                    src={baicInformation?.mapTerrain}
                    alt="baicInformation"
                    fill
                    quality={50}
                    placeholder="blur"
                    blurDataURL={backgroundImageBase64}
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </div>
            )
          )}
        </section>
        <section
          className="col-span-2 mt-10 flex w-full flex-col items-center 
        justify-start gap-2 lg:mt-0 lg:rounded-xl lg:p-7 lg:ring-2 lg:ring-third-color  "
        >
          <h2 className="mt-10 w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white">
            วันที่ยื่นขอการรับรอง
          </h2>
          <section className="flex w-full items-center justify-center gap-2">
            <Label className="text-lg font-medium text-super-main-color">
              วัน/เดือน/ปี
            </Label>
            <Calendar
              required
              locale="th"
              className=" h-10 w-40 text-center outline-none    "
              placeholder="วันที่ยื่นขอการรับรอง"
              value={
                baicInformation?.certRequestDate
                  ? new Date(baicInformation.certRequestDate)
                  : undefined
              }
              onChange={(e) =>
                setBasicInformation((prev: any) => {
                  return {
                    ...prev,
                    certRequestDate: e.value,
                  };
                })
              }
              dateFormat="dd/mm/yy"
              touchUI={deviceType === "mobile" ? true : false}
            />
          </section>
        </section>
        {isUpdate ? (
          <div className="mt-20 flex w-full justify-center gap-2 lg:col-span-2 lg:mt-0">
            <Link
              href={`/kos01/${docKos1?.data?.id}`}
              className="flex items-center justify-center gap-3 rounded-lg bg-red-600 px-10 py-2 
          text-xl text-white drop-shadow-md"
            >
              <IoMdCloseCircle />
              ยกเลิก
            </Link>
            <Button
              type="submit"
              className="flex items-center justify-center gap-3 rounded-lg bg-super-main-color px-10 py-2 
          text-xl text-white drop-shadow-md"
            >
              <FaSave />
              บันทึก
            </Button>
          </div>
        ) : (
          <div className="mt-20 flex w-full justify-center gap-2 lg:col-span-2 lg:mt-0">
            <Button
              type="button"
              onPress={handleClickOnBack}
              className={`mt-5 flex items-center justify-center gap-2 rounded-xl bg-third-color 
              px-5 py-2 text-lg font-semibold text-white drop-shadow-lg 
                transition duration-100 hover:bg-super-main-color 
                active:scale-110 active:ring-2 active:ring-super-main-color`}
            >
              <MdOutlineNavigateBefore /> ย้อนกลับ
            </Button>
            <Button
              type="submit"
              className={`mt-5 flex items-center justify-center gap-2 rounded-xl bg-third-color px-10
               py-2 text-lg  font-semibold text-white drop-shadow-lg 
                transition duration-100 hover:bg-super-main-color 
                active:scale-110 active:ring-2 active:ring-super-main-color`}
            >
              ถัดไป <MdOutlineNavigateNext />
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}

export default FarmFieldInformation;
