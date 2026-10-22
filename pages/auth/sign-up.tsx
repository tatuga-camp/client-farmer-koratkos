import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { LuKeyRound, LuLoader2, LuLogIn, LuUserPlus } from "react-icons/lu";
import Swal from "sweetalert2";
import {
  AccountValues,
  FormAlert,
  IdCardField,
  NoteBox,
  PhoneField,
  TitleField,
  accountTitle,
  emptyAccount,
  toDigits,
  validateAccount,
} from "../../components/account/accountFields";
import Agreement from "../../components/agreement";
import { ErrorSummary, FieldErrorText, TextField } from "../../components/ui";
import HomePageLayout from "../../layouts/homePageLayout";
import { SignUpService } from "../../services/auth";
import { errorMessage } from "../../utils/confirm";
import { useFieldErrors } from "../../utils/useFieldErrors";

function SignUp() {
  const router = useRouter();
  const [values, setValues] = useState<AccountValues>(emptyAccount);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<unknown>();

  const form = useFieldErrors({
    ...validateAccount(values),
    isAccept: accepted ? undefined : "กรุณาอ่านข้อตกลง แล้วติ๊กช่อง “ฉันอ่านและยอมรับข้อตกลง”",
  });

  const update = (name: keyof AccountValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerError(undefined);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(undefined);
    if (!form.validate()) return;
    setSubmitting(true);
    try {
      await SignUpService({
        title: accountTitle(values),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        identityCardId: toDigits(values.idCard),
        phoneNumber: toDigits(values.phone),
      });
    } catch (error) {
      setServerError(error ?? null);
      setSubmitting(false);
      return;
    }
    router.push("/auth/sign-in");
    // Both values contain only digits and dashes (see formatIdCard / formatPhone), so they are safe as HTML.
    Swal.fire({
      icon: "success",
      title: "สมัครใช้งานสำเร็จ",
      html: `ต่อไปให้เข้าสู่ระบบด้วย<br />เลขบัตรประชาชน <b>${values.idCard}</b><br />และเบอร์โทร <b>${values.phone}</b>`,
      confirmButtonText: "ไปเข้าสู่ระบบ",
    });
  };

  const message = serverError !== undefined ? errorMessage(serverError) : "";
  const alreadyRegistered = message.includes("มีอยู่ในระบบ");

  return (
    <HomePageLayout>
      <Head>
        <title>สมัครใช้งาน | Korat KOS สำหรับเกษตรกร</title>
      </Head>
      <div className="card flex flex-col gap-6 p-5 sm:p-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">สมัครใช้งาน</h1>
          <p className="text-lg text-super-main-color/80">สำหรับเกษตรกรที่ยังไม่มีบัญชี ใช้เวลาไม่ถึง 2 นาที</p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-7">
          <ErrorSummary errors={form.errors} show={form.submitted} />

          <section aria-labelledby="name-title" className="flex flex-col gap-5">
            <h2 id="name-title" className="text-xl font-bold">
              ชื่อผู้สมัคร
            </h2>
            <TitleField
              id="title"
              choice={values.titleChoice}
              otherTitle={values.otherTitle}
              onChoiceChange={update("titleChoice")}
              onOtherTitleChange={update("otherTitle")}
              onOtherTitleBlur={() => form.touch("otherTitle")}
              errors={form.errors}
            />
            <TextField
              id="firstName"
              label="ชื่อ"
              hint="ชื่อจริงตามบัตรประชาชน ไม่ต้องใส่คำนำหน้า เช่น สมชาย"
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
          </section>

          <section aria-labelledby="login-title" className="flex flex-col gap-5">
            <h2 id="login-title" className="text-xl font-bold">
              ข้อมูลสำหรับเข้าสู่ระบบ
            </h2>
            <NoteBox icon={<LuKeyRound />} tone="warn">
              เลขบัตรประชาชนและเบอร์โทรนี้ ใช้เข้าสู่ระบบทุกครั้ง (ไม่มีรหัสผ่าน) กรุณาตรวจดูให้ถูกต้อง
            </NoteBox>
            <IdCardField
              id="idCard"
              label="เลขบัตรประชาชน"
              hint="ตัวเลข 13 หลักบนบัตร พิมพ์แค่ตัวเลข ระบบใส่ขีดให้เอง เช่น 1-2345-67890-12-3"
              value={values.idCard}
              onChange={update("idCard")}
              onBlur={() => form.touch("idCard")}
              error={form.errors.idCard}
            />
            <PhoneField
              id="phone"
              label="เบอร์โทรศัพท์"
              hint="เบอร์มือถือที่ใช้อยู่ 10 หลัก เช่น 081-234-5678"
              value={values.phone}
              onChange={update("phone")}
              onBlur={() => form.touch("phone")}
              error={form.errors.phone}
            />
          </section>

          <section aria-labelledby="agreement-title" className="flex flex-col gap-3">
            <h2 id="agreement-title" className="text-xl font-bold">
              ข้อตกลงการใช้งาน
            </h2>
            <p className="hint">เลื่อนอ่านในกรอบด้านล่างให้จบ แล้วติ๊กยอมรับ</p>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="agreement-title"
              className="max-h-64 overflow-y-auto rounded-xl border border-super-main-color/20 bg-fourth-color/60 p-4 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-main-color"
            >
              <Agreement />
            </div>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-white p-4 transition-colors ${
                accepted
                  ? "border-main-color bg-main-color/5"
                  : form.errors.isAccept
                    ? "border-red-600"
                    : "border-super-main-color/20 hover:border-super-main-color/40"
              }`}
            >
              <input
                id="isAccept"
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                aria-invalid={form.errors.isAccept ? true : undefined}
                aria-describedby={form.errors.isAccept ? "isAccept-error" : undefined}
                className="size-6 shrink-0 cursor-pointer accent-main-color"
              />
              <span className="text-lg font-semibold">ฉันอ่านและยอมรับข้อตกลง</span>
            </label>
            {form.errors.isAccept && <FieldErrorText id="isAccept-error">{form.errors.isAccept}</FieldErrorText>}
          </section>

          {serverError !== undefined && (
            <FormAlert title="สมัครใช้งานไม่สำเร็จ">
              <p className="whitespace-pre-line">{message}</p>
              {alreadyRegistered && (
                <p>
                  ถ้าเคยสมัครไว้แล้ว ไม่ต้องสมัครใหม่{" "}
                  <Link href="/auth/sign-in" className="font-semibold underline underline-offset-2">
                    ไปหน้าเข้าสู่ระบบ
                  </Link>
                </p>
              )}
            </FormAlert>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? (
              <>
                <LuLoader2 aria-hidden="true" className="size-5 animate-spin" />
                กำลังสมัคร…
              </>
            ) : (
              <>
                <LuUserPlus aria-hidden="true" className="size-5" />
                สมัครใช้งาน
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-3 border-t border-third-color/30 pt-5">
          <p className="text-center text-lg">มีบัญชีแล้ว?</p>
          <Link href="/auth/sign-in" className="btn btn-secondary w-full">
            <LuLogIn aria-hidden="true" className="size-5" />
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </HomePageLayout>
  );
}

export default SignUp;
