import { UseQueryResult, useQuery } from "@tanstack/react-query";
import React from "react";
import { Button } from "react-aria-components";
import { MdBrowserNotSupported } from "react-icons/md";
import {
  CreateRegisterFormEvaluatonService,
  GetCheckStatusEvaluationService,
  ResponseCheckEvaluationService,
  UpdateRegisterFormEvaluatonService,
} from "../../services/evaluation";
import moment from "moment";
import Swal from "sweetalert2";

type StatusProps = {
  status: UseQueryResult<ResponseCheckEvaluationService, Error>;
  setTriggerViewEvaluationReport?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};
export type statusListsType =
  | "ยังไม่สามารถส่งคำร้องขอรับการประเมินได้"
  | "รอรับการประเมิน"
  | "ยื่นส่งคำร้องขอรับการประเมิน"
  | "ผ่านการประเมินแล้ว"
  | "ไม่ผ่านการประเมิน";

const handleSummitCreateRegisterFormEvaluaton = async ({
  status,
}: StatusProps) => {
  try {
    Swal.fire({
      title: "กำลังส่งคำร้องขอรับการประเมิน",
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    const create = await CreateRegisterFormEvaluatonService({
      isReadyToEvaluated: true,
      summitEvaluationDate: moment().toISOString(),
    });
    await status.refetch();
    Swal.fire({
      icon: "success",
      title: "ส่งคำร้องขอรับการประเมินสำเร็จ",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "ส่งคำร้องขอรับการประเมินไม่สำเร็จ",
      text: error?.message,
    });
  }
};

const handleSummitUpdateRegisterFormEvaluaton = async ({
  status,
}: StatusProps) => {
  try {
    Swal.fire({
      title: "กำลังส่งคำร้องขอรับการประเมินใหม่",
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    const update = await UpdateRegisterFormEvaluatonService({
      isReadyToEvaluated: true,
      summitEvaluationDate: moment().toISOString(),
      status: "pending",
    });
    await status.refetch();
    Swal.fire({
      icon: "success",
      title: "ส่งคำร้องขอรับการประเมินสำเร็จ",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "ส่งคำร้องขอรับการประเมินไม่สำเร็จ",
      text: error?.message,
    });
  }
};
const readyToEvaluation = ({ status }: StatusProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Button
        onPress={() => handleSummitCreateRegisterFormEvaluaton({ status })}
        type="button"
        className="flex flex-col items-center justify-center rounded-xl
         bg-super-main-color p-3 px-5 text-white transition duration-100  hover:scale-105
          active:scale-110"
      >
        <span>พร้อม</span>
        <span>ขอรับการประเมิน</span>
      </Button>
      <span
        onClick={() => handleSummitCreateRegisterFormEvaluaton({ status })}
        className="cursor-pointer text-base text-blue-700"
      >
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

const PassedEvaluation = ({ setTriggerViewEvaluationReport }: StatusProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-col items-center justify-center rounded-xl bg-green-700
       p-3 px-5  text-white"
      >
        <span>ผ่านการประเมิน</span>
      </div>
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={() =>
            setTriggerViewEvaluationReport &&
            setTriggerViewEvaluationReport(() => true)
          }
          className="rounded-lg bg-third-color px-2 py-1 font-semibold text-white
         drop-shadow-lg transition duration-150 hover:scale-105 active:scale-110"
        >
          รายละเอียดการประเมิน
        </button>
      </div>
    </div>
  );
};

const NotPassedEvaluation = ({
  setTriggerViewEvaluationReport,
  status,
}: StatusProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="0 flex items-center justify-center gap-2 rounded-xl bg-red-800 p-3  px-5 text-white">
        <span>ไม่ผ่านการประเมิน</span>
        <MdBrowserNotSupported />
      </div>
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={() => handleSummitUpdateRegisterFormEvaluaton({ status })}
          className="rounded-lg bg-green-700 px-2 py-1 font-semibold text-white
         drop-shadow-lg transition duration-150 hover:scale-105 active:scale-110"
        >
          ส่งการประเมินใหม่
        </button>
        <button
          onClick={() =>
            setTriggerViewEvaluationReport &&
            setTriggerViewEvaluationReport(() => true)
          }
          className="rounded-lg bg-third-color px-2 py-1 font-semibold text-white
         drop-shadow-lg transition duration-150 hover:scale-105 active:scale-110"
        >
          รายละเอียดการประเมิน
        </button>
      </div>
      <span className="text-balance text-center text-red-800">
        *แก้ไขข้อมูลและส่งคำร้องขอรับการประเมินอีกครั้ง
      </span>
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

type StatusEvaluationProps = {
  setTriggerViewEvaluationReport: React.Dispatch<React.SetStateAction<boolean>>;
};
function StatusEvaluation({
  setTriggerViewEvaluationReport,
}: StatusEvaluationProps) {
  const status = useQuery({
    queryKey: ["status-evluation"],
    queryFn: () => GetCheckStatusEvaluationService(),
  });
  return (
    <div
      className="flex h-max w-80 flex-col items-center justify-center gap-1 rounded-3xl bg-slate-200
     p-2 font-Anuphan drop-shadow-lg lg:w-96"
    >
      <h2 className="text-lg font-bold text-super-main-color">
        สถานะการส่งคำร้อง
      </h2>
      {status.isLoading ? (
        <div className="flex h-20 w-10/12 flex-col gap-2 ">
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-300"></div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-300"></div>
            <div className="h-10 w-10/12 animate-pulse rounded-lg bg-slate-300"></div>
          </div>
        </div>
      ) : status.data === "not-ready" ? (
        notReadyToEvaluation()
      ) : status.data === "ready" ? (
        readyToEvaluation({ status: status })
      ) : status.data === "approved" ? (
        PassedEvaluation({ setTriggerViewEvaluationReport, status })
      ) : status.data === "rejected" ? (
        NotPassedEvaluation({ setTriggerViewEvaluationReport, status })
      ) : (
        PenddingEvaluation()
      )}
    </div>
  );
}

export default StatusEvaluation;
