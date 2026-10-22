import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  LuCheckCircle2,
  LuChevronDown,
  LuClock,
  LuLock,
  LuSend,
  LuXCircle,
} from "react-icons/lu";
import {
  CreateRegisterFormEvaluatonService,
  GetCheckStatusEvaluationService,
  UpdateRegisterFormEvaluatonService,
} from "../../services/evaluation";
import { showError, showSaving } from "../../utils/confirm";
import { Skeleton } from "../ui";
import EvaluationReport from "./evaluationReport";

type StatusEvaluationProps = {
  /** Step number in the home checklist. */
  step: number;
  /** How many of the five documents are saved, for the "not ready" message. */
  doneCount: number;
};

async function confirmSend(again: boolean) {
  const result = await Swal.fire({
    icon: "question",
    title: again ? "ส่งคำร้องขอรับการประเมินอีกครั้ง?" : "ส่งคำร้องขอรับการประเมิน?",
    text: again
      ? "ตรวจดูว่าแก้ไขตามความคิดเห็นของผู้ประเมินครบแล้ว ก่อนส่งอีกครั้ง"
      : "ตรวจดูข้อมูลในเอกสารทั้ง 5 ฉบับให้ถูกต้องก่อนส่ง",
    showCancelButton: true,
    confirmButtonText: "ส่งคำร้อง",
    cancelButtonText: "ยังไม่ส่ง",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

/** Final checklist step: send the evaluation request, then follow its result. */
function StatusEvaluation({ step, doneCount }: StatusEvaluationProps) {
  const queryClient = useQueryClient();
  const [showReport, setShowReport] = useState(false);
  const status = useQuery({
    queryKey: ["status-evluation"],
    queryFn: () => GetCheckStatusEvaluationService(),
  });

  const send = async (again: boolean) => {
    if (!(await confirmSend(again))) return;
    try {
      showSaving("กำลังส่งคำร้อง");
      const input = { isReadyToEvaluated: true, summitEvaluationDate: new Date().toISOString() };
      if (again) await UpdateRegisterFormEvaluatonService({ ...input, status: "pending" });
      else await CreateRegisterFormEvaluatonService(input);
      await queryClient.invalidateQueries({ queryKey: ["status-evluation"] });
      Swal.fire({
        icon: "success",
        title: "ส่งคำร้องเรียบร้อย",
        text: "คณะกรรมการจะตรวจประเมินจากเอกสารที่กรอกไว้ ติดตามผลได้ที่หน้านี้",
        confirmButtonText: "ตกลง",
      });
    } catch (error) {
      showError(error, "ส่งคำร้องไม่สำเร็จ");
    }
  };

  const reportToggle = (
    <button
      type="button"
      onClick={() => setShowReport((open) => !open)}
      aria-expanded={showReport}
      className="btn btn-secondary"
    >
      {showReport ? "ซ่อนผลการประเมิน" : "ดูผลการประเมิน"}
      <LuChevronDown aria-hidden="true" className={`size-5 transition-transform ${showReport ? "rotate-180" : ""}`} />
    </button>
  );

  let tone = "border-third-color/40";
  let icon = <LuLock aria-hidden="true" className="size-6" />;
  let iconClass = "border-2 border-third-color/70 text-super-main-color/70";
  let title = "ส่งคำร้องขอรับการประเมิน";
  let body: React.ReactNode = null;

  if (status.isLoading) {
    body = <Skeleton className="h-16 w-full" />;
  } else if (status.isError) {
    body = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="hint">ตรวจสอบสถานะคำร้องไม่สำเร็จ</p>
        <button type="button" className="btn btn-secondary" onClick={() => status.refetch()}>
          ลองใหม่
        </button>
      </div>
    );
  } else if (status.data === "not-ready") {
    body = (
      <p className="hint">
        กรอกเอกสารให้ครบทั้ง 5 ฉบับก่อน จึงจะส่งคำร้องได้ (ตอนนี้บันทึกแล้ว {doneCount} จาก 5 ฉบับ)
      </p>
    );
  } else if (status.data === "ready") {
    tone = "border-2 border-main-color ring-4 ring-main-color/10";
    icon = <LuSend aria-hidden="true" className="size-6" />;
    iconClass = "bg-main-color text-white";
    title = "เอกสารครบแล้ว ส่งคำร้องได้เลย";
    body = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="hint">กดปุ่มเพื่อแจ้งคณะกรรมการว่าพร้อมรับการตรวจประเมิน</p>
        <button type="button" className="btn btn-primary shrink-0" onClick={() => send(false)}>
          <LuSend aria-hidden="true" className="size-5" />
          ส่งคำร้องขอรับการประเมิน
        </button>
      </div>
    );
  } else if (status.data === "approved") {
    tone = "border-2 border-main-color/60";
    icon = <LuCheckCircle2 aria-hidden="true" className="size-6" />;
    iconClass = "bg-main-color text-white";
    title = "ผ่านการประเมินแล้ว";
    body = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="hint">ยินดีด้วย แปลงของคุณผ่านการประเมินมาตรฐาน KOS</p>
        {reportToggle}
      </div>
    );
  } else if (status.data === "rejected") {
    tone = "border-2 border-red-600/50";
    icon = <LuXCircle aria-hidden="true" className="size-6" />;
    iconClass = "bg-red-700 text-white";
    title = "ยังไม่ผ่านการประเมิน";
    body = (
      <div className="flex flex-col gap-3">
        <p className="hint">อ่านความคิดเห็นของผู้ประเมิน แก้ไขเอกสารตามนั้น แล้วส่งคำร้องอีกครั้ง</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {reportToggle}
          <button type="button" className="btn btn-primary" onClick={() => send(true)}>
            <LuSend aria-hidden="true" className="size-5" />
            ส่งคำร้องอีกครั้ง
          </button>
        </div>
      </div>
    );
  } else {
    tone = "border-2 border-secondary-color/50";
    icon = <LuClock aria-hidden="true" className="size-6" />;
    iconClass = "bg-secondary-color text-white";
    title = "ส่งคำร้องแล้ว รอการตรวจประเมิน";
    body = <p className="hint">คณะกรรมการกำลังตรวจเอกสาร ผลการประเมินจะแสดงที่หน้านี้</p>;
  }

  return (
    <li className={`card flex flex-col gap-4 p-4 sm:p-5 ${tone}`}>
      <div className="flex gap-4">
        <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
          {status.data === "not-ready" || status.isLoading ? <span className="text-lg font-bold">{step}</span> : icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-base font-bold text-super-main-color/80">ขั้นสุดท้าย</span>
          <h3 className="text-xl font-bold leading-snug">{title}</h3>
          {body}
        </div>
      </div>
      {showReport && <EvaluationReport />}
    </li>
  );
}

export default StatusEvaluation;
