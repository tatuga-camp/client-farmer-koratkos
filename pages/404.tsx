import React from "react";
import Error404 from "../components/svgs/404";
import Link from "next/link";

function ErrorNotFoundPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-fourth-color font-Anuphan">
      <h2 className="text-2xl font-semibold text-third-color">Oops!</h2>
      <main className="flex h-40 w-10/12 items-center justify-center gap-2 text-8xl font-semibold text-super-main-color">
        4
        <div className="flex h-20 w-20 items-center justify-center">
          <Error404 />
        </div>
        4
      </main>
      <span className="text-lg font-semibold">
        Sorry, this page could not be found
      </span>
      <Link
        href="/"
        className="rounded-lg bg-super-main-color px-5 py-1
        font-semibold text-white drop-shadow-md transition-all duration-150 hover:scale-105 active:scale-110"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}

export default ErrorNotFoundPage;
