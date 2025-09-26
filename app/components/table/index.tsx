import {
  A,
  Box,
  Table,
  Tbody,
  Tr,
  Th,
  Button,
  Select,
  Option,
} from "@mercury-js/mess";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React, { forwardRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { CustomSelect } from "../inputs";
import { useNavigate, useParams } from "react-router";

interface TableProps<T extends object> {
  data: T[];
  rowCount: number;
  columns: ColumnDef<T>[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
}

const DynamicTable = forwardRef<HTMLDivElement, TableProps<any>>(
  (
    { data, columns, rowCount, pagination, setPagination, sorting, setSorting },
    ref
  ) => {
    const table = useReactTable({
      data,
      columns,
      state: {
        pagination,
        sorting,
      },
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      enableSorting: true,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      manualPagination: true,
      manualSorting: true,
      rowCount,
      debugTable: true,
    });

    let navigate = useNavigate();
    let params = useParams();
const renderPagination = () => {
  const totalPages = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const visiblePages = 3;
  let displayedPages: any[] = [];

  if (totalPages <= visiblePages + 1) {
    displayedPages = Array.from({ length: totalPages }, (_, i) => i);
  } else if (pageIndex < visiblePages) {
    displayedPages = [
      ...Array.from({ length: visiblePages }, (_, i) => i),
      "...",
      totalPages - 1,
    ];
  } else if (pageIndex >= totalPages - visiblePages) {
    displayedPages = [
      0,
      "...",
      ...Array.from(
        { length: visiblePages },
        (_, i) => totalPages - visiblePages + i
      ),
    ];
  } else {
    displayedPages = [
      0,
      "...",
      pageIndex - 1,
      pageIndex,
      pageIndex + 1,
      "...",
      totalPages - 1,
    ];
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
      onClick={() =>
        typeof number === "number" && table.setPageIndex(number)
      }
    >
      {number === "..." ? "..." : (number as number) + 1}
    </A>
  ));
};

    useEffect(() => {
      console.log(columns, "columns ----- ");
    }, [columns]);

    return (
      <Box styles={{ base: { width: "100%" } }} ref={ref}>
        <Box
          styles={{
            base: {
              overflow: "auto",
              border:  "var(--table-border)",
              borderRadius: "var(--table-borderRadius)",
              width: "100%",
            },
          }}
        >
          <Table
            styles={{
              base: {
                minWidth: "var(--table-minWidth)",
      borderCollapse: "collapse",
              },
            }}
          >
            <Tbody
              as="thead"
              styles={{
                base: {
                  backgroundColor: "var(--table-header-backgroundColor)",
                  color: "var(--table-header-textColor)",
                  fontSize: "var(--table-header-fontSize)",
                  fontWeight: "var(--table-header-fontWeight)",
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
                          padding: "var(--table-header-padding)",
                          textAlign: "left",
                          borderBottom: "var(--table-header-borderBottom)",
                        },
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Tbody>
            <Tbody styles={{ base: { backgroundColor: "var(--table-row-backgroundColor)",
        color: "var(--table-row-textColor)", } }}>
              {table.getRowModel().rows.map((row) => (
                <Tr
                  key={row.id}
                  onClick={() => {
                    navigate(
                      `/dashboard/o/${params?.model}/r/${row.original.id}`
                    );
                  }}
                  styles={{
                    base: {
                      borderTop: "var(--table-row-borderTop)",
                      ":hover": { backgroundColor: "var(--table-row-hoverBg)" },
                    },
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Th
                      key={cell.id}
                      as="td"
                      styles={{
                        base: {
                           padding: "var(--table-row-padding)",
                fontSize: "var(--table-row-fontSize)",
                fontWeight: "var(--table-row-fontWeight)",
                color: "var(--table-row-textColor)",
                cursor: "pointer",
                        },
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Box
          styles={{
            base: {
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              gap: "8px",
              marginTop: "16px",
              flexWrap: "wrap",
            },
          }}
        >
          <A
            onClick={() => table.getCanPreviousPage() && table.firstPage()}
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
                cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
              },
            }}
          >
            <ChevronsLeft size={12} className="mt-[2px]" />
          </A>
          <A
            onClick={() => table.getCanPreviousPage() && table.previousPage()}
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
                cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
              },
            }}
          >
            <ChevronLeft size={12} className="mt-[2px]" /> Previous
          </A>
          {renderPagination()}
          <A
            onClick={() => table.getCanNextPage() && table.nextPage()}
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
                cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
              },
            }}
          >
            Next <ChevronRight size={12} className="mt-[2px]" />
          </A>
          <A
            onClick={() => table.getCanNextPage() && table.lastPage()}
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
                cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
              },
            }}
          >
            <ChevronsRight size={12} className="mt-[2px]" />
          </A>
          <CustomSelect
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            options={[
              { label: "Page 10", value: "10" },
              { label: "Page 20", value: "20" },
              { label: "Page 30", value: "30" },
              { label: "Page 40", value: "40" },
              { label: "Page 50", value: "50" },
            ]}
            addonstyles={{
              base: {
                width: "fit-content",
                fontSize: "12px",
                height: "28px",
              },
            }}
          ></CustomSelect>
          <Box className="flex items-center gap-1 text-[12px]">
            <Box>Page</Box>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount().toLocaleString()}
            </strong>
          </Box>
          <Box className="flex items-center gap-1 text-[12px]">
            | Go to page:
            <input
              type="number"
              min="1"
              max={table.getPageCount()}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border-1 border-[#E5E5E5] p-1  w-16 rounded-[10px]"
            />
          </Box>
        </Box>
      </Box>
    );
  }
);

export default DynamicTable;
