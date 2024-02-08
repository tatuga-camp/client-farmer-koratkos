import Image from "next/image";
import Link from "next/link";
import React from "react";
import { menuKos, menuKos01 } from "../../data/menus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetAllDocKosService } from "../../services/farmer";
import { RiShutDownLine } from "react-icons/ri";
import { destroyCookie } from "nookies";

function DashboardSidebar() {
  const queryClient = useQueryClient();
  const docKos = useQuery({
    queryKey: ["docKos"],
    queryFn: () => GetAllDocKosService(),
  });
  const handleSignOut = () => {
    destroyCookie(null, "access_token", { path: "/" });
    queryClient.removeQueries({ queryKey: ["farmer"] });
  };
  return (
    <div
      className="sticky top-0  hidden h-screen w-96 flex-col items-center
     justify-between bg-[#F1E4C3] px-5 py-10 lg:flex"
    >
      <Link
        href="/"
        className="flex flex-col items-center justify-center  gap-1  "
      >
        <div className="flex items-end justify-center gap-1">
          <h1 className="text-2xl font-bold uppercase text-main-color ">
            Korat KOS
          </h1>
          <div className="relative h-12 w-12">
            <Image
              src="/favicon.ico"
              fill
              alt="icon"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
        <p className=" w-full text-balance  text-center text-xs font-medium text-super-main-color">
          ระบบสมัครขอรับการตรวจประเมินมาตรฐาน เกษตรอินทรีย์ขั้นพื้นฐาน
          จังหวัดนครราชสีมา
        </p>
      </Link>
      <ul className="flex flex-col items-center justify-start gap-4">
        {menuKos({ docKos }).map((menu, index) => {
          return (
            <Link
              className="flex items-center justify-center gap-2 rounded-lg p-1 text-2xl font-semibold text-third-color ring-third-color transition
               duration-150 hover:bg-white hover:text-super-main-color hover:ring-2 hover:drop-shadow-lg active:scale-110"
              href={menu.href}
              key={index}
            >
              {menu.title}
              <menu.icon />
            </Link>
          );
        })}
      </ul>
      <Link
        onClick={handleSignOut}
        className="flex flex-col items-center justify-center "
        href="/auth/sign-in"
      >
        <div
          className="rounded-full bg-red-600 p-3 text-4xl text-white drop-shadow-lg
         transition duration-150 hover:bg-red-800 active:scale-110"
        >
          <RiShutDownLine />
        </div>
        <span className="text-xl font-extrabold text-black">ออกจากระบบ</span>
      </Link>
    </div>
  );
}

export default DashboardSidebar;
