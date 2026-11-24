"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

/** Membagi array sesuai halaman aktif dan menjamin halaman tetap dalam rentang sah. */
export function paginateItems<T>(
  items: T[],
  currentPage: number,
  pageSize: number,
) {
  const safeSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * safeSize;
  const pageItems = items.slice(startIndex, startIndex + safeSize);

  return { pageItems, totalItems, totalPages, safePage, startIndex };
}

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  suffixLabel?: string;
  className?: string;
}

/** Kontrol paginasi seragam untuk tabel & daftar card responsif. */
export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  suffixLabel,
  className = "",
}: TablePaginationProps) {
  const safeSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * safeSize;
  const endIndex = Math.min(startIndex + safeSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 text-xs sm:text-sm text-white/60 ${className}`}
    >
      <span>
        Showing{" "}
        <span className="font-semibold text-white">
          {totalItems === 0 ? 0 : `${startIndex + 1} - ${endIndex}`}
        </span>{" "}
        data out of <span className="font-semibold text-white">{totalItems}</span>
        {suffixLabel ? ` ${suffixLabel}` : ""}
      </span>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-xs">
            <span>Show</span>
            <select
              aria-label="Jumlah data per halaman"
              value={safeSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="cursor-pointer bg-white/[0.03] border border-white/15 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-white/40 [&>option]:bg-[#15161A]"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>data per page</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage <= 1}
            title="Previous page"
            aria-label="Previous page"
            className="border border-white/15 bg-white/[0.03] rounded-lg p-1.5 text-white/75 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/75 px-1 font-medium whitespace-nowrap tabular-nums">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage >= totalPages}
            title="Next page"
            aria-label="Next page"
            className="border border-white/15 bg-white/[0.03] rounded-lg p-1.5 text-white/75 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

