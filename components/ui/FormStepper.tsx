import React from "react";
import { LuCheck } from "react-icons/lu";

type FormStepperProps = {
  steps: string[];
  /** Zero-based index of the step on screen. */
  current: number;
};

/**
 * "ขั้นที่ 2 จาก 4" with a segmented bar on phones; numbered circles with names
 * on wider screens. Purely informative: steps are moved with the form buttons.
 */
export function FormStepper({ steps, current }: FormStepperProps) {
  return (
    <nav aria-label="ขั้นตอนการกรอก" className="w-full">
      <div className="flex flex-col gap-2 md:hidden">
        <p className="text-base">
          <span className="font-bold">
            ขั้นที่ {current + 1} จาก {steps.length}
          </span>
          <span className="text-super-main-color/80">: {steps[current]}</span>
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {steps.map((step, index) => (
            <span
              key={step}
              className={`h-2 flex-1 rounded-full ${index <= current ? "bg-main-color" : "bg-third-color/30"}`}
            />
          ))}
        </div>
      </div>
      <ol className="hidden items-start md:flex">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step} className="flex flex-1 items-start last:flex-none" aria-current={active ? "step" : undefined}>
              <div className="flex w-28 flex-col items-center gap-2 text-center">
                <span
                  className={`flex size-10 items-center justify-center rounded-full border-2 text-lg font-bold ${
                    done
                      ? "border-main-color bg-main-color text-white"
                      : active
                        ? "border-main-color bg-white text-main-color ring-4 ring-main-color/15"
                        : "border-third-color/60 bg-white text-super-main-color/60"
                  }`}
                >
                  {done ? <LuCheck aria-label="เสร็จแล้ว" className="size-5" strokeWidth={3} /> : index + 1}
                </span>
                <span className={`text-base leading-tight ${active ? "font-bold" : "text-super-main-color/75"}`}>{step}</span>
              </div>
              {index < steps.length - 1 && (
                <span aria-hidden="true" className={`mt-5 h-0.5 flex-1 ${done ? "bg-main-color" : "bg-third-color/40"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
