import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { Brand, SidebarNav } from "../sidebars/dashboardSidebar";

/** Phone / tablet top bar with a labelled menu button that opens the navigation drawer. */
function DashboardNavbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = openRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  // Close when navigation happens by any route (e.g. browser back).
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-third-color/40 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Brand />
        <button
          ref={openRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="btn btn-secondary btn-sm gap-1.5"
        >
          <LuMenu aria-hidden="true" className="size-6" />
          เมนู
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="เมนู" id="mobile-menu">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 bg-super-main-color/40 animate-in fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col gap-6 overflow-y-auto bg-white px-4 pb-6 pt-4 shadow-xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-bold">เมนู</span>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm gap-1.5">
                <LuX aria-hidden="true" className="size-6" />
                ปิด
              </button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardNavbar;
