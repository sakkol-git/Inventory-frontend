import React from "react";

export type ViewMode = "grid" | "table";

/**
 * Props for GridTableRenderer component
 */
export interface GridTableRendererProps<T> {
  /** Items to display */
  items: T[];

  /** Current view mode */
  viewMode: ViewMode;

  /** Whether to show empty state */
  isEmpty: boolean;

  /** Grid view component */
  GridComponent: React.ComponentType<any>;

  /** Table view component */
  TableComponent: React.ComponentType<any>;

  /** Props to pass to grid component */
  gridProps?: Record<string, any>;

  /** Props to pass to table component */
  tableProps?: Record<string, any>;

  /** Empty state view */
  emptyState: React.ReactNode;
}

/**
 * Unified component that handles view mode switching between grid and table views
 * Eliminates duplicate view-mode logic from page components
 *
 * @example
 * const Component = () => {
 *   const view = useChemicalsView();
 *   
 *   return (
 *     <GridTableRenderer
 *       items={view.filteredItems}
 *       viewMode={view.viewMode}
 *       isEmpty={view.isEmpty}
 *       GridComponent={ChemicalGrid}
 *       TableComponent={ChemicalTable}
 *       gridProps={{
 *         onNavigate: view.navigateToDetail,
 *         onEdit: view.openEditForm,
 *         onDelete: view.requestDeleteChemical,
 *       }}
 *       tableProps={{
 *         onNavigate: view.navigateToDetail,
 *         onEdit: view.openEditForm,
 *         onDelete: view.requestDeleteChemical,
 *       }}
 *       emptyState={
 *         <EmptyState
 *           icon={FlaskConical}
 *           title="No chemicals found"
 *         />
 *       }
 *     />
 *   );
 * };
 */
export function GridTableRenderer<T>(
  props: GridTableRendererProps<T>
): React.ReactElement {
  const {
    items,
    viewMode,
    isEmpty,
    GridComponent,
    TableComponent,
    gridProps = {},
    tableProps = {},
    emptyState,
  } = props;

  if (isEmpty) {
    return <>{emptyState}</>;
  }

  if (viewMode === "grid") {
    return <GridComponent items={items} {...gridProps} />;
  }

  return <TableComponent items={items} {...tableProps} />;
}
