import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BASE_URL from "@/config/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, ChevronDown, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ButtonConfig } from "@/config/ButtonConfig";
import CreateItem from "./CreateItem";
import EditItem from "./EditItem";
import { ITEM_LIST } from "@/api";
import Loader from "@/components/loader/Loader";

const ItemList = () => {
  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["item"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${ITEM_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.items;
    },
  });

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Define columns for the table
  const columns = [
    {
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    // {
    //   accessorKey: "item_category",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Category
    //       <ArrowUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => <div>{row.getValue("item_category")}</div>,
    // },
    {
      accessorKey: "item_category",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("item_category")}</div>,
    },
    {
      accessorKey: "item_name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("item_name")}</div>,
    },
    {
      accessorKey: "item_size",
      header: "Size",
      cell: ({ row }) => <div>{row.getValue("item_size")}</div>,
    },
    {
      accessorKey: "item_brand",
      header: "Brand",
      cell: ({ row }) => <div>{row.getValue("item_brand")}</div>,
    },
    {
      accessorKey: "item_weight",
      header: "Weight",
      cell: ({ row }) => <div>{row.getValue("item_weight")}</div>,
    },

    {
      accessorKey: "item_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("item_status");

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
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const ItemId = row.original.id;

        return (
          <div className="flex flex-row">
            <EditItem ItemId={ItemId} />
          </div>
        );
      },
    },
  ];


  const filteredItems = item?.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];


  // Create the table instance
  const table = useReactTable({
    data: item || [],
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
        pageSize: 10,
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
              Error Fetching Item
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
      <div className="w-full p-0 md:p-4 grid grid-cols-1">

        <div className="sm:hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl text-gray-800 font-medium">
              Item List
            </h1>
            <div>
              <CreateItem />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search item..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative bg-white rounded-lg shadow-sm border-l-4 border-r border-b border-t border-yellow-500 overflow-hidden"
                >
                  <div className="p-2 flex flex-col gap-2">
                    {/* Sl No and Item Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-gray-800">
                          {item.item_name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${item.item_status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {item.item_status}
                        </span>

                        <EditItem ItemId={item.id} />
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      {/* Category */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {item.item_category}
                        </span>
                      </div>

                      {/* Size */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Size:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {item.item_size}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      {/* Brand */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Brand:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {item.item_brand}
                        </span>
                      </div>

                      {/* Weight */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Weight:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {item.item_weight}
                        </span>
                      </div>
                    </div>
                    {/* Action */}

                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-gray-500">
                No items found.
              </div>
            )}
          </div>
        </div>


        <div className="hidden sm:block">
          <div className="flex text-left text-2xl text-gray-800 font-[400]">
            Item List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search item..."
                value={table.getState().globalFilter || ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>

            {/* Dropdown Menu & Sales Button */}
            <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <CreateItem />
            </div>
          </div>
          {/* table  */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
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
          {/* row slection and pagintaion button  */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total Item : &nbsp;
              {table.getFilteredRowModel().rows.length}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ItemList;
