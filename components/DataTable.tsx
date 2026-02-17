"use client";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  pageSize = 10,
  headerActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!search) return data;

    const lowerSearch = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = String(row[col.key as keyof T] ?? "").toLowerCase();
        return value.includes(lowerSearch);
      }),
    );
  }, [search, data, columns]);

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
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-4 py-1 rounded w-64 text-sm"
        />
        {headerActions && <div>{headerActions}</div>}
      </div>
      {/* Table */}
      {/* <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.map((row) => (
            <TableRow key={String(row[keyField])}>
              {columns.map((col) => (
                <TableCell key={String(col.key)} className={col.className}>
                  {col.cell
                    ? col.cell(row)
                    : String(row[col.key as keyof T] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table> */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
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

          {/* Fill empty rows to make table always 10 rows tall */}
          {Array.from({ length: 10 - paginatedData.length }).map((_, i) => (
            <TableRow key={`empty-${i}`} className="h-12">
              {columns.map((col, j) => (
                <TableCell key={j}>&nbsp;</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-3 flex justify-end items-center space-x-2 text-sm">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          <MdKeyboardDoubleArrowLeft />
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          <MdKeyboardArrowLeft />
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-1 border rounded ${
              page === currentPage
                ? "bg-primary text-white border-primary"
                : "hover:bg-muted"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          <MdKeyboardArrowRight />
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          <MdKeyboardDoubleArrowRight />
        </button>
      </div>
    </div>
  );
}
