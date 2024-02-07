import { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { ResponseGetAllDocKosService } from "../../services/farmer";
import { Button } from "react-aria-components";
import Link from "next/link";
import { FaRegEdit } from "react-icons/fa";
import { MdNoteAdd } from "react-icons/md";
type DocKosListsProps = {
  docKos: UseQueryResult<ResponseGetAllDocKosService, Error>;
};

const DataSaved = () => {
  return (
    <div className="w-max rounded-2xl bg-super-main-color px-4 py-2 text-xl text-white ">
      บันทึกข้อมูลแล้ว
    </div>
  );
};
const NotDataSaved = () => {
  return (
    <div className="w-max rounded-2xl bg-red-700 px-4 py-2 text-xl text-white ">
      ยังไม่บันทึกข้อมูล
    </div>
  );
};
function DocKosLists({ docKos }: DocKosListsProps) {
  return (
    <ul className="mt-5 flex flex-col items-center justify-between gap-7 font-Anuphan">
      <li className="flex h-60 w-11/12 flex-col items-center gap-3 rounded-xl bg-[#F1E4C3] p-5 drop-shadow-lg">
        <div className="flex w-full items-center justify-between ">
          <span className="text-xl font-bold text-super-main-color ">
            สถานะ
          </span>
          {docKos.data?.kos1 ? <DataSaved /> : <NotDataSaved />}
        </div>
        <h2 className="w-full text-4xl font-bold text-super-main-color">
          KOS-01
        </h2>
        <h5 className="w-full text-left text-sm text-super-main-color">
          ใบสมัครขอรับการตรวจประเมิน มาตรฐานเกษตรอินทรีย์ขั้นพื้นฐาน
        </h5>
        {docKos.data?.kos1 ? (
          <Link
            href={`/kos01/${docKos.data?.kos1.id}`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <FaRegEdit />
            แก้ไขข้อมูล
          </Link>
        ) : (
          <Link
            href={`create/kos1`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <MdNoteAdd />
            เพิ่มข้อมูล
          </Link>
        )}
      </li>
      <li className="flex h-60 w-11/12 flex-col items-center justify-between gap-3 rounded-xl bg-[#F1E4C3] p-5 drop-shadow-lg">
        <div className="flex w-full items-center justify-between ">
          <span className="text-xl font-bold text-super-main-color ">
            สถานะ
          </span>
          {docKos.data?.kos2 ? <DataSaved /> : <NotDataSaved />}
        </div>
        <h2 className="w-full text-4xl font-bold text-super-main-color">
          KOS-02
        </h2>
        <h5 className="w-full text-left text-sm text-super-main-color">
          ผังแปลงขอรับการตรวจประเมิน มาตรฐานเกษตรอินทรีย์ขั้นพื้นฐาน
          จัวหวัดนครราชสีมา
        </h5>
        {docKos.data?.kos2 ? (
          <Link
            href={`/doc-kos/kos02/${docKos.data?.kos2.id}`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <FaRegEdit />
            แก้ไขข้อมูล
          </Link>
        ) : (
          <Link
            href={`create/kos2`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <MdNoteAdd />
            เพิ่มข้อมูล
          </Link>
        )}
      </li>
      <li className="flex h-60 w-11/12 flex-col items-center justify-between gap-3 rounded-xl bg-[#F1E4C3] p-5 drop-shadow-lg">
        <div className="flex w-full items-center justify-between ">
          <span className="text-xl font-bold text-super-main-color ">
            สถานะ
          </span>
          {docKos.data?.kos3 ? <DataSaved /> : <NotDataSaved />}
        </div>
        <h2 className="w-full text-4xl font-bold text-super-main-color">
          KOS-03
        </h2>
        <h5 className="w-full text-left text-sm text-super-main-color">
          แบบบันทึกกิจกรรมในแปลงผลิต พืชอินทรีย์
        </h5>
        {docKos.data?.kos3 ? (
          <Link
            href={`/doc-kos/kos03/${docKos.data?.kos3.id}`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <FaRegEdit />
            แก้ไขข้อมูล
          </Link>
        ) : (
          <Link
            href={`create/kos3`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <MdNoteAdd />
            เพิ่มข้อมูล
          </Link>
        )}
      </li>
      <li className="flex h-60 w-11/12 flex-col items-center justify-between gap-3 rounded-xl bg-[#F1E4C3] p-5 drop-shadow-lg">
        <div className="flex w-full items-center justify-between ">
          <span className="text-xl font-bold text-super-main-color ">
            สถานะ
          </span>
          {docKos.data?.kos4 ? <DataSaved /> : <NotDataSaved />}
        </div>
        <h2 className="w-full text-4xl font-bold text-super-main-color">
          KOS-04
        </h2>
        <h5 className="w-full text-left text-sm text-super-main-color">
          แบบบันทึกปัจจัยการผลิตในแปลง ผลิตพืชอินทรีย์{" "}
        </h5>
        {docKos.data?.kos4 ? (
          <Link
            href={`/doc-kos/kos04/${docKos.data?.kos4.id}`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <FaRegEdit />
            แก้ไขข้อมูล
          </Link>
        ) : (
          <Link
            href={`create/kos4`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <MdNoteAdd />
            เพิ่มข้อมูล
          </Link>
        )}
      </li>
      <li className="flex h-60 w-11/12 flex-col items-center justify-between gap-3 rounded-xl bg-[#F1E4C3] p-5 drop-shadow-lg">
        <div className="flex w-full items-center justify-between  ">
          <span className="text-xl font-bold text-super-main-color ">
            สถานะ
          </span>
          {docKos.data?.kos5 ? <DataSaved /> : <NotDataSaved />}
        </div>
        <h2 className="w-full text-4xl font-bold text-super-main-color">
          KOS-05
        </h2>
        <h5 className="w-full text-left text-sm text-super-main-color">
          แบบบันทึกการเก็บเกี่ยวในแปลง ผลิตพืชอินทรีย์
        </h5>
        {docKos.data?.kos5 ? (
          <Link
            href={`/doc-kos/kos05/${docKos.data?.kos5.id}`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <FaRegEdit />
            แก้ไขข้อมูล
          </Link>
        ) : (
          <Link
            href={`create/kos5`}
            className="flex items-center justify-center gap-2  rounded-xl bg-third-color px-4
            py-1 text-xl font-medium text-white ring-super-main-color
             transition duration-100 active:scale-105 active:ring-2"
          >
            <MdNoteAdd />
            เพิ่มข้อมูล
          </Link>
        )}
      </li>
    </ul>
  );
}

export default DocKosLists;
