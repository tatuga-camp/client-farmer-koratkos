import { Calendar } from "primereact/calendar";
import React, { useState } from "react";
import { Button, Form, Input, Label, TextField } from "react-aria-components";
import { FaSave } from "react-icons/fa";

import { UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { FactoryKos4, Pagination } from "../../../model";
import { ResponseGetAllDocKosService } from "../../../services/farmer";
import {
  CreateDocKos04Service,
  CreateFatorKos4Service,
} from "../../../services/kos4";
import { useDeviceType } from "../../../utils";
import TypeAmountCombox from "./combox/typeAmountCombox";
type CreateActivityProps = {
  docKos?: UseQueryResult<ResponseGetAllDocKosService, Error>;
  factors?: UseQueryResult<Pagination<FactoryKos4>, Error>;
  setTriggerCreateFactor?: React.Dispatch<React.SetStateAction<boolean>>;
};
function CreateFactor({
  docKos,
  factors,
  setTriggerCreateFactor,
}: CreateActivityProps) {
  const deviceType = useDeviceType();
  const router = useRouter();
  const [factor, setFactor] = useState<{
    purchaseDate?: string;
    prodFactorTypes?: string;
    amount?: number;
    source?: string;
    typeAmount?: string;
  }>({
    typeAmount: "กิโลกรัม",
  });
  const handleChangeFator = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFactor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummitFator = async (e: React.FormEvent) => {
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

      let docKos04Id = "";
      if (setTriggerCreateFactor) {
        docKos04Id = router.query.kos04Id as string;
      } else {
        const docKos4 = await CreateDocKos04Service();
        docKos04Id = docKos4.id;
      }

      const createFactor = await CreateFatorKos4Service({
        purchaseDate: factor?.purchaseDate as string,
        prodFactorTypes: factor?.prodFactorTypes as string,
        amount: factor?.amount as number,
        source: factor?.source as string,
        docKos04Id: docKos04Id,
        typeAmount: factor?.typeAmount as string,
      });

      if (setTriggerCreateFactor) {
        await factors?.refetch();
        setTriggerCreateFactor(() => false);
      } else {
        await docKos?.refetch();
        router.push({
          pathname: `/kos04/${docKos04Id}`,
        });
      }

      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",

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
    <div className="flex w-full flex-col items-center pb-5 ">
      <Form
        onSubmit={handleSummitFator}
        className="mt-5 flex w-80 flex-col items-center justify-start gap-5  lg:w-96 lg:rounded-lg lg:p-5 lg:ring-2 lg:ring-third-color"
      >
        <Label className="mt-10 w-80 rounded-lg bg-third-color  py-2 text-center text-lg font-bold text-white">
          เพิ่มปัจจัยการผลิต
        </Label>

        <TextField className="flex w-80 flex-col  items-start justify-start gap-2 ">
          <Label className="w-max text-xl font-semibold text-super-main-color">
            วันที่(ที่ซื้อ/ได้มา) :
          </Label>
          <Calendar
            required
            className="w-full"
            dateFormat="dd/MM/yy"
            value={factor?.purchaseDate ? new Date(factor?.purchaseDate) : null}
            onChange={(e) => {
              setFactor((prev) => ({
                ...prev,
                purchaseDate: e.target.value?.toISOString(),
              }));
            }}
            locale="th"
            touchUI={deviceType === "mobile" ? true : false}
          />
        </TextField>
        <TextField className="flex w-80  flex-col items-center justify-start">
          <Label className="w-full text-left text-xl font-semibold text-super-main-color">
            ชนิดของปัจจัย :
          </Label>
          <Input
            required
            name="prodFactorTypes"
            onChange={handleChangeFator}
            value={factor?.prodFactorTypes}
            type="text"
            className="w-full rounded-lg p-3 ring-1 ring-gray-300"
          />
        </TextField>

        <TextField className="flex w-80  flex-col items-center justify-start">
          <Label className="w-full text-left text-xl font-semibold text-super-main-color">
            ปริมาณ :
          </Label>
          <div className="flex w-full items-start justify-center gap-2">
            <Input
              required
              name="amount"
              onChange={handleChangeFator}
              value={factor?.amount}
              type="number"
              inputMode="numeric"
              className="h-12 w-full rounded-lg p-3 ring-1 ring-gray-300"
            />
            <TypeAmountCombox factor={factor} setFactor={setFactor} />
          </div>
        </TextField>
        <TextField className="flex w-80  flex-col items-center justify-start">
          <Label className="w-full text-left text-xl font-semibold text-super-main-color">
            แหล่งที่มา :
          </Label>
          <Input
            required
            name="source"
            onChange={handleChangeFator}
            value={factor?.source}
            type="text"
            className="w-full rounded-lg p-3 ring-1 ring-gray-300"
          />
        </TextField>
        <section className="flex w-full justify-center gap-2">
          {setTriggerCreateFactor && (
            <Button
              type="button"
              onPress={() => setTriggerCreateFactor(() => false)}
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

export default CreateFactor;
