import { UseQueryResult } from "@tanstack/react-query";
import React, { ReactNode, useEffect } from "react";
import { LuChevronLeft, LuChevronRight, LuRefreshCw, LuWifiOff } from "react-icons/lu";
import { Pagination } from "../../model";
import { errorMessage } from "../../utils/confirm";
import { Skeleton } from "../ui";

/** Records per page for the KOS-04 / KOS-05 logbooks. */
export const LOG_PAGE_SIZE = 10;

/**
 * The API answers 400 "Invalid page number" for a page past the end, which includes
 * page 1 of a log with no records yet. Treat that as an empty page instead of an error.
 */
export async function fetchLogPage<T>(page: number, load: () => Promise<Pagination<T>>): Promise<Pagination<T>> {
  try {
    return await load();
  } catch (error) {
    const apiError = error as { statusCode?: number; message?: unknown } | undefined;
    if (apiError?.statusCode === 400 && apiError.message === "Invalid page number") {
      return { data: [], meta: { total: 0, lastPage: 0, currentPage: page, prev: page - 1, next: page } };
    }
    throw error;
  }
}

type LogPaginationProps = {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
};

/** Big "ก่อนหน้า" / "ถัดไป" buttons with "หน้า 1 จาก 3" between them. */
export function LogPagination({ page, lastPage, onChange }: LogPaginationProps) {
  if (lastPage <= 1) return null;
  const go = (next: number) => {
    onChange(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    // Phones: page count on its own row, two full-width buttons below; one row from sm.
    <nav aria-label="เปลี่ยนหน้า" className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between">
      <p aria-live="polite" className="col-span-2 text-center text-lg font-semibold tabular-nums sm:order-2">
        หน้า {page} จาก {lastPage}
      </p>
      <button type="button" className="btn btn-secondary whitespace-nowrap sm:order-1" disabled={page <= 1} onClick={() => go(page - 1)}>
        <LuChevronLeft aria-hidden="true" className="size-5" />
        ก่อนหน้า
      </button>
      <button type="button" className="btn btn-secondary whitespace-nowrap sm:order-3" disabled={page >= lastPage} onClick={() => go(page + 1)}>
        ถัดไป
        <LuChevronRight aria-hidden="true" className="size-5" />
      </button>
    </nav>
  );
}

type LogListProps<T extends { id: string }> = {
  query: UseQueryResult<Pagination<T>, Error>;
  page: number;
  onPageChange: (page: number) => void;
  /** Names the list for screen readers, e.g. "รายการปัจจัยการผลิต". */
  label: string;
  /** Shown when there are no records yet (an EmptyState with an add button). */
  empty: ReactNode;
  renderItem: (item: T) => ReactNode;
};

/** Loading, error, empty and paged states for a logbook of record cards. */
export function LogList<T extends { id: string }>({ query, page, onPageChange, label, empty, renderItem }: LogListProps<T>) {
  const items = query.data?.data;
  const isPlaceholder = query.isPlaceholderData;

  // Deleting the only record on the last page leaves that page empty: step back a page.
  // (Not while showing the previous page's data as a placeholder, or it would keep stepping.)
  useEffect(() => {
    if (items && items.length === 0 && page > 1 && !isPlaceholder) onPageChange(page - 1);
  }, [items, page, isPlaceholder, onPageChange]);

  if (query.isError) {
    return (
      <div role="alert" className="card flex flex-col items-center gap-3 px-5 py-10 text-center">
        <LuWifiOff aria-hidden="true" className="size-10 text-third-color" />
        <p className="text-xl font-bold">โหลดรายการไม่สำเร็จ</p>
        <p className="hint max-w-md">{errorMessage(query.error)}</p>
        <button type="button" onClick={() => query.refetch()} className="btn btn-primary mt-2">
          <LuRefreshCw aria-hidden="true" className="size-5" />
          ลองใหม่
        </button>
      </div>
    );
  }

  if (!items || (items.length === 0 && page > 1)) {
    return (
      <div aria-busy="true" className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return <>{empty}</>;

  return (
    <div className="flex flex-col gap-5">
      <ul aria-label={label} className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="flex">
            {renderItem(item)}
          </li>
        ))}
      </ul>
      <LogPagination page={page} lastPage={query.data?.meta.lastPage ?? 1} onChange={onPageChange} />
    </div>
  );
}
