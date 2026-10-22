import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { LuSave } from "react-icons/lu";
import {
  ComboField,
  ComboItem,
  ErrorSummary,
  FieldGroup,
  FormActions,
  FormCard,
  MonthChipsField,
  NumberField,
  TextField,
  YearField,
} from "../../../ui";
import { plantLists } from "../../../../data/plants";
import { OrgCropProdCalForKos2 } from "../../../../model";
import {
  CreateOrgProdKos2Service,
  ResponseGetDocKos02Service,
  UpdateOrgProdKos2Service,
} from "../../../../services/kos2";
import { showError, showSaved, showSaving } from "../../../../utils/confirm";
import { isoFromLocalDate } from "../../../../utils/format";
import { useFieldErrors } from "../../../../utils/useFieldErrors";
import { FieldErrors, checkNumber, checkRequired, checkText } from "../../../../utils/validators";

const plantItems: ComboItem[] = plantLists
  .filter((plant) => plant.title !== "อื่นๆ ระบุ")
  .map((plant) => ({ id: plant.title, label: plant.title }));

type PlanValues = {
  plotNumber: string;
  yearPlan: string;
  landArea: string;
  plantType: string;
  rangeDate: string[];
  yieldPerRai: string;
  seed: string;
  source: string;
};

const isValidDate = (iso?: string) => !!iso && !Number.isNaN(new Date(iso).getTime());

function toValues(plan?: OrgCropProdCalForKos2): PlanValues {
  const thisYear = isoFromLocalDate(new Date().getFullYear(), 0, 1);
  if (!plan) {
    return {
      plotNumber: "",
      yearPlan: thisYear,
      landArea: "",
      plantType: "",
      rangeDate: [],
      yieldPerRai: "",
      seed: "",
      source: "",
    };
  }
  return {
    plotNumber: String(plan.plotNumber),
    yearPlan: isValidDate(plan.yearPlan) ? plan.yearPlan : thisYear,
    landArea: String(plan.landArea),
    plantType: plan.plantType,
    rangeDate: plan.rangeDate.filter(isValidDate),
    yieldPerRai: String(plan.yieldPerRai),
    seed: plan.seed,
    source: plan.source,
  };
}

/** One ISO date per month, all in the plan's year, in calendar order. */
function monthsInYear(rangeDate: string[], year: number) {
  const months = Array.from(new Set(rangeDate.map((iso) => new Date(iso).getMonth()))).sort((a, b) => a - b);
  return months.map((month) => isoFromLocalDate(year, month));
}

function checkMoreThanZero(value: string, rule: { label: string; example: string; unit: string }) {
  const error = checkNumber(value, rule);
  if (error) return error;
  return Number(value) > 0 ? undefined : `${rule.label}ต้องมากกว่า 0 เช่น ${rule.example} ${rule.unit}`;
}

function validatePlan(values: PlanValues): FieldErrors {
  return {
    plotNumber: checkNumber(values.plotNumber, { label: "หมายเลขแปลง", example: "1", integer: true, min: 1 }),
    yearPlan: checkRequired(values.yearPlan, "กรุณาเลือกปีที่ปลูก"),
    landArea: checkMoreThanZero(values.landArea, { label: "พื้นที่ปลูก", example: "1.5", unit: "ไร่" }),
    plantType: checkText(values.plantType, { label: "ชื่อพืชที่ปลูก", example: "ผักคะน้า" }),
    rangeDate: checkRequired(values.rangeDate, "กรุณาแตะเลือกเดือนที่ปลูกอย่างน้อย 1 เดือน"),
    yieldPerRai: checkMoreThanZero(values.yieldPerRai, { label: "ผลผลิตต่อไร่", example: "1500", unit: "กก./ไร่" }),
    seed: checkText(values.seed, { label: "เมล็ดพันธุ์หรือส่วนขยายพันธุ์", example: "เมล็ดพันธุ์ผักคะน้า" }),
    source: checkText(values.source, { label: "แหล่งที่มาของพันธุ์", example: "ซื้อจากร้านเกษตรในอำเภอ หรือ เก็บพันธุ์เอง" }),
  };
}

type OrgCropProdFormProps = {
  docKos02: ResponseGetDocKos02Service;
  /** The plan being edited; leave out to add a new one. */
  plan?: OrgCropProdCalForKos2;
  /** Back to the list, after saving or cancelling. */
  onDone: () => void;
};

/** KOS-02 part 2: what one plot grows in a year (one plant per record). */
function OrgCropProdForm({ docKos02, plan, onDone }: OrgCropProdFormProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<PlanValues>(() => toValues(plan));
  const [saving, setSaving] = useState(false);
  const form = useFieldErrors(validatePlan(values));
  const year = new Date(values.yearPlan).getFullYear();

  const set = <K extends keyof PlanValues>(key: K, value: PlanValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  // Keep the chosen months when the farmer switches year.
  const setYear = (iso: string) =>
    setValues((prev) => ({
      ...prev,
      yearPlan: iso,
      rangeDate: monthsInYear(prev.rangeDate, new Date(iso).getFullYear()),
    }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const body = {
      plotNumber: Number(values.plotNumber),
      yearPlan: values.yearPlan,
      landArea: Number(values.landArea),
      plantType: values.plantType.trim(),
      rangeDate: monthsInYear(values.rangeDate, year),
      yieldPerRai: Number(values.yieldPerRai),
      seed: values.seed.trim(),
      source: values.source.trim(),
    };
    try {
      setSaving(true);
      showSaving();
      if (plan) {
        await UpdateOrgProdKos2Service({
          query: { orgCropProdCalForKos2Id: plan.id, docKos02Id: docKos02.id },
          body,
        });
      } else {
        await CreateOrgProdKos2Service({ ...body, docKos02Id: docKos02.id });
      }
      await queryClient.invalidateQueries({ queryKey: ["docKos02"] });
      showSaved(plan ? "บันทึกการแก้ไขแล้ว" : "เพิ่มแผนการปลูกแล้ว");
      onDone();
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const certifiedPlots = docKos02.numberOfPlotForKosCertificated?.trim();

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ErrorSummary errors={form.errors} show={form.submitted} />
      <FormCard
        title={plan ? `แก้ไขแผนการปลูก แปลงที่ ${plan.plotNumber}` : "เพิ่มแผนการปลูก"}
        description="1 รายการ คือพืช 1 ชนิดในแปลง 1 แปลง ถ้าแปลงเดียวปลูกหลายพืช ให้เพิ่มทีละรายการ"
      >
        <FieldGroup title="แปลงที่ปลูก">
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="plotNumber"
              label="แปลงที่"
              hint={
                certifiedPlots
                  ? `หมายเลขแปลงตามผัง (แปลงที่ขอรับรอง: ${certifiedPlots})`
                  : "หมายเลขแปลงตามผัง เช่น 1"
              }
              integer
              value={values.plotNumber}
              onChange={(value) => set("plotNumber", value)}
              onBlur={() => form.touch("plotNumber")}
              error={form.errors.plotNumber}
            />
            <YearField
              id="yearPlan"
              label="ปีที่ปลูก"
              hint="แผนนี้เป็นของปีไหน ส่วนใหญ่คือปีนี้"
              value={values.yearPlan}
              onChange={setYear}
              error={form.errors.yearPlan}
            />
          </div>
          <NumberField
            id="landArea"
            label="พื้นที่ปลูก"
            hint="ขนาดพื้นที่ที่ปลูกพืชนี้ เช่น 1.5 (ครึ่งไร่ใส่ 0.5, 1 งานใส่ 0.25)"
            unit="ไร่"
            value={values.landArea}
            onChange={(value) => set("landArea", value)}
            onBlur={() => form.touch("landArea")}
            error={form.errors.landArea}
          />
        </FieldGroup>

        <FieldGroup title="พืชที่ปลูก" className="border-t border-third-color/30 pt-5">
          <ComboField
            id="plantType"
            label="ชื่อพืช"
            hint="ถ้าไม่มีในรายการ พิมพ์ชื่อพืชเองได้"
            items={plantItems}
            allowsCustomValue
            value={values.plantType}
            onChange={(value) => set("plantType", value)}
            onBlur={() => form.touch("plantType")}
            error={form.errors.plantType}
          />
          <MonthChipsField
            id="rangeDate"
            label="เดือนที่ปลูก"
            hint="แตะเดือนที่ปลูก เลือกได้หลายเดือน แตะซ้ำเพื่อยกเลิก"
            year={year}
            value={values.rangeDate}
            onChange={(value) => {
              set("rangeDate", value);
              form.touch("rangeDate");
            }}
            error={form.errors.rangeDate}
          />
          <NumberField
            id="yieldPerRai"
            label="ผลผลิตที่คาดว่าจะได้"
            hint="ประมาณจากที่เคยได้ ไม่ต้องแม่นยำ เช่น 1,500 กิโลกรัมต่อ 1 ไร่"
            unit="กก./ไร่"
            value={values.yieldPerRai}
            onChange={(value) => set("yieldPerRai", value)}
            onBlur={() => form.touch("yieldPerRai")}
            error={form.errors.yieldPerRai}
          />
        </FieldGroup>

        <FieldGroup title="พันธุ์ที่ใช้ปลูก" className="border-t border-third-color/30 pt-5">
          <TextField
            id="seed"
            label="เมล็ดพันธุ์ / ส่วนขยายพันธุ์"
            hint="ใช้อะไรปลูก เช่น เมล็ดพันธุ์ผักคะน้า ต้นกล้า หน่อกล้วย"
            maxLength={255}
            value={values.seed}
            onChange={(value) => set("seed", value)}
            onBlur={() => form.touch("seed")}
            error={form.errors.seed}
          />
          <TextField
            id="source"
            label="แหล่งที่มาของพันธุ์"
            hint="ได้พันธุ์มาจากไหน เช่น ซื้อจากร้านเกษตรในอำเภอ หรือ เก็บพันธุ์เอง"
            maxLength={255}
            value={values.source}
            onChange={(value) => set("source", value)}
            onBlur={() => form.touch("source")}
            error={form.errors.source}
          />
        </FieldGroup>
      </FormCard>

      <FormActions>
        <button type="button" className="btn btn-secondary" onClick={onDone} disabled={saving}>
          ยกเลิก
        </button>
        <button type="submit" className="btn btn-primary sm:min-w-44" disabled={saving}>
          <LuSave aria-hidden="true" className="size-5" />
          {plan ? "บันทึกการแก้ไข" : "บันทึกแผนการปลูก"}
        </button>
      </FormActions>
    </form>
  );
}

export default OrgCropProdForm;
