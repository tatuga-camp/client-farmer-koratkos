import React, { useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextField,
} from "react-aria-components";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";
import {
  MdCheckBoxOutlineBlank,
  MdOutlineNavigateBefore,
  MdOutlineNavigateNext,
  MdOutlineRadioButtonChecked,
  MdOutlineRadioButtonUnchecked,
} from "react-icons/md";
import Swal from "sweetalert2";
import { BasicInformation } from "./basicInformation";
import {
  CreateDocKos1Service,
  CreateFarmDocKos1Service,
} from "../../../../services/kos1";
import { Farmer } from "../../../../model";
import { useRouter } from "next/router";
import { Step } from "../../../../pages/create/kos1";

function ProductionInformation({ farmer }: { farmer: Farmer }) {
  const router = useRouter();
  const [productionInformation, setProductionInformation] = useState<{
    productionProcess: string[];
    productionMethod: {
      value: string;
      select: string;
    };
    plotsTotal: number;
    raiTotal: number;
    nganTotal: number;
    certicatedPlotTotal: number;
    certicatedRaiTotal: number;
    certicatedNganTotal: number;
  }>();

  const handleChangeProductionInformation = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setProductionInformation((prev: any) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSummitProductionInformation = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        icon: "info",
        title: "กำลังสร้างเอกสาร KOS 1",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEnterKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const basicInformation = localStorage.getItem("basicInformation");
      const parseBasicInformation: BasicInformation = JSON.parse(
        basicInformation as string,
      );
      const farmInformation = localStorage.getItem("farmFieldInformation");
      const parseFarmInformation: BasicInformation & {
        certRequestDate: string;
        longitude: string;
        latitude: string;
        mapTerrain: string;
        mapHybrid: string;
      } = JSON.parse(farmInformation as string);
      const docKos1 = await CreateDocKos1Service({
        address: parseBasicInformation.address,
        villageNumber: parseBasicInformation.moo,
        subdistrict: parseBasicInformation.tambon?.name_th as string,
        district: parseBasicInformation.amphure?.name_th as string,
        province: parseBasicInformation.province?.name_th as string,
        phoneNumber: farmer.phoneNumber,
      });
      const farmDocKos1 = await CreateFarmDocKos1Service({
        address: parseFarmInformation.address,
        villageNumber: parseFarmInformation.moo,
        subdistrict: parseFarmInformation.tambon?.name_th as string,
        district: parseFarmInformation.amphure?.name_th as string,
        province: parseFarmInformation.province?.name_th as string,
        latitude: parseFarmInformation.latitude,
        longitude: parseFarmInformation.longitude,
        productionProcess: productionInformation?.productionProcess as string[],
        docKos01Id: docKos1.id,
        certRequestDate: parseFarmInformation.certRequestDate,
        productionMethod: productionInformation?.productionMethod
          .value as string,
        mapTerrain: parseFarmInformation.mapTerrain,
        mapHybrid: parseFarmInformation.mapHybrid,
        plotsTotal: productionInformation?.plotsTotal as number,
        raiTotal: productionInformation?.raiTotal as number,
        nganTotal: productionInformation?.nganTotal as number,
        certicatedPlotTotal:
          productionInformation?.certicatedPlotTotal as number,
        certicatedRaiTotal: productionInformation?.certicatedRaiTotal as number,
        certicatedNganTotal:
          productionInformation?.certicatedNganTotal as number,
      });

      localStorage.removeItem("basicInformation");
      localStorage.removeItem("farmFieldInformation");
      router.push({
        pathname: `/kos01/${farmDocKos1.docKos01Id}/plantKos1`,
      });
      Swal.fire({
        icon: "success",
        title: "สร้างเอกสาร KOS 1 สำเร็จ",
      });
    } catch (error: any) {
      console.log(error.message);
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: error.message,
      });
    }
  };
  const handleClickOnBack = () => {
    router.push({
      pathname: "/create/kos1",
      query: { step: "farmFieldInformation" as Step },
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center font-Anuphan">
      <h2 className="w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white">
        กระบวนการผลิต
      </h2>
      <div className="flex w-full  items-center justify-center">
        <Form
          onSubmit={handleSummitProductionInformation}
          aria-label="เลือกกระบวนการผลิต"
          className="mt-5 flex w-full flex-col items-center justify-start gap-5"
        >
          <CheckboxGroup
            aria-label="เลือกกระบวนการผลิต"
            isRequired
            value={productionInformation?.productionProcess}
            onChange={(e) => {
              setProductionInformation((prev: any) => {
                return {
                  ...prev,
                  productionProcess: e as string[],
                };
              });
            }}
            className="flex flex-col gap-2"
          >
            <Checkbox
              className={({ isPressed, isSelected }) => (isSelected ? "" : "")}
              value="มีเฉพาะผลิตผลพืช อินทรีย์เท่านั้น"
            >
              {({ isSelected }) => (
                <div className="flex items-center justify-start gap-2 ">
                  <div className="text-3xl text-super-main-color">
                    {isSelected ? (
                      <IoIosCheckbox />
                    ) : (
                      <MdCheckBoxOutlineBlank />
                    )}
                  </div>
                  <span className="text-lg font-bold text-super-main-color">
                    มีเฉพาะผลิตผลพืช อินทรีย์เท่านั้น
                  </span>
                </div>
              )}
            </Checkbox>
            <Checkbox
              className={({ isPressed, isSelected }) => (isSelected ? "" : "")}
              value="มีทั้งผลิตผลพืชอินทรีย์ และทั่วไป"
            >
              {({ isSelected }) => (
                <div className="flex items-center justify-start gap-2 ">
                  <div className="text-3xl text-super-main-color">
                    {isSelected ? (
                      <IoIosCheckbox />
                    ) : (
                      <MdCheckBoxOutlineBlank />
                    )}
                  </div>
                  <span className="text-lg font-bold text-super-main-color">
                    มีทั้งผลิตผลพืชอินทรีย์ และทั่วไป
                  </span>
                </div>
              )}
            </Checkbox>
          </CheckboxGroup>

          <RadioGroup
            isRequired
            value={productionInformation?.productionMethod?.select}
            onChange={(e) =>
              setProductionInformation((prev: any) => {
                return {
                  ...prev,
                  productionMethod: {
                    select: e,
                    value: e,
                  },
                };
              })
            }
            className="mt-4 flex  flex-col gap-2"
          >
            <Label className="text-xl font-bold text-super-main-color">
              วิธีการผลิต
            </Label>
            <Radio value="ชนิดพืชที่ผลิตแตกต่างกัน">
              {({ isSelected }) => (
                <div className=" flex items-center justify-start gap-2">
                  <div className="text-2xl text-super-main-color">
                    {isSelected ? (
                      <MdOutlineRadioButtonChecked />
                    ) : (
                      <MdOutlineRadioButtonUnchecked />
                    )}
                  </div>
                  <span className="text-lg font-semibold">
                    ชนิดพืชที่ผลิตแตกต่างกัน
                  </span>
                </div>
              )}
            </Radio>
            <Radio value="เวลาการผลิตแตกต่างกัน">
              {({ isSelected }) => (
                <div className=" flex items-center justify-start gap-2">
                  <div className="text-2xl text-super-main-color">
                    {isSelected ? (
                      <MdOutlineRadioButtonChecked />
                    ) : (
                      <MdOutlineRadioButtonUnchecked />
                    )}
                  </div>
                  <span className="text-lg font-semibold">
                    เวลาการผลิตแตกต่างกัน
                  </span>
                </div>
              )}
            </Radio>
            <div className="flex  items-center justify-start gap-2">
              <Radio value="อื่นๆ">
                {({ isSelected }) => (
                  <div className=" flex items-center justify-start gap-2">
                    <div className="text-2xl text-super-main-color">
                      {isSelected ? (
                        <MdOutlineRadioButtonChecked />
                      ) : (
                        <MdOutlineRadioButtonUnchecked />
                      )}
                    </div>
                    <div>
                      <span className="text-lg font-semibold">อื่น ๆ</span>
                    </div>
                  </div>
                )}
              </Radio>
              <TextField aria-label="ตัวเลือกอื่นๆ" className="relative  ">
                <Input
                  onChange={(e) =>
                    setProductionInformation((prev: any) => {
                      return {
                        ...prev,
                        productionMethod: {
                          select: "อื่นๆ",
                          value: e.target.value,
                        },
                      };
                    })
                  }
                  className="bg-slate-200 p-2"
                />
              </TextField>
            </div>
          </RadioGroup>

          <h2 className="mt-5 w-10/12 rounded-xl bg-third-color py-2 text-center text-xl font-bold text-white">
            ชนิดพืชที่ขอการรับรอง
          </h2>
          <div className="flex w-10/12 flex-col items-start gap-2">
            <TextField
              isRequired
              className="relative flex  flex-col items-start  "
            >
              <Label className="text-lg font-semibold text-super-main-color">
                จำนวนแปลงทั้งหมด :{" "}
              </Label>
              <Input
                name="plotsTotal"
                onChange={handleChangeProductionInformation}
                value={productionInformation?.plotsTotal}
                required
                type="number"
                inputMode="numeric"
                className="bg-slate-200 p-2"
              />
            </TextField>
            <div className="flex w-full items-center justify-center gap-2">
              <TextField
                isRequired
                className="relative flex w-max items-center  justify-center gap-2 "
              >
                <Label className="text-lg font-semibold text-super-main-color">
                  พื้นที่ :{" "}
                </Label>
                <Input
                  name="raiTotal"
                  onChange={handleChangeProductionInformation}
                  value={productionInformation?.raiTotal}
                  type="number"
                  inputMode="numeric"
                  className="w-20 bg-slate-200 p-2"
                />
                <span className="text-lg font-semibold text-super-main-color">
                  ไร่
                </span>
              </TextField>
              <TextField
                isRequired
                aria-label="งาน"
                className="relative flex w-max items-center  justify-center gap-2 "
              >
                <Input
                  name="nganTotal"
                  onChange={handleChangeProductionInformation}
                  value={productionInformation?.nganTotal}
                  type="number"
                  inputMode="numeric"
                  className="w-20 bg-slate-200 p-2"
                />
                <span className="text-lg font-semibold text-super-main-color">
                  งาน
                </span>
              </TextField>
            </div>
          </div>
          <div className="mt-5 flex w-10/12 flex-col items-start gap-2">
            <TextField
              isRequired
              className="relative flex  flex-col items-start  "
            >
              <Label className="text-lg font-semibold text-super-main-color">
                จำนวนแปลงที่ขอรับรอง KOS :{" "}
              </Label>
              <Input
                name="certicatedPlotTotal"
                onChange={handleChangeProductionInformation}
                value={productionInformation?.certicatedPlotTotal}
                type="number"
                inputMode="numeric"
                className="bg-slate-200 p-2"
              />
            </TextField>
            <div className="flex w-full items-center justify-center gap-2">
              <TextField
                isRequired
                className="relative flex w-max items-center  justify-center gap-2 "
              >
                <Label className="text-lg font-semibold text-super-main-color">
                  พื้นที่ :{" "}
                </Label>
                <Input
                  name="certicatedRaiTotal"
                  onChange={handleChangeProductionInformation}
                  value={productionInformation?.certicatedRaiTotal}
                  type="number"
                  inputMode="numeric"
                  className="w-20 bg-slate-200 p-2"
                />
                <span className="text-lg font-semibold text-super-main-color">
                  ไร่
                </span>
              </TextField>
              <TextField
                isRequired
                aria-label="งาน"
                className="relative flex w-max items-center  justify-center gap-2 "
              >
                <Input
                  name="certicatedNganTotal"
                  onChange={handleChangeProductionInformation}
                  value={productionInformation?.certicatedNganTotal}
                  type="number"
                  inputMode="numeric"
                  className="w-20 bg-slate-200 p-2"
                />
                <span className="text-lg font-semibold text-super-main-color">
                  งาน
                </span>
              </TextField>
            </div>
          </div>
          <div className="flex w-full items-center justify-center gap-2">
            <Button
              onPress={handleClickOnBack}
              type="button"
              className={`mt-5 flex items-center justify-center gap-2 rounded-xl bg-third-color 
            px-5 py-2 text-lg font-semibold text-white drop-shadow-lg 
              transition duration-100 hover:bg-super-main-color 
              active:scale-110 active:ring-2 active:ring-super-main-color`}
            >
              <MdOutlineNavigateBefore /> ย้อนกลับ
            </Button>
            <Button
              type="submit"
              className={`mt-5 flex items-center justify-center gap-2 rounded-xl bg-third-color px-10
             py-2 text-lg  font-semibold text-white drop-shadow-lg 
              transition duration-100 hover:bg-super-main-color 
              active:scale-110 active:ring-2 active:ring-super-main-color`}
            >
              ถัดไป <MdOutlineNavigateNext />
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ProductionInformation;
