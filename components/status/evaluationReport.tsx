import { useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useState } from "react";
import { GetFormEvaluatonsService } from "../../services/evaluation";
import { FormEvaluation, User } from "../../model";
import { IoArrowBackCircle } from "react-icons/io5";

type EvaluationReportProps = {
  setTriggerViewEvaluationReport: Dispatch<SetStateAction<boolean>>;
};
function EvaluationReport({
  setTriggerViewEvaluationReport,
}: EvaluationReportProps) {
  const [selectFormEvaluation, setSelectFormEvaluation] = useState<
    FormEvaluation & { user: User }
  >();
  const formEvaluations = useQuery({
    queryKey: ["formEvaluations"],
    queryFn: () =>
      GetFormEvaluatonsService().then((res) => {
        setSelectFormEvaluation(() => res[0]);
        return res;
      }),
  });

  return (
    <div
      className="flex  w-11/12 flex-col items-center justify-start rounded-lg 
    bg-[#F1E4C3] p-5 font-Anuphan md:w-8/12"
    >
      <h1 className="rounded-lg bg-third-color px-2 py-1 font-semibold text-white">
        รายละเอียดการประเมิน
      </h1>
      <ul className="mt-5 flex items-center justify-center gap-5">
        {formEvaluations.data?.map((formEvaluation) => {
          return (
            <li
              onClick={() => setSelectFormEvaluation(() => formEvaluation)}
              className={`cursor-pointer rounded-lg px-5 py-1 text-sm font-semibold 
               text-white transition duration-150 hover:scale-105
                active:scale-110 ${selectFormEvaluation?.id === formEvaluation.id ? "bg-super-main-color" : "bg-secondary-color"}`}
              key={formEvaluation.id}
            >
              ครั้งที่ {formEvaluation.number}
            </li>
          );
        })}
      </ul>
      <div className="flex w-full flex-col  items-center gap-3">
        <div
          className="mt-5 flex w-11/12 max-w-96 items-center justify-center gap-2 rounded-lg bg-secondary-color
         px-4 py-2 text-sm font-semibold text-white"
        >
          <span>ผู้ประเมิน ครั้งที่ {selectFormEvaluation?.number}</span>
          <span>
            {" "}
            : {selectFormEvaluation?.user.firstName}{" "}
            {selectFormEvaluation?.user.lastName}
          </span>
        </div>
        <div className="rounded-lg bg-third-color px-4 py-2  text-sm font-semibold text-white">
          สถานะ:{" "}
          {selectFormEvaluation?.status === "approved"
            ? "ผ่าน"
            : selectFormEvaluation?.status === "rejected" && "ไม่ผ่าน"}
        </div>
        <div className="h-max w-full text-wrap px-4">
          <span className="text-sm font-bold text-super-main-color">
            ความคิดเห็น :
          </span>
          <div className="w-full  text-balance break-words text-sm ">
            {selectFormEvaluation?.reason}{" "}
          </div>
        </div>
        <button
          onClick={() => {
            setTriggerViewEvaluationReport(() => false);
          }}
          className="flex w-max items-center justify-center gap-2
         rounded-lg bg-super-main-color px-4 py-1 text-white drop-shadow-lg transition 
         duration-150 hover:scale-105 active:scale-110"
        >
          <div className="rounded-full bg-white p-1 text-super-main-color">
            <IoArrowBackCircle />
          </div>
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}

export default EvaluationReport;
