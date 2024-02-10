import React, { useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import CreatePlantKos1, { PlantData } from "./createPlantKos1";
import { UseQueryResult } from "@tanstack/react-query";
import {
  DeletePlantKos1Service,
  ResponseGetAllDocKos1Service,
} from "../../../../services/kos1";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";
import { GiWeight } from "react-icons/gi";
import { TbToolsKitchen } from "react-icons/tb";
import UpdatePlantKos1 from "./updatePlantKos1";
import Swal from "sweetalert2";

type PlantKos1Type = {
  farmKOS1Id: string;
  docKos1: UseQueryResult<ResponseGetAllDocKos1Service, Error>;
};
function CardPlantKos1({ farmKOS1Id, docKos1 }: PlantKos1Type) {
  const [triggerCreatePlant, setTriggerCreatePlant] = useState(false);
  const [triggerUpdatePlant, setTriggerUpdatePlant] = useState(false);
  const [selectUpdatePlant, setSelectUpdatePlant] = useState<
    (PlantData & { id: string }) | undefined
  >();
  if (triggerCreatePlant) {
    return (
      <div className="flex w-full justify-center">
        <CreatePlantKos1
          docKos1={docKos1}
          farmKOS1Id={farmKOS1Id}
          setTriggerCreatePlant={setTriggerCreatePlant}
        />
      </div>
    );
  }
  if (triggerUpdatePlant && selectUpdatePlant) {
    return (
      <div className="flex w-full justify-center">
        <UpdatePlantKos1
          setTriggerUpdatePlant={setTriggerUpdatePlant}
          docKos1={docKos1}
          setSelectUpdatePlant={setSelectUpdatePlant}
          selectUpdatePlant={selectUpdatePlant}
        />
      </div>
    );
  }

  const handleDeletePlant = async ({ plantId }: { plantId: string }) => {
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
        const deletePlant = await DeletePlantKos1Service({
          plantKOS1Id: plantId,
        });
        await docKos1.refetch();
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
    <div className="flex w-full flex-col items-center justify-center font-Anuphan">
      <div className="flex w-full flex-col items-center justify-start">
        <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white lg:w-96">
          กระบวนการผลิต
        </h2>
        <button
          onClick={() => {
            setTriggerCreatePlant(() => true);
          }}
          className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-super-main-color px-5 py-1 text-xl
     font-semibold text-white drop-shadow-md transition duration-150 hover:scale-105 active:scale-110"
        >
          <IoMdAddCircleOutline />
          เพิ่มชนิดพืช
        </button>
        <ul className="mt-10 flex w-full flex-col  items-center justify-center gap-7 lg:grid lg:grid-cols-3 lg:p-10">
          {docKos1.data?.plantKOS1s.map((plant, index) => {
            const seasonProd = plant.seasonProd.map((time) => {
              const date = new Date(time);
              return date.toLocaleDateString("th-TH", {
                month: "short",
              });
            });
            const expHarvestDate = new Date(
              plant.expHarvestDate,
            ).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <li
                key={index}
                className="flex h-60 w-10/12 flex-col items-center gap-1 rounded-lg bg-[#F1E4C3] p-2 drop-shadow-md"
              >
                <section className="flex w-full justify-between">
                  <h1
                    className="flex h-10 items-center justify-center
                     rounded-2xl bg-super-main-color px-3  text-lg font-bold text-white"
                  >
                    ลำดับที่ {index + 1}
                  </h1>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectUpdatePlant(() => {
                          return {
                            id: plant.id,
                            plant: plant.plant,
                            raiTotal: Number(plant.raiTotal),
                            annualProdCycles: plant.annualProdCycles.toString(),
                            seasonProd: plant.seasonProd.map(
                              (time) => new Date(time),
                            ),
                            expYieldAmt: plant.expYieldAmt,
                            expHarvestDate: new Date(plant.expHarvestDate),
                          };
                        });
                        setTriggerUpdatePlant(() => true);
                      }}
                      className="flex flex-col items-center justify-center gap-1"
                    >
                      <div className="rounded-lg bg-[#597E52] p-2 text-white">
                        <AiFillEdit />
                      </div>
                      <span className="text-sm font-semibold">แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleDeletePlant({ plantId: plant.id })}
                      className="flex flex-col items-center justify-center gap-1"
                    >
                      <div className="rounded-lg bg-red-700 p-2 text-white">
                        <MdDelete />
                      </div>
                      <span className="text-sm font-semibold">ลบ</span>
                    </button>
                  </div>
                </section>
                <section className="flex w-full flex-col items-center justify-center gap-1">
                  <h3 className="w-40 truncate text-center text-3xl font-semibold text-super-main-color">
                    {plant.plant}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-third-color">
                    <span>พื้นที่ {plant.raiTotal} ไร่</span>
                    <span>ผลิต {plant.annualProdCycles} รอบ/ปี</span>
                  </div>
                </section>
                <section className="mt-5 flex w-full justify-center gap-2">
                  <div className="flex w-max items-center justify-center gap-2 ">
                    <div className="rounded-full bg-super-main-color p-1 text-sm text-white">
                      <FaCalendarAlt />
                    </div>
                    <span className="font-semibold text-super-main-color">
                      {seasonProd[0]} - {seasonProd[1]}
                    </span>
                  </div>
                  <div className="flex w-max items-center justify-center gap-2">
                    <div className="rounded-full bg-super-main-color p-1 text-sm text-white">
                      <GiWeight />
                    </div>
                    <span className="font-semibold text-super-main-color">
                      {plant.expYieldAmt.toLocaleString()} กก.
                    </span>
                  </div>
                </section>
                <div className="mt-2 flex w-max items-center justify-center gap-2">
                  <div className="rounded-full bg-super-main-color p-1 text-sm text-white">
                    <TbToolsKitchen />
                  </div>
                  <span className="font-semibold text-super-main-color">
                    เก็บเกี่ยว : {expHarvestDate}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default CardPlantKos1;
