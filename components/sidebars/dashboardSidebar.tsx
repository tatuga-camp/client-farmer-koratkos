import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { LuCheck, LuHome, LuLogOut, LuUserCog } from "react-icons/lu";
import { kosGuides } from "../../data/kosGuides";
import { GetAllDocKosService } from "../../services/farmer";
import { useSignOut } from "../../utils/useFarmer";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-main-color">
      <span className="relative size-11 shrink-0">
        <Image src="/favicon.ico" fill alt="" sizes="44px" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xl font-bold text-main-color">Korat KOS</span>
        <span className="text-sm text-super-main-color/80">เกษตรอินทรีย์ขั้นพื้นฐาน นครราชสีมา</span>
      </span>
    </Link>
  );
}

const itemClass = (active: boolean) =>
  `flex min-h-12 items-center gap-3 rounded-xl px-3 text-lg transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-main-color ${
    active ? "bg-main-color font-semibold text-white" : "text-super-main-color hover:bg-third-color/15"
  }`;

/** Navigation shared by the desktop sidebar and the phone menu drawer. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const signOut = useSignOut();
  const docKos = useQuery({ queryKey: ["docKos"], queryFn: () => GetAllDocKosService() });
  const path = router.asPath;

  return (
    <nav aria-label="เมนูหลัก" className="flex flex-1 flex-col gap-6">
      <Link href="/" onClick={onNavigate} className={itemClass(path === "/")} aria-current={path === "/" ? "page" : undefined}>
        <LuHome aria-hidden="true" className="size-6 shrink-0" />
        หน้าหลัก
      </Link>

      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-base font-semibold text-super-main-color/70">เอกสารที่ต้องกรอก</p>
        <ul className="flex flex-col gap-1">
          {kosGuides.map((guide, index) => {
            const doc = docKos.data?.[guide.key];
            const href = doc?.id ? guide.viewHref(doc.id) : guide.createHref;
            const number = guide.code.slice(-2);
            const active = path.startsWith(`/kos${number}`) || path.startsWith(`/create/kos${number}`);
            return (
              <li key={guide.key}>
                <Link href={href} onClick={onNavigate} className={itemClass(active)} aria-current={active ? "page" : undefined}>
                  <span
                    aria-hidden="true"
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      doc
                        ? active
                          ? "bg-white text-main-color"
                          : "bg-main-color text-white"
                        : active
                          ? "border-2 border-white"
                          : "border-2 border-third-color text-super-main-color"
                    }`}
                  >
                    {doc ? <LuCheck className="size-4" strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="text-base font-bold">{guide.code}</span>
                    <span className={`truncate text-base ${active ? "text-white/90" : "text-super-main-color/80"}`}>{guide.name}</span>
                  </span>
                  <span className="sr-only">{doc ? "(บันทึกแล้ว)" : "(ยังไม่ได้กรอก)"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-third-color/40 pt-4">
        <Link
          href="/farmer/setting"
          onClick={onNavigate}
          className={itemClass(path.startsWith("/farmer/setting"))}
          aria-current={path.startsWith("/farmer/setting") ? "page" : undefined}
        >
          <LuUserCog aria-hidden="true" className="size-6 shrink-0" />
          ข้อมูลส่วนตัว
        </Link>
        <button type="button" onClick={signOut} className={`${itemClass(false)} text-red-700 hover:bg-red-50`}>
          <LuLogOut aria-hidden="true" className="size-6 shrink-0" />
          ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}

function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-8 overflow-y-auto border-r border-third-color/40 bg-white px-4 py-6 lg:flex">
      <div className="px-1">
        <Brand />
      </div>
      <SidebarNav />
    </aside>
  );
}

export default DashboardSidebar;
