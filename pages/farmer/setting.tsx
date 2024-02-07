import React, { useState } from "react";
import DashboardLayout from "../../layouts/dashboardLayout";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import {
  GetFarmerClientSideService,
  GetFarmerServerSideService,
  UpdateFarmerService,
  UploadProfileService,
} from "../../services/farmer";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { Farmer } from "../../model";
import Image from "next/image";
import {
  Button,
  FileTrigger,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { BiSolidImageAdd } from "react-icons/bi";
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";
import Swal from "sweetalert2";

function Setting({ initialFarmer }: { initialFarmer: Farmer }) {
  const [userSettingData, setUserSettingData] = useState<Farmer>(initialFarmer);
  const [loadingUploadPicture, setLoadingUploadPicture] = useState(false);
  const farmer = useQuery({
    queryKey: ["farmer"],
    queryFn: () => GetFarmerClientSideService(),
    initialData: initialFarmer,
  });
  const handleFileInputChange = async (files: FileList | null) => {
    const file = files?.[0];
    setLoadingUploadPicture(() => true);
    const farmer = await UploadProfileService({ file: file as File });
    setTimeout(() => {
      setLoadingUploadPicture(() => false);
    }, 2000);
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      const result = e.target?.result;
      setUserSettingData((prev) => {
        return {
          ...prev,
          picture: farmer.picture,
        };
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSummitOnSetting = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        title: "กำลังบันทึกข้อมูล",
        allowEnterKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const farmer = await UpdateFarmerService(userSettingData);
      Swal.fire({
        title: "บันทึกข้อมูลสำเร็จ",
        timerProgressBar: true,
        timer: 1500,
        icon: "success",
      });
    } catch (error: any) {
      console.log(error);
      Swal.fire({
        title: "บันทึกข้อมูลไม่สำเร็จ",
        icon: "error",
        html: `<p>${error.message}</p>`,
      });
    }
  };

  const handleChangeUserSetting = (
    e: React.ChangeEvent<HTMLInputElement> | InputMaskChangeEvent,
  ) => {
    const { name, value } = e.target;
    setUserSettingData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  return (
    <DashboardLayout>
      <Head>
        <title>แก้ไขบัญชี</title>
      </Head>
      <div className="min-h-screen bg-fourth-color pb-10 font-Anuphan">
        <header className="flex flex-col items-center  justify-center gap-3 pt-40">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-super-main-color ring-offset-2">
            {loadingUploadPicture ? (
              <div className="h-full w-full animate-pulse bg-gray-400"></div>
            ) : (
              <Image
                src={userSettingData?.picture}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                alt="profile pciture"
                priority
              />
            )}
          </div>
          <FileTrigger
            acceptedFileTypes={["image/*"]}
            onSelect={handleFileInputChange}
          >
            <Button className="flex items-center justify-center gap-2 rounded-md bg-third-color px-5 py-1 font-semibold text-white">
              <BiSolidImageAdd /> อัพโหลดรูป
            </Button>
          </FileTrigger>
        </header>
        <main className="mt-5 flex w-full justify-center">
          <Form
            onSubmit={handleSummitOnSetting}
            className="flex w-10/12 flex-col items-center justify-start gap-10"
          >
            <section className="w-full">
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
                  value={userSettingData.title}
                  onChange={handleChangeUserSetting}
                  className="h-10 w-40 bg-slate-200 p-2 text-xl"
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
                  value={userSettingData.firstName}
                  onChange={handleChangeUserSetting}
                  className="h-10 w-full bg-slate-200 p-2 text-xl"
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
                  value={userSettingData.lastName}
                  onChange={handleChangeUserSetting}
                  className="h-10 w-full bg-slate-200 p-2 text-xl"
                />
              </TextField>
            </section>

            <section className="w-full">
              <TextField
                className=" flex w-full flex-col items-start justify-start  gap-2"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  เลขบัตรประชาชน :
                </Label>
                <InputMask
                  name="identityCardId"
                  value={userSettingData.identityCardId}
                  onChange={handleChangeUserSetting}
                  className="h-10 w-full bg-slate-200 p-2 text-xl"
                  maxLength={13}
                  mask="9-9999-99999-99-9"
                  placeholder="9-9999-99999-99-9"
                />
              </TextField>
            </section>
            <section className="w-full">
              <TextField
                className=" flex w-full flex-col items-start justify-start  gap-2"
                type="text"
                isRequired
              >
                <Label className="text-xl font-bold text-super-main-color">
                  เบอร์โทรศัพท์ :
                </Label>

                <InputMask
                  name="phoneNumber"
                  maxLength={10}
                  mask="999-999-9999"
                  placeholder="999-999-9999"
                  value={userSettingData.phoneNumber}
                  onChange={handleChangeUserSetting}
                  className="h-10 w-full bg-slate-200 p-2 text-xl"
                />
              </TextField>
            </section>

            <Button
              type="submit"
              className={`"bg-third-color rounded-xl bg-third-color  px-10 py-2  text-xl font-bold text-white 
              transition duration-100 hover:bg-super-main-color 
              active:scale-110 active:ring-2 active:ring-super-main-color`}
            >
              บันทึก
            </Button>
          </Form>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Setting;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(ctx);
    const accessToken = cookies.access_token;
    if (accessToken) {
      const initialFarmer = await GetFarmerServerSideService({
        access_token: accessToken,
      });
      return {
        props: {
          initialFarmer,
        },
      };
    } else {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/sign-in",
        },
      };
    }
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
