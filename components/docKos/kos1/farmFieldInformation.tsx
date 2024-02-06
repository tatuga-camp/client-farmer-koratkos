import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { BasicInformation } from "./basicInformation";
import { Button, Form, Input, Label, TextField } from "react-aria-components";
import ProviceComBox from "./combox/proviceComBox";
import AmphureComBox from "./combox/amphureComBox";
import TambonComBox from "./combox/tambonComBox";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
import { GetStaticMapService } from "../../../services/map";
import Image from "next/image";
import { backgroundImageBase64 } from "../../../data/base64Images";
import { useRouter } from "next/router";

function FarmFieldInformation() {
  const router = useRouter();
  const [baicInformation, setBasicInformation] = useState<
    BasicInformation | undefined
  >();
  const [loadingMap, setLoadingMap] = useState(false);
  const [position, setPosition] = useState({
    longitude: "",
    latitude: "",
  });
  const [map, setMap] = useState({
    mapTerrain: "",
    mapHybrid: "",
  });
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
    const farmFieldInformation = localStorage.getItem("farmFieldInformation");
    if (farmFieldInformation) {
      const parseFarmFieldInformation: BasicInformation =
        JSON.parse(farmFieldInformation);
      setBasicInformation(() => parseFarmFieldInformation);
    }
  }, []);

  const handleSummitFarmFieldInformation = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      localStorage.setItem(
        "farmFieldInformation",
        JSON.stringify(baicInformation),
      );
      router.push({
        pathname: "/create/kos1",
        query: { step: "farmFieldInformation" },
      });
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
          lat: position.latitude,
          lng: position.longitude,
        }),
        GetStaticMapService({
          maptype: "terrain",
          lat: position.latitude,
          lng: position.longitude,
        }),
      ]);
      setMap(() => {
        return {
          mapHybrid: hybrid.imageURL,
          mapTerrain: terrain.imageURL,
        };
      });
      setLoadingMap(() => false);
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
      pathname: "/create/kos1",
      query: { step: "basicInformation" },
    });
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white">
        ที่ตั้งสถานที่ผลิตพืชอินทรีย์
      </h2>
      <Form
        onSubmit={handleSummitFarmFieldInformation}
        className="mt-5 flex w-11/12 flex-col items-center justify-start gap-2"
      >
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
            className="h-10 w-full bg-slate-200 p-2 text-xl"
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
            className="h-10 w-full bg-slate-200 p-2 text-xl"
          />
        </TextField>

        <ProviceComBox
          baicInformation={baicInformation as BasicInformation}
          setBasicInformation={setBasicInformation}
        />

        <AmphureComBox
          selectProvinceId={baicInformation?.province?.originalId as number}
          baicInformation={baicInformation as BasicInformation}
          setBasicInformation={setBasicInformation}
        />

        <TambonComBox
          selectAmphureId={baicInformation?.amphure?.originalId as number}
          baicInformation={baicInformation as BasicInformation}
          setBasicInformation={setBasicInformation}
        />

        <section className="mt-10 flex w-full flex-col items-center justify-center gap-2">
          <Label className="text-xl font-semibold text-super-main-color ">
            พิกัดแปลง (UTM) 47/48 P :
          </Label>
          <TextField
            className="flex w-full items-center justify-center  gap-2"
            name="latitude "
            type="text"
            isRequired
          >
            <Label className="w-max text-xl font-bold text-super-main-color">
              Y :
            </Label>
            <Input
              onChange={(e) =>
                setPosition((prev) => ({ ...prev, latitude: e.target.value }))
              }
              value={position.latitude}
              className="h-10 w-40 bg-slate-200 p-2 text-xl"
            />
          </TextField>
          <TextField
            className="flex w-full items-center justify-center  gap-2"
            name="longitude "
            type="text"
            isRequired
          >
            <Label className="w-max text-xl font-bold text-super-main-color">
              X :
            </Label>
            <Input
              onChange={(e) =>
                setPosition((prev) => ({ ...prev, longitude: e.target.value }))
              }
              value={position.longitude}
              className="h-10 w-40 bg-slate-200 p-2 text-xl"
            />
          </TextField>

          {position.latitude && position.longitude && (
            <Button
              onPress={handleGetStaticMap}
              className=" rounded-lg bg-super-main-color px-2 py-2 text-white transition
             duration-100 hover:scale-105 active:scale-110"
              type="button"
            >
              ตรวจสอบแผนที่
            </Button>
          )}
          {loadingMap === true ? (
            <div className="grid h-40 w-full grid-cols-2 gap-2 ">
              <div className="h-full w-full animate-pulse bg-slate-500"></div>
              <div className="h-full w-full animate-pulse bg-slate-500"></div>
            </div>
          ) : (
            map.mapHybrid &&
            map.mapTerrain && (
              <div className="grid h-40 w-full grid-cols-2 gap-2 ">
                <div className="relative h-full w-full ">
                  <Image
                    src={`${map.mapHybrid}`}
                    alt="map"
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
                    src={map.mapTerrain}
                    alt="map"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </div>
            )
          )}
        </section>
        <div className="flex w-full items-center justify-center gap-2">
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
      </Form>
    </div>
  );
}

export default FarmFieldInformation;
