import { UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuCopy, LuSave } from "react-icons/lu";
import {
  AddressFields,
  DateField,
  ErrorSummary,
  FormActions,
  FormCard,
  emptyAddress,
  validateAddress,
} from "../../../ui";
import { FarmLocation } from "./farmLocation";
import { FarmDraft, readFarmDraft, saveFarmDraft } from "../farmDraft";
import {
  GetDocKos1Service,
  ResponseGetAllDocKos1Service,
  UpdateFarmKos01Service,
} from "../../../../services/kos1";
import { showError, showSaved, showSaving } from "../../../../utils/confirm";
import { useFieldErrors } from "../../../../utils/useFieldErrors";
import { checkDate, checkLatitude, checkLongitude } from "../../../../utils/validators";
import { Step } from "../../../../pages/create/kos01";

type FarmFieldInformationProps = {
  isUpdate?: boolean;
  docKos1?: UseQueryResult<ResponseGetAllDocKos1Service, Error>;
};

const blankFarm = (): FarmDraft => ({
  ...emptyAddress(),
  latitude: "",
  longitude: "",
  certRequestDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
});

function validateFarm(value: FarmDraft) {
  const hasCoordinates = !checkLatitude(value.latitude) && !checkLongitude(value.longitude);
  return {
    ...validateAddress(value, { mooRequired: false }),
    latitude: checkLatitude(value.latitude),
    longitude: checkLongitude(value.longitude),
    map:
      hasCoordinates && (!value.mapHybrid || !value.mapTerrain)
        ? "กดปุ่ม “ดูแผนที่แปลง” แล้วตรวจว่าหมุดอยู่ตรงแปลง ก่อนไปต่อ"
        : undefined,
    certRequestDate: checkDate(value.certRequestDate, { label: "วันที่ยื่นขอการรับรอง" }),
  };
}

/** KOS-01 step 2: where the farm is, checked on a map, and the application date. */
function FarmFieldInformation({ isUpdate, docKos1 }: FarmFieldInformationProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [farm, setFarm] = useState<FarmDraft>(blankFarm);
  const [saving, setSaving] = useState(false);
  // The applicant's address, offered as a starting point for the farm address.
  const applicant = useQuery({ queryKey: ["docKos1"], queryFn: () => GetDocKos1Service(), retry: false });
  const savedFarm = docKos1?.data?.farmKos1;

  useEffect(() => {
    if (isUpdate) {
      if (!savedFarm) return;
      setFarm({
        address: savedFarm.address ?? "",
        moo: savedFarm.villageNumber ?? "",
        province: savedFarm.province ?? "",
        amphure: savedFarm.district ?? "",
        tambon: savedFarm.subdistrict ?? "",
        latitude: savedFarm.latitude ?? "",
        longitude: savedFarm.longitude ?? "",
        mapHybrid: savedFarm.mapHybrid,
        mapTerrain: savedFarm.mapTerrain,
        certRequestDate: savedFarm.certRequestDate ? new Date(savedFarm.certRequestDate).toISOString() : undefined,
      });
    } else {
      const draft = readFarmDraft();
      if (draft) setFarm(draft);
    }
  }, [isUpdate, savedFarm]);

  const form = useFieldErrors(validateFarm(farm));
  const patch = (next: Partial<FarmDraft>) => setFarm((prev) => ({ ...prev, ...next }));

  const copyApplicantAddress = () => {
    const data = applicant.data;
    if (!data) return;
    patch({
      address: data.address ?? "",
      moo: data.villageNumber ?? "",
      province: data.province ?? "",
      amphure: data.district ?? "",
      tambon: data.subdistrict ?? "",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    if (!isUpdate) {
      saveFarmDraft(farm);
      router.push({ pathname: "/create/kos01", query: { step: "productionInformation" as Step } });
      return;
    }
    try {
      setSaving(true);
      showSaving();
      await UpdateFarmKos01Service({
        body: {
          address: farm.address.trim(),
          villageNumber: farm.moo.trim(),
          subdistrict: farm.tambon,
          district: farm.amphure,
          province: farm.province,
          latitude: farm.latitude,
          longitude: farm.longitude,
          certRequestDate: farm.certRequestDate ? new Date(farm.certRequestDate) : undefined,
          mapTerrain: farm.mapTerrain,
          mapHybrid: farm.mapHybrid,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["docKos1"] });
      showSaved();
      router.push(`/kos01/${docKos1?.data?.id}`);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    saveFarmDraft(farm);
    router.push({ pathname: "/create/kos01", query: { step: "basicInformation" as Step } });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <ErrorSummary errors={form.errors} show={form.submitted} />

      <FormCard title="ที่อยู่แปลง" description="ที่ตั้งของแปลงที่ขอรับรอง ถ้าแปลงอยู่ที่บ้าน ให้กดคัดลอกที่อยู่ผู้สมัคร">
        {applicant.data && (
          <button type="button" onClick={copyApplicantAddress} className="btn btn-secondary btn-sm w-full sm:w-fit">
            <LuCopy aria-hidden="true" className="size-5" />
            คัดลอกที่อยู่ผู้สมัคร
          </button>
        )}
        <AddressFields value={farm} onChange={(address) => patch(address)} errors={form.errors} touch={form.touch} mooOptional />
      </FormCard>

      <FormCard title="พิกัดแปลง" description="ตำแหน่งบนแผนที่ ใช้ให้ผู้ตรวจเดินทางไปถึงแปลงได้ถูกต้อง">
        <FarmLocation value={farm} onChange={patch} errors={form.errors} touch={form.touch} />
      </FormCard>

      <FormCard title="วันที่ยื่นขอการรับรอง">
        <DateField
          id="certRequestDate"
          label="วันที่ยื่นใบสมัคร"
          hint="ปกติคือวันนี้ ถ้ายื่นเอกสารกระดาษไว้ก่อนแล้ว ให้เลือกวันที่ยื่น"
          value={farm.certRequestDate}
          onChange={(certRequestDate) => patch({ certRequestDate })}
          onBlur={() => form.touch("certRequestDate")}
          error={form.errors.certRequestDate}
        />
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
          {isUpdate ? (
            <>
              <LuSave aria-hidden="true" className="size-5" />
              บันทึก
            </>
          ) : (
            <>
              ถัดไป
              <LuArrowRight aria-hidden="true" className="size-5" />
            </>
          )}
        </button>
      </FormActions>
    </form>
  );
}

export default FarmFieldInformation;
