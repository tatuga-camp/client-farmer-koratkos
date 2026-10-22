import { useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { LuArrowLeft, LuKeyRound, LuSave } from "react-icons/lu";
import Swal from "sweetalert2";
import {
  AccountValues,
  IdCardField,
  NoteBox,
  PhoneField,
  TitleField,
  accountFromFarmer,
  accountTitle,
  toDigits,
  validateAccount,
} from "../../components/account/accountFields";
import ProfilePhotoCard from "../../components/account/profilePhotoCard";
import { ErrorSummary, FormActions, FormCard, TextField } from "../../components/ui";
import DashboardLayout from "../../layouts/dashboardLayout";
import { UpdateFarmerService } from "../../services/farmer";
import { showError, showSaved, showSaving } from "../../utils/confirm";
import { useFarmer } from "../../utils/useFarmer";
import { useFieldErrors } from "../../utils/useFieldErrors";

/** Mounted by DashboardLayout only once the farmer is loaded, so the form starts filled in. */
function ProfileForm() {
  const farmer = useFarmer();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<AccountValues>(() => accountFromFarmer(farmer.data));
  const [saving, setSaving] = useState(false);
  const form = useFieldErrors(validateAccount(values));

  const update = (name: keyof AccountValues) => (value: string) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const identityCardId = toDigits(values.idCard);
    const phoneNumber = toDigits(values.phone);
    const loginChanged = identityCardId !== farmer.data?.identityCardId || phoneNumber !== farmer.data?.phoneNumber;
    try {
      setSaving(true);
      showSaving();
      await UpdateFarmerService({
        title: accountTitle(values),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        identityCardId,
        phoneNumber,
      });
      await queryClient.invalidateQueries({ queryKey: ["farmer"] });
      if (loginChanged) {
        // Both values contain only digits and dashes, so they are safe as HTML.
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลเรียบร้อย",
          html: `ครั้งต่อไปให้เข้าสู่ระบบด้วย<br />เลขบัตรประชาชน <b>${values.idCard}</b><br />และเบอร์โทร <b>${values.phone}</b>`,
          confirmButtonText: "ตกลง",
        });
      } else {
        showSaved();
      }
    } catch (error) {
      // The server answers a number already used by another account with a bare 500.
      const status = (error as { statusCode?: number } | undefined)?.statusCode;
      showError(
        loginChanged && status === 500
          ? { message: "เลขบัตรประชาชนหรือเบอร์โทรนี้อาจมีบัญชีอื่นใช้อยู่แล้ว ตรวจดูตัวเลขอีกครั้ง แล้วลองใหม่" }
          : error,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ErrorSummary errors={form.errors} show={form.submitted} />
      <FormCard title="ชื่อ-นามสกุล" description="ให้ตรงกับบัตรประชาชน">
        <TitleField
          id="title"
          choice={values.titleChoice}
          otherTitle={values.otherTitle}
          onChoiceChange={update("titleChoice")}
          onOtherTitleChange={update("otherTitle")}
          onOtherTitleBlur={() => form.touch("otherTitle")}
          errors={form.errors}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            label="ชื่อ"
            hint="ไม่ต้องใส่คำนำหน้า เช่น สมชาย"
            value={values.firstName}
            onChange={update("firstName")}
            onBlur={() => form.touch("firstName")}
            error={form.errors.firstName}
            autoComplete="given-name"
            maxLength={255}
          />
          <TextField
            id="lastName"
            label="นามสกุล"
            hint="เช่น ใจดี"
            value={values.lastName}
            onChange={update("lastName")}
            onBlur={() => form.touch("lastName")}
            error={form.errors.lastName}
            autoComplete="family-name"
            maxLength={255}
          />
        </div>
      </FormCard>

      <FormCard title="ข้อมูลเข้าสู่ระบบ">
        <NoteBox icon={<LuKeyRound />} tone="warn">
          <p className="font-semibold">เลขบัตรประชาชนและเบอร์โทรนี้ ใช้เข้าสู่ระบบ</p>
          <p>ถ้าแก้ไข ครั้งต่อไปต้องเข้าสู่ระบบด้วยเลขใหม่ จดไว้ให้ดี</p>
        </NoteBox>
        <div className="grid gap-5 sm:grid-cols-2">
          <IdCardField
            id="idCard"
            label="เลขบัตรประชาชน"
            hint="13 หลัก พิมพ์แค่ตัวเลข เช่น 1-2345-67890-12-3"
            value={values.idCard}
            onChange={update("idCard")}
            onBlur={() => form.touch("idCard")}
            error={form.errors.idCard}
          />
          <PhoneField
            id="phone"
            label="เบอร์โทรศัพท์"
            hint="เบอร์มือถือ 10 หลัก เช่น 081-234-5678"
            value={values.phone}
            onChange={update("phone")}
            onBlur={() => form.touch("phone")}
            error={form.errors.phone}
          />
        </div>
      </FormCard>

      <FormActions>
        <Link href="/" className="btn btn-secondary">
          ยกเลิก
        </Link>
        <button type="submit" className="btn btn-primary sm:min-w-44" disabled={saving}>
          <LuSave aria-hidden="true" className="size-5" />
          บันทึก
        </button>
      </FormActions>
    </form>
  );
}

function Setting() {
  return (
    <DashboardLayout>
      <Head>
        <title>ข้อมูลส่วนตัว | Korat KOS สำหรับเกษตรกร</title>
      </Head>
      <header className="flex flex-col gap-3">
        <Link href="/" className="btn btn-ghost btn-sm -ml-3 self-start">
          <LuArrowLeft aria-hidden="true" className="size-5" />
          กลับหน้าหลัก
        </Link>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-balance text-2xl font-bold leading-snug sm:text-3xl">ข้อมูลส่วนตัว</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-super-main-color/80">
            เปลี่ยนรูปโปรไฟล์ แก้ไขชื่อ เลขบัตรประชาชน และเบอร์โทรที่ใช้เข้าสู่ระบบ
          </p>
        </div>
      </header>
      <ProfilePhotoCard />
      <ProfileForm />
    </DashboardLayout>
  );
}

export default Setting;
