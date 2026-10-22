import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { FactoryKos4 } from "../../../model";
import { DeleteFatorKos4Service } from "../../../services/kos4";
import { confirmDelete, showError, showSaved, showSaving } from "../../../utils/confirm";
import { formatNumber, formatThaiDate } from "../../../utils/format";
import RecordCard from "../recordCard";

type CardFactorProps = {
  factor: FactoryKos4;
  onEdit: (factor: FactoryKos4) => void;
};

/** One KOS-04 record: what was bought or made, when, how much and from where. */
function CardFactor({ factor, onEdit }: CardFactorProps) {
  const queryClient = useQueryClient();
  const shortDate = formatThaiDate(factor.purchaseDate, "short");

  const handleDelete = async () => {
    const confirmed = await confirmDelete({ title: `ลบบันทึก ${factor.prodFactorTypes} วันที่ ${shortDate}?` });
    if (!confirmed) return;
    try {
      showSaving("กำลังลบข้อมูล");
      await DeleteFatorKos4Service({ prodFactorKos4Id: factor.id });
      await queryClient.invalidateQueries({ queryKey: ["factor"] });
      showSaved("ลบเรียบร้อย");
    } catch (error) {
      showError(error, "ลบไม่สำเร็จ");
    }
  };

  return (
    <RecordCard
      title={factor.prodFactorTypes}
      recordName={`${factor.prodFactorTypes} วันที่ ${shortDate}`}
      details={[
        { label: "วันที่ซื้อหรือได้มา", value: formatThaiDate(factor.purchaseDate) },
        { label: "จำนวน", value: `${formatNumber(factor.amount)} ${factor.typeAmount}` },
        { label: "แหล่งที่มา", value: factor.source, wide: true },
      ]}
      onEdit={() => onEdit(factor)}
      onDelete={handleDelete}
    />
  );
}

export default CardFactor;
