import Image from "next/image";
import React, { ReactNode, useRef, useState } from "react";
import { LuImagePlus, LuTrash2, LuZoomIn } from "react-icons/lu";
import { FieldErrorText } from "./Field";

export type PickedPhoto = {
  /** Saved photos have an id (and a server URL); new ones only have the File and a blob URL. */
  id?: string;
  url: string;
  file?: File;
};

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/bmp", "image/heic", "image/heif"];
const MAX_MB = 15;

type PhotoPickerProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  photos: PickedPhoto[];
  onAdd: (photos: PickedPhoto[]) => void;
  /** Ask for confirmation in the parent before deleting a saved photo. */
  onRemove: (photo: PickedPhoto) => void;
  /** Max number of photos; the add button hides once reached. */
  max?: number;
};

/** Big "take or choose a photo" tile plus a thumbnail grid. */
export function PhotoPicker({ id, label, hint, error, optional, photos, onAdd, onRemove, max }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState<string>();
  const full = max !== undefined && photos.length >= max;
  const errorId = error || rejected ? `${id}-error` : undefined;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted: PickedPhoto[] = [];
    const problems: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type && !ACCEPTED.includes(file.type)) {
        problems.push(`“${file.name}” ไม่ใช่ไฟล์รูปภาพ`);
      } else if (file.size > MAX_MB * 1024 * 1024) {
        problems.push(`“${file.name}” ใหญ่เกิน ${MAX_MB} MB`);
      } else {
        accepted.push({ file, url: URL.createObjectURL(file) });
      }
    });
    const room = max === undefined ? accepted.length : Math.max(0, max - photos.length);
    if (accepted.length > room) problems.push(`เพิ่มได้อีกไม่เกิน ${room} รูป`);
    setRejected(problems.length > 0 ? problems.join("\n") : undefined);
    if (accepted.length > 0) onAdd(accepted.slice(0, room));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5" aria-describedby={errorId}>
      <legend className="label mb-1.5">
        {label}
        {optional && <span className="font-normal text-super-main-color/70"> (ถ้ามี)</span>}
      </legend>
      {hint && <p className="hint">{hint}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <figure key={photo.id ?? photo.url} className="group relative m-0 aspect-[4/3] overflow-hidden rounded-xl border border-third-color/50 bg-fourth-color">
            <Image src={photo.url} alt={`รูปที่ ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover" unoptimized={!photo.id} />
            <a
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              className="absolute left-2 top-2 flex size-10 items-center justify-center rounded-lg bg-white/90 text-super-main-color shadow"
              aria-label={`ดูรูปที่ ${index + 1} ขนาดเต็ม`}
            >
              <LuZoomIn aria-hidden="true" className="size-5" />
            </a>
            <button
              type="button"
              onClick={() => onRemove(photo)}
              className="absolute right-2 top-2 flex min-h-10 items-center gap-1 rounded-lg bg-white/95 px-2.5 text-base font-semibold text-red-700 shadow"
              aria-label={`ลบรูปที่ ${index + 1}`}
            >
              <LuTrash2 aria-hidden="true" className="size-5" />
              ลบ
            </button>
            {!photo.id && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-super-main-color/80 px-2 py-1 text-center text-sm text-white">
                ยังไม่บันทึก
              </figcaption>
            )}
          </figure>
        ))}
        {!full && (
          <button
            id={id}
            type="button"
            data-invalid={error ? true : undefined}
            onClick={() => inputRef.current?.click()}
            className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white p-3 text-center text-super-main-color transition-colors hover:bg-third-color/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-main-color ${
              error ? "border-red-600" : "border-third-color"
            }`}
          >
            <LuImagePlus aria-hidden="true" className="size-9 text-main-color" />
            <span className="text-lg font-semibold leading-tight">ถ่ายรูป / เลือกรูป</span>
            <span className="text-sm text-super-main-color/70">เลือกได้หลายรูป</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => handleFiles(event.target.files)}
      />
      {(error || rejected) && <FieldErrorText id={errorId}>{[error, rejected].filter(Boolean).join("\n")}</FieldErrorText>}
    </fieldset>
  );
}
