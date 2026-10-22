import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useMemo, useRef, useState } from "react";
import { LuSave } from "react-icons/lu";
import { kosGuide } from "../../../data/kosGuides";
import { plantLists, typeAmount } from "../../../data/plants";
import { HarvestLogDocKos5 } from "../../../model";
import { GetAllDocKosService } from "../../../services/farmer";
import { GetDocKos1Service } from "../../../services/kos1";
import {
  CreateDocKos05Service,
  CreateHarvestLogKos5Service,
  UpdateHarvestLogKos5Service,
} from "../../../services/kos5";
import { showError, showSaved, showSaving } from "../../../utils/confirm";
import { isoFromLocalDate } from "../../../utils/format";
import { useFieldErrors } from "../../../utils/useFieldErrors";
import { FieldErrors, checkDate, checkNumber, checkText } from "../../../utils/validators";
import { ComboField, DateField, ErrorSummary, FormActions, FormCard, NumberField, TextAreaField } from "../../ui";

const guide = kosGuide("kos5");
const listPlants = plantLists.map((plant) => plant.title).filter((title) => title !== "อื่นๆ ระบุ");
const unitItems = typeAmount.map((unit) => ({ id: unit.title, label: unit.title }));

const todayIso = () => {
  const now = new Date();
  return isoFromLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
};

type HarvestValues = {
  harvestDate?: string;
  plotNumber: string;
  plantType: string;
  amount: string;
  typeAmount: string;
  marketing: string;
};

function validateHarvest(values: HarvestValues): FieldErrors {
  const unit = values.typeAmount.trim() || "กิโลกรัม";
  return {
    harvestDate: checkDate(values.harvestDate, { label: "วันที่เก็บเกี่ยว", notFuture: true }),
    plotNumber:
      checkNumber(values.plotNumber, { label: "หมายเลขแปลง", example: "1", integer: true }) ??
      (Number(values.plotNumber) >= 1 ? undefined : "หมายเลขแปลงเริ่มที่ 1 เช่น 1 หรือ 2"),
    plantType: checkText(values.plantType, { label: "ชนิดพืชที่เก็บ", example: "ผักคะน้า" }),
    amount:
      checkNumber(values.amount, { label: "ปริมาณ", example: "50", unit }) ??
      (Number(values.amount) > 0 ? undefined : `ปริมาณต้องมากกว่า 0 เช่น 50 ${unit}`),
    typeAmount: checkText(values.typeAmount, { label: "หน่วย", example: "กิโลกรัม" }),
    marketing: checkText(values.marketing, { label: "ที่ขายผลผลิต", example: "ตลาดชุมชนบ้านโคก", max: 1000 }),
  };
}

/** The plants from the farmer's own application (KOS-01) first, then the common list. */
function usePlantChoices() {
  const docKos1 = useQuery({ queryKey: ["docKos1"], queryFn: () => GetDocKos1Service() });
  const plantKos1s = docKos1.data?.plantKOS1s;
  const items = useMemo(() => {
    const own = Array.from(new Set((plantKos1s ?? []).map((plant) => plant.plant.trim()).filter(Boolean)));
    return [...own, ...listPlants.filter((title) => !own.includes(title))].map((label) => ({ id: label, label }));
  }, [plantKos1s]);
  return { items, hasOwn: !!plantKos1s?.length, plotsTotal: docKos1.data?.farmKos1?.plotsTotal };
}

type HarvestLogFormProps = {
  /** KOS-05 to add to. Left out for the farmer's first record: the document is created on save. */
  docKos05Id?: string;
  /** The record being edited. */
  harvestLog?: HarvestLogDocKos5;
  /** In-page add / edit returns to the list. Without it, saving opens the KOS-05 page. */
  onSaved?: (result: "added" | "updated") => void;
  onCancel?: () => void;
};

/** Add or edit one harvest (KOS-05): when, which plot, which plant, how much, and where it was sold. */
function HarvestLogForm({ docKos05Id, harvestLog, onSaved, onCancel }: HarvestLogFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const plants = usePlantChoices();
  const [saving, setSaving] = useState(false);
  const createdDocId = useRef<string>();
  const [values, setValues] = useState<HarvestValues>(() => ({
    harvestDate: harvestLog?.harvestDate ?? todayIso(),
    plotNumber: harvestLog ? String(harvestLog.plotNumber) : "",
    plantType: harvestLog?.plantType ?? "",
    amount: harvestLog ? String(harvestLog.amount) : "",
    typeAmount: harvestLog?.typeAmount ?? "กิโลกรัม",
    marketing: harvestLog?.marketing ?? "",
  }));
  const set = (patch: Partial<HarvestValues>) => setValues((prev) => ({ ...prev, ...patch }));
  const form = useFieldErrors(validateHarvest(values));

  /** Reuses the farmer's KOS-05 when it already exists (or an earlier try created it), so a retry can't make a second one. */
  const resolveDocId = async () => {
    if (docKos05Id) return docKos05Id;
    if (!createdDocId.current) {
      const docKos = await queryClient.ensureQueryData({ queryKey: ["docKos"], queryFn: () => GetAllDocKosService() });
      createdDocId.current = docKos?.kos5?.id ?? (await CreateDocKos05Service()).id;
    }
    return createdDocId.current;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const body = {
      harvestDate: values.harvestDate as string,
      plotNumber: Number(values.plotNumber),
      plantType: values.plantType.trim(),
      amount: Number(values.amount),
      typeAmount: values.typeAmount.trim(),
      marketing: values.marketing.trim(),
    };
    try {
      setSaving(true);
      showSaving();
      let docId = docKos05Id;
      if (harvestLog) {
        await UpdateHarvestLogKos5Service({ query: { harvestLogKos5Id: harvestLog.id }, body });
      } else {
        docId = await resolveDocId();
        await CreateHarvestLogKos5Service({ ...body, docKos05Id: docId });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["harvestLog"] }),
        !docKos05Id && queryClient.invalidateQueries({ queryKey: ["docKos"] }),
      ]);
      showSaved();
      if (onSaved) onSaved(harvestLog ? "updated" : "added");
      else if (docId) router.push(guide.viewHref(docId));
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <ErrorSummary errors={form.errors} show={form.submitted} />
      <FormCard
        title={harvestLog ? "แก้ไขบันทึกการเก็บเกี่ยว" : "เพิ่มบันทึกการเก็บเกี่ยว"}
        description="กรอก 1 รายการ ต่อการเก็บพืช 1 ชนิด จากแปลงเดียว"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <DateField
            id="harvestDate"
            label="วันที่เก็บเกี่ยว"
            hint={harvestLog ? "แตะเพื่อเปลี่ยนวันที่" : "ตั้งไว้เป็นวันนี้ ถ้าเก็บวันอื่นให้แตะเพื่อเปลี่ยน"}
            value={values.harvestDate}
            onChange={(harvestDate) => set({ harvestDate })}
            onBlur={() => form.touch("harvestDate")}
            max={todayIso()}
            error={form.errors.harvestDate}
          />
          <NumberField
            id="plotNumber"
            label="แปลงที่"
            hint={
              plants.plotsTotal
                ? `ใส่เลขแปลงที่เก็บ (ในใบสมัครมี ${plants.plotsTotal.toLocaleString()} แปลง)`
                : "ใส่เลขแปลงที่เก็บ เช่น 1"
            }
            integer
            placeholder="เช่น 1"
            value={values.plotNumber}
            onChange={(plotNumber) => set({ plotNumber })}
            onBlur={() => form.touch("plotNumber")}
            error={form.errors.plotNumber}
          />
        </div>
        <ComboField
          id="plantType"
          label="ชนิดพืชที่เก็บ"
          hint={
            plants.hasOwn
              ? "พืชที่คุณกรอกไว้ในใบสมัคร (KOS-01) อยู่บนสุด ถ้าไม่มีในรายการ พิมพ์ชื่อเองได้"
              : "พิมพ์เพื่อค้นหา ถ้าไม่มีในรายการ พิมพ์ชื่อเองได้ เช่น ผักคะน้า"
          }
          items={plants.items}
          allowsCustomValue
          value={values.plantType}
          onChange={(plantType) => set({ plantType })}
          onBlur={() => form.touch("plantType")}
          error={form.errors.plantType}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            id="amount"
            label="ปริมาณที่เก็บได้"
            hint="ใส่เป็นตัวเลข เช่น 50"
            value={values.amount}
            onChange={(amount) => set({ amount })}
            onBlur={() => form.touch("amount")}
            error={form.errors.amount}
          />
          <ComboField
            id="typeAmount"
            label="หน่วย"
            hint="เลือก หรือพิมพ์เอง เช่น กิโลกรัม"
            items={unitItems}
            allowsCustomValue
            value={values.typeAmount}
            onChange={(unit) => set({ typeAmount: unit })}
            onBlur={() => form.touch("typeAmount")}
            error={form.errors.typeAmount}
          />
        </div>
        <TextAreaField
          id="marketing"
          label="นำผลผลิตไปขายที่ไหน"
          hint="บอกชื่อตลาดหรือร้านที่ขาย เช่น ขายที่ตลาดชุมชนบ้านโคก หรือส่งร้านผักอินทรีย์ในตัวเมือง"
          rows={3}
          maxLength={1000}
          value={values.marketing}
          onChange={(marketing) => set({ marketing })}
          onBlur={() => form.touch("marketing")}
          error={form.errors.marketing}
        />
      </FormCard>
      <FormActions>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            ยกเลิก
          </button>
        )}
        <button type="submit" disabled={saving} className="btn btn-primary sm:min-w-44">
          <LuSave aria-hidden="true" className="size-5" />
          บันทึก
        </button>
      </FormActions>
    </form>
  );
}

export default HarvestLogForm;
