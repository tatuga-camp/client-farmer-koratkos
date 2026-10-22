import { useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { setCookie } from "nookies";
import React, { useState } from "react";
import { LuInfo, LuLoader2, LuLogIn, LuUserPlus } from "react-icons/lu";
import { FormAlert, IdCardField, NoteBox, PhoneField, toDigits } from "../../components/account/accountFields";
import HomePageLayout from "../../layouts/homePageLayout";
import { SignInService } from "../../services/auth";
import { errorMessage } from "../../utils/confirm";
import { useFieldErrors } from "../../utils/useFieldErrors";
import { checkThaiIdCard, checkThaiPhone } from "../../utils/validators";

function SignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState({ idCard: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<unknown>();

  const form = useFieldErrors({
    idCard: checkThaiIdCard(values.idCard),
    phone: checkThaiPhone(values.phone),
  });

  const update = (name: keyof typeof values) => (value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerError(undefined);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(undefined);
    if (!form.validate()) return;
    setSubmitting(true);
    let accessToken: string;
    try {
      const signIn = await SignInService({
        identityCardId: toDigits(values.idCard),
        phoneNumber: toDigits(values.phone),
      });
      accessToken = signIn.access_token;
    } catch (error) {
      setServerError(error ?? null);
      setSubmitting(false);
      return;
    }
    setCookie(null, "access_token", accessToken, {
      maxAge: 2 * 24 * 60 * 60, // 2 days, same as the token itself
      path: "/",
    });
    // On a shared phone the previous farmer's data may still be cached.
    queryClient.removeQueries();
    router.push("/");
  };

  const notFound = (serverError as { statusCode?: number } | null)?.statusCode === 404;

  return (
    <HomePageLayout>
      <Head>
        <title>เข้าสู่ระบบ | Korat KOS สำหรับเกษตรกร</title>
      </Head>
      <div className="card flex flex-col gap-6 p-5 sm:p-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">เข้าสู่ระบบ</h1>
          <p className="text-lg text-super-main-color/80">สำหรับเกษตรกรที่สมัครใช้งานแล้ว</p>
        </header>

        <NoteBox icon={<LuInfo />}>ใช้เลขบัตรประชาชนและเบอร์โทรที่ใช้ตอนสมัคร ไม่ต้องมีรหัสผ่าน</NoteBox>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            hint="เบอร์มือถือ 10 หลัก เช่น 081-234-5678"
            value={values.phone}
            onChange={update("phone")}
            onBlur={() => form.touch("phone")}
            error={form.errors.phone}
          />

          {serverError !== undefined && (
            <FormAlert title="เข้าสู่ระบบไม่สำเร็จ">
              <p className="whitespace-pre-line">{errorMessage(serverError)}</p>
              {notFound && <p>ถ้ายังไม่เคยสมัคร ให้กดปุ่ม “สมัครใช้งาน” ด้านล่าง</p>}
            </FormAlert>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? (
              <>
                <LuLoader2 aria-hidden="true" className="size-5 animate-spin" />
                กำลังเข้าสู่ระบบ…
              </>
            ) : (
              <>
                <LuLogIn aria-hidden="true" className="size-5" />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-3 border-t border-third-color/30 pt-5">
          <p className="text-center text-lg">ยังไม่มีบัญชี?</p>
          <Link href="/auth/sign-up" className="btn btn-secondary w-full">
            <LuUserPlus aria-hidden="true" className="size-5" />
            สมัครใช้งาน
          </Link>
        </div>
      </div>
    </HomePageLayout>
  );
}

export default SignIn;
