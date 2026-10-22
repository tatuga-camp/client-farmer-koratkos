import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LuArrowRight, LuSave } from "react-icons/lu";
import Swal from "sweetalert2";
import {
  AddressFields,
  AddressValue,
  ErrorSummary,
  FormActions,
  FormCard,
  emptyAddress,
  validateAddress,
} from "../../../ui";
import {
  CreateDocKos1Service,
  ResponseGetAllDocKos1Service,
  UpdateDocKos1Service,
} from "../../../../services/kos1";
import { showError, showSaved, showSaving } from "../../../../utils/confirm";
import { useFieldErrors } from "../../../../utils/useFieldErrors";
import { Step } from "../../../../pages/create/kos01";

type BasicInformationProps = {
  /** Editing a saved application (returns to the KOS-01 overview) rather than creating one. */
  isUpdate?: boolean;
  docKos1?: UseQueryResult<ResponseGetAllDocKos1Service, Error>;
};

/** KOS-01 step 1: the applicant's home address. */
function BasicInformation({ isUpdate, docKos1 }: BasicInformationProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState<AddressValue>(emptyAddress);
  const [saving, setSaving] = useState(false);
  const saved = docKos1?.data;

  // Prefill when editing, or when the farmer came back to step 1 of an application already started.
  useEffect(() => {
    if (!saved) return;
    setAddress({
      address: saved.address ?? "",
      moo: saved.villageNumber ?? "",
      province: saved.province ?? "",
      amphure: saved.district ?? "",
      tambon: saved.subdistrict ?? "",
    });
  }, [saved]);

  const form = useFieldErrors(validateAddress(address));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const body = {
      address: address.address.trim(),
      villageNumber: address.moo.trim(),
      province: address.province,
      district: address.amphure,
      subdistrict: address.tambon,
    };
    try {
      setSaving(true);
      showSaving();
      if (saved) {
        await UpdateDocKos1Service(body);
      } else {
        await CreateDocKos1Service(body);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["docKos1"] }),
        queryClient.invalidateQueries({ queryKey: ["docKos"] }),
      ]);
      if (isUpdate && saved) {
        showSaved();
        router.push(`/kos01/${saved.id}`);
      } else {
        Swal.close();
        router.push({ pathname: "/create/kos01", query: { step: "farmFieldInformation" as Step } });
      }
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
        title="ที่อยู่ผู้สมัคร"
        description="กรอกที่อยู่ตามทะเบียนบ้านของคุณ ส่วนที่ตั้งแปลงจะกรอกในขั้นถัดไป"
      >
        <AddressFields value={address} onChange={setAddress} errors={form.errors} touch={form.touch} />
      </FormCard>
      <FormActions>
        {isUpdate && saved && (
          <Link href={`/kos01/${saved.id}`} className="btn btn-secondary">
            ยกเลิก
          </Link>
        )}
        <button type="submit" className="btn btn-primary sm:min-w-44" disabled={saving}>
          {isUpdate ? (
            <>
              <LuSave aria-hidden="true" className="size-5" />
              บันทึก
            </>
          ) : (
            <>
              บันทึกและไปขั้นถัดไป
              <LuArrowRight aria-hidden="true" className="size-5" />
            </>
          )}
        </button>
      </FormActions>
    </form>
  );
}

export default BasicInformation;
