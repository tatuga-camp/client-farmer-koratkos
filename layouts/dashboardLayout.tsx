import type { ReactNode } from "react";
import DashboardNavbar from "../components/navbars/dashboardNavbar";
import { Farmer } from "../model";
import DashboardSidebar from "../components/sidebars/dashboardSidebar";
import Image from "next/image";
import StatusEvaluation from "../components/status/statusEvaluation";

type LayoutProps = {
  children: ReactNode;
  farmer: Farmer;
  isSetting?: boolean;
};

function DashboardLayout({ children, farmer, isSetting }: LayoutProps) {
  return (
    <section className="flex bg-fourth-color font-Anuphan">
      <DashboardNavbar />

      <DashboardSidebar />
      <div className="flex w-full flex-col">
        {!isSetting && (
          <header
            className="flex flex-col items-center justify-center gap-3
         pt-40 font-Anuphan lg:w-full lg:flex-row-reverse lg:justify-around lg:pt-10"
          >
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-super-main-color ring-offset-2 ">
              <Image
                src={farmer.picture}
                alt="profile"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className=" object-cover"
              />
            </div>
            <span className="flex w-80  justify-center truncate text-center text-2xl font-bold text-super-main-color  lg:w-max lg:flex-col lg:items-start lg:text-4xl">
              สวัสดี!{" "}
              <span className="font-extrabold">
                {farmer.firstName} {farmer.lastName}
              </span>
            </span>
          </header>
        )}
        {children}
        <footer className="flex h-40 w-full flex-col items-center justify-center gap-2 md:hidden">
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
          <p className=" w-11/12 text-balance text-center text-sm font-medium text-super-main-color">
            ระบบสมัครขอรับการตรวจประเมินมาตรฐาน เกษตรอินทรีย์ขั้นพื้นฐาน
            จังหวัดนครราชสีมา
          </p>
        </footer>
      </div>
    </section>
  );
}

export default DashboardLayout;
