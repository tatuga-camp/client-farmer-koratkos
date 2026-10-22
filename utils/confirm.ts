import Swal from "sweetalert2";

type ApiError = { message?: string | string[]; statusCode?: number } | Error | undefined | null;

/**
 * Turns whatever a service threw into a sentence a farmer can act on.
 * Services rethrow `error.response.data`, which is undefined when the request never
 * reached the server (no signal), and Nest validation errors carry an array of messages.
 */
export function errorMessage(error: unknown) {
  const apiError = error as ApiError;
  if (!apiError || error instanceof TypeError) {
    return "เชื่อมต่อระบบไม่ได้ ตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง";
  }
  if ("statusCode" in apiError && apiError.statusCode === 401) {
    return "หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบใหม่";
  }
  const message = apiError.message;
  if (Array.isArray(message)) return message.join("\n");
  return message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

export function showSaving(title = "กำลังบันทึกข้อมูล") {
  Swal.fire({
    title,
    text: "กรุณารอสักครู่ อย่าปิดหน้านี้",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });
}

export function showSaved(title = "บันทึกข้อมูลเรียบร้อย", text?: string) {
  return Swal.fire({ icon: "success", title, text, timer: 1800, showConfirmButton: false });
}

export function showError(error: unknown, title = "บันทึกไม่สำเร็จ") {
  return Swal.fire({ icon: "error", title, text: errorMessage(error), confirmButtonText: "ตกลง" });
}

/** Red, cancel-focused confirmation. Resolves true only when the farmer confirms. */
export async function confirmDelete({ title, text, confirmText = "ลบ" }: { title: string; text?: string; confirmText?: string }) {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: text ?? "ลบแล้วจะกู้คืนไม่ได้",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#b91c1c",
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}
