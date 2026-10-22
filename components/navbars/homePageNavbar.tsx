import Image from "next/image";
import { LuArrowLeft } from "react-icons/lu";

/** Top of the sign-in / sign-up screens: the way back to the public site, and the brand on phones. */
function HomePageNavbar() {
  return (
    <header className="flex flex-col gap-4 px-4 pt-3 sm:px-6 lg:px-10 lg:pt-6">
      {/* The public site is another app, so a plain link rather than next/link. */}
      <a href={process.env.NEXT_PUBLIC_MAIN_CLIENT_URL ?? "/"} className="btn btn-ghost btn-sm -ml-3 self-start">
        <LuArrowLeft aria-hidden="true" className="size-5" />
        กลับหน้าแรก
      </a>
      <div className="flex items-center gap-3 lg:hidden">
        <Image src="/favicon.ico" width={48} height={48} alt="" unoptimized className="size-12 shrink-0" />
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-tight text-main-color">Korat KOS</p>
          <p className="text-balance text-base leading-snug text-super-main-color/80">
            มาตรฐานเกษตรอินทรีย์ จ.นครราชสีมา
          </p>
        </div>
      </div>
    </header>
  );
}

export { HomePageNavbar };
