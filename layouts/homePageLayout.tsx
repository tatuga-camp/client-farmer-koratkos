import Image from "next/image";
import type { ReactNode } from "react";
import { HomePageNavbar } from "../components/navbars/homePageNavbar";
import { sponsors } from "../data/menus";

type LayoutProps = {
  children: ReactNode;
};

function SponsorLogos({ size }: { size: "sm" | "lg" }) {
  const box = size === "lg" ? "size-16" : "size-11";
  return (
    <ul className={`flex flex-wrap gap-2.5 ${size === "sm" ? "justify-center" : ""}`}>
      {sponsors.map((sponsor) => (
        <li
          key={sponsor.url}
          title={sponsor.title}
          className={`${box} relative shrink-0 overflow-hidden rounded-full border border-third-color/40 bg-white p-1`}
        >
          <Image src={sponsor.url} alt={sponsor.title} width={64} height={64} className="size-full object-contain" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Signed-out shell for sign-in / sign-up. Phones: brand line, then the form card.
 * Desktop: brand panel with the scheme name and partner logos on the left, form on the right.
 */
function HomePageLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-fourth-color font-Anuphan text-super-main-color lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="hidden flex-col justify-between gap-10 border-r border-third-color/40 bg-third-color/15 p-10 lg:sticky lg:top-0 lg:flex lg:h-screen xl:p-14">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image src="/favicon.ico" width={72} height={72} alt="" unoptimized priority className="size-[4.5rem] shrink-0" />
            <p className="text-5xl font-extrabold tracking-tight text-main-color">Korat KOS</p>
          </div>
          <p className="max-w-lg text-balance text-3xl font-bold leading-snug">
            ระบบสมัครขอรับการตรวจประเมินมาตรฐานเกษตรอินทรีย์ขั้นพื้นฐาน จังหวัดนครราชสีมา
          </p>
          <p className="max-w-md text-lg leading-relaxed text-super-main-color/80">
            สำหรับเกษตรกร กรอกเอกสารขอรับรองได้จากมือถือ บันทึกไว้แล้วกลับมาทำต่อได้
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-super-main-color/80">หน่วยงานที่ร่วมดำเนินงาน</p>
          <SponsorLogos size="lg" />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <HomePageNavbar />
        <main className="flex flex-1 flex-col items-center px-4 pb-8 pt-5 sm:px-6 lg:justify-center lg:px-10 lg:py-10">
          <div className="w-full max-w-lg">{children}</div>
        </main>
        <footer className="flex flex-col items-center gap-2.5 px-4 pb-8 lg:hidden">
          <p className="text-sm font-semibold text-super-main-color/70">หน่วยงานที่ร่วมดำเนินงาน</p>
          <SponsorLogos size="sm" />
        </footer>
      </div>
    </div>
  );
}

export default HomePageLayout;
