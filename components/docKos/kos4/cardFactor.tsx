import React from "react";
import { FactoryKos4, Pagination } from "../../../model";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { GiWeight } from "react-icons/gi";
import moment from "moment";
import Swal from "sweetalert2";
import { DeleteFatorKos4Service } from "../../../services/kos4";
import { UseQueryResult } from "@tanstack/react-query";
type CardFactorProps = {
  factor: FactoryKos4;
  factors: UseQueryResult<Pagination<FactoryKos4>, Error>;
  index: number;
  setSelectFactor: React.Dispatch<
    React.SetStateAction<FactoryKos4 | undefined>
  >;
  setTriggerUpdateFactor: React.Dispatch<React.SetStateAction<boolean>>;
};
function CardFactor({
  factor,
  factors,
  index,
  setSelectFactor,
  setTriggerUpdateFactor,
}: CardFactorProps) {
  const purchaseDate = moment(factor.purchaseDate)
    .locale("th")
    .format("DD/MM/YYYY");

  const handleDeleteFactor = async ({
    factorId,
    typeFactor,
  }: {
    factorId: string;
    typeFactor: string;
  }) => {
    let content = document.createElement("div");
    content.innerHTML =
      "<div>กรุณาพิมพ์ข้อความนี้</div> <strong>" +
      "ยืนยันการลบ" +
      "</strong> <div>เพื่อลบข้อมูล</div>";
    const { value } = await Swal.fire<{ value: string }>({
      title: `ลบ ${typeFactor}`,
      input: "text",
      html: content,
      footer: "<strong>หากลบแล้วคุณจะไม่สามารถกู้คืนข้อมูลได้</strong>",
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== "ยืนยันการลบ") {
          return "กรุณาพิมพ์ข้อความยืนยันให้ถูกต้อง";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "กำลังลบข้อมูล",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const deleteFactor = await DeleteFatorKos4Service({
          prodFactorKos4Id: factorId,
        });
        await factors.refetch();
        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          text: "ลบข้อมูลสำเร็จ",
        });
      } catch (error: any) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error.message,
        });
      }
    }
  };
  return (
    <section className="flex h-max min-h-60 w-11/12 flex-col gap-3 rounded-lg bg-[#F1E4C3] p-5">
      <header className="flex items-center justify-between">
        <div className="rounded-lg bg-[#502D16] px-4 py-1 text-xl font-semibold text-white">
          ปัจจัยที่ {index + 1}
        </div>
        <div className="my-0 flex justify-end gap-2">
          <button
            onClick={() => {
              setSelectFactor(() => factor);
              setTriggerUpdateFactor(() => true);
            }}
            className="flex flex-col 
                            items-center justify-center gap-1 transition duration-100 hover:scale-105 active:scale-110"
          >
            <div className="rounded-lg bg-[#597E52] p-2 text-white">
              <AiFillEdit />
            </div>
            <span className="text-sm font-semibold">แก้ไข</span>
          </button>
          <button
            onClick={() =>
              handleDeleteFactor({
                factorId: factor.id,
                typeFactor: factor.prodFactorTypes,
              })
            }
            className="flex flex-col 
                            items-center justify-center gap-1 transition duration-100 hover:scale-105 active:scale-110"
          >
            <div className="rounded-lg bg-red-700 p-2 text-white">
              <MdDelete />
            </div>
            <span className="text-sm font-semibold">ลบ</span>
          </button>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center gap-2">
        <h1 className="max-w-80 truncate text-2xl font-semibold text-[#502D16] ">
          {factor.prodFactorTypes}
        </h1>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-lg text-super-main-color">
            <div className="flex items-center justify-center rounded-full bg-super-main-color p-1 text-white">
              <GiWeight />
            </div>
            {factor.amount.toLocaleString()} กิโลกรัม
          </div>
          <span className="text-base text-super-main-color">
            {purchaseDate}
          </span>
        </div>
        <span className="mt-4 text-lg font-semibold text-super-main-color">
          <span className="text-black">แหล่งที่มา :</span> {factor.source}
        </span>
      </main>
    </section>
  );
}

export default CardFactor;
