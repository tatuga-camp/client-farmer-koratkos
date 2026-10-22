import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { LuSave } from "react-icons/lu";
import { kosGuide } from "../../../data/kosGuides";
import { typeAmount } from "../../../data/plants";
import { FactoryKos4 } from "../../../model";
import { GetAllDocKosService } from "../../../services/farmer";
import { CreateDocKos04Service, CreateFatorKos4Service, UpdateFatorKos4Service } from "../../../services/kos4";
import { showError, showSaved, showSaving } from "../../../utils/confirm";
import { isoFromLocalDate } from "../../../utils/format";
import { useFieldErrors } from "../../../utils/useFieldErrors";
import { FieldErrors, checkDate, checkNumber, checkText } from "../../../utils/validators";
import { ComboField, DateField, ErrorSummary, Field, FormActions, FormCard, GuideBox, NumberField, TextField } from "../../ui";

const guide = kosGuide("kos4");
const noChemicalsTip = guide.tips.find((tip) => tip.includes("ปุ๋ยเคมี")) ?? guide.tips[0];
const quickPicks = ["ปุ๋ยหมัก", "ปุ๋ยคอก", "น้ำหมักชีวภาพ", "เมล็ดพันธุ์", "ต้นกล้า", "สารชีวภัณฑ์"];
const unitItems = typeAmount.map((unit) => ({ id: unit.title, label: unit.title }));

const todayIso = () => {
  const now = new Date();
  return isoFromLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
};

type FactorValues = {
  purchaseDate?: string;
  prodFactorTypes: string;
  amount: string;
  typeAmount: string;
  source: string;
};

function validateFactor(values: FactorValues): FieldErrors {
  const unit = values.typeAmount.trim() || "กระสอบ";
  return {
    purchaseDate: checkDate(values.purchaseDate, { label: "วันที่ซื้อหรือได้มา", notFuture: true }),
    prodFactorTypes: checkText(values.prodFactorTypes, { label: "ชื่อปัจจัยการผลิต", example: "ปุ๋ยหมัก" }),
    amount:
      checkNumber(values.amount, { label: "จำนวน", example: "10", unit }) ??
      (Number(values.amount) > 0 ? undefined : `จำนวนต้องมากกว่า 0 เช่น 10 ${unit}`),
    typeAmount: checkText(values.typeAmount, { label: "หน่วย", example: "กิโลกรัม หรือ กระสอบ" }),
    source: checkText(values.source, { label: "แหล่งที่มา", example: "ร้านเกษตรรุ่งเรือง หรือ ทำเอง" }),
  };
}

type FactorFormProps = {
  /** KOS-04 to add to. Left out for the farmer's first record: the document is created on save. */
  docKos04Id?: string;
  /** The record being edited. */
  factor?: FactoryKos4;
  /** In-page add / edit returns to the list. Without it, saving opens the KOS-04 page. */
  onSaved?: (result: "added" | "updated") => void;
  onCancel?: () => void;
};

/** Add or edit one production input (KOS-04): date, what it is, how much, and where it came from. */
function FactorForm({ docKos04Id, factor, onSaved, onCancel }: FactorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const createdDocId = useRef<string>();
  const [values, setValues] = useState<FactorValues>(() => ({
    purchaseDate: factor?.purchaseDate ?? todayIso(),
    prodFactorTypes: factor?.prodFactorTypes ?? "",
    amount: factor ? String(factor.amount) : "",
    typeAmount: factor?.typeAmount ?? "กิโลกรัม",
    source: factor?.source ?? "",
  }));
  const set = (patch: Partial<FactorValues>) => setValues((prev) => ({ ...prev, ...patch }));
  const form = useFieldErrors(validateFactor(values));

  /** Reuses the farmer's KOS-04 when it already exists (or an earlier try created it), so a retry can't make a second one. */
  const resolveDocId = async () => {
    if (docKos04Id) return docKos04Id;
    if (!createdDocId.current) {
      const docKos = await queryClient.ensureQueryData({ queryKey: ["docKos"], queryFn: () => GetAllDocKosService() });
      createdDocId.current = docKos?.kos4?.id ?? (await CreateDocKos04Service()).id;
    }
    return createdDocId.current;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const body = {
      purchaseDate: values.purchaseDate as string,
      prodFactorTypes: values.prodFactorTypes.trim(),
      amount: Number(values.amount),
      typeAmount: values.typeAmount.trim(),
      source: values.source.trim(),
    };
    try {
      setSaving(true);
      showSaving();
      let docId = docKos04Id;
      if (factor) {
        await UpdateFatorKos4Service({ query: { prodFactorKos4Id: factor.id }, body });
      } else {
        docId = await resolveDocId();
        await CreateFatorKos4Service({ ...body, docKos04Id: docId });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["factor"] }),
        !docKos04Id && queryClient.invalidateQueries({ queryKey: ["docKos"] }),
      ]);
      showSaved();
      if (onSaved) onSaved(factor ? "updated" : "added");
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
        title={factor ? "แก้ไขบันทึกปัจจัยการผลิต" : "เพิ่มบันทึกปัจจัยการผลิต"}
        description="กรอก 1 รายการ ต่อของ 1 อย่างที่ซื้อหรือได้มา เช่น ปุ๋ยหมัก 10 กระสอบ"
      >
        <GuideBox title="ข้อควรระวัง">{noChemicalsTip}</GuideBox>
        <DateField
          id="purchaseDate"
          label="วันที่ซื้อหรือได้มา"
          hint={factor ? "แตะเพื่อเปลี่ยนวันที่" : "ตั้งไว้เป็นวันนี้ ถ้าได้มาวันอื่นให้แตะเพื่อเปลี่ยน"}
          value={values.purchaseDate}
          onChange={(purchaseDate) => set({ purchaseDate })}
          onBlur={() => form.touch("purchaseDate")}
          max={todayIso()}
          error={form.errors.purchaseDate}
        />
        <Field
          id="prodFactorTypes"
          label="ชื่อปัจจัยการผลิต"
          hint="ปุ๋ย เมล็ดพันธุ์ ต้นกล้า หรือวัสดุอื่นที่นำมาใช้ในแปลง พิมพ์ชื่อเอง หรือแตะชื่อที่ใช้บ่อยด้านล่าง"
          error={form.errors.prodFactorTypes}
        >
          {(control) => (
            <div className="flex flex-col gap-3">
              <input
                {...control}
                name="prodFactorTypes"
                type="text"
                className="input"
                placeholder="เช่น ปุ๋ยหมัก"
                value={values.prodFactorTypes}
                onChange={(event) => set({ prodFactorTypes: event.target.value })}
                onBlur={() => form.touch("prodFactorTypes")}
              />
              <div role="group" aria-label="ชื่อที่ใช้บ่อย" className="flex flex-wrap gap-2">
                {quickPicks.map((name) => {
                  const isOn = values.prodFactorTypes.trim() === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => set({ prodFactorTypes: name })}
                      className={`min-h-11 rounded-full border px-4 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-main-color ${
                        isOn
                          ? "border-main-color bg-main-color text-white"
                          : "border-super-main-color/30 bg-white text-super-main-color hover:bg-third-color/10"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            id="amount"
            label="จำนวน"
            hint="ใส่เป็นตัวเลข เช่น 10"
            value={values.amount}
            onChange={(amount) => set({ amount })}
            onBlur={() => form.touch("amount")}
            error={form.errors.amount}
          />
          <ComboField
            id="typeAmount"
            label="หน่วย"
            hint="เลือก หรือพิมพ์เอง เช่น กระสอบ"
            items={unitItems}
            allowsCustomValue
            value={values.typeAmount}
            onChange={(unit) => set({ typeAmount: unit })}
            onBlur={() => form.touch("typeAmount")}
            error={form.errors.typeAmount}
          />
        </div>
        <TextField
          id="source"
          label="แหล่งที่มา"
          hint="ชื่อร้านที่ซื้อ หรือพิมพ์ว่า ทำเอง"
          placeholder="เช่น ร้านเกษตรรุ่งเรือง"
          value={values.source}
          onChange={(source) => set({ source })}
          onBlur={() => form.touch("source")}
          error={form.errors.source}
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

export default FactorForm;
