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
import * as SwitchPrimitive from "@radix-ui/react-switch";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import CreateCategory from "./CreateCategory";
import { CATEGORY_LIST } from "@/api";
import Loader from "@/components/loader/Loader";

const CategoryList = () => {
  const {
    data: category,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${CATEGORY_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.category;
    },
  });

  // State for table management
  const { toast } = useToast();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [togglingId, setTogglingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const queryClient = useQueryClient();
  const handleToggle = async (categoryId, currentStatus) => {
    setTogglingId(categoryId);

    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      await handleSubmit({ categoryId, status: newStatus }); // API call

      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setTogglingId(null); // Hide loader after API response
    }
  };

  const handleSubmit = async ({ categoryId, status }) => {
    if (!status) {
      toast({
        title: "Error",
        description: "Status is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/categorys/${categoryId}`,
        { category_status: status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update buyer",
        variant: "destructive",
      });
    }
  };
  const columns = [
    {
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "category_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("category_status");

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
        const categoryId = row.original.id;
        const currentStatus = row.original.category_status;
        return (
          <SwitchPrimitive.Root
            checked={currentStatus === "Active"}
            onCheckedChange={() => handleToggle(categoryId, currentStatus)}
            disabled={togglingId === categoryId}
            title={currentStatus}
            className={`relative inline-flex items-center h-6 w-11 rounded-full
              ${currentStatus === "Active" ? "bg-green-500" : "bg-gray-400"} 
              ${togglingId == categoryId
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
              }
            `}
          >
            <SwitchPrimitive.Thumb
              className={`block w-4 h-4 bg-white rounded-full transform transition-transform
                ${currentStatus === "Active" ? "translate-x-6" : "translate-x-1"
                }
              `}
            />
          </SwitchPrimitive.Root>
        );
      },
    },
  ];

  const filteredCategories = category?.filter(item =>
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Create the table instance
  const table = useReactTable({
    data: category || [],
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
              Error Fetching Category
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
      <div className="w-full p-0 md:p-4">
        {/* for small screen  */}
        <div className="sm:hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl text-gray-800 font-medium">
              Category List
            </h1>
            <div >
              <CreateCategory />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search category..."
                value={searchQuery}
                onChange={(event) => {

                  setSearchQuery(event.target.value);


                }}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>


          </div>
          <div className="space-y-3">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((item, index) => (
                <div key={item.id} className="relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-3 flex justify-between items-center border-b border-gray-50">
                    <div className=" flex items-center space-x-2">
                      <div className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <h3 className="font-medium text-gray-800">

                        {item.category}

                      </h3>

                    </div>
                    <div className="flex items-center justify-between gap-5">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${item.category_status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {item.category_status}
                    </span>
                   

                      <SwitchPrimitive.Root
                        checked={item.category_status === "Active"}
                        onCheckedChange={() => handleToggle(item.id, item.category_status)}
                        disabled={togglingId === item.id}
                        className={`relative inline-flex items-center h-4 w-10 rounded
                   ${item.category_status === "Active" ? "bg-green-500" : "bg-gray-400"} 
                   ${togglingId === item.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                 `}
                      >
                        <SwitchPrimitive.Thumb
                          className={`block w-3 h-3 bg-black  rounded transform transition-transform
                     ${item.category_status === "Active" ? "translate-x-6" : "translate-x-1"}
                   `}
                        />
                      </SwitchPrimitive.Root>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-gray-500">
                No categories found.
              </div>
            )}
          </div>
        </div>
        {/* medium screen onwards  */}
        <div className="hidden sm:block">
          <div className="flex text-left text-2xl text-gray-800 font-[400]">
            Category List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search category..."
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

              <CreateCategory />
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
              Total Category  : &nbsp;
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

export default CategoryList;
