import Image from "next/image";
import { TbArrowBack } from "react-icons/tb";

function HomePageNavbar() {
  return (
    <nav className=" fixed top-0 flex h-28 w-full items-center justify-between bg-[#F1E4C3] p-5 font-Anuphan">
      <section className="flex flex-col items-center justify-end gap-1  font-bold text-main-color">
        <div
          className="flex items-center justify-center rounded-2xl bg-main-color p-2 text-3xl text-white ring-white 
        transition duration-100 hover:bg-super-main-color active:scale-110  active:ring-2"
        >
          <TbArrowBack />
        </div>
        ย้อนกลับ
      </section>
      <section className="flex flex-col items-end  gap-1  ">
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
        <p className=" w-48 text-balance text-right text-[0.65rem] font-medium text-super-main-color">
          ระบบสมัครขอรับการตรวจประเมินมาตรฐาน เกษตรอินทรีย์ขั้นพื้นฐาน
          จังหวัดนครราชสีมา
        </p>
      </section>
    </nav>
  );
}

export { HomePageNavbar };
