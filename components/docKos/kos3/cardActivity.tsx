import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import { DeleteActivityKos3Service } from "../../../services/kos3";
import { confirmDelete, showError, showSaved, showSaving } from "../../../utils/confirm";
import { formatThaiDate } from "../../../utils/format";
import { ActivityWithFiles } from "./activityForm";

type CardActivityProps = {
  activity: ActivityWithFiles;
  onEdit: (activity: ActivityWithFiles) => void;
};

/** One saved KOS-03 activity: date, plot, what was done, photos, and edit / delete. */
function CardActivity({ activity, onEdit }: CardActivityProps) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const photos = activity.fileOnActivities;
  const dateText = formatThaiDate(activity.activityDate);
  const itemName = `บันทึกวันที่ ${formatThaiDate(activity.activityDate, "short")} แปลงที่ ${activity.plotNumber}`;

  const handleDelete = async () => {
    const confirmed = await confirmDelete({
      title: `ลบ${itemName}?`,
      text: photos.length > 0 ? `รูปที่แนบไว้ ${photos.length} รูปจะถูกลบด้วย ลบแล้วกู้คืนไม่ได้` : undefined,
    });
    if (!confirmed) return;
    try {
      setDeleting(true);
      showSaving("กำลังลบบันทึก");
      await DeleteActivityKos3Service({ activitiesKos3Id: activity.id });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      showSaved("ลบบันทึกเรียบร้อย");
    } catch (error) {
      showError(error, "ลบไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="card flex flex-col gap-4 p-4 sm:p-5">
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-col">
          <dt className="text-sm text-super-main-color/70">วันที่ทำงาน</dt>
          <dd className="text-lg font-bold leading-snug">{dateText}</dd>
        </div>
        <div className="flex flex-col items-end">
          <dt className="text-sm text-super-main-color/70">แปลงที่</dt>
          <dd className="min-w-12 rounded-lg bg-main-color/10 px-3 py-0.5 text-center text-xl font-bold text-main-color tabular-nums">
            {activity.plotNumber}
          </dd>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="text-sm text-super-main-color/70">สิ่งที่ทำ</dt>
          <dd className="whitespace-pre-line break-words text-lg leading-relaxed">{activity.note}</dd>
        </div>
      </dl>

      {photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-super-main-color/70">รูปถ่าย {photos.length} รูป (แตะเพื่อดูรูปใหญ่)</p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <li key={photo.id}>
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block aspect-square overflow-hidden rounded-lg border border-third-color/50 bg-fourth-color focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-main-color"
                >
                  <Image
                    src={photo.url}
                    alt={`รูปที่ ${index + 1} ของ${itemName} (เปิดรูปขนาดเต็ม)`}
                    fill
                    sizes="(max-width: 640px) 33vw, 160px"
                    className="object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 border-t border-third-color/30 pt-3 sm:justify-end [&>*]:flex-1 sm:[&>*]:flex-none">
        <button type="button" onClick={() => onEdit(activity)} className="btn btn-secondary btn-sm" disabled={deleting}>
          <LuPencil aria-hidden="true" className="size-5" />
          แก้ไข
          <span className="sr-only">{itemName}</span>
        </button>
        <button type="button" onClick={handleDelete} className="btn btn-danger-soft btn-sm" disabled={deleting}>
          <LuTrash2 aria-hidden="true" className="size-5" />
          ลบ
          <span className="sr-only">{itemName}</span>
        </button>
      </div>
    </li>
  );
}

export default CardActivity;
