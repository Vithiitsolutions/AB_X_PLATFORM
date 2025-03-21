import { A, Box, Table, Tbody, Tr, Th, Button } from "@mercury-js/mess";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { forwardRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";

interface TableProps<T extends object> {
  data: T[];
  rowCount: number;
  columns: ColumnDef<T>[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
}

const DynamicTable = forwardRef<HTMLDivElement, TableProps<any>>(({ data, columns = [], rowCount, pagination, setPagination }, ref) => {
  

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount,
    debugTable: true
  });

  const renderPagination = () => {
    const totalPages = table.getPageCount();
    const pageIndex = table.getState().pagination.pageIndex;
    const visiblePages = 3;
    let displayedPages = [];

    if (totalPages <= visiblePages + 1) {
      displayedPages = Array.from({ length: totalPages }, (_, i) => i);
    } else if (pageIndex < visiblePages) {
      displayedPages = [...Array.from({ length: visiblePages }, (_, i) => i), "...", totalPages - 1];
    } else if (pageIndex >= totalPages - visiblePages) {
      displayedPages = [0, "...", ...Array.from({ length: visiblePages }, (_, i) => totalPages - visiblePages + i)];
    } else {
      displayedPages = [0, "...", pageIndex - 1, pageIndex, pageIndex + 1, "...", totalPages - 1];
    }

    return displayedPages.map((number, index) => (
      <A
        key={index}
        styles={{
          base: {
            color: "#000",
            padding: "2px 8px",
            border: pageIndex === number ? "1px solid #DDDDDD" : "none",
            borderRadius: "4px",
            fontSize: 12,
            cursor: "pointer",
            opacity: number === "..." ? 0.5 : 1,
          },
        }}
        onClick={() => typeof number === "number" && table.setPageIndex(number)}
      >
        {number === "..." ? "..." : (number as number) + 1}
      </A>
    ));
  };

  return (
    <Box styles={{ base: { width: "100%" } }} ref={ref}>
      <Box
        styles={{
          base: {
            overflow: "auto",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            width: "100%",
          },
        }}
      >
        <Table styles={{ base: { minWidth: "calc(100vw - 240px)", borderCollapse: "collapse" } }}>
          <Tbody
            as="thead"
            styles={{
              base: {
                backgroundColor: "#F2F2F2",
                color: "#656565",
                fontSize: "12px",
                fontWeight: "600",
              },
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    styles={{
                      base: {
                        padding: "8px 16px",
                        textAlign: "left",
                        borderBottom: "1px solid #E5E7EB",
                      },
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Th>
                ))}
              </Tr>
            ))}
          </Tbody>
          <Tbody styles={{ base: { backgroundColor: "#FFFFFF" } }}>
            {table.getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                styles={{
                  base: {
                    borderTop: "1px solid #E5E7EB",
                    ":hover": { backgroundColor: "#F9FAFB" },
                  },
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Th
                    key={cell.id}
                    as="td"
                    styles={{
                      base: { padding: "8px 16px", fontSize: "12px", cursor: "pointer" },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Th>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box className="flex items-center gap-2">
        <Button
          className="border rounded p-1"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </Button>
        <Button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </Button>
        <Button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </Button>
        <Button
          className="border rounded p-1"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </Button>
        <span className="flex items-center gap-1">
          <Box>Page</Box>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount().toLocaleString()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            min="1"
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </Box>
      <Box
        styles={{
          base: {
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            gap: "8px",
            marginTop: "16px",
          },
        }}
      >
        <A
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          styles={{
            base: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 0,
              cursor: "pointer",
            },
          }}
        >
          <ChevronLeft size={12} className="mt-[2px]" /> Previous
        </A>
        {renderPagination()}
        <A
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          styles={{
            base: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 0,
              cursor: "pointer",
            },
          }}
        >
          Next <ChevronRight size={12} className="mt-[2px]" />
        </A>
      </Box>
    </Box>
  );
});

export default DynamicTable;
