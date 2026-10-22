import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LuArrowLeft, LuCheck, LuSave } from "react-icons/lu";
import Swal from "sweetalert2";
import { ChoiceCards, ErrorSummary, FieldErrorText, FormActions, FormCard, NumberField, TextField } from "../../../ui";
import { ProductionDraft, clearKos01Drafts, readFarmDraft, readProductionDraft, saveProductionDraft } from "../farmDraft";
import {
  CreateFarmDocKos1Service,
  ResponseGetAllDocKos1Service,
  UpdateFarmKos01Service,
} from "../../../../services/kos1";
import { showError, showSaved, showSaving } from "../../../../utils/confirm";
import { formatArea } from "../../../../utils/format";
import { useFieldErrors } from "../../../../utils/useFieldErrors";
import { checkNumber, checkText, FieldErrors } from "../../../../utils/validators";
import { Step } from "../../../../pages/create/kos01";

type ProductionInformationProps = {
  isUpdate?: boolean;
  docKos1?: UseQueryResult<ResponseGetAllDocKos1Service, Error>;
};

const processOptions = [
  {
    value: "มีเฉพาะผลิตผลพืช อินทรีย์เท่านั้น",
    label: "ปลูกเฉพาะพืชอินทรีย์",
    description: "ทุกแปลงในฟาร์มเป็นอินทรีย์ ไม่ใช้สารเคมีเลย",
  },
  {
    value: "มีทั้งผลิตผลพืชอินทรีย์ และทั่วไป",
    label: "ปลูกทั้งพืชอินทรีย์และพืชทั่วไป",
    description: "บางแปลงยังใช้ปุ๋ยหรือสารเคมีอยู่",
  },
];

const OTHER = "อื่นๆ";
const methodOptions = [
  { value: "ชนิดพืชที่ผลิตแตกต่างกัน", label: "ปลูกพืชคนละชนิด", description: "พืชในแปลงอินทรีย์เป็นคนละชนิดกับพืชในแปลงทั่วไป" },
  { value: "เวลาการผลิตแตกต่างกัน", label: "ปลูกคนละช่วงเวลา", description: "พืชชนิดเดียวกัน แต่ปลูกและเก็บเกี่ยวคนละช่วง" },
  { value: OTHER, label: "อื่น ๆ", description: "อธิบายวิธีของคุณเอง" },
];

const emptyProduction: ProductionDraft = {
  productionProcess: "",
  productionMethod: "",
  productionMethodOther: "",
  plotsTotal: "",
  raiTotal: "",
  nganTotal: "0",
  certicatedPlotTotal: "",
  certicatedRaiTotal: "",
  certicatedNganTotal: "0",
};

const toNgan = (rai: string, ngan: string) => Number(rai || 0) * 4 + Number(ngan || 0);
const nganRule = { label: "งาน", example: "2", unit: "งาน", max: 3.99, maxMessage: "งานต้องน้อยกว่า 4 (4 งาน = 1 ไร่ ให้นับเป็นไร่แทน)" };

function validateProduction(value: ProductionDraft): FieldErrors {
  const errors: FieldErrors = {
    productionProcess: value.productionProcess ? undefined : "กรุณาเลือกว่าฟาร์มของคุณปลูกแบบไหน",
    productionMethod: value.productionMethod ? undefined : "กรุณาเลือกวิธีแยกการผลิต",
    productionMethodOther:
      value.productionMethod === OTHER
        ? checkText(value.productionMethodOther, { label: "วิธีการผลิตของคุณ", example: "ปลูกแยกแปลง มีแนวกันชน" })
        : undefined,
    plotsTotal: checkNumber(value.plotsTotal, { label: "จำนวนแปลงทั้งหมด", integer: true, min: 1, example: "3", unit: "แปลง" }),
    raiTotal: checkNumber(value.raiTotal, { label: "พื้นที่ทั้งหมด (ไร่)", example: "5", unit: "ไร่" }),
    nganTotal: checkNumber(value.nganTotal, nganRule),
    certicatedPlotTotal: checkNumber(value.certicatedPlotTotal, { label: "จำนวนแปลงที่ขอรับรอง", integer: true, min: 1, example: "2", unit: "แปลง" }),
    certicatedRaiTotal: checkNumber(value.certicatedRaiTotal, { label: "พื้นที่ที่ขอรับรอง (ไร่)", example: "2", unit: "ไร่" }),
    certicatedNganTotal: checkNumber(value.certicatedNganTotal, nganRule),
  };
  if (!errors.raiTotal && !errors.nganTotal && toNgan(value.raiTotal, value.nganTotal) <= 0) {
    errors.raiTotal = "พื้นที่ทั้งหมดต้องมากกว่า 0";
  }
  if (!errors.certicatedRaiTotal && !errors.certicatedNganTotal && toNgan(value.certicatedRaiTotal, value.certicatedNganTotal) <= 0) {
    errors.certicatedRaiTotal = "พื้นที่ที่ขอรับรองต้องมากกว่า 0";
  }
  if (!errors.plotsTotal && !errors.certicatedPlotTotal && Number(value.certicatedPlotTotal) > Number(value.plotsTotal)) {
    errors.certicatedPlotTotal = `แปลงที่ขอรับรองต้องไม่มากกว่าแปลงทั้งหมด (${value.plotsTotal} แปลง)`;
  }
  const areaOk = !errors.raiTotal && !errors.nganTotal && !errors.certicatedRaiTotal && !errors.certicatedNganTotal;
  if (areaOk && toNgan(value.certicatedRaiTotal, value.certicatedNganTotal) > toNgan(value.raiTotal, value.nganTotal)) {
    errors.certicatedRaiTotal = `พื้นที่ที่ขอรับรองมากกว่าพื้นที่ทั้งหมด (${formatArea(value.raiTotal, value.nganTotal)}) ลองตรวจตัวเลขอีกครั้ง`;
  }
  return errors;
}

/** KOS-01 step 3: organic-only or parallel production, and plot counts and areas. */
function ProductionInformation({ isUpdate, docKos1 }: ProductionInformationProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [value, setValue] = useState<ProductionDraft>(emptyProduction);
  const [saving, setSaving] = useState(false);
  const savedFarm = docKos1?.data?.farmKos1;

  useEffect(() => {
    if (isUpdate) {
      if (!savedFarm) return;
      const method = savedFarm.productionMethod ?? "";
      const known = methodOptions.some((option) => option.value === method && option.value !== OTHER);
      setValue({
        // Older applications could tick both boxes; the first one wins.
        productionProcess: savedFarm.productionProcess?.[0] ?? "",
        productionMethod: method ? (known ? method : OTHER) : "",
        productionMethodOther: known ? "" : method,
        plotsTotal: String(savedFarm.plotsTotal ?? ""),
        raiTotal: String(savedFarm.raiTotal ?? ""),
        nganTotal: String(savedFarm.nganTotal ?? 0),
        certicatedPlotTotal: String(savedFarm.certicatedPlotTotal ?? ""),
        certicatedRaiTotal: String(savedFarm.certicatedRaiTotal ?? ""),
        certicatedNganTotal: String(savedFarm.certicatedNganTotal ?? 0),
      });
    } else {
      const draft = readProductionDraft();
      if (draft) setValue(draft);
    }
  }, [isUpdate, savedFarm]);

  const form = useFieldErrors(validateProduction(value));
  const set = (key: keyof ProductionDraft) => (next: string) => setValue((prev) => ({ ...prev, [key]: next }));
  const numberProps = (key: keyof ProductionDraft) => ({
    id: key,
    value: value[key],
    onChange: set(key),
    onBlur: () => form.touch(key),
    error: form.errors[key],
  });

  const production = {
    productionProcess: [value.productionProcess],
    productionMethod: value.productionMethod === OTHER ? value.productionMethodOther.trim() : value.productionMethod,
    plotsTotal: Number(value.plotsTotal),
    raiTotal: Number(value.raiTotal),
    nganTotal: Number(value.nganTotal || 0),
    certicatedPlotTotal: Number(value.certicatedPlotTotal),
    certicatedRaiTotal: Number(value.certicatedRaiTotal),
    certicatedNganTotal: Number(value.certicatedNganTotal || 0),
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    try {
      if (isUpdate) {
        setSaving(true);
        showSaving();
        await UpdateFarmKos01Service({ body: { ...production, docKos01Id: docKos1?.data?.id } });
        await queryClient.invalidateQueries({ queryKey: ["docKos1"] });
        showSaved();
        router.push(`/kos01/${docKos1?.data?.id}`);
        return;
      }
      const farm = readFarmDraft();
      if (!farm || !farm.mapHybrid || !farm.mapTerrain || !farm.certRequestDate) {
        saveProductionDraft(value);
        await Swal.fire({
          icon: "warning",
          title: "ยังไม่มีข้อมูลที่ตั้งแปลง",
          text: "กรุณากลับไปกรอกขั้นที่ 2 ที่ตั้งแปลงให้ครบก่อน",
          confirmButtonText: "ไปที่ขั้นที่ 2",
        });
        router.push({ pathname: "/create/kos01", query: { step: "farmFieldInformation" as Step } });
        return;
      }
      setSaving(true);
      showSaving("กำลังบันทึกใบสมัคร");
      const created = await CreateFarmDocKos1Service({
        address: farm.address.trim(),
        villageNumber: farm.moo.trim(),
        subdistrict: farm.tambon,
        district: farm.amphure,
        province: farm.province,
        latitude: farm.latitude,
        longitude: farm.longitude,
        certRequestDate: farm.certRequestDate,
        mapTerrain: farm.mapTerrain,
        mapHybrid: farm.mapHybrid,
        ...production,
      });
      clearKos01Drafts();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["docKos1"] }),
        queryClient.invalidateQueries({ queryKey: ["docKos"] }),
      ]);
      showSaved("บันทึกเรียบร้อย", "เหลืออีกขั้นเดียว: เพิ่มชนิดพืชที่ขอรับรอง");
      router.push(`/kos01/${created.docKos01Id}/plantKos1`);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    saveProductionDraft(value);
    router.push({ pathname: "/create/kos01", query: { step: "farmFieldInformation" as Step } });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <ErrorSummary errors={form.errors} show={form.submitted} />

      <FormCard title="การผลิต">
        <ChoiceCards
          id="productionProcess"
          label="ฟาร์มของคุณปลูกแบบไหน"
          options={processOptions}
          value={value.productionProcess}
          onChange={set("productionProcess")}
          error={form.errors.productionProcess}
          columns={2}
        />
        <ChoiceCards
          id="productionMethod"
          label="แยกการผลิตอินทรีย์ออกจากการผลิตทั่วไปอย่างไร"
          hint="ถ้าปลูกเฉพาะพืชอินทรีย์ ให้เลือกข้อที่ใกล้เคียงที่สุด หรือเลือก “อื่น ๆ” แล้วพิมพ์ว่า “ผลิตเฉพาะพืชอินทรีย์”"
          options={methodOptions}
          value={value.productionMethod}
          onChange={set("productionMethod")}
          error={form.errors.productionMethod}
          renderSelected={(option) =>
            option.value === OTHER && (
              <TextField
                id="productionMethodOther"
                label="อธิบายวิธีการผลิตของคุณ"
                placeholder="เช่น ผลิตเฉพาะพืชอินทรีย์"
                value={value.productionMethodOther}
                onChange={set("productionMethodOther")}
                onBlur={() => form.touch("productionMethodOther")}
                error={form.errors.productionMethodOther}
                maxLength={255}
                className="pl-4"
              />
            )
          }
        />
      </FormCard>

      <FormCard title="จำนวนแปลงและพื้นที่" description="1 ไร่ = 4 งาน ถ้าไม่มีเศษเป็นงาน ให้ใส่ 0">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">พื้นที่ทั้งหมดของฟาร์ม</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <NumberField {...numberProps("plotsTotal")} label="จำนวนแปลง" hint="นับทุกแปลง ทั้งอินทรีย์และทั่วไป" unit="แปลง" integer className="col-span-2 sm:col-span-1" />
            <NumberField {...numberProps("raiTotal")} label="พื้นที่ (ไร่)" hint="เช่น 5" unit="ไร่" />
            <NumberField {...numberProps("nganTotal")} label="และ (งาน)" hint="0 ถึง 3" unit="งาน" />
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-third-color/30 pt-5">
          <h3 className="text-lg font-bold">ส่วนที่ขอรับรอง KOS</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <NumberField {...numberProps("certicatedPlotTotal")} label="จำนวนแปลง" hint="ไม่เกินจำนวนแปลงทั้งหมด" unit="แปลง" integer className="col-span-2 sm:col-span-1" />
            <NumberField {...numberProps("certicatedRaiTotal")} label="พื้นที่ (ไร่)" hint="เช่น 2" unit="ไร่" />
            <NumberField {...numberProps("certicatedNganTotal")} label="และ (งาน)" hint="0 ถึง 3" unit="งาน" />
          </div>
          {!form.errors.certicatedRaiTotal && toNgan(value.certicatedRaiTotal, value.certicatedNganTotal) > 0 && toNgan(value.raiTotal, value.nganTotal) > 0 && (
            <p className="flex items-center gap-1.5 text-base text-main-color">
              <LuCheck aria-hidden="true" className="size-5" />
              ขอรับรอง {formatArea(value.certicatedRaiTotal, value.certicatedNganTotal)} จากทั้งหมด {formatArea(value.raiTotal, value.nganTotal)}
            </p>
          )}
        </div>
        {form.submitted && form.errorCount > 0 && <FieldErrorText>แก้ไขช่องที่มีกรอบสีแดงก่อนบันทึก</FieldErrorText>}
      </FormCard>

      <FormActions>
        {isUpdate ? (
          <Link href={`/kos01/${docKos1?.data?.id}`} className="btn btn-secondary">
            ยกเลิก
          </Link>
        ) : (
          <button type="button" onClick={goBack} className="btn btn-secondary">
            <LuArrowLeft aria-hidden="true" className="size-5" />
            ย้อนกลับ
          </button>
        )}
        <button type="submit" className="btn btn-primary sm:min-w-44" disabled={saving}>
          <LuSave aria-hidden="true" className="size-5" />
          {isUpdate ? "บันทึก" : "บันทึกและไปเพิ่มพืช"}
        </button>
      </FormActions>
    </form>
  );
}

export default ProductionInformation;
