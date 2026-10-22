import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { HarvestLogDocKos5 } from "../../../model";
import { DeleteHarvestLogKos5Service } from "../../../services/kos5";
import { confirmDelete, showError, showSaved, showSaving } from "../../../utils/confirm";
import { formatNumber, formatThaiDate } from "../../../utils/format";
import RecordCard from "../recordCard";

type CardHarvestLogProps = {
  harvestLog: HarvestLogDocKos5;
  onEdit: (harvestLog: HarvestLogDocKos5) => void;
};

/** One KOS-05 record: which plant from which plot, when, how much and where it was sold. */
function CardHarvestLog({ harvestLog, onEdit }: CardHarvestLogProps) {
  const queryClient = useQueryClient();
  const shortDate = formatThaiDate(harvestLog.harvestDate, "short");

  const handleDelete = async () => {
    const confirmed = await confirmDelete({
      title: `ลบบันทึกวันที่ ${shortDate} แปลงที่ ${harvestLog.plotNumber}?`,
      text: `${harvestLog.plantType} ${formatNumber(harvestLog.amount)} ${harvestLog.typeAmount} ลบแล้วจะกู้คืนไม่ได้`,
    });
    if (!confirmed) return;
    try {
      showSaving("กำลังลบข้อมูล");
      await DeleteHarvestLogKos5Service({ harvestLogKos5Id: harvestLog.id });
      await queryClient.invalidateQueries({ queryKey: ["harvestLog"] });
      showSaved("ลบเรียบร้อย");
    } catch (error) {
      showError(error, "ลบไม่สำเร็จ");
    }
  };

  return (
    <RecordCard
      badge={`แปลงที่ ${harvestLog.plotNumber}`}
      title={harvestLog.plantType}
      recordName={`${harvestLog.plantType} แปลงที่ ${harvestLog.plotNumber} วันที่ ${shortDate}`}
      details={[
        { label: "วันที่เก็บเกี่ยว", value: formatThaiDate(harvestLog.harvestDate) },
        { label: "ปริมาณ", value: `${formatNumber(harvestLog.amount)} ${harvestLog.typeAmount}` },
        { label: "นำไปขายที่", value: harvestLog.marketing, wide: true },
      ]}
      onEdit={() => onEdit(harvestLog)}
      onDelete={handleDelete}
    />
  );
}

export default CardHarvestLog;
