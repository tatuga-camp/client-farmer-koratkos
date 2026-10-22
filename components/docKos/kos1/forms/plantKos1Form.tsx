import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { LuSave } from "react-icons/lu";
import {
  ComboField,
  DateField,
  ErrorSummary,
  FormActions,
  FormCard,
  MonthRangeField,
  NumberField,
} from "../../../ui";
import { plantLists } from "../../../../data/plants";
import { PlantKos1 } from "../../../../model";
import { CreatePlantKos1Service, UpdatePlantKos1Service } from "../../../../services/kos1";
import { showError, showSaved, showSaving } from "../../../../utils/confirm";
import { useFieldErrors } from "../../../../utils/useFieldErrors";
import { checkDate, checkNumber, checkText, FieldErrors } from "../../../../utils/validators";

type PlantKos1FormProps = {
  farmKOS1Id: string;
  /** The plant being edited; omit to add a new one. */
  plant?: PlantKos1;
  onDone: () => void;
};

type PlantValue = {
  plant: string;
  raiTotal: string;
  annualProdCycles: string;
  seasonProd: (string | undefined)[];
  expHarvestDate?: string;
  expYieldAmt: string;
};

// "อื่นๆ ระบุ" was a list entry before custom typing was possible.
export const plantItems = plantLists
  .filter((plant) => plant.title !== "อื่นๆ ระบุ")
  .map((plant) => ({ id: plant.title, label: plant.title }));

function validatePlant(value: PlantValue): FieldErrors {
  const [start, end] = value.seasonProd;
  return {
    plant: checkText(value.plant, { label: "ชื่อพืช", example: "ผักคะน้า" }),
    raiTotal: checkNumber(value.raiTotal, { label: "พื้นที่ปลูก", example: "1.5", unit: "ไร่", min: 0.01 }),
    annualProdCycles: checkNumber(value.annualProdCycles, {
      label: "จำนวนรอบที่ปลูกต่อปี",
      integer: true,
      min: 1,
      max: 12,
      example: "2",
      unit: "รอบ",
      maxMessage: "ปลูกได้ไม่เกิน 12 รอบต่อปี ลองตรวจตัวเลขอีกครั้ง",
    }),
    seasonProd: !start || !end ? "กรุณาเลือกทั้งเดือนที่เริ่มปลูก และเดือนที่ปลูกเสร็จ" : undefined,
    expHarvestDate: checkDate(value.expHarvestDate, { label: "วันที่คาดว่าจะเก็บเกี่ยว" }),
    expYieldAmt: checkNumber(value.expYieldAmt, { label: "ผลผลิตที่คาดว่าจะได้", example: "500", unit: "กก.", min: 0.01 }),
  };
}

/** Add or edit one crop in the KOS-01 application (step 4). */
function PlantKos1Form({ farmKOS1Id, plant, onDone }: PlantKos1FormProps) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState<PlantValue>(() => ({
    plant: plant?.plant ?? "",
    raiTotal: plant ? String(plant.raiTotal) : "",
    annualProdCycles: plant ? String(plant.annualProdCycles) : "",
    seasonProd: plant?.seasonProd?.map((iso) => new Date(iso).toISOString()) ?? [undefined, undefined],
    expHarvestDate: plant?.expHarvestDate ? new Date(plant.expHarvestDate).toISOString() : undefined,
    expYieldAmt: plant ? String(plant.expYieldAmt) : "",
  }));
  const errors = useMemo(() => validatePlant(value), [value]);
  const form = useFieldErrors(errors);
  const set = <K extends keyof PlantValue>(key: K) => (next: PlantValue[K]) => setValue((prev) => ({ ...prev, [key]: next }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const body = {
      plant: value.plant.trim(),
      raiTotal: Number(value.raiTotal),
      annualProdCycles: value.annualProdCycles,
      seasonProd: value.seasonProd as string[],
      expHarvestDate: new Date(value.expHarvestDate as string),
      expYieldAmt: Number(value.expYieldAmt),
    };
    try {
      setSaving(true);
      showSaving();
      if (plant) {
        await UpdatePlantKos1Service({ query: { plantKOS1Id: plant.id }, body });
      } else {
        await CreatePlantKos1Service({ ...body, farmKOS1Id });
      }
      await queryClient.invalidateQueries({ queryKey: ["docKos1"] });
      showSaved(plant ? "บันทึกการแก้ไขเรียบร้อย" : `เพิ่ม${body.plant}เรียบร้อย`);
      onDone();
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
        title={plant ? `แก้ไขข้อมูล${plant.plant}` : "เพิ่มชนิดพืช"}
        description="กรอกทีละชนิด ถ้าปลูกหลายชนิด ให้กดเพิ่มทีละชนิดจนครบ"
      >
        <ComboField
          id="plant"
          label="ชื่อพืช"
          hint="พิมพ์เพื่อค้นหา เช่น “คะน้า” ถ้าไม่มีในรายการ พิมพ์ชื่อพืชเองได้เลย"
          items={plantItems}
          value={value.plant}
          onChange={set("plant")}
          onBlur={() => form.touch("plant")}
          error={form.errors.plant}
          allowsCustomValue
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            id="raiTotal"
            label="พื้นที่ปลูก"
            hint="เฉพาะพืชชนิดนี้ เช่น 1.5 ไร่ (2 งาน = 0.5 ไร่)"
            unit="ไร่"
            value={value.raiTotal}
            onChange={set("raiTotal")}
            onBlur={() => form.touch("raiTotal")}
            error={form.errors.raiTotal}
          />
          <NumberField
            id="annualProdCycles"
            label="ปลูกปีละกี่รอบ"
            hint="เช่น ผักใบปลูกได้ 4 รอบต่อปี ไม้ผลใส่ 1"
            unit="รอบ/ปี"
            integer
            value={value.annualProdCycles}
            onChange={set("annualProdCycles")}
            onBlur={() => form.touch("annualProdCycles")}
            error={form.errors.annualProdCycles}
          />
        </div>
        <MonthRangeField
          id="seasonProd"
          label="ช่วงเดือนที่ปลูก"
          hint="เลือกเดือนที่เริ่มปลูก และเดือนที่ปลูกเสร็จ เช่น พฤษภาคม ถึง สิงหาคม"
          value={value.seasonProd}
          onChange={set("seasonProd")}
          onBlur={() => form.touch("seasonProd")}
          error={form.errors.seasonProd}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <DateField
            id="expHarvestDate"
            label="วันที่คาดว่าจะเก็บเกี่ยว"
            hint="ประมาณการได้ ไม่ต้องตรงวัน"
            value={value.expHarvestDate}
            onChange={set("expHarvestDate")}
            onBlur={() => form.touch("expHarvestDate")}
            error={form.errors.expHarvestDate}
          />
          <NumberField
            id="expYieldAmt"
            label="ผลผลิตที่คาดว่าจะได้"
            hint="รวมทั้งปี ประมาณการ เช่น 500 กิโลกรัม"
            unit="กก."
            value={value.expYieldAmt}
            onChange={set("expYieldAmt")}
            onBlur={() => form.touch("expYieldAmt")}
            error={form.errors.expYieldAmt}
          />
        </div>
      </FormCard>
      <FormActions>
        <button type="button" onClick={onDone} className="btn btn-secondary">
          ยกเลิก
        </button>
        <button type="submit" className="btn btn-primary sm:min-w-44" disabled={saving}>
          <LuSave aria-hidden="true" className="size-5" />
          บันทึก
        </button>
      </FormActions>
    </form>
  );
}

export default PlantKos1Form;
