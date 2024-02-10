import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import React from "react";
import { TbUserEdit } from "react-icons/tb";
import { VscSignOut } from "react-icons/vsc";
import { Farmer } from "../../model";
import { useSignOut } from "../../utils";

function DashboardNavbar() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <nav className="fixed top-0 z-50 flex h-28 w-full items-center justify-between bg-[#F1E4C3] p-5 font-Anuphan lg:hidden ">
      <Link href="/" className="flex flex-col items-start  gap-1  ">
        <div className="flex items-end justify-center gap-1">
          <h1 className="text-xl font-bold text-main-color">Korat KOS</h1>
          <div className="relative h-10 w-10">
            <Image
              src="/favicon.ico"
              fill
              alt="icon"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
        <p className=" w-36 text-balance text-left text-[0.50rem] font-medium text-super-main-color">
          ระบบสมัครขอรับการตรวจประเมินมาตรฐาน เกษตรอินทรีย์ขั้นพื้นฐาน
          จังหวัดนครราชสีมา
        </p>
      </Link>

      <section className="flex flex-col items-center justify-center gap-1 text-super-main-color">
        <Link
          href="/farmer/setting"
          className=" rounded-2xl bg-super-main-color p-2 text-3xl text-white
          transition duration-100  active:scale-105 "
        >
          <TbUserEdit />
        </Link>
        <span className="text-sm font-bold">แก้ไขข้อมูล</span>
      </section>
      <section className="flex flex-col items-center justify-center gap-1 text-red-700">
        <Link
          href="/auth/sign-in"
          onClick={useSignOut}
          className=" rounded-2xl bg-red-800 p-2 text-3xl text-white 
        transition duration-100 hover:bg-red-800 active:scale-105 active:bg-red-700"
        >
          <VscSignOut />
        </Link>
        <span className="text-sm font-bold">ออกจากระบบ</span>
      </section>
    </nav>
  );
}

export default DashboardNavbar;
