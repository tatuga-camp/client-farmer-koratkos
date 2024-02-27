import React, { ChangeEventHandler, useState } from "react";
import {
  Button,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "react-aria-components";
import { Calendar } from "primereact/calendar";
import { FaSave } from "react-icons/fa";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetAllDocKosService } from "../../../services/farmer";
import { useDeviceType } from "../../../utils";
import {
  CreateDocKos05Service,
  CreateHarvestLogKos5Service,
  UpdateHarvestLogKos5Service,
} from "../../../services/kos5";
import { HarvestLogDocKos5, Pagination } from "../../../model";

type CreateActivityProps = {
  setTriggerUpdateHarvestLog: React.Dispatch<React.SetStateAction<boolean>>;
  harvestLogs: UseQueryResult<Pagination<HarvestLogDocKos5>, Error>;
  selectHarvestLog: HarvestLogDocKos5 | undefined;
};
function UpdateHarvestLog({
  setTriggerUpdateHarvestLog,
  harvestLogs,
  selectHarvestLog,
}: CreateActivityProps) {
  const deviceType = useDeviceType();
  const router = useRouter();
  const [harvestLog, setHarvestLog] = useState<{
    plotNumber?: number;
    harvestDate?: string;
    plantType?: string;
    amount?: number;
    marketing?: string;
  }>({
    plotNumber: selectHarvestLog?.plotNumber,
    harvestDate: selectHarvestLog?.harvestDate,
    plantType: selectHarvestLog?.plantType,
    amount: selectHarvestLog?.amount,
    marketing: selectHarvestLog?.marketing,
  });
  const handleChangeCreateHarvest = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setHarvestLog((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummitForm = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        icon: "info",
        title: "กำลังบันทึกข้อมูล",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const update = await UpdateHarvestLogKos5Service({
        query: {
          harvestLogKos5Id: selectHarvestLog?.id as string,
        },
        body: {
          plotNumber: harvestLog?.plotNumber as number,
          harvestDate: harvestLog?.harvestDate as string,
          plantType: harvestLog?.plantType as string,
          amount: harvestLog?.amount as number,
          marketing: harvestLog?.marketing as string,
        },
      });
      await harvestLogs.refetch();
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        timer: 1500,
      });
      setTriggerUpdateHarvestLog(() => false);
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
        onSubmit={handleSummitForm}
        className="mt-5 flex w-80 flex-col items-center justify-start gap-5 lg:mt-5 lg:w-96 lg:rounded-lg lg:p-5 lg:ring-2 lg:ring-third-color"
      >
        <Label className="mt-10 w-80 rounded-lg bg-third-color  py-2 text-center text-lg font-bold text-white">
          เพิ่มบันทึกการเก็บเกี่ยว
        </Label>
        <TextField className="flex w-80  flex-col items-center justify-start">
          <Label className="w-full text-left text-xl font-semibold text-super-main-color">
            แปลงที่ :
          </Label>
          <Input
            required
            type="number"
            name="plotNumber"
            onChange={handleChangeCreateHarvest}
            value={harvestLog?.plotNumber}
            inputMode="numeric"
            className="w-full rounded-lg p-3 ring-1 ring-gray-300"
          />
        </TextField>
        <TextField className="flex w-80 flex-col  items-start justify-start gap-2 ">
          <Label className="w-max text-xl font-semibold text-super-main-color">
            วันที่เก็บเกี่ยว :
          </Label>
          <Calendar
            required
            className="w-full"
            dateFormat="dd/MM/yy"
            value={
              harvestLog?.harvestDate ? new Date(harvestLog?.harvestDate) : null
            }
            onChange={(e) => {
              setHarvestLog((prev) => ({
                ...prev,
                harvestDate: e.target.value?.toISOString(),
              }));
            }}
            locale="th"
            touchUI={deviceType === "mobile" ? true : false}
          />
        </TextField>
        <TextField className="flex w-80  flex-col items-center justify-start">
          <Label className="w-full text-left text-xl font-semibold text-super-main-color">
            ชนิดพืชที่เก็บเกี่ยว :
          </Label>
          <Input
            required
            name="plantType"
            onChange={handleChangeCreateHarvest}
            value={harvestLog?.plantType}
            type="text"
            className="w-full rounded-lg p-3 ring-1 ring-gray-300"
          />
        </TextField>

        <TextField className="flex w-80  flex-col items-center justify-start">
          <Label className="w-full text-left text-xl font-semibold text-super-main-color">
            ปริมาณ :
          </Label>
          <Input
            required
            name="amount"
            onChange={handleChangeCreateHarvest}
            value={harvestLog?.amount}
            type="number"
            placeholder="กิโลกรัม"
            inputMode="numeric"
            className="w-full rounded-lg p-3 ring-1 ring-gray-300"
          />
        </TextField>
        <TextField className="flex w-80  flex-col items-center justify-start">
          <Label className="w-full text-left text-xl font-semibold text-super-main-color">
            การตลาด :
          </Label>
          <Input
            required
            name="marketing"
            onChange={handleChangeCreateHarvest}
            value={harvestLog?.marketing}
            type="text"
            className="w-full rounded-lg p-3 ring-1 ring-gray-300"
          />
        </TextField>
        <section className="flex w-full justify-center gap-2">
          <Button
            type="button"
            onPress={() => setTriggerUpdateHarvestLog(() => false)}
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

export default UpdateHarvestLog;
