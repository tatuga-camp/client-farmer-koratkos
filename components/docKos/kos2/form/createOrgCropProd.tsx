import { UseQueryResult } from "@tanstack/react-query";
import React, { useState } from "react";

import { Button, Form, Input, Label, TextField } from "react-aria-components";
import { Calendar } from "primereact/calendar";
import { FaSave } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import Swal from "sweetalert2";
import {
  CreateOrgProdKos2Service,
  ResponseGetDocKos02Service,
} from "../../../../services/kos2";
import { useDeviceType } from "../../../../utils";
import PlantCombox from "../combox/plantCombox";

type OrgCropProdProps = {
  dockos02: UseQueryResult<ResponseGetDocKos02Service, Error>;
  setTriggerCreateOrgCropProdCalForKos2: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};
export type OrgCropProdCalForKos2Data = {
  plotNumber?: number;
  landArea?: number;
  plantType?: string;
  rangeDate?: Date[];
  yieldPerRai?: number;
  yearPlan?: string;
  seed?: string;
  source?: string;
};
function CreateOrgCropProd({
  dockos02,
  setTriggerCreateOrgCropProdCalForKos2,
}: OrgCropProdProps) {
  const deviceType = useDeviceType();
  const [orgCropProdCalForKos2s, setOrgCropProdCalForKos2s] =
    useState<OrgCropProdCalForKos2Data>();

  const handleCheckOrgCropProdCalForKos2 = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setOrgCropProdCalForKos2s((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummitOrgCropProdCalForKos2 = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        title: "กำลังบันทึกข้อมูล",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const rangeDate = orgCropProdCalForKos2s?.rangeDate?.map((date) =>
        date.toISOString(),
      );
      const create = await CreateOrgProdKos2Service({
        yearPlan: orgCropProdCalForKos2s?.yearPlan as string,
        landArea: orgCropProdCalForKos2s?.landArea as number,
        plantType: orgCropProdCalForKos2s?.plantType as string,
        rangeDate: rangeDate as string[],
        yieldPerRai: orgCropProdCalForKos2s?.yieldPerRai as number,
        docKos02Id: dockos02.data?.id as string,
        seed: orgCropProdCalForKos2s?.seed as string,
        source: orgCropProdCalForKos2s?.source as string,
        plotNumber: orgCropProdCalForKos2s?.plotNumber as number,
      });
      await dockos02.refetch();
      setTriggerCreateOrgCropProdCalForKos2(() => false);
      Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        timer: 1500,
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
    <div className="mt-10 flex w-full flex-col items-center justify-center">
      <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white lg:w-96">
        แผนการผลิตพืชอินทรีย์
      </h2>
      <Form
        onSubmit={handleSummitOrgCropProdCalForKos2}
        className="mt-5 flex w-11/12 flex-col items-center gap-4 lg:grid lg:grid-cols-2"
      >
        <section className="flex w-full flex-col gap-5 rounded-lg lg:p-5 lg:ring-2 lg:ring-third-color">
          <TextField className="flex w-80 items-center justify-start">
            <Label className="w-28 text-base font-semibold text-super-main-color">
              แปลงที่ :
            </Label>
            <Input
              required
              name="plotNumber"
              onChange={handleCheckOrgCropProdCalForKos2}
              value={orgCropProdCalForKos2s?.plotNumber}
              type="number"
              inputMode="numeric"
              className="w-10/12 rounded-lg p-3 ring-1 ring-gray-300"
              placeholder="ลำดับแปลง"
            />
          </TextField>
          <TextField
            isRequired
            className="flex w-80 flex-col  items-start gap-2"
          >
            <Label className="text-base font-semibold text-super-main-color">
              แผนการผลิตพืชอินทรีย์ ประจำปีการผลิต :
            </Label>
            <Calendar
              value={
                orgCropProdCalForKos2s?.yearPlan
                  ? new Date(orgCropProdCalForKos2s?.yearPlan)
                  : undefined
              }
              onChange={(e) => {
                setOrgCropProdCalForKos2s((prev: any) => ({
                  ...prev,
                  yearPlan: e.value,
                }));
              }}
              required
              className="w-10/12"
              view="year"
              dateFormat="yy"
              locale="th"
              touchUI={deviceType === "mobile" ? true : false}
            />
          </TextField>

          <TextField className="flex w-80  items-center justify-start gap-2 ">
            <Label className="w-20 text-base font-semibold text-super-main-color">
              พื้นที่ :
            </Label>
            <Input
              required
              name="landArea"
              onChange={handleCheckOrgCropProdCalForKos2}
              value={orgCropProdCalForKos2s?.landArea}
              type="number"
              inputMode="numeric"
              className="w-10/12 rounded-lg p-3 ring-1 ring-gray-300"
              placeholder="จำนวนไร่"
            />
            <span className="text-base font-semibold text-super-main-color">
              ไร่
            </span>
          </TextField>
          <PlantCombox
            orgCropProdCalForKos2s={orgCropProdCalForKos2s}
            setOrgCropProdCalForKos2s={setOrgCropProdCalForKos2s}
          />
          <TextField className="flex w-80  items-center justify-start gap-2 ">
            <Label className="w-20 text-base font-semibold text-super-main-color">
              เดือน :
            </Label>
            <Calendar
              value={
                orgCropProdCalForKos2s?.rangeDate
                  ? orgCropProdCalForKos2s.rangeDate.map(
                      (date) => new Date(date),
                    )
                  : undefined
              }
              onChange={(e) => {
                setOrgCropProdCalForKos2s((prev: any) => ({
                  ...prev,
                  rangeDate: e.value,
                }));
              }}
              required
              selectionMode="multiple"
              className="w-10/12"
              view="month"
              dateFormat="MM"
              locale="th"
              touchUI={deviceType === "mobile" ? true : false}
            />
          </TextField>
          <TextField className="flex w-80  items-center justify-start gap-2 ">
            <Label className="w-20 text-base font-semibold text-super-main-color">
              ผลผลิต :
            </Label>
            <Input
              name="yieldPerRai"
              onChange={handleCheckOrgCropProdCalForKos2}
              value={orgCropProdCalForKos2s?.yieldPerRai}
              required
              type="number"
              inputMode="numeric"
              className="w-40 rounded-lg p-3 ring-1 ring-gray-300"
              placeholder="ผลผลิต"
            />
            <span className="text-base font-semibold text-super-main-color">
              กก./ไร่
            </span>
          </TextField>
        </section>
        <section className="flex w-full flex-col gap-2 rounded-lg lg:h-full lg:p-5 lg:ring-2 lg:ring-third-color">
          <TextField className="flex w-80 flex-col  items-start justify-center gap-2 ">
            <Label className="w-full text-base font-semibold text-super-main-color">
              เมล็ด/ส่วนขยายพันธุ์พืช :
            </Label>
            <Input
              name="seed"
              onChange={handleCheckOrgCropProdCalForKos2}
              value={orgCropProdCalForKos2s?.seed}
              required
              className="w-10/12 rounded-lg p-3 ring-1 ring-gray-300"
              placeholder="เมล็ด"
            />
          </TextField>

          <TextField className="flex w-80 flex-col  items-start justify-center gap-2 ">
            <Label className="w-full text-base font-semibold text-super-main-color">
              แหล่งที่มา :
            </Label>
            <Input
              name="source"
              onChange={handleCheckOrgCropProdCalForKos2}
              value={orgCropProdCalForKos2s?.source}
              required
              className="w-10/12 rounded-lg p-3 ring-1 ring-gray-300"
              placeholder="แหล่งที่มา"
            />
          </TextField>
        </section>
        <section className="flex w-full items-center justify-center gap-2 lg:col-span-2">
          <Button
            type="button"
            onPress={() => {
              setTriggerCreateOrgCropProdCalForKos2(() => false);
            }}
            className="flex h-10 w-40 items-center justify-center gap-3 rounded-lg bg-red-600
        text-xl text-white drop-shadow-md"
          >
            <IoMdCloseCircle />
            ยกเลิก
          </Button>
          <Button
            type="submit"
            className="flex h-10 w-40 items-center justify-center gap-3 rounded-lg bg-super-main-color
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

export default CreateOrgCropProd;
