import React from "react";
import { Button } from "react-aria-components";
import { MdBrowserNotSupported } from "react-icons/md";

export type statusListsType =
  | "ยังไม่สามารถส่งคำร้องขอรับการประเมินได้"
  | "รอรับการประเมิน"
  | "ยื่นส่งคำร้องขอรับการประเมิน"
  | "ผ่านการประเมินแล้ว"
  | "ไม่ผ่านการประเมิน";

const readyToEvaluation = () => {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="flex flex-col items-center justify-center rounded-xl bg-super-main-color p-3 px-5  text-white transition duration-100 active:scale-110"
      >
        <span>พร้อม</span>
        <span>ขอรับการประเมิน</span>
      </Button>
      <span className="text-base text-blue-700">
        คลิกเพื่อส่งคำร้องขอรับการประเมิน
      </span>
    </div>
  );
};

const notReadyToEvaluation = () => {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="flex flex-col items-center justify-center rounded-xl bg-orange-500 p-3 px-5  text-white transition duration-100 active:scale-110"
      >
        <span>ยังไม่สามารถส่งคำร้อง</span>
        <span>ขอรับการประเมินได้</span>
      </Button>
      <span className="text-base text-red-500">
        *โปรดตรวจสอบข้อมูลให้ถูกต้อง
      </span>
    </div>
  );
};

const PassedEvaluation = () => {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="flex flex-col items-center justify-center rounded-xl bg-third-color p-3 px-5  text-white transition duration-100 active:scale-110"
      >
        <span>ผ่านการประเมิน</span>
      </Button>
    </div>
  );
};

const NotPassedEvaluation = () => {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="flex items-center justify-center gap-2 rounded-xl bg-red-800 p-3 px-5  text-white transition duration-100 active:scale-110"
      >
        <span>ไม่ผ่านการประเมิน</span>
        <MdBrowserNotSupported />
      </Button>
    </div>
  );
};

const PenddingEvaluation = () => {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="flex flex-col items-center justify-center rounded-xl bg-secondary-color p-3 px-5  text-white transition duration-100 active:scale-110"
      >
        <span>รอรับการประเมิน</span>
      </Button>
      <span className="text-base text-secondary-color">
        โปรดรอจากประเมินจากคณะกรรมการ
      </span>
    </div>
  );
};

function StatusEvaluation() {
  return (
    <div
      className="flex h-max w-80 flex-col items-center justify-center gap-1 rounded-3xl
     bg-slate-200 p-2 font-Anuphan drop-shadow-lg"
    >
      <h2 className="text-lg font-bold text-super-main-color">
        สถานะการส่งคำร้อง
      </h2>
      {PenddingEvaluation()}
    </div>
  );
}

export default StatusEvaluation;
