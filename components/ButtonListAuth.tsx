import Link from "next/link";
import { Farmer } from "./svgs/Farmer";
import Swal from "sweetalert2";

function ButtonListAuth() {
  const handleShowLoading = () => {
    Swal.fire({
      title: "กำลังโหลด...",
      html: "กรุณารอสักครู่",
      allowEscapeKey: false,
      allowEnterKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };
  return (
    <>
      <Link
        onClick={handleShowLoading}
        href={process.env.NEXT_PUBLIC_FARMER_ROUTE as string}
        className="btn-hoever flex items-center justify-center  gap-2
        rounded-full bg-main-color  p-2 py-1 ring-super-main-color transition duration-100 hover:scale-110 active:ring-2"
      >
        <Farmer />
        <span className="font-medium text-white">
          ลงทะเบียน สำหรับเกษตรกรใหม่
        </span>
      </Link>

      <Link
        onClick={handleShowLoading}
        href={process.env.NEXT_PUBLIC_FARMER_ROUTE as string}
        className="flex min-h-11 items-center justify-center gap-2 rounded-full 
        bg-third-color p-2 py-1 ring-super-main-color transition duration-100 hover:scale-110 active:ring-2"
      >
        <span className="font-medium text-white">
          เข้าสู่ระบบ สำหรับเกษตรกร
        </span>
      </Link>
      <Link
        href={process.env.NEXT_PUBLIC_COMMITTEE_ROUTE as string}
        onClick={handleShowLoading}
        className="relative z-20 flex min-h-11 items-center justify-center gap-2 
        rounded-full bg-secondary-color p-2  py-1 ring-super-main-color transition duration-100 hover:scale-110 active:ring-2"
      >
        <span className="font-medium text-white">สำหรับผู้ประเมิน</span>
      </Link>
    </>
  );
}

export { ButtonListAuth };
