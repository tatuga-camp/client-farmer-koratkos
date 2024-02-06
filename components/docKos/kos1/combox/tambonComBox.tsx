import { Combobox, Transition } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import React, { Fragment, useEffect, useState } from "react";
import { Input, Label, TextField } from "react-aria-components";
import { FaCheck } from "react-icons/fa";
import { RiExpandUpDownLine } from "react-icons/ri";
import { GetAllTambonByAmphureService } from "../../../../services/thai-data";
import { Tambon } from "../../../../model";
import { BasicInformation, TypeSetBasicInformation } from "../basicInformation";

type TambonComBoxProps = {
  selectAmphureId: number | null;
  setBasicInformation: TypeSetBasicInformation;
  baicInformation: BasicInformation;
};
function TambonComBox({
  selectAmphureId,
  baicInformation,
  setBasicInformation,
}: TambonComBoxProps) {
  const [query, setQuery] = useState("");

  const tambons = useQuery({
    queryKey: ["tambons"],
    queryFn: () =>
      GetAllTambonByAmphureService({
        amphureId: selectAmphureId as number,
      }),
    enabled: false,
  });

  useEffect(() => {
    if (selectAmphureId) {
      tambons.refetch();
    }
  }, [selectAmphureId]);

  if (tambons.isFetching)
    return (
      <div className="flex h-10 w-full animate-pulse items-center justify-center rounded-lg bg-gray-400 text-white">
        Loading...
      </div>
    );
  if (tambons.isError)
    return (
      <TextField
        className="flex w-full items-center justify-center  gap-2"
        name="tambon"
        type="text"
        isRequired
      >
        <Label className="w-40 text-xl font-bold text-super-main-color">
          ตำบล :
        </Label>
        <Input className="h-10 w-full bg-slate-200 p-2 text-xl" />
      </TextField>
    );

  const filterAmphures =
    query === ""
      ? tambons.data
      : tambons.data?.filter((tambon: Tambon) => {
          return tambon.name_th.toLowerCase().includes(query.toLowerCase());
        });
  return (
    <Combobox
      value={baicInformation?.tambon}
      onChange={(value) => {
        setBasicInformation((prev: any) => {
          return {
            ...prev,
            tambon: value as Tambon,
          };
        });
      }}
    >
      <div className="relative flex w-full items-center justify-center  gap-2">
        <Label className="w-40 text-xl font-bold text-super-main-color">
          ตำบล :
        </Label>
        <div
          className="relative w-full cursor-default overflow-hidden bg-slate-200
       text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75
        focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
        >
          <Combobox.Input
            className="h-10 w-full rounded-md bg-slate-200 p-2 text-lg outline-none"
            displayValue={(tambon: Tambon) => tambon.name_th}
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
            className="absolute top-10  z-50 mt-1 max-h-36  w-full overflow-auto rounded-md bg-white 
      py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
          >
            {filterAmphures?.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                ไม่พบข้อมูล
              </div>
            ) : (
              filterAmphures?.map((tambon) => (
                <Combobox.Option
                  key={tambon.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-teal-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={tambon}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {tambon.name_th}
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

export default TambonComBox;
