import React, { useState } from "react";
import HomePageLayout from "../../layouts/homePageLayout";
import { Farmer } from "../../components/svgs/Farmer";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";
import Head from "next/head";
import { SignInService } from "../../services/auth";
import Swal from "sweetalert2";
import Link from "next/link";
import { setCookie } from "nookies";
import { useRouter } from "next/router";
import Image from "next/image";

function SignIn() {
  const router = useRouter();
  const [farmerData, setFarmerData] = useState({
    idCard: "",
    phone: "",
  });

  const handleOnChangeFarmerData = (e: InputMaskChangeEvent) => {
    const { name, value } = e.target;
    setFarmerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummitOnSignIn = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (farmerData.idCard.length !== 17 || farmerData.phone.length !== 12) {
        throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
      }
      Swal.fire({
        title: "กำลังเข้าสู่ระบบ",
        html: "กรุณารอสักครู่",
        timerProgressBar: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const signIn = await SignInService({
        identityCardId: farmerData.idCard.replace(/-/g, ""),
        phoneNumber: farmerData.phone.replace(/-/g, ""),
      });
      setCookie(null, "access_token", signIn.access_token, {
        maxAge: 2 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
        path: "/", // Cookie path (can be adjusted based on your needs)
      });
      router.push("/");
      Swal.fire({
        title: "เข้าสู่ระบบสำเร็จ",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.log(error);
      Swal.fire({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        html: error.message.toString(),
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <HomePageLayout>
      <Head>
        <title>เข้าสู่ระบบ</title>
      </Head>

      <div className="w-full pt-40">
        <header className=" flex w-full flex-col items-center justify-center gap-4 font-Anuphan">
          <section className="flex w-40 flex-col items-center justify-center rounded-lg bg-third-color px-5 py-2 text-base font-semibold text-white">
            <h1>เข้าสู่ระบบ</h1>
            <h2>สำหรับเกษตรกร</h2>
          </section>
          <div className="h-24 w-24 overflow-hidden  rounded-full ring-2 ring-super-main-color">
            <Farmer />
          </div>
        </header>
        <main className="mt-5 flex items-center justify-center font-Anuphan">
          <Form
            onSubmit={handleSummitOnSignIn}
            className="flex flex-col items-center justify-center gap-5 lg:w-8/12"
          >
            <TextField
              type="text"
              className="flex w-10/12 flex-col"
              name="idCard"
              isRequired
            >
              <Label className="text-xl font-bold text-third-color">
                เลขบัตรประจำตัวประชาชน :
              </Label>
              <InputMask
                required
                onChange={handleOnChangeFarmerData}
                mask="9-9999-99999-99-9"
                placeholder="9-9999-99999-99-9"
                name="idCard"
                type="text"
                value={farmerData.idCard}
                inputMode="numeric"
                className="h-10 w-full bg-slate-200 pl-5 text-xl"
              />
            </TextField>
            <TextField type="tel" className="flex w-10/12 flex-col" isRequired>
              <Label className="text-xl font-bold  text-third-color">
                เบอร์โทรศัพท์ :
              </Label>

              <InputMask
                required
                name="phone"
                type="text"
                inputMode="numeric"
                className="h-10 w-full bg-slate-200 pl-5 text-xl"
                mask="999-999-9999"
                placeholder="999-999-9999"
                onChange={handleOnChangeFarmerData}
                value={farmerData.phone}
              />
            </TextField>
            <div>
              <Button
                className="rounded-xl bg-third-color px-10 py-2 text-xl font-bold text-white 
                transition duration-100 hover:bg-super-main-color 
                active:scale-110 active:ring-2 active:ring-super-main-color"
                type="submit"
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </Form>
        </main>
        <footer className="mt-5 flex w-full justify-center">
          <Link
            className="font-Anuphan text-lg text-blue-700 underline"
            href="/auth/sign-up"
          >
            ไม่มีบัญชี? กดเพื่อลงทะเบียน
          </Link>
        </footer>
      </div>
    </HomePageLayout>
  );
}

export default SignIn;
