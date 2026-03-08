import { Column } from "@/components/DataTable";
import * as XLSX from "xlsx";

export function downloadExcel<T>(
  data: T[],
  columns: Column<T>[],
  filename: string,
) {
  const exportColumns = columns.filter((col) => col.header && col.exportValue);

  const formatted = data.map((row) =>
    Object.fromEntries(
      exportColumns.map((col) => [col.header, col.exportValue!(row)]),
    ),
  );

  const worksheet = XLSX.utils.json_to_sheet(formatted);

  // auto column width based on content
  const colWidths = exportColumns.map((col) => {
    const headerLen = col.header.length;
    const maxDataLen = Math.max(
      ...data.map((row) => {
        const val = col.exportValue!(row);
        return val ? String(val).length : 0;
      }),
    );
    return { wch: Math.max(headerLen, maxDataLen) + 2 }; // +2 padding
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
