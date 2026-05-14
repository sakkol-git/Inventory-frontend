/* ═══════════════════════════════════════════════════════════════════════════
 * usePagination — Hook unit tests
 * ═══════════════════════════════════════════════════════════════════════════ */

import { usePagination } from "@/shared/components/Pagination";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const items = Array.from({ length: 55 }, (_, i) => ({ id: i + 1 }));

describe("usePagination", () => {
  it("returns the first page of items by default", () => {
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 10 }),
    );

    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0].id).toBe(1);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(6);
    expect(result.current.totalItems).toBe(55);
  });

  it("navigates to next page", () => {
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 10 }),
    );

    act(() => result.current.nextPage());

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0].id).toBe(11);
  });

  it("navigates to previous page", () => {
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 10 }),
    );

    act(() => result.current.goToPage(3));
    act(() => result.current.prevPage());

    expect(result.current.currentPage).toBe(2);
  });

  it("jumps to first and last page", () => {
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 10 }),
    );

    act(() => result.current.lastPage());
    expect(result.current.currentPage).toBe(6);
    expect(result.current.paginatedItems).toHaveLength(5); // 55 % 10 = 5

    act(() => result.current.firstPage());
    expect(result.current.currentPage).toBe(1);
  });

  it("clamps page when items shrink", () => {
    const { result, rerender } = renderHook(
      ({ data }) => usePagination(data, { defaultPageSize: 10 }),
      { initialProps: { data: items } },
    );

    act(() => result.current.goToPage(6));
    expect(result.current.currentPage).toBe(6);

    // Shrink items to 15 (2 pages) — current page should clamp
    rerender({ data: items.slice(0, 15) });
    expect(result.current.currentPage).toBe(2);
    expect(result.current.totalPages).toBe(2);
  });

  it("resets to page 1 when page size changes", () => {
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 10 }),
    );

    act(() => result.current.goToPage(3));
    act(() => result.current.changePageSize(20));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.paginatedItems).toHaveLength(20);
  });

  it("reports hasNextPage and hasPrevPage correctly", () => {
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 10 }),
    );

    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);

    act(() => result.current.lastPage());

    expect(result.current.hasPrevPage).toBe(true);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("handles empty items array", () => {
    const { result } = renderHook(() =>
      usePagination([], { defaultPageSize: 10 }),
    );

    expect(result.current.paginatedItems).toHaveLength(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("does not navigate beyond boundaries", () => {
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 10 }),
    );

    act(() => result.current.prevPage()); // Already on page 1
    expect(result.current.currentPage).toBe(1);

    act(() => result.current.goToPage(100)); // Beyond max
    expect(result.current.currentPage).toBe(6);
  });
});
