import { useQuery } from "@tanstack/react-query";
import React from "react";
import { SelectField, TextField } from "./Field";
import {
  GetAllAmphuresByProvinceService,
  GetAllProvinceService,
  GetAllTambonByAmphureService,
} from "../../services/thai-data";
import { checkText, FieldErrors } from "../../utils/validators";

/** Address as the server stores it: names, not ids. */
export type AddressValue = {
  address: string;
  moo: string;
  province: string;
  amphure: string;
  tambon: string;
};

/** KOS is a Nakhon Ratchasima scheme, so new addresses start in that province. */
export const emptyAddress = (): AddressValue => ({
  address: "",
  moo: "",
  province: "นครราชสีมา",
  amphure: "",
  tambon: "",
});

export function validateAddress(value: AddressValue, { mooRequired = true } = {}): FieldErrors {
  return {
    address: checkText(value.address, { label: "บ้านเลขที่", example: "99/1" }),
    moo: checkText(value.moo, { label: "หมู่ที่", example: "5", required: mooRequired }),
    province: value.province ? undefined : "กรุณาเลือกจังหวัด",
    amphure: value.amphure ? undefined : "กรุณาเลือกอำเภอ",
    tambon: value.tambon ? undefined : "กรุณาเลือกตำบล",
  };
}

type AddressFieldsProps = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  errors: FieldErrors;
  touch: (name: string) => void;
  /** The farm address may have no village number; the applicant's address must. */
  mooOptional?: boolean;
};

const toOptions = (names: string[]) => names.map((name) => ({ value: name, label: name }));

/** House number, village, then province → district → sub-district, each list narrowed by the one before. */
export function AddressFields({ value, onChange, errors, touch, mooOptional }: AddressFieldsProps) {
  const provinces = useQuery({ queryKey: ["provinces"], queryFn: () => GetAllProvinceService(), staleTime: Infinity });
  const provinceId = provinces.data?.find((province) => province.name_th === value.province)?.originalId;

  const amphures = useQuery({
    queryKey: ["amphures", provinceId],
    queryFn: () => GetAllAmphuresByProvinceService({ provinceId: provinceId as number }),
    enabled: provinceId !== undefined,
    staleTime: Infinity,
  });
  const amphureId = amphures.data?.find((amphure) => amphure.name_th === value.amphure)?.originalId;

  const tambons = useQuery({
    queryKey: ["tambons", amphureId],
    queryFn: () => GetAllTambonByAmphureService({ amphureId: amphureId as number }),
    enabled: amphureId !== undefined,
    staleTime: Infinity,
  });

  const set = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch });

  // A saved name that isn't in the loaded list (old data, renamed district) stays selectable.
  const withCurrent = (names: string[], current: string) =>
    current && !names.includes(current) ? [current, ...names] : names;

  const provinceNames = withCurrent((provinces.data ?? []).map((p) => p.name_th), value.province);
  const amphureNames = withCurrent((amphures.data ?? []).map((a) => a.name_th), value.amphure);
  const tambonNames = withCurrent((tambons.data ?? []).map((t) => t.name_th), value.tambon);

  // If the address service is down, let farmers type the names instead of blocking the form.
  const offline = provinces.isError || amphures.isError || tambons.isError;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField
        id="address"
        label="บ้านเลขที่"
        hint="ตามทะเบียนบ้าน เช่น 99 หรือ 99/1"
        value={value.address}
        onChange={(address) => set({ address })}
        onBlur={() => touch("address")}
        error={errors.address}
        autoComplete="address-line1"
        maxLength={255}
      />
      <TextField
        id="moo"
        label="หมู่ที่"
        hint={mooOptional ? "ถ้าไม่มีหมู่ ให้เว้นว่างไว้" : "ใส่เฉพาะตัวเลข เช่น 5"}
        optional={mooOptional}
        inputMode="numeric"
        value={value.moo}
        onChange={(moo) => set({ moo })}
        onBlur={() => touch("moo")}
        error={errors.moo}
        maxLength={255}
      />
      {offline ? (
        <>
          <TextField id="province" label="จังหวัด" value={value.province} onChange={(province) => set({ province })} onBlur={() => touch("province")} error={errors.province} />
          <TextField id="amphure" label="อำเภอ" value={value.amphure} onChange={(amphure) => set({ amphure })} onBlur={() => touch("amphure")} error={errors.amphure} />
          <TextField id="tambon" label="ตำบล" value={value.tambon} onChange={(tambon) => set({ tambon })} onBlur={() => touch("tambon")} error={errors.tambon} />
        </>
      ) : (
        <>
          <SelectField
            id="province"
            label="จังหวัด"
            value={value.province}
            onChange={(province) => set({ province, amphure: "", tambon: "" })}
            onBlur={() => touch("province")}
            error={errors.province}
            options={toOptions(provinceNames)}
            placeholder={provinces.isLoading ? "กำลังโหลดรายชื่อจังหวัด…" : "แตะเพื่อเลือกจังหวัด"}
            disabled={provinces.isLoading}
          />
          <SelectField
            id="amphure"
            label="อำเภอ"
            hint={!value.province ? "เลือกจังหวัดก่อน" : undefined}
            value={value.amphure}
            onChange={(amphure) => set({ amphure, tambon: "" })}
            onBlur={() => touch("amphure")}
            error={errors.amphure}
            options={toOptions(amphureNames)}
            placeholder={amphures.isFetching ? "กำลังโหลดรายชื่ออำเภอ…" : "แตะเพื่อเลือกอำเภอ"}
            disabled={!value.province || amphures.isFetching}
          />
          <SelectField
            id="tambon"
            label="ตำบล"
            hint={!value.amphure ? "เลือกอำเภอก่อน" : undefined}
            value={value.tambon}
            onChange={(tambon) => set({ tambon })}
            onBlur={() => touch("tambon")}
            error={errors.tambon}
            options={toOptions(tambonNames)}
            placeholder={tambons.isFetching ? "กำลังโหลดรายชื่อตำบล…" : "แตะเพื่อเลือกตำบล"}
            disabled={!value.amphure || tambons.isFetching}
          />
        </>
      )}
    </div>
  );
}
