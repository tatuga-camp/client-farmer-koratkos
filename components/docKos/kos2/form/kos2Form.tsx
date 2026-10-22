import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { LuArrowRight, LuSave } from "react-icons/lu";
import Swal from "sweetalert2";
import {
  ErrorSummary,
  ExampleDetails,
  FormActions,
  FormCard,
  PhotoPicker,
  PickedPhoto,
  TextAreaField,
  TextField,
} from "../../../ui";
import { kosGuide } from "../../../../data/kosGuides";
import {
  CreateDocKos2Service,
  CreateFileOnDocKos02Service,
  DeleteFileOnDocKos02Service,
  ResponseGetDocKos02Service,
  UpdateDocKos2Service,
} from "../../../../services/kos2";
import { GetSignURLService, UploadSignURLService } from "../../../../services/google-storage";
import { confirmDelete, showError, showSaved, showSaving } from "../../../../utils/confirm";
import { useFieldErrors } from "../../../../utils/useFieldErrors";
import { FieldErrors, checkText } from "../../../../utils/validators";

/** KOS-02 is filled in two parts: the farm map first, then a crop plan for each plot. */
export const kos02Steps = ["ผังแปลง", "แผนการปลูก"];

type MapValues = { plots: string; marketing: string; photos: PickedPhoto[] };

function validateMap(values: MapValues): FieldErrors {
  return {
    numberOfPlotForKosCertificated: checkText(values.plots, { label: "หมายเลขแปลงที่ขอรับรอง", example: "1, 2, 4" }),
    mapPhotos:
      values.photos.length === 0 ? "กรุณาเพิ่มรูปผังแปลงอย่างน้อย 1 รูป วาดบนกระดาษแล้วถ่ายรูปก็ได้" : undefined,
    marketingDetail: checkText(values.marketing, {
      label: "การจัดการหลังเก็บเกี่ยวและการตลาด",
      max: 1000,
      required: false,
    }),
  };
}

/** Changes the open "saving" dialog's title in place, so it doesn't flash between photos. */
function setSavingTitle(title: string) {
  const element = Swal.getTitle();
  if (element) element.textContent = title;
}

type Kos2FormProps = {
  /** The saved document when editing; leave out on the create page. */
  saved?: ResponseGetDocKos02Service;
  onCancel?: () => void;
  onSaved?: () => void;
};

/** KOS-02 part 1: which plots to certify, photos of the farm map, and post-harvest / marketing notes. */
function Kos2Form({ saved, onCancel, onSaved }: Kos2FormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [plots, setPlots] = useState(saved?.numberOfPlotForKosCertificated ?? "");
  const [marketing, setMarketing] = useState(saved?.marketingDetail ?? "");
  const [photos, setPhotos] = useState<PickedPhoto[]>(
    () => saved?.files.map((file) => ({ id: file.id, url: file.url })) ?? [],
  );
  // Known once the document exists, so saving again after a failed upload updates instead of creating twice.
  const [docId, setDocId] = useState(saved?.id);
  const [saving, setSaving] = useState(false);

  const form = useFieldErrors(validateMap({ plots, marketing, photos }));

  /** Uploads every photo not saved yet; returns the grid numbers ("รูปที่ N") of those that failed. */
  const uploadNewPhotos = async (docKos02Id: string) => {
    const pending = photos.filter((photo) => !photo.id && photo.file);
    const failed: number[] = [];
    for (let index = 0; index < pending.length; index++) {
      const photo = pending[index];
      const file = photo.file as File;
      const fileType = file.type || "image/jpeg";
      setSavingTitle(`กำลังอัปโหลดรูปที่ ${index + 1} จาก ${pending.length}`);
      try {
        const signURL = await GetSignURLService({ fileName: file.name, fileType });
        const upload = await UploadSignURLService({ contentType: fileType, file, signURL: signURL.signURL });
        // Don't record a file that never reached storage.
        if (upload.message === "error") throw new Error("upload failed");
        const created = await CreateFileOnDocKos02Service({ url: signURL.originalURL, type: fileType, docKos02Id });
        // Mark it saved, so pressing save again only retries the ones that failed.
        setPhotos((prev) => prev.map((item) => (item === photo ? { id: created.id, url: created.url } : item)));
      } catch {
        failed.push(photos.indexOf(photo) + 1);
      }
    }
    return failed;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.validate()) return;
    const body = {
      numberOfPlotForKosCertificated: plots.trim(),
      marketingDetail: marketing.trim(),
    };
    try {
      setSaving(true);
      showSaving();
      let id = docId;
      if (id) {
        await UpdateDocKos2Service(body);
      } else {
        id = (await CreateDocKos2Service(body)).id;
        setDocId(id);
        queryClient.invalidateQueries({ queryKey: ["docKos"] });
      }
      const failed = await uploadNewPhotos(id);

      if (failed.length > 0) {
        // The text is saved; stay here with the failed photos (still marked "ยังไม่บันทึก") so a retry sends only those.
        // Not refreshed on the create page: it would open the saved document and drop the unsent photos.
        if (saved) queryClient.invalidateQueries({ queryKey: ["docKos02"] });
        showError(
          new Error(`รูปที่ ${failed.join(", ")} ยังอัปโหลดไม่สำเร็จ ตรวจสอบสัญญาณอินเทอร์เน็ต แล้วกดบันทึกอีกครั้ง`),
          `บันทึกแล้ว แต่รูปยังขึ้นไม่ครบ (${failed.length} รูป)`,
        );
      } else if (saved) {
        await queryClient.invalidateQueries({ queryKey: ["docKos02"] });
        showSaved();
        onSaved?.();
      } else {
        showSaved("บันทึกผังแปลงแล้ว", "ขั้นต่อไป: เพิ่มแผนการปลูกของแต่ละแปลง");
        await router.push(kosGuide("kos2").viewHref(id));
        // Only after leaving: the create page opens the saved document as soon as it sees one.
        queryClient.invalidateQueries({ queryKey: ["docKos02"] });
      }
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (photo: PickedPhoto) => {
    form.touch("mapPhotos");
    if (!photo.id) {
      URL.revokeObjectURL(photo.url);
      setPhotos((prev) => prev.filter((item) => item !== photo));
      return;
    }
    const isLast = photos.length === 1;
    const confirmed = await confirmDelete({
      title: `ลบรูปผังแปลงรูปที่ ${photos.indexOf(photo) + 1}?`,
      text: isLast
        ? "รูปจะถูกลบทันทีและกู้คืนไม่ได้ ต้องมีรูปผังแปลงอย่างน้อย 1 รูป หลังลบให้เพิ่มรูปใหม่แล้วกดบันทึก"
        : "รูปจะถูกลบออกจากระบบทันที และกู้คืนไม่ได้",
    });
    if (!confirmed) return;
    const fileOnDocKos02Id = photo.id;
    try {
      showSaving("กำลังลบรูป");
      await DeleteFileOnDocKos02Service({ fileOnDocKos02Id });
      setPhotos((prev) => prev.filter((item) => item.id !== fileOnDocKos02Id));
      queryClient.invalidateQueries({ queryKey: ["docKos02"] });
      showSaved("ลบรูปแล้ว");
    } catch (error) {
      showError(error, "ลบรูปไม่สำเร็จ");
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ErrorSummary errors={form.errors} show={form.submitted} />
      <FormCard
        title={saved ? "แก้ไขผังแปลง" : "ผังแปลง"}
        description={saved ? undefined : "บันทึกผังแปลงก่อน ขั้นต่อไปจะเพิ่มแผนการปลูกของแต่ละแปลง"}
      >
        <TextField
          id="numberOfPlotForKosCertificated"
          label="หมายเลขแปลงที่ขอรับรอง"
          hint="ใส่หมายเลขแปลงให้ตรงกับในผัง ถ้ามีหลายแปลงให้คั่นด้วยจุลภาค เช่น 1, 2, 4"
          value={plots}
          onChange={setPlots}
          onBlur={() => form.touch("numberOfPlotForKosCertificated")}
          error={form.errors.numberOfPlotForKosCertificated}
          maxLength={255}
          autoComplete="off"
        />
        <PhotoPicker
          id="mapPhotos"
          label="รูปผังแปลง"
          hint="วาดผังด้วยมือบนกระดาษแล้วถ่ายรูปก็ได้ ในผังให้มีหมายเลขแปลง ทิศเหนือ แหล่งน้ำ และแปลงข้างเคียง ถ่ายในที่สว่างให้อ่านตัวหนังสือได้"
          photos={photos}
          onAdd={(added) => setPhotos((prev) => [...prev, ...added])}
          onRemove={handleRemove}
          error={form.errors.mapPhotos}
        />
      </FormCard>

      <FormCard
        title="หลังเก็บเกี่ยวและการตลาด"
        description="ไม่บังคับ แต่ช่วยให้ผู้ตรวจเข้าใจว่าผลผลิตอินทรีย์ของคุณไม่ปนกับผลผลิตทั่วไป"
      >
        <TextAreaField
          id="marketingDetail"
          label="เก็บเกี่ยวแล้วทำอย่างไรต่อ และขายที่ไหน"
          hint="เล่าสั้น ๆ เช่น ล้าง คัด บรรจุอย่างไร เก็บไว้ที่ไหน และขายให้ใคร"
          optional
          rows={5}
          maxLength={1000}
          value={marketing}
          onChange={setMarketing}
          onBlur={() => form.touch("marketingDetail")}
          error={form.errors.marketingDetail}
        />
        <ExampleDetails>
          เก็บผักตอนเช้า ล้างด้วยน้ำสะอาด คัดใบเหลืองออก มัดเป็นกำ ใส่ตะกร้าที่ใช้กับผักอินทรีย์เท่านั้น
          ไม่ปนกับผักทั่วไป นำไปขายที่ตลาดเกษตรอินทรีย์ในอำเภอทุกวันเสาร์ และส่งร้านอาหารใกล้บ้าน
        </ExampleDetails>
      </FormCard>

      <FormActions>
        {saved && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            ยกเลิก
          </button>
        )}
        <button type="submit" className="btn btn-primary sm:min-w-44" disabled={saving}>
          {saved ? (
            <>
              <LuSave aria-hidden="true" className="size-5" />
              บันทึก
            </>
          ) : (
            <>
              บันทึกและไปเพิ่มแผนการปลูก
              <LuArrowRight aria-hidden="true" className="size-5" />
            </>
          )}
        </button>
      </FormActions>
    </form>
  );
}

export default Kos2Form;
