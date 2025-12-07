/* eslint-disable @typescript-eslint/no-explicit-any */
import * as LucidIcons from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { useApp } from "../hooks/useApp";
import { hasPermission } from "../lib/authorization";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  isAction?: boolean;
  className?: string;
  type?: string;
  permission?: string;
  isArabic?: boolean;
  render?: (value: any, row: TableRow) => React.ReactNode;
}

interface ActionColumn {
  key: string;
  label: string;
  icon: keyof typeof LucidIcons;
  route: string;
  className?: string;
  tooltip?: string;
  permission: string;
}

interface TableRow {
  [key: string]: any;
}

interface CustomTableProps {
  columns: TableColumn[];
  actions: ActionColumn[];
  data: TableRow[];
  onDelete: (id: number) => void;
  onView?: (row: TableRow) => void;
  onEdit?: (row: TableRow) => void;
  onAssign?: (row: TableRow) => void;
  isModel: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (column: string) => void;
  onStatusToggle?: (id: number, status: boolean) => void;
  enableSelection?: boolean;
  selectedRows?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

const CustomTable = ({
  columns,
  actions,
  data,
  onDelete,
  onView,
  onEdit,
  onAssign,
  isModel,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  sortBy,
  sortDir,
  onSortChange,
  onStatusToggle,
  enableSelection = false,
  selectedRows = [],
  onSelectionChange = () => {},
}: CustomTableProps) => {
  const { user } = useApp();
  const userPermissions = user?.permissions ?? [];

  // ✅ Filter columns based on optional "permission" property
  const visibleColumns = columns.filter((col) =>
    col.permission ? hasPermission(col.permission, userPermissions) : true
  );

  // For print view: remove switch/action columns too
  const printColumns = visibleColumns.filter(
    (col) => !col.isAction && col.type !== "switch"
  );

  const displayColumns = visibleColumns;

  const handlePageSizeChange = (newPageSize: string) => {
    onPageSizeChange(Number(newPageSize));
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const handleSortClick = (column: TableColumn) => {
    if (!column.sortable || !onSortChange) return;
    onSortChange(column.key);
  };

  // Handle individual row selection
  const handleRowSelect = (rowId: number, checked: boolean) => {
    let newSelection = [...selectedRows];
    if (checked) {
      if (!newSelection.includes(rowId)) {
        newSelection.push(rowId);
      }
    } else {
      newSelection = newSelection.filter((id) => id !== rowId);
    }
    onSelectionChange(newSelection);
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map((row) => row.id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  // Check if all rows are selected
  const isAllSelected =
    data.length > 0 && data.every((row) => selectedRows.includes(row.id));
  const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

  const renderActionButtons = (row: TableRow) => (
    <div className="flex items-center space-x-2 justify-center print:hidden">
      {actions.map((action) => {
        const IconComponent = LucidIcons[action.icon] as React.ElementType;
        const isAllowed = hasPermission(
          action.permission,
          user?.permissions ?? []
        );
        if (!isAllowed) return null;

        if (isModel) {
          if (action.label === "View") {
            return (
              <Button
                id={action.key}
                label={action.label}
                type="button"
                variant="default"
                key={`${action.key}-${row.id}`}
                className={action.className}
                onClick={() => onView?.(row)}
                title={action.tooltip}
              >
                <IconComponent />
              </Button>
            );
          }
          if (action.label === "Edit") {
            return (
              <Button
                id={action.key}
                label={action.label}
                type="button"
                variant="default"
                key={`${action.key}-${row.id}`}
                className={action.className}
                onClick={() => onEdit?.(row)}
                title={action.tooltip}
              >
                <IconComponent />
              </Button>
            );
          }
          if (action.label === "Assign") {
            return (
              <Button
                id={action.key}
                label={action.label}
                type="button"
                variant="default"
                key={`${action.key}-${row.id}`}
                className={action.className}
                onClick={() => onAssign?.(row)}
                title={action.tooltip}
              >
                <IconComponent />
              </Button>
            );
          }
        }

        if (action.label === "Delete") {
          return (
            <Button
              id={action.key}
              label={action.label}
              type="button"
              variant="default"
              key={`${action.key}-${row.id}`}
              className={action.className}
              onClick={() => onDelete(row.id)}
              title={action.tooltip}
            >
              <IconComponent />
            </Button>
          );
        }

        return (
          <Link
            key={`${action.key}-${row.id}`}
            title={action.tooltip}
            to={`${action.route}/${row.id}`}
          >
            <IconComponent className={action.className} />
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm print:border-0 print:shadow-none">
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500 print:hidden">
          <div className="text-blue-400 mb-2">
            <LucidIcons.Search className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <p className="text-lg font-medium">No data found</p>
          <p className="text-sm">There are no records to display</p>
        </div>
      ) : (
        <>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl print:bg-gray-800 print:shadow-none">
                {/* Checkbox column header */}
                {enableSelection && (
                  <th className="px-4 py-3 text-sm font-medium text-white print:hidden">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                        ref={(el) => {
                          if (el) {
                            (el as HTMLInputElement).indeterminate =
                              isIndeterminate;
                          }
                        }}
                      />
                    </div>
                  </th>
                )}

                {/* Show all columns on screen, filtered columns on print */}
                {(typeof window !== "undefined" &&
                window.matchMedia("print").matches
                  ? printColumns
                  : displayColumns
                ).map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-sm font-medium text-white cursor-pointer transition-all duration-200 print:cursor-default print:bg-gray-800 ${
                      column.sortable &&
                      typeof window !== "undefined" &&
                      !window.matchMedia("print").matches
                        ? "hover:bg-blue-500"
                        : ""
                    } ${column.className || ""} ${
                      column.isAction ? "print:hidden" : ""
                    } ${column.type === "switch" ? "print:hidden" : ""}`}
                    onClick={() =>
                      typeof window !== "undefined" &&
                      !window.matchMedia("print").matches &&
                      handleSortClick(column)
                    }
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{column.label}</span>
                      {/* Sort Icon - only if column is sortable and not printing */}
                      {column.sortable &&
                        typeof window !== "undefined" &&
                        !window.matchMedia("print").matches && (
                          <>
                            {sortBy === column.key && sortDir === "asc" && (
                              <LucidIcons.ArrowUpAZ className="w-4 h-4 text-white" />
                            )}
                            {sortBy === column.key && sortDir === "desc" && (
                              <LucidIcons.ArrowDownZA className="w-4 h-4 text-white" />
                            )}
                            {sortBy !== column.key && (
                              <LucidIcons.ArrowUpDown className="w-4 h-4 text-white" />
                            )}
                          </>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 print:divide-gray-200">
              {data.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors duration-150 print:hover:bg-transparent print:border-b print:border-gray-300"
                >
                  {/* Checkbox column */}
                  {enableSelection && (
                    <td className="px-4 py-2 text-center print:hidden">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onCheckedChange={(checked) =>
                          handleRowSelect(row.id, checked as boolean)
                        }
                        className="bg-white border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </td>
                  )}

                  {displayColumns.map((column) => (
                    <td
                      key={column.key}
                      dir={column.isArabic ? "rtl" : "ltr"}
                      className={`px-6 py-2 text-sm text-gray-700 text-center print:px-2 print:py-1 print:text-xs ${
                        column.className
                      } ${column.isAction ? "print:hidden" : ""} ${
                        column.type === "switch" ? "print:hidden" : ""
                      }`}
                    >
                      {column.isAction ? (
                        renderActionButtons(row)
                      ) : column.type === "switch" ? (
                        <div className="print:hidden">
                          <Switch
                            checked={
                              row.status === "active" || row.required === "yes"
                            }
                            onCheckedChange={(checked) =>
                              onStatusToggle?.(row.id, checked)
                            }
                            className={`h-4 w-10 ${
                              row.status === "active" || row.required === "yes"
                                ? "bg-green-500 data-[state=checked]:bg-green-600"
                                : "bg-red-500 data-[state=unchecked]:bg-red-600"
                            } border border-gray-300 transition-colors rounded-full shadow-inner`}
                          />
                        </div>
                      ) : column.type === "multi-values" ? (
                        <div className="flex flex-wrap justify-center items-center gap-1">
                          {row[column.key].map(
                            (permission: any, index: any) => {
                              const permId =
                                permission.id ??
                                permission.name ??
                                permission.label ??
                                index;
                              return (
                                <Badge
                                  key={`${row.id}-${permId}`}
                                  variant="destructive"
                                  className="print:bg-gray-200 print:text-gray-800 print:border print:border-gray-400"
                                >
                                  {permission.label}
                                </Badge>
                              );
                            }
                          )}
                        </div>
                      ) : column.render ? (
                        column.render(row[column.key], row)
                      ) : Array.isArray(row[column.key]) ? (
                        <div className="flex flex-wrap justify-center items-center gap-1">
                          {row[column.key].map((permission: any) =>
                            permission.label ? permission.label : ""
                          )}
                        </div>
                      ) : (
                        String(row[column.key] ? row[column.key] : "")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls - Hidden in print */}
          <div className="px-6 py-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 print:hidden">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20 h-8 border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  id="first-page"
                  label=""
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <LucidIcons.ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  id="prev-page"
                  label=""
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <LucidIcons.ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Dynamic Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      id={`page-${pageNum}`}
                      label=""
                      type="button"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  id="next-page"
                  label=""
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <LucidIcons.ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  id="last-page"
                  label=""
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <LucidIcons.ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomTable;
