import Page from "@/app/dashboard/page";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import { DASHBOARD_LIST } from "@/api";
import Loader from "@/components/loader/Loader";

const Home = () => {
  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${DASHBOARD_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  // Define columns for the table
  const columns = [
    {
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },

    {
      accessorKey: "purchase_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("purchase_date");
        return moment(date).format("DD-MMM-YYYY");
      },
    },
    {
      accessorKey: "purchase_buyer_name",
      header: " Buyer Name",
      cell: ({ row }) => <div>{row.getValue("purchase_buyer_name")}</div>,
    },
    {
      accessorKey: "purchase_ref_no",
      header: "Ref No",
      cell: ({ row }) => <div>{row.getValue("purchase_ref_no")}</div>,
    },
    {
      accessorKey: "purchase_vehicle_no",
      header: "Vehicle No",
      cell: ({ row }) => <div>{row.getValue("purchase_vehicle_no")}</div>,
    },

    {
      accessorKey: "purchase_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("purchase_status");

        return (
          <span
            className={`px-2 py-1 rounded text-xs ${status == "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
              }`}
          >
            {status}
          </span>
        );
      },
    },
  ];
  const salescolumns = [
    {
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },

    {
      accessorKey: "sales_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("sales_date");
        return moment(date).format("DD-MMM-YYYY");
      },
    },

    {
      accessorKey: "sales_buyer_name",
      header: " Buyer Name",
      cell: ({ row }) => <div>{row.getValue("sales_buyer_name")}</div>,
    },
    {
      accessorKey: "sales_ref_no",
      header: "Ref No",
      cell: ({ row }) => <div>{row.getValue("sales_ref_no")}</div>,
    },
    {
      accessorKey: "sales_vehicle_no",
      header: "Vehicle No",
      cell: ({ row }) => <div>{row.getValue("sales_vehicle_no")}</div>,
    },

    {
      accessorKey: "sales_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("sales_status");

        return (
          <span
            className={`px-2 py-1 rounded text-xs ${status == "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
              }`}
          >
            {status}
          </span>
        );
      },
    },
  ];
  // Create the table instance
  const table = useReactTable({
    data: dashboard?.purchase || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });
  const salestable = useReactTable({
    data: dashboard?.sales || [],
    columns: salescolumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });
  // Render loading state
  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Home
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <div className=" w-full p-0  md:p-4 sm:grid grid-cols-1">
        {/* tabs for mobile screen for purchase and summary  */}
        <>
          <Tabs defaultValue="purchase" className="sm:hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
            </TabsList>

            {/* Purchase Tab Content */}
            <TabsContent value="purchase">
              <Card className="shadow-sm  border-0">
                <CardHeader className="px-3 py-2 border-b">
                  <CardTitle className="text-lg font-semibold text-black">
                    Purchase Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {dashboard?.purchase?.length ? (
                    dashboard.purchase.map((item, index) => (
                      <div
                        key={index}
                        className="mb-2 rounded-lg bg-white border-l-4 border-r border-b border-t border-yellow-500 shadow-sm"
                      >
                        <div className="p-3">
                          {/* Header with buyer name and status */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-yellow-600"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </div>
                              <span className="font-medium text-sm text-gray-800 truncate max-w-[150px]">
                                {item.purchase_buyer_name}
                              </span>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 text-xs rounded-full ${item.purchase_status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {item.purchase_status}
                            </span>
                          </div>


                          <div className="flex flex-wrap justify-between  gap-1">
                            {item.purchase_ref_no && (
                              <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">

                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-600 mr-1"
                                >
                                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                </svg>
                                <span className="text-xs text-gray-700"><span className="text-[10px]">Ref No:</span>{item.purchase_ref_no}</span>
                              </div>
                            )}
                            {item.purchase_vehicle_no && (
                              <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-600 mr-1"
                                >
                                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                  <path d="M13 5v2" />
                                  <path d="M13 17v2" />
                                  <path d="M13 11v2" />
                                </svg>
                                <span className="text-xs text-gray-700"><span className="text-[10px]">Vehicle No:</span>{item.purchase_vehicle_no}</span>
                              </div>
                            )}
                            {item.purchase_date && (

                              <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-600 mr-1"
                                >
                                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span className="text-xs text-gray-700">
                                  {moment(item.purchase_date).format("DD-MMM-YY")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4 flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 mb-2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                      No purchase data available.
                    </div>
                  )}
                </CardContent>
              
              </Card>
            </TabsContent>

            {/* Dispatch Tab Content */}
            <TabsContent value="dispatch">
              <Card className="shadow-sm border-0">
                <CardHeader className="px-3 py-2 border-b">
                  <CardTitle className="text-lg font-semibold text-black">
                    Dispatch Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {dashboard?.sales?.length ? (
                    dashboard.sales.map((item, index) => (
                      <div
                        key={index}
                        className="mb-2 rounded-lg bg-white border-l-4 border-r border-b border-t border-blue-500 shadow-sm"
                      >
                        <div className="p-3">
                          {/* Header with buyer name and status */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-blue-600"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </div>
                              <span className="font-medium text-sm text-gray-800 truncate max-w-[150px]">
                                {item.sales_buyer_name}
                              </span>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 text-xs rounded-full ${item.sales_status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {item.sales_status}
                            </span>
                          </div>


                          <div className="flex flex-wrap justify-between gap-1">
                            {item.sales_ref_no && (
                              <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-600 mr-1"
                                >
                                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                </svg>
                                <span className="text-xs text-gray-700"><span className="text-[10px]">Ref No:</span>{item.sales_ref_no}</span>
                              </div>
                            )}
                            {item.sales_vehicle_no && (
                              <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-600 mr-1"
                                >
                                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                  <path d="M13 5v2" />
                                  <path d="M13 17v2" />
                                  <path d="M13 11v2" />
                                </svg>
                                <span className="text-xs text-gray-700"><span className="text-[10px]">Vehicle No:</span>{item.sales_vehicle_no}</span>
                              </div>
                            )}
                            {item.sales_date && (


                              <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-600 mr-1"
                                >
                                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span className="text-xs text-gray-700">
                                  {moment(item.sales_date).format("DD-MMM-YY")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4 flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 mb-2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                      No dispatch data available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </>

<>
        {/* median screen  */}
        <div className=" hidden sm:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow
                className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
              >
                <TableHead
                  colSpan={table.getHeaderGroups()[0]?.headers.length}
                  className="text-xl font-bold text-black"
                >
                  Purchase Summary
                </TableHead>
              </TableRow>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* ------------------------------sales table------------------------ */}
        <div className=" hidden sm:block rounded-md border my-4">
          <Table>
            <TableHeader>
              <TableRow
                className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
              >
                <TableHead
                  colSpan={salestable.getHeaderGroups()[0]?.headers.length}
                  className="text-xl font-bold text-black"
                >
                  Dispatch Summary
                </TableHead>
              </TableRow>
              {salestable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {salestable.getRowModel().rows?.length ? (
                salestable.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </>
      </div>
    </Page>
  );
};

export default Home;
