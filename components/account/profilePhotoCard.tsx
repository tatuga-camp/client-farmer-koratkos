import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { LuCamera, LuLoader2 } from "react-icons/lu";
import { UploadProfileService } from "../../services/farmer";
import { showError, showSaved } from "../../utils/confirm";
import { useFarmer } from "../../utils/useFarmer";
import { FieldErrorText, StorageImage } from "../ui";

// The server only takes .jpg/.jpeg/.png/.gif names (case-sensitive) up to 10 MB.
const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif" };
const MAX_MB = 10;

/** Current profile picture with a big "เปลี่ยนรูป" button; uploads as soon as a picture is chosen. */
function ProfilePhotoCard() {
  const farmer = useFarmer();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  const [problem, setProblem] = useState<string>();
  const uploading = preview !== undefined;
  const picture = preview ?? farmer.data?.picture;
  const name = `${farmer.data?.title ?? ""}${farmer.data?.firstName ?? ""} ${farmer.data?.lastName ?? ""}`.trim();

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    const extension = EXTENSIONS[file.type];
    if (!extension) {
      setProblem(`“${file.name}” ใช้ไม่ได้ เลือกรูปแบบ JPG หรือ PNG`);
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setProblem(`รูปนี้ใหญ่เกิน ${MAX_MB} MB ลองเลือกรูปอื่น หรือถ่ายใหม่`);
      return;
    }
    setProblem(undefined);
    const url = URL.createObjectURL(file);
    setPreview(url);
    try {
      // Rename so the server's extension check passes for names like "IMG_0012.JPEG".
      await UploadProfileService({ file: new File([file], `profile.${extension}`, { type: file.type }) });
      await queryClient.invalidateQueries({ queryKey: ["farmer"] });
      showSaved("เปลี่ยนรูปเรียบร้อย");
    } catch (error) {
      showError(error, "เปลี่ยนรูปไม่สำเร็จ");
    } finally {
      setPreview(undefined);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section aria-labelledby="photo-title" className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <h2 id="photo-title" className="sr-only">
        รูปโปรไฟล์
      </h2>
      <div className="relative size-28 shrink-0 self-center overflow-hidden rounded-full bg-third-color/20 ring-2 ring-third-color ring-offset-2">
        {picture &&
          (uploading ? (
            <Image src={picture} alt="รูปโปรไฟล์ของคุณ" fill sizes="112px" unoptimized className="object-cover" />
          ) : (
            // A just-uploaded picture can take a moment to appear in storage.
            <StorageImage src={picture} alt="รูปโปรไฟล์ของคุณ" sizes="112px" priority className="object-cover" />
          ))}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <LuLoader2 aria-hidden="true" className="size-8 animate-spin text-super-main-color" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-center sm:text-left">
        <p className="text-xl font-bold">{name}</p>
        <p className="hint">ใช้รูปที่เห็นหน้าชัด ไฟล์ JPG หรือ PNG ไม่เกิน {MAX_MB} MB</p>
        <input
          ref={inputRef}
          id="profilePicture"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => handleFile(event.target.files)}
        />
        <button
          type="button"
          className="btn btn-secondary mt-1 w-full sm:w-fit"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <LuLoader2 aria-hidden="true" className="size-5 animate-spin" />
              กำลังอัปโหลด…
            </>
          ) : (
            <>
              <LuCamera aria-hidden="true" className="size-5" />
              เปลี่ยนรูป
            </>
          )}
        </button>
        <p role="status" className="sr-only">
          {uploading ? "กำลังอัปโหลดรูป" : ""}
        </p>
        {problem && <FieldErrorText>{problem}</FieldErrorText>}
      </div>
    </section>
  );
}

export default ProfilePhotoCard;
