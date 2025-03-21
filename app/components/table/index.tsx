import { A, Box, Table, Tbody, Tr, Th } from "@mercury-js/mess";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import React, { forwardRef, useMemo } from "react";
import { useTable, usePagination, useRowSelect,Column } from "react-table";
import _ from "lodash";

interface TableProps<T extends object> {
  data: T[];
  columns: Column<T>[] | undefined;
}

const DynamicTable = forwardRef<HTMLDivElement, TableProps<any>>(({ data, columns = [] }, ref) => {
  console.log("Columns:", columns);
  console.log("Data:", data);
  const tableColumns: Column<any>[] = useMemo(
    () => [
      {
        id: "select",
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
        ),
        Cell: ({ row }: any) => <input type="checkbox" {...row.getToggleRowSelectedProps()} />,
      },

      ...columns, // Spread the rest of the dynamic columns
    ],
    [columns]
  );
  

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    state: { pageIndex },
  } = useTable(
    {
      columns:tableColumns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination,
    useRowSelect
  );
  const renderPagination = () => {
    const totalPages = pageOptions.length;
    const visiblePages = 3;
    let displayedPages = [];
  
    if (totalPages <= visiblePages + 1) {
      displayedPages = pageOptions;
    } else if (pageIndex < visiblePages) {
      displayedPages = [...pageOptions.slice(0, visiblePages), "...", totalPages - 1];
    } else if (pageIndex >= totalPages - visiblePages) {
      displayedPages = [0, "...", ...pageOptions.slice(totalPages - visiblePages)];
    } else {
      displayedPages = [0, "...", ...pageOptions.slice(pageIndex - 1, pageIndex + 2), "...", totalPages - 1];
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
        onClick={() => typeof number === "number" && gotoPage(number)}
      >
        {number === "..." ? "..." : number + 1}
      </A>
    ));
  };
  
  return (
    <Box styles={{ base: {  width: "100%" } }} ref={ref}>
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
        <Table
          {...getTableProps()}
          styles={{ base: { minWidth: "calc(100vw - 280px)", borderCollapse: "collapse" } }}
        >
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
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th
                    {...column.getHeaderProps()}
                    styles={{
                      base: {
                        padding: "8px 16px",
                        textAlign: "left",
                        borderBottom: "1px solid #E5E7EB",
                      },
                    }}
                  >
                    {column.render("Header")}
                  </Th>
                ))}
              </Tr>
            ))}
          </Tbody>
          <Tbody
            {...getTableBodyProps()}
            styles={{ base: { backgroundColor: "#FFFFFF" } }}
          >
            {page.map((row) => {
              prepareRow(row);
              return (
                <Tr
                  {...row.getRowProps()}
                  styles={{
                    base: {
                      borderTop: "1px solid #E5E7EB",
                      ":hover": { backgroundColor: "#F9FAFB" },
                    },
                  }}
                >
                  {row.cells.map((cell) => (
                    <Th
                      as="td"
                      {...cell.getCellProps()}
                      styles={{
                        base: { padding: "8px 16px", fontSize: "12px" ,cursor:"pointer"},
                      }}
                    >
                      {cell.render("Cell")}
                    </Th>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
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
        <A onClick={previousPage} disabled={!canPreviousPage} styles={{base:{
          display:"flex",flexDirection:"row",alignItems:"center",fontSize:"12px",fontWeight:600,textAlign:"center",lineHeight:0,cursor:"pointer"
        }}}>
          <ChevronLeft size={12}  className="mt-[2px]"/> Previous
        </A>
        {/* {pageOptions.map((number, index) => (
          <A
            key={index}
            styles={{
              base: {
                color: "#000",
                padding: "2px 8px",
                border: pageIndex === number ? "1px solid #DDDDDD" : "none",
                borderRadius: "4px",
                fontSize:12,
                cursor:"pointer"
              },
            }}
            onClick={() => gotoPage(number)}
          >
            {number + 1}
          </A>
        ))} */}
        {renderPagination()}
        <A onClick={nextPage} disabled={!canNextPage} styles={{base:{
          display:"flex",flexDirection:"row",alignItems:"center",fontSize:"12px",fontWeight:600,textAlign:"center",lineHeight:0,cursor:"pointer"
        }}}>
          Next <ChevronRight size={12} className="mt-[2px]"/>
        </A>
      </Box>
    </Box>
  );

});

export default DynamicTable;
