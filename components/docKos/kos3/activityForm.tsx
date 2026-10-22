import { useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { LuPlus, LuSave } from "react-icons/lu";
import { ActivityKos3, FileActivityKos3 } from "../../../model";
import {
  CreateActivityKos3Service,
  CreateDocKos3Service,
  CreateFileOnActivityKos3Service,
  DeleteFileOnActivityKos3Service,
  UpdateActivityKos3Service,
} from "../../../services/kos3";
import {
  GetSignURLService,
  UploadSignURLService,
} from "../../../services/google-storage";
import {
  DateField,
  ErrorSummary,
  FormActions,
  FormCard,
  NumberField,
  PhotoPicker,
  PickedPhoto,
  TextAreaField,
} from "../../ui";
import { confirmDelete, showError, showSaved, showSaving } from "../../../utils/confirm";
import { isoFromLocalDate } from "../../../utils/format";
import { useFieldErrors } from "../../../utils/useFieldErrors";
import { FieldErrors, checkDate, checkNumber, checkText } from "../../../utils/validators";

export type ActivityWithFiles = ActivityKos3 & { fileOnActivities: FileActivityKos3[] };

const NOTE_MAX = 500;

/** Common jobs, so a farmer can tap instead of typing the whole note. */
const quickActivities = [
  "เตรียมดิน",
  "ปลูก/หว่านเมล็ด",
  "ใส่ปุ๋ยหมัก",
  "รดน้ำ",
  "กำจัดวัชพืช",
  "ป้องกันกำจัดศัตรูพืช",
  "เก็บเกี่ยว",
];

type ActivityValues = {
  activityDate?: string;
  plotNumber: string;
  note: string;
};

function todayIso() {
  const now = new Date();
  return isoFromLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function validateActivity(values: ActivityValues): FieldErrors {
  return {
    activityDate: checkDate(values.activityDate, { label: "วันที่ทำงาน", notFuture: true }),
    plotNumber:
      values.plotNumber !== "" && Number(values.plotNumber) < 1
        ? "หมายเลขแปลงเริ่มที่ 1 ดูหมายเลขในผังแปลง KOS-02"
        : checkNumber(values.plotNumber, {
            label: "หมายเลขแปลง",
            example: "1",
            integer: true,
            max: 999,
            maxMessage: "หมายเลขแปลงไม่ควรเกิน 999 ดูหมายเลขในผังแปลง KOS-02 อีกครั้ง",
          }),
    note: checkText(values.note, { label: "สิ่งที่ทำในแปลง", example: "ใส่ปุ๋ยหมัก 2 กระสอบ", max: NOTE_MAX }),
  };
}

/**
 * Uploads new photos one at a time and attaches them to the activity.
 * Returns how many failed, so a weak signal doesn't throw away the saved record.
 */
async function uploadPhotos(activityId: string, photos: PickedPhoto[]) {
  let failed = 0;
  for (const photo of photos) {
    if (!photo.file) continue;
    try {
      const signURL = await GetSignURLService({
        fileName: photo.file.name,
        fileType: photo.file.type || "image/jpeg",
      });
      const upload = await UploadSignURLService({
        contentType: signURL.contentType,
        file: photo.file,
        signURL: signURL.signURL,
      });
      if (upload.message === "error") throw new Error("upload failed");
      await CreateFileOnActivityKos3Service({
        url: signURL.originalURL,
        type: signURL.contentType,
        activitiesKos3Id: activityId,
      });
    } catch {
      failed += 1;
    }
  }
  return failed;
}

type ActivityFormProps = {
  /** The farmer's KOS-03 document. When missing it is created together with the first activity. */
  docKos3Id?: string;
  /** Editing this saved activity; otherwise a new one is added. */
  activity?: ActivityWithFiles;
  onSaved: (result: { docKos3Id: string; created: boolean }) => void;
  /** Shows a Cancel button that returns to the list. */
  onCancel?: () => void;
};

/** Add or edit one KOS-03 activity: date, plot, what was done and optional photos. */
function ActivityForm({ docKos3Id, activity, onSaved, onCancel }: ActivityFormProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ActivityValues>(() =>
    activity
      ? {
          activityDate: activity.activityDate,
          plotNumber: String(activity.plotNumber),
          note: activity.note ?? "",
        }
      : { activityDate: todayIso(), plotNumber: "", note: "" },
  );
  const [photos, setPhotos] = useState<PickedPhoto[]>(
    () => activity?.fileOnActivities.map((file) => ({ id: file.id, url: file.url })) ?? [],
  );
  const [saving, setSaving] = useState(false);
  // Kept if the document was created but saving the activity failed, so a retry doesn't create it twice.
  const createdDocId = useRef<string>();

  const form = useFieldErrors(validateActivity(values));
  const set = (patch: Partial<ActivityValues>) => setValues((prev) => ({ ...prev, ...patch }));

  const appendToNote = (text: string) => {
    setValues((prev) => {
      const current = prev.note.trimEnd();
      return { ...prev, note: current ? `${current} ${text}` : text };
    });
  };

  const handleRemovePhoto = async (photo: PickedPhoto) => {
    if (!photo.id) {
      URL.revokeObjectURL(photo.url);
      setPhotos((prev) => prev.filter((item) => item.url !== photo.url));
      return;
    }
    const confirmed = await confirmDelete({
      title: "ลบรูปนี้?",
      text: "รูปที่บันทึกไว้แล้วจะถูกลบทันที และกู้คืนไม่ได้",
      confirmText: "ลบรูป",
    });
    if (!confirmed) return;
    try {
      showSaving("กำลังลบรูป");
      await DeleteFileOnActivityKos3Service({ fileOnActivityId: photo.id });
      setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      showSaved("ลบรูปเรียบร้อย");
    } catch (error) {
      showError(error, "ลบรูปไม่สำเร็จ");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const body = {
      plotNumber: Number(values.plotNumber),
      activityDate: values.activityDate as string,
      note: values.note.trim(),
    };
    try {
      setSaving(true);
      showSaving();
      let docId = docKos3Id ?? createdDocId.current;
      if (!docId) {
        docId = (await CreateDocKos3Service()).id;
        createdDocId.current = docId;
      }
      const saved = activity
        ? await UpdateActivityKos3Service({
            query: { docKos03Id: activity.docKos03Id, activitiesKos3Id: activity.id },
            body,
          })
        : await CreateActivityKos3Service({ ...body, docKos03Id: docId });
      const failed = await uploadPhotos(
        saved.id,
        photos.filter((photo) => !photo.id),
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activities"] }),
        !docKos3Id && queryClient.invalidateQueries({ queryKey: ["docKos"] }),
      ]);
      if (failed > 0) {
        showError(
          {
            message: `อัปโหลดรูปไม่สำเร็จ ${failed} รูป ตรวจสอบสัญญาณอินเทอร์เน็ต แล้วกด “แก้ไข” ที่บันทึกนี้เพื่อเพิ่มรูปอีกครั้ง`,
          },
          "บันทึกกิจกรรมแล้ว แต่รูปยังขึ้นไม่ครบ",
        );
      } else {
        showSaved();
      }
      onSaved({ docKos3Id: docId, created: !activity });
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <ErrorSummary errors={form.errors} show={form.submitted} />
      <FormCard
        title={activity ? "แก้ไขบันทึกกิจกรรม" : "เพิ่มบันทึกกิจกรรม"}
        description="กรอกวันที่ หมายเลขแปลง และสิ่งที่ทำ ส่วนรูปถ่ายจะใส่หรือไม่ก็ได้"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <DateField
            id="activityDate"
            label="วันที่ทำงาน"
            hint={activity ? "วันที่ลงมือทำงานนี้ แตะเพื่อเปลี่ยน" : "ตั้งไว้เป็นวันนี้ ถ้าทำวันอื่นให้แตะเพื่อเปลี่ยน"}
            value={values.activityDate}
            onChange={(activityDate) => set({ activityDate })}
            onBlur={() => form.touch("activityDate")}
            max={todayIso()}
            error={form.errors.activityDate}
          />
          <NumberField
            id="plotNumber"
            label="แปลงที่"
            hint="หมายเลขแปลงตามผังใน KOS-02 เช่น 1"
            integer
            placeholder="เช่น 1"
            value={values.plotNumber}
            onChange={(plotNumber) => set({ plotNumber })}
            onBlur={() => form.touch("plotNumber")}
            error={form.errors.plotNumber}
          />
        </div>

        <div className="flex flex-col gap-3">
          <TextAreaField
            id="note"
            label="สิ่งที่ทำในแปลง"
            hint="เขียนสั้น ๆ ว่าทำอะไร ใช้อะไร เท่าไร เช่น “ใส่ปุ๋ยหมัก 2 กระสอบ” หรือ “ถอนหญ้ารอบแปลง”"
            placeholder="เช่น ใส่ปุ๋ยหมัก 2 กระสอบ"
            maxLength={NOTE_MAX}
            value={values.note}
            onChange={(note) => set({ note })}
            onBlur={() => form.touch("note")}
            error={form.errors.note}
          />
          <div className="flex flex-col gap-2">
            <p id="note-quick-label" className="text-base font-semibold text-super-main-color/80">
              แตะเพื่อเติมงานที่ทำบ่อย
            </p>
            <div role="group" aria-labelledby="note-quick-label" className="flex flex-wrap gap-2">
              {quickActivities.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => appendToNote(text)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-main-color/40 bg-white px-4 text-base font-semibold text-main-color transition-colors hover:bg-main-color/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-main-color active:bg-main-color/20"
                >
                  <LuPlus aria-hidden="true" className="size-4" />
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PhotoPicker
          id="photos"
          label="รูปถ่ายตอนทำงาน"
          optional
          hint="ถ่ายให้เห็นงานที่ทำ เช่น กองปุ๋ยหมัก หรือแปลงที่ถอนหญ้าแล้ว ช่วยให้ผู้ตรวจเห็นภาพ"
          photos={photos}
          onAdd={(added) => setPhotos((prev) => [...prev, ...added])}
          onRemove={handleRemovePhoto}
        />
      </FormCard>
      <FormActions>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={saving}>
            ยกเลิก
          </button>
        )}
        <button type="submit" className="btn btn-primary sm:min-w-44" disabled={saving}>
          <LuSave aria-hidden="true" className="size-5" />
          บันทึก
        </button>
      </FormActions>
    </form>
  );
}

export default ActivityForm;
