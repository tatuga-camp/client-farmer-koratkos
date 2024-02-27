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
import { Checkbox } from "primereact/checkbox";
import Head from "next/head";
import Swal from "sweetalert2";
import { SignUpService } from "../../services/auth";
import { useRouter } from "next/router";

function SignUp() {
  const router = useRouter();
  const [signUpForm, setSignUpForm] = useState<{
    title: string;
    firstName: string;
    lastName: string;
    idCard: string;
    phone: string;
    confirmIdCard: string;
    confirmPhone: string;
    isAccept: boolean;
  }>({
    title: "",
    firstName: "",
    lastName: "",
    idCard: "",
    phone: "",
    confirmIdCard: "",
    confirmPhone: "",
    isAccept: false,
  });

  const handleOnChangeSignUpForm = (
    e: React.ChangeEvent<HTMLInputElement> | InputMaskChangeEvent,
  ) => {
    const { name, value } = e.target;
    setSignUpForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummitOnSignUp = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        title: "กำลังลงทะเบียน",
        html: "กรุณารอสักครู่",
        timerProgressBar: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // Validate form values
      if (
        signUpForm.title === "" ||
        signUpForm.firstName === "" ||
        signUpForm.lastName === "" ||
        signUpForm.idCard === "" ||
        signUpForm.phone === "" ||
        signUpForm.confirmIdCard === "" ||
        signUpForm.confirmPhone === ""
      ) {
        throw new Error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      }

      if (signUpForm.confirmIdCard !== signUpForm.idCard) {
        throw new Error("หมายเลขบัตรประชาชนไม่ตรงกัน");
      }

      if (signUpForm.confirmPhone !== signUpForm.phone) {
        throw new Error("หมายเลขโทรศัพท์ไม่ตรงกัน");
      }

      const farmer = await SignUpService({
        title: signUpForm.title,
        firstName: signUpForm.firstName,
        lastName: signUpForm.lastName,
        identityCardId: signUpForm.idCard.replace(/-/g, ""),
        phoneNumber: signUpForm.phone.replace(/-/g, ""),
      });

      router.push("/auth/sign-in");
      Swal.fire({
        title: "ลงทะเบียนสำเร็จ",
        html: "โปรดเข้าสู่ระบบอีกครั้งด้วย เลขบัตรประจำตัวประชาชน และ เบอร์มือถือ",
        icon: "success",
        timer: 5000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        title: "ลงทะเบียนไม่สำเร็จ",
        html: error.message,
        icon: "error",
      });
    }
  };

  return (
    <HomePageLayout>
      <Head>
        <title>ลงทะเบียนสำหรับเกษตรกรใหม่</title>
      </Head>
      <div className="w-full pt-40">
        <header className="flex justify-center">
          <section className="flex w-60  items-center justify-center gap-2 rounded-lg bg-super-main-color py-2 font-bold text-white">
            <div className="h-12 w-12">
              <Farmer />
            </div>
            <div>
              <h1>ลงทะเบียนสำหรับ</h1>
              <h1>เกษตรกรใหม่</h1>
            </div>
          </section>
        </header>
        <main className="mt-10 flex justify-center pb-10">
          <Form
            onSubmit={handleSummitOnSignUp}
            className="flex w-10/12 flex-col items-center justify-start gap-10 lg:w-8/12"
          >
            <section className="flex w-full flex-col gap-2">
              <TextField
                className="flex w-full items-center justify-start  gap-2"
                name="title"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  คำนำหน้า :
                </Label>
                <Input
                  value={signUpForm.title}
                  onChange={handleOnChangeSignUpForm}
                  className="h-10 w-40  p-2 text-xl"
                />
              </TextField>
              <TextField
                className="mt-5 flex w-full flex-col items-start justify-start  gap-2"
                name="firstName"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  ชื่อจริง :
                </Label>
                <Input
                  value={signUpForm.firstName}
                  onChange={handleOnChangeSignUpForm}
                  className="h-10 w-full  p-2 text-xl"
                />
              </TextField>
              <TextField
                className=" flex w-full flex-col items-start justify-start  gap-2"
                name="lastName"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  นามสกุล :
                </Label>
                <Input
                  value={signUpForm.lastName}
                  onChange={handleOnChangeSignUpForm}
                  className="h-10 w-full  p-2 text-xl"
                />
              </TextField>
            </section>

            <section className="flex w-full flex-col gap-2">
              <TextField
                className=" flex w-full flex-col items-start justify-start  gap-2"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  เลขบัตรประชาชน :
                </Label>
                <InputMask
                  name="idCard"
                  value={signUpForm.idCard}
                  onChange={handleOnChangeSignUpForm}
                  className="h-10 w-full  p-2 text-xl"
                  maxLength={13}
                  inputMode="numeric"
                  type="text"
                  mask="9-9999-99999-99-9"
                  placeholder="9-9999-99999-99-9"
                />
              </TextField>
              <TextField
                className=" flex w-full flex-col items-start justify-start  gap-2"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  ยืนยันเลขบัตรประชาชน :
                </Label>
                <InputMask
                  value={signUpForm.confirmIdCard}
                  onChange={handleOnChangeSignUpForm}
                  className="h-10 w-full  p-2 text-xl"
                  maxLength={13}
                  name="confirmIdCard"
                  inputMode="numeric"
                  type="text"
                  mask="9-9999-99999-99-9"
                  placeholder="9-9999-99999-99-9"
                />
              </TextField>
            </section>
            <section className="flex w-full flex-col gap-2">
              <TextField
                className=" flex w-full flex-col items-start justify-start  gap-2"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  เบอร์โทรศัพท์ :
                </Label>

                <InputMask
                  name="phone"
                  maxLength={10}
                  mask="999-999-9999"
                  placeholder="999-999-9999"
                  value={signUpForm.phone}
                  inputMode="numeric"
                  type="text"
                  onChange={handleOnChangeSignUpForm}
                  className="h-10 w-full  p-2 text-xl"
                />
              </TextField>
              <TextField
                className=" flex w-full flex-col items-start justify-start  gap-2"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  ยืนยันเบอร์โทรศัพท์ :
                </Label>
                <InputMask
                  name="confirmPhone"
                  maxLength={10}
                  mask="999-999-9999"
                  inputMode="numeric"
                  type="text"
                  placeholder="999-999-9999"
                  value={signUpForm.confirmPhone}
                  onChange={handleOnChangeSignUpForm}
                  className="h-10 w-full  p-2 text-xl"
                />
              </TextField>
            </section>
            <TextField className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5"
                onChange={(e) =>
                  setSignUpForm((prev) => {
                    return {
                      ...prev,
                      isAccept: !prev.isAccept,
                    };
                  })
                }
                checked={signUpForm.isAccept}
              />
              <Label className="text-xl font-bold text-super-main-color">
                ฉันยืนยันว่าข้อมูลถูกต้อง
              </Label>
            </TextField>

            <Button
              type="submit"
              isDisabled={!signUpForm.isAccept}
              className={`rounded-xl ${signUpForm.isAccept ? "bg-third-color" : "bg-slate-400"}  px-10 py-2  text-xl font-bold text-white 
              transition duration-100 hover:bg-super-main-color 
              active:scale-110 active:ring-2 active:ring-super-main-color`}
            >
              ลงทะเบียน
            </Button>
          </Form>
        </main>
      </div>
    </HomePageLayout>
  );
}

export default SignUp;
