import { Combobox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { Button, Form, Input, Label, TextField } from "react-aria-components";
import { FaCheck } from "react-icons/fa";
import { MdOutlineNavigateNext } from "react-icons/md";
import { RiExpandUpDownLine } from "react-icons/ri";
import ProviceComBox from "./combox/proviceComBox";
import AmphureComBox from "./combox/amphureComBox";
import { Amphure, Province, Tambon } from "../../../model";
import TambonComBox from "./combox/tambonComBox";
import Swal from "sweetalert2";
import { useRouter } from "next/router";

export type BasicInformation = {
  address: string;
  moo: string;
  province: Province | null;
  amphure: Amphure | null;
  tambon: Tambon | null;
};

export type TypeSetBasicInformation = React.Dispatch<
  React.SetStateAction<BasicInformation | undefined>
>;
function BasicInformation() {
  const router = useRouter();
  const [baicInformation, setBasicInformation] = useState<
    BasicInformation | undefined
  >();

  const handleChangeOnBasicInformation = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setBasicInformation((prev: any) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  useEffect(() => {
    const basicInformation = localStorage.getItem("basicInformation");
    if (basicInformation) {
      const parseBasicInformation: BasicInformation =
        JSON.parse(basicInformation);
      setBasicInformation(() => parseBasicInformation);
    }
  }, []);

  const handleSummitBasicInformation = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      localStorage.setItem("basicInformation", JSON.stringify(baicInformation));
      router.push({
        pathname: "/create/kos1",
        query: { step: "farmFieldInformation" },
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white">
        ข้อมูลพื้นฐาน
      </h2>
      <div className="flex justify-center">
        <Form
          onSubmit={handleSummitBasicInformation}
          className="mt-5 flex w-11/12 flex-col items-center justify-start gap-2"
        >
          <TextField
            className="flex w-full items-center justify-center  gap-2"
            name="address"
            type="text"
            isRequired
          >
            <Label className="w-40 text-xl font-bold text-super-main-color">
              ที่อยู่เลขที่ :
            </Label>
            <Input
              onChange={handleChangeOnBasicInformation}
              value={baicInformation?.address}
              className="h-10 w-full bg-slate-200 p-2 text-xl"
            />
          </TextField>
          <TextField
            className="flex w-full items-center justify-center  gap-2"
            name="moo"
            type="text"
            isRequired
          >
            <Label className="w-40 text-xl font-bold text-super-main-color">
              หมู่ที่ :
            </Label>
            <Input
              onChange={handleChangeOnBasicInformation}
              value={baicInformation?.moo}
              className="h-10 w-full bg-slate-200 p-2 text-xl"
            />
          </TextField>

          <ProviceComBox
            baicInformation={baicInformation as BasicInformation}
            setBasicInformation={setBasicInformation}
          />

          <AmphureComBox
            selectProvinceId={baicInformation?.province?.originalId as number}
            baicInformation={baicInformation as BasicInformation}
            setBasicInformation={setBasicInformation}
          />

          <TambonComBox
            selectAmphureId={baicInformation?.amphure?.originalId as number}
            baicInformation={baicInformation as BasicInformation}
            setBasicInformation={setBasicInformation}
          />

          <Button
            type="submit"
            className={`mt-5 flex items-center justify-center gap-2 rounded-xl bg-third-color px-10 py-2 text-xl  font-bold text-white drop-shadow-lg 
              transition duration-100 hover:bg-super-main-color 
              active:scale-110 active:ring-2 active:ring-super-main-color`}
          >
            ถัดไป <MdOutlineNavigateNext />
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default BasicInformation;
