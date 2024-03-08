import { Combobox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { Input, Label, TextField } from "react-aria-components";
import { FaCheck } from "react-icons/fa";
import { RiExpandUpDownLine } from "react-icons/ri";
import { typeAmount } from "../../../../data/plants";

type PlantComboxProps = {
  factor:
    | {
        purchaseDate?: string | undefined;
        prodFactorTypes?: string | undefined;
        amount?: number | undefined;
        source?: string | undefined;
        typeAmount?: string | undefined;
      }
    | undefined;
  setFactor: React.Dispatch<
    React.SetStateAction<{
      purchaseDate?: string | undefined;
      prodFactorTypes?: string | undefined;
      amount?: number | undefined;
      source?: string | undefined;
      typeAmount?: string | undefined;
    }>
  >;
};
function TypeAmountCombox({ setFactor, factor }: PlantComboxProps) {
  const [query, setQuery] = useState("");
  const [unknowOption, setUnknowOption] = useState(false);
  const filterPlants =
    query === ""
      ? typeAmount
      : typeAmount?.filter((type) => {
          return type.title.toLowerCase().includes(query.toLowerCase());
        });

  useEffect(() => {
    if (factor?.typeAmount !== undefined) {
      const isKnowPlat = typeAmount?.find(
        (type) => type.title === factor?.typeAmount,
      );
      if (!isKnowPlat) {
        setUnknowOption(() => true);
      } else if (isKnowPlat) {
        setUnknowOption(() => false);
      }
    }
  }, [factor]);
  return (
    <Combobox
      value={factor?.typeAmount}
      onChange={(value) => {
        setFactor((prev) => {
          return {
            ...prev,
            typeAmount: value,
          };
        });
      }}
    >
      <div className="relative flex w-10/12 flex-col items-start justify-center  gap-2">
        {unknowOption && (
          <Input
            value={factor?.typeAmount}
            onChange={(e) =>
              setFactor((prev) => {
                return {
                  ...prev,
                  typeAmount: e.target.value,
                };
              })
            }
            className=" h-12 w-full rounded-md border-[1px] border-black   p-3 text-lg "
          />
        )}

        {!unknowOption && (
          <div
            className="relative w-full cursor-default overflow-hidden bg-slate-200
       text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75
        focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
          >
            <Combobox.Input
              required
              className=" h-12 w-full rounded-md border-[1px] border-black   p-3 text-lg "
              displayValue={(type: any) => type}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <RiExpandUpDownLine />
            </Combobox.Button>
          </div>
        )}
        {unknowOption ? (
          <button
            type="button"
            className="rounded-lg bg-super-main-color px-1  py-1 text-white drop-shadow-lg"
            onClick={() => setUnknowOption((prev) => !prev)}
          >
            เลือกจากรายการ
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg bg-super-main-color px-1 py-1 text-white drop-shadow-lg"
            onClick={() => setUnknowOption((prev) => !prev)}
          >
            ระบุอื่น ๆ
          </button>
        )}

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options
            className="absolute top-20  z-50 mt-1 max-h-36  w-full overflow-auto rounded-md bg-white 
      py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
          >
            {filterPlants?.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                ไม่พบข้อมูล
              </div>
            ) : (
              filterPlants?.map((plant, index) => (
                <Combobox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-teal-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={plant.title}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {plant.title}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-teal-600"
                          }`}
                        >
                          <FaCheck />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}

export default TypeAmountCombox;
