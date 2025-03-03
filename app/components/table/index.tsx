import React, { useMemo } from "react";
import { useTable, usePagination, useRowSelect } from "react-table";

interface TableProps {
  data: any[];
}

const DynamicTable: React.FC<TableProps> = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        id: "select",
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <input type="checkbox" {...getToggleAllRowsSelectedProps()} className="rounded-full" />
        ),
        Cell: ({ row }: any) => (
          <input type="checkbox" {...row.getToggleRowSelectedProps()} className="rounded-full" />
        ),
      },
      ...Object.keys(data[0] || {}).map((key) => ({
        Header: key.replace(/([A-Z])/g, " $1").trim(),
        accessor: key,
      })),
    ],
    [data]
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
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination,
    useRowSelect
  );

  return (
    <div className="p-4 w-full">
      <div className="overflow-auto border border-gray-300 rounded-md w-full">
        <table {...getTableProps()} className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} className="px-4 py-2 text-left border-b">
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white">
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="border-t hover:bg-gray-50">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="px-4 py-2 text-sm">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={previousPage}
          disabled={!canPreviousPage}
        >
          Previous
        </button>
        <span className="text-sm font-semibold">Page {pageIndex + 1}</span>
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={nextPage}
          disabled={!canNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DynamicTable;
