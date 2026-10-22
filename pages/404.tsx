import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { LuHome, LuSearchX } from "react-icons/lu";

function ErrorNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-fourth-color px-4 py-10 font-Anuphan text-super-main-color">
      <Head>
        <title>ไม่พบหน้านี้ | Korat KOS สำหรับเกษตรกร</title>
      </Head>
      <div className="flex items-center gap-2.5">
        <Image src="/favicon.ico" width={40} height={40} alt="" unoptimized className="size-10" />
        <span className="text-2xl font-extrabold text-main-color">Korat KOS</span>
      </div>
      <main className="card flex w-full max-w-md flex-col items-center gap-4 px-6 py-10 text-center">
        <span aria-hidden="true" className="flex size-20 items-center justify-center rounded-full bg-third-color/20">
          <LuSearchX className="size-10" />
        </span>
        <p className="text-5xl font-extrabold tracking-wider text-main-color">404</p>
        <h1 className="text-balance text-2xl font-bold leading-snug">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="hint max-w-sm">ลิงก์อาจพิมพ์ผิด หรือหน้านี้ถูกย้ายไปแล้ว กดปุ่มด้านล่างเพื่อกลับไปหน้าหลัก</p>
        <Link href="/" className="btn btn-primary mt-2 w-full sm:w-auto">
          <LuHome aria-hidden="true" className="size-5" />
          กลับหน้าหลัก
        </Link>
      </main>
    </div>
  );
}

export default ErrorNotFoundPage;
