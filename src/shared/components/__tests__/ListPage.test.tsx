/* ═══════════════════════════════════════════════════════════════════════════
 * ListPage — Component render tests
 * ═══════════════════════════════════════════════════════════════════════════ */

import { ListPage } from "@/shared/components/ListPage";
import { renderWithProviders } from "@/test/test-utils";
import { screen } from "@testing-library/react";
import { Wrench } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

const defaultProps = {
  icon: Wrench,
  title: "Test Items",
  description: "A test list page",
  addLabel: "Add Item",
  onAdd: vi.fn(),
  stats: [{ label: "Total", value: 42, color: "primary" as const }],
  searchPlaceholder: "Search...",
  searchQuery: "",
  onSearchChange: vi.fn(),
  viewMode: "grid" as const,
  onViewModeChange: vi.fn(),
  items: [{ id: 1 }, { id: 2 }, { id: 3 }],
  emptyTitle: "Nothing here",
  emptyDescription: "Try something else.",
  renderGrid: (items: { id: number }[]) => (
    <div data-testid="grid">{items.length} items in grid</div>
  ),
  renderTable: (items: { id: number }[]) => (
    <div data-testid="table">{items.length} items in table</div>
  ),
};

function renderListPage(overrides = {}) {
  return renderWithProviders(<ListPage {...defaultProps} {...overrides} />);
}

describe("ListPage", () => {
  it("renders the page header", () => {
    renderListPage();

    expect(screen.getByText("Test Items")).toBeInTheDocument();
    expect(screen.getByText("A test list page")).toBeInTheDocument();
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("renders the grid view when viewMode is grid", () => {
    renderListPage({ viewMode: "grid" });

    expect(screen.getByTestId("grid")).toBeInTheDocument();
    expect(screen.queryByTestId("table")).not.toBeInTheDocument();
  });

  it("renders the table view when viewMode is list", () => {
    renderListPage({ viewMode: "list" });

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.queryByTestId("grid")).not.toBeInTheDocument();
  });

  it("shows empty state when items array is empty", () => {
    renderListPage({ items: [] });

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try something else.")).toBeInTheDocument();
    expect(screen.queryByTestId("grid")).not.toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    renderListPage({ isLoading: true });

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows error state when isError is true", () => {
    renderListPage({ isError: true });

    expect(
      screen.getByText("Failed to load data. Please try again."),
    ).toBeInTheDocument();
  });

  it("renders alert slot content", () => {
    renderListPage({
      alertSlot: <div data-testid="alert">Safety warning!</div>,
    });

    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("renders filter slot content", () => {
    renderListPage({
      filterSlot: (
        <select data-testid="filter">
          <option>All</option>
        </select>
      ),
    });

    expect(screen.getByTestId("filter")).toBeInTheDocument();
  });

  it("renders children (dialog slots)", () => {
    renderListPage({
      children: <div data-testid="dialog">Form dialog</div>,
    });

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });
});
