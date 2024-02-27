import type { ReactNode } from "react";
import { HomePageNavbar } from "../components/navbars/homePageNavbar";
import { Backgroud } from "../components/svgs/Backgroud";
import Image from "next/image";

type LayoutProps = {
  children: ReactNode;
};

function HomePageLayout({ children }: LayoutProps) {
  return (
    <section>
      <HomePageNavbar />
      <div className="flex min-h-screen w-full bg-fourth-color font-Anuphan">
        <div className="sticky top-0 z-10 hidden h-screen w-8/12 items-center justify-center bg-[#F1E4C3] lg:flex">
          <header className="flex flex-col items-center justify-center">
            <section className="flex items-end justify-center gap-2">
              <h2 className="text-xl font-bold text-super-main-color">
                WELCOME TO
              </h2>
              <div className="relative h-20 w-20">
                <Image src="/favicon.ico" fill alt="icon" />
              </div>
            </section>
            <section className="l flex w-11/12 flex-col items-center justify-center lg:w-9/12 xl:w-10/12 2xl:w-max">
              <h1 className="text-6xl font-extrabold text-main-color">
                Korat KOS
              </h1>

              <span className="tre text-center text-xl font-normal leading-6 text-main-color lg:leading-9">
                ระบบสมัครขอรับการตรวจประเมิน มาตรฐานเกษตรอินทรีย์ขั้นพื้นฐาน
              </span>
              <span className="text-center text-xl font-medium  leading-6 text-super-main-color">
                จังหวัดนครราชสีมา
              </span>
            </section>
          </header>
        </div>
        {children}
      </div>
    </section>
  );
}

export default HomePageLayout;
