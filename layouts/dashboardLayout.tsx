import type { ReactNode } from "react";
import { LuRefreshCw, LuWifiOff } from "react-icons/lu";
import DashboardNavbar from "../components/navbars/dashboardNavbar";
import DashboardSidebar from "../components/sidebars/dashboardSidebar";
import { Skeleton } from "../components/ui";
import { useFarmer } from "../utils/useFarmer";

type LayoutProps = {
  children: ReactNode;
};

/**
 * Signed-in shell: sidebar on desktop, top bar + menu drawer on phones.
 * It loads the farmer itself (redirecting to sign-in when needed), so pages
 * only render once the farmer is known.
 */
function DashboardLayout({ children }: LayoutProps) {
  const farmer = useFarmer();
  const status = (farmer.error as { statusCode?: number } | null)?.statusCode;
  const failed = farmer.isError && status !== 401 && status !== 403;

  return (
    <div className="flex min-h-screen bg-fourth-color font-Anuphan text-super-main-color">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 lg:px-10 lg:pt-10">
          {farmer.data ? (
            children
          ) : failed ? (
            <div className="card mx-auto mt-10 flex max-w-md flex-col items-center gap-3 px-6 py-10 text-center">
              <LuWifiOff aria-hidden="true" className="size-10 text-third-color" />
              <h1 className="text-xl font-bold">โหลดข้อมูลไม่สำเร็จ</h1>
              <p className="hint">ตรวจสอบสัญญาณอินเทอร์เน็ต แล้วกดลองใหม่</p>
              <button type="button" onClick={() => farmer.refetch()} className="btn btn-primary mt-2">
                <LuRefreshCw aria-hidden="true" className="size-5" />
                ลองใหม่
              </button>
            </div>
          ) : (
            <div aria-busy="true" className="flex flex-col gap-4">
              <p className="sr-only" role="status">
                กำลังโหลด
              </p>
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
