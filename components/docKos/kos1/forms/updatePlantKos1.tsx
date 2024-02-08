import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useState } from "react";
import { Button, Form, Input, Label, TextField } from "react-aria-components";
import { FaSave } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import Swal from "sweetalert2";
import {
  CreatePlantKos1Service,
  ResponseGetAllDocKos1Service,
  UpdatePlantKos1Service,
} from "../../../../services/kos1";
import { useRouter } from "next/router";
import { UseQueryResult } from "@tanstack/react-query";
import { PlantData } from "./createPlantKos1";
import { useDeviceType } from "../../../../utils";
type BasicInformationProps = {
  docKos1: UseQueryResult<ResponseGetAllDocKos1Service, Error>;
  setSelectUpdatePlant: React.Dispatch<
    React.SetStateAction<(PlantData & { id: string }) | undefined>
  >;
  selectUpdatePlant: PlantData & { id: string };
  setTriggerUpdatePlant: React.Dispatch<React.SetStateAction<boolean>>;
};
function UpdatePlantKos1({
  docKos1,
  selectUpdatePlant,
  setTriggerUpdatePlant,
  setSelectUpdatePlant,
}: BasicInformationProps) {
  const router = useRouter();
  const deviceType = useDeviceType();
  const [createPlant, setCreatePlant] = useState<PlantData>(
    () => selectUpdatePlant,
  );

  const handleChangeCreatePlant = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatePlant((prev: any) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSummitCreatePlant = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (
        !createPlant?.plant ||
        !createPlant?.raiTotal ||
        !createPlant?.annualProdCycles ||
        !createPlant?.seasonProd ||
        !createPlant?.expHarvestDate ||
        !createPlant?.expYieldAmt
      ) {
        throw new Error("กรุณากรอกข้อมูลให้ครบ");
      }

      const seasonProds = createPlant?.seasonProd.map((value) =>
        value.toISOString(),
      );

      const update = await UpdatePlantKos1Service({
        query: {
          plantKOS1Id: selectUpdatePlant.id,
        },
        body: {
          plant: createPlant?.plant,
          raiTotal: createPlant?.raiTotal,
          annualProdCycles: createPlant?.annualProdCycles,
          seasonProd: seasonProds,
          expHarvestDate: createPlant?.expHarvestDate,
          expYieldAmt: createPlant?.expYieldAmt,
        },
      });

      await docKos1.refetch();
      setTriggerUpdatePlant(() => false);
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "บันทึกข้อมูลสำเร็จ",
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
    <div className="flex w-full flex-col items-center justify-start font-Anuphan lg:w-96 ">
      <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white">
        แก้ไขเชนิดพืช : {selectUpdatePlant.plant}
      </h2>
      <Form
        onSubmit={handleSummitCreatePlant}
        className="mt-5 flex flex-col items-center justify-start gap-4"
      >
        <TextField isRequired className="flex items-center justify-start gap-2">
          <Label className="text-xl font-semibold text-super-main-color">
            ชนิดพืช :
          </Label>
          <Input
            required
            name="plant"
            onChange={handleChangeCreatePlant}
            value={createPlant?.plant}
            type="text"
            className="h-10 w-40 rounded-lg bg-white p-2 ring-1 ring-slate-400"
          />
        </TextField>
        <TextField isRequired className="flex items-center justify-start gap-2">
          <Label className="text-xl font-semibold text-super-main-color">
            พื้นที่ (ไร่) :
          </Label>
          <Input
            name="raiTotal"
            onChange={handleChangeCreatePlant}
            value={createPlant?.raiTotal}
            type="number"
            inputMode="numeric"
            className="h-10 w-40 rounded-lg bg-white p-2 ring-1 ring-slate-400"
          />
        </TextField>
        <TextField
          isRequired
          className="mt-5 flex w-10/12 flex-col items-start justify-center gap-2"
        >
          <Label className="text-xl font-semibold text-super-main-color">
            จำนวนรอบการผลิต/ปี :
          </Label>
          <Input
            name="annualProdCycles"
            onChange={handleChangeCreatePlant}
            value={createPlant?.annualProdCycles}
            type="number"
            inputMode="numeric"
            className="h-10 w-full rounded-lg bg-white p-2 ring-1 ring-slate-400"
          />
        </TextField>
        <div className="flex w-10/12 flex-col items-start justify-center gap-2">
          <Label className="text-xl font-semibold text-super-main-color">
            ช่วงเวลาการผลิต (เดือน) :
          </Label>

          <Calendar
            required
            value={createPlant?.seasonProd}
            onChange={(e) =>
              setCreatePlant((prev: any) => ({ ...prev, seasonProd: e.value }))
            }
            locale="th"
            className=" h-12 w-full overflow-hidden rounded-lg ring-1 ring-slate-400"
            selectionMode="range"
            touchUI={deviceType === "mobile" ? true : false}
            placeholder="เลือกช่วงเดือน"
            view="month"
            dateFormat="MM"
          />
        </div>
        <section className="flex w-10/12 flex-col items-start justify-center gap-2">
          <Label className="text-xl font-semibold text-super-main-color">
            จำนวนรอบการผลิต/ปี :
          </Label>
          <Calendar
            required
            value={createPlant?.expHarvestDate}
            onChange={(e) =>
              setCreatePlant((prev: any) => ({
                ...prev,
                expHarvestDate: e.value,
              }))
            }
            locale="th"
            className=" h-12 w-full overflow-hidden rounded-lg ring-1 ring-slate-400"
            touchUI={deviceType === "mobile" ? true : false}
            placeholder="เลือกวันเดือนปี"
            dateFormat="dd/MM/yy"
          />
        </section>
        <TextField
          isRequired
          className="flex w-10/12 flex-col items-start justify-center gap-2"
        >
          <Label className="text-xl font-semibold text-super-main-color">
            ปริมาณผลผลิตที่คาดว่า จะได้รับ (กก.) :
          </Label>
          <Input
            name="expYieldAmt"
            onChange={handleChangeCreatePlant}
            value={createPlant?.expYieldAmt}
            type="number"
            inputMode="numeric"
            className="h-10 w-full rounded-lg bg-white p-2 ring-1 ring-slate-400"
          />
        </TextField>
        <div className="mt-20 flex gap-2">
          <Button
            type="button"
            onPress={() => {
              setTriggerUpdatePlant(() => false);
            }}
            className="flex items-center justify-center gap-3 rounded-lg bg-red-600 px-10 py-2 
        text-xl text-white drop-shadow-md"
          >
            <IoMdCloseCircle />
            ยกเลิก
          </Button>
          <Button
            type="submit"
            className="flex items-center justify-center gap-3 rounded-lg bg-super-main-color px-10 py-2 
        text-xl text-white drop-shadow-md"
          >
            <FaSave />
            บันทึก
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default UpdatePlantKos1;
