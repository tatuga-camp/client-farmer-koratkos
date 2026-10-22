import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { GetFormEvaluatonsService } from "../../services/evaluation";
import { formatThaiDate } from "../../utils/format";
import { Skeleton } from "../ui";

const statusText: Record<string, { label: string; className: string }> = {
  approved: { label: "ผ่าน", className: "bg-main-color/10 text-main-color" },
  rejected: { label: "ไม่ผ่าน", className: "bg-red-50 text-red-700" },
  evaluating: { label: "กำลังประเมิน", className: "bg-secondary-color/10 text-secondary-color" },
  pending: { label: "รอประเมิน", className: "bg-third-color/20 text-super-main-color" },
};

/** Results of each evaluation round: who evaluated, the outcome and their comments. */
function EvaluationReport() {
  const [selectedId, setSelectedId] = useState<string>();
  const formEvaluations = useQuery({
    queryKey: ["formEvaluations"],
    queryFn: () => GetFormEvaluatonsService(),
  });

  if (formEvaluations.isLoading) return <Skeleton className="h-40 w-full" />;
  if (formEvaluations.isError) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-xl bg-fourth-color p-4">
        <p className="hint">โหลดผลการประเมินไม่สำเร็จ</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => formEvaluations.refetch()}>
          ลองใหม่
        </button>
      </div>
    );
  }
  const rounds = [...(formEvaluations.data ?? [])].sort((a, b) => a.number - b.number);
  if (rounds.length === 0) {
    return <p className="rounded-xl bg-fourth-color p-4 hint">ยังไม่มีผลการประเมิน</p>;
  }
  // Latest round first by default: that is the result that matters now.
  const selected = rounds.find((round) => round.id === selectedId) ?? rounds[rounds.length - 1];
  const status = statusText[selected.status] ?? statusText.pending;

  return (
    <section aria-label="ผลการประเมิน" className="flex flex-col gap-4 rounded-xl border border-third-color/40 bg-fourth-color/60 p-4">
      {rounds.length > 1 && (
        <div role="group" aria-label="เลือกครั้งที่ประเมิน" className="flex flex-wrap gap-2">
          {rounds.map((round) => (
            <button
              key={round.id}
              type="button"
              aria-pressed={round.id === selected.id}
              onClick={() => setSelectedId(round.id)}
              className={`btn btn-sm ${round.id === selected.id ? "btn-dark" : "btn-secondary"}`}
            >
              ครั้งที่ {round.number}
            </button>
          ))}
        </div>
      )}
      <dl className="grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-super-main-color/70">ผลการประเมิน ครั้งที่ {selected.number}</dt>
          <dd>
            <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-base font-bold ${status.className}`}>{status.label}</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-super-main-color/70">ผู้ประเมิน</dt>
          <dd className="text-lg font-semibold">
            {selected.user ? `${selected.user.firstName} ${selected.user.lastName}` : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-super-main-color/70">วันที่ประเมิน</dt>
          <dd className="text-lg font-semibold">{formatThaiDate(selected.evaluatedDate)}</dd>
        </div>
      </dl>
      <div>
        <h4 className="text-base font-bold">ความคิดเห็นของผู้ประเมิน</h4>
        <p className="mt-1 whitespace-pre-line break-words rounded-lg bg-white p-3 text-lg leading-relaxed">
          {selected.reason?.trim() || "ไม่มีความคิดเห็นเพิ่มเติม"}
        </p>
      </div>
    </section>
  );
}

export default EvaluationReport;
