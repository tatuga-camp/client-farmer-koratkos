import { Combobox, Transition } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import React, { Fragment, useEffect, useState } from "react";
import { Input, Label, TextField } from "react-aria-components";
import { FaCheck } from "react-icons/fa";
import { RiExpandUpDownLine } from "react-icons/ri";
import { PlantData } from "../forms/createPlantKos1";

const plantLists = [
  { title: "กระท่อม" },
  { title: "กระถิน" },
  { title: "กระท้อน" },
  { title: "กล้วย" },
  { title: "กล้วยหอม" },
  { title: "กล้วยน้ำว้า" },
  { title: "มะละกอ" },
  { title: "มะม่วง" },
  { title: "มะนาว" },
  { title: "มะพร้าว" },
];

type PlantComboxProps = {
  createPlant: PlantData | undefined;
  setCreatePlant: React.Dispatch<React.SetStateAction<PlantData | undefined>>;
};
function PlantCombox({ setCreatePlant, createPlant }: PlantComboxProps) {
  const [query, setQuery] = useState("");

  const filterPlants =
    query === ""
      ? plantLists
      : plantLists?.filter((plant) => {
          return plant.title.toLowerCase().includes(query.toLowerCase());
        });
  return (
    <Combobox
      value={createPlant?.plant}
      onChange={(value) => {
        setCreatePlant((prev) => {
          return {
            ...prev,
            plant: value,
          };
        });
      }}
    >
      <div className="relative flex w-10/12 flex-col items-start justify-center  gap-2">
        <Label className="w-40 text-xl font-bold text-super-main-color">
          รายชื่อพืช :
        </Label>
        <div
          className="relative w-full cursor-default overflow-hidden bg-slate-200
       text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75
        focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
        >
          <Combobox.Input
            required
            className="h-10 w-full rounded-md  border-2 border-black p-2 text-lg "
            displayValue={(plant: any) => plant}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <RiExpandUpDownLine />
          </Combobox.Button>
        </div>
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

export default PlantCombox;
