"use client";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { X } from "lucide-react";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { inventoryStatusConfig } from "@/app/dashboard/utils";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig = {
  key: string;
  label: string;
  options: FilterOption[];
};
export type Column<T> = {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  pageSize?: number;
  headerActions?: React.ReactNode;
  filters?: FilterConfig[];
  defaultSearch?: string;
  highlightId?: string;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  pageSize = 10,
  headerActions,
  filters = [],
  defaultSearch = "",
  highlightId = "",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [idFilter, setIdFilter] = useState(defaultSearch);

  const [currentPage, setCurrentPage] = useState(1);

  //
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  ); // 👈 new
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filteredData = useMemo(() => {
    let result = data;
    if (idFilter) {
      result = result.filter((row) => String(row["id"] ?? "") === idFilter);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = String(row[col.key as keyof T] ?? "").toLowerCase();
          return value.includes(lowerSearch);
        }),
      );
    }

    // Apply active filters 👈
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => String(row[key] ?? "") === value);
      }
    });

    return result;
  }, [search, data, columns, activeFilters, idFilter]);
  // Filtered data based on search
  // const filteredData = useMemo(() => {
  //   if (!search) return data;

  //   const lowerSearch = search.toLowerCase();
  //   return data.filter((row) =>
  //     columns.some((col) => {
  //       const value = String(row[col.key as keyof T] ?? "").toLowerCase();
  //       return value.includes(lowerSearch);
  //     }),
  //   );
  // }, [search, data, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  const goToPage = (page: number) =>
    setCurrentPage(Math.min(Math.max(1, page), totalPages));

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
              setIdFilter("");
            }}
            className="border px-4 py-1 rounded w-64 text-sm"
          />
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <button
                onClick={() =>
                  setOpenFilter(openFilter === filter.key ? null : filter.key)
                }
                className={`border px-3 py-1 rounded text-sm flex items-center gap-2 cursor-pointer ${
                  activeFilters[filter.key] ? "border-primary text-primary" : ""
                }`}
              >
                {filter.label}
                {activeFilters[filter.key] && (
                  <Badge
                    className={cn(
                      "flex items-center gap-1",
                      filter.key === "status" && activeFilters[filter.key]
                        ? inventoryStatusConfig[
                            activeFilters[
                              filter.key
                            ] as keyof typeof inventoryStatusConfig
                          ]?.className
                        : "bg-black text-white",
                    )}
                  >
                    {
                      filter.options.find(
                        (o) => o.value === activeFilters[filter.key],
                      )?.label
                    }
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFilters((prev) => ({
                          ...prev,
                          [filter.key]: "",
                        }));
                        setOpenFilter(null);
                      }}
                      className="hover:opacity-70 cursor-pointer"
                    >
                      <X className="size-4" />
                    </span>
                  </Badge>
                )}
                ▾
              </button>

              {openFilter === filter.key && (
                <div className="absolute z-10 top-full mt-1 bg-white border rounded shadow-md min-w-36 text-sm">
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-muted text-muted-foreground"
                    onClick={() => {
                      setActiveFilters((prev) => ({
                        ...prev,
                        [filter.key]: "",
                      }));
                      setOpenFilter(null);
                    }}
                  >
                    All
                  </button>
                  {filter.options.map((opt) => (
                    <button
                      key={opt.value}
                      className={`w-full text-left px-3 py-2 hover:bg-muted ${
                        activeFilters[filter.key] === opt.value
                          ? "font-semibold text-primary"
                          : ""
                      }`}
                      onClick={() => {
                        setActiveFilters((prev) => ({
                          ...prev,
                          [filter.key]: opt.value,
                        }));
                        setCurrentPage(1);
                        setOpenFilter(null);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {headerActions && <div>{headerActions}</div>}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="h-[480px] flex items-center justify-center text-sm text-muted-foreground">
                  No data available.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {paginatedData.map((row) => (
                <TableRow key={String(row[keyField])} className="h-10">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {col.cell
                        ? col.cell(row)
                        : String(row[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {Array.from({ length: 11 - paginatedData.length }).map((_, i) => (
                <TableRow key={`empty-${i}`} className="h-12">
                  {columns.map((col, j) => (
                    <TableCell key={j}>&nbsp;</TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}

      <div className="mt-3 flex justify-end items-center space-x-2 text-sm">
        <span className="px-2 text-muted-foreground">
          Page {currentPage} of {totalPages || 1}
        </span>

        <div className="flex">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded-l-md disabled:opacity-50"
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border  disabled:opacity-50"
          >
            <MdKeyboardArrowLeft />
          </button>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border  disabled:opacity-50"
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded-r-md disabled:opacity-50"
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
