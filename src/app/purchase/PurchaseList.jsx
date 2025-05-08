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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { ChevronDown, Edit, Search, SquarePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchPurchaseById,
  navigateToPurchaseEdit,
  PURCHASE_LIST,
} from "@/api";
import Loader from "@/components/loader/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import StatusToggle from "@/components/toggle/StatusToggle";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import { RiWhatsappFill } from "react-icons/ri";
import { encryptId } from "@/components/common/Encryption";

const PurchaseList = () => {
  const {
    data: purchase,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchase"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${PURCHASE_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.purchase;
    },
  });

  // State for table management
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const UserId = localStorage.getItem("userType");
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/purchases/${deleteItemId}`
      );
      const data = response.data;

      if (data.code === 200) {
        toast({
          title: "Success",
          description: data.msg,
        });
        refetch();
      } else if (data.code === 400) {
        toast({
          title: "Duplicate Entry",
          description: data.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: data.msg || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description:
          error?.response?.data?.msg ||
          error.message ||
          "Something unexpected happened.",
        variant: "destructive",
      });
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleFetchPurchaseById = async (purchaseId) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["purchaseByid", purchaseId],
        queryFn: () => fetchPurchaseById(purchaseId),
      });

      console.log("Purchase Data:", data);

      if (data?.purchase && data?.purchaseSub) {
        handleSendWhatsApp(data.purchase, data.purchaseSub);
      } else {
        console.error("Incomplete data received");
      }
    } catch (error) {
      console.error("Failed to fetch purchase data or send WhatsApp:", error);
    }
  };
  const handleSendWhatsApp = (purchase, purchaseSub) => {
    const {
      purchase_ref_no,
      purchase_date,
      purchase_buyer_name,
      purchase_buyer_city,
      purchase_vehicle_no,
    } = purchase;

    const itemLine = purchaseSub.map((item) => {
      const size = item.purchase_sub_size.padEnd(10, " ");
      const box = item.purchase_sub_box.toString().padStart(4, " ");
      return `${size} ${box}`;
    });

    const itemLines = purchaseSub.map((item) => {
      const name = item.purchase_sub_item.padEnd(25, " ");
      const qty = `(${item.purchase_sub_category.replace(/\D/g, "")})`.padStart(
        6,
        " "
      );
      return `${name}${qty}`;
    });

    const totalQty = purchaseSub.reduce((sum, item) => {
      const qty =
        parseInt(item.purchase_sub_category.replace(/\D/g, ""), 10) || 0;
      return sum + qty;
    }, 0);

    const message = `=== PackList ===
  No.        : ${purchase_ref_no}
  Date       : ${moment(purchase_date).format("DD-MM-YYYY")}
  Party      : ${purchase_buyer_name}
  City       : ${purchase_buyer_city}
  VEHICLE NO : ${purchase_vehicle_no}
  ===============================
  Product    [SIZE]   (QTY)
  ===============================
${itemLine.map((line) => "  " + line).join("\n")}
  ===============================
${itemLines.map((line) => "  " + line).join("\n")}
  ===============================
  Total QTY: ${totalQty}
  ===============================`;

    const phoneNumber = "919680053300";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    // const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    // window.open(whatsappUrl, "_blank");
  };

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
        const statusId = row.original.id;
        return (
          <StatusToggle
            initialStatus={status}
            teamId={statusId}
            onStatusChange={() => {
              refetch();
            }}
          />
        );
      },
    },

    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const purchaseId = row.original.id;
        return (
          <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigateToPurchaseEdit(navigate, purchaseId);
                    }}
                  >
                    <Edit />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Purchase</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {UserId != 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteRow(purchaseId)}
                      className="text-red-500"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Purchase</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleFetchPurchaseById(encryptId(purchaseId))
                    }
                    className="text-green-500"
                    type="button"
                  >
                    <RiWhatsappFill className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Whatsapp Purchase</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];
  const filteredItems =
    purchase?.filter((item) =>
      item.purchase_buyer_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Create the table instance
  const table = useReactTable({
    data: purchase || [],
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
              Error Fetching purchase
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
              Purchase List
            </h1>
            <div>
              <Button
                variant="default"
                className={`md:ml-2 bg-yellow-400 hover:bg-yellow-600 text-black rounded-l-full`}
                onClick={() => {
                  navigate("/purchase/create");
                }}
              >
                <SquarePlus className="h-4 w-4 " /> Purchase
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search purchase..."
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
                        <div className="bg-gray-100 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-sm text-gray-800">
                          {item.purchase_buyer_name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between gap-2 ">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.purchase_status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <StatusToggle
                            initialStatus={item.purchase_status}
                            teamId={item.id}
                            onStatusChange={() => {
                              refetch();
                            }}
                          />
                        </span>
                        <button
                          variant="ghost"
                          className={`px-2 py-1 bg-yellow-400 hover:bg-yellow-600 rounded-lg text-black text-xs`}
                          onClick={() => {
                            navigateToPurchaseEdit(navigate, item.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {UserId != 1 && (
                          <button
                            variant="ghost"
                            // className={`px-2 py-1 bg-yellow-400 hover:bg-yellow-600 rounded-lg text-black text-xs`}
                            onClick={() => handleDeleteRow(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                        {/* <EditItem ItemId={} /> */}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between gap-1">
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
                          <span className="text-xs text-gray-700">
                            <span className="text-[10px]">Ref No:</span>
                            {item.purchase_ref_no}
                          </span>
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
                          <span className="text-xs text-gray-700">
                            <span className="text-[10px]">Vehicle No:</span>
                            {item.purchase_vehicle_no}
                          </span>
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
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="4"
                              rx="2"
                              ry="2"
                            />
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-gray-500">
                No items found.
              </div>
            )}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="flex text-left text-2xl text-gray-800 font-[400]">
            Purchase List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Purchase..."
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
              <Button
                variant="default"
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={() => {
                  navigate("/purchase/create");
                }}
              >
                <SquarePlus className="h-4 w-4 mr-2" /> Purchase
              </Button>{" "}
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
              Total Purchase : &nbsp;
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
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              purchase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default PurchaseList;
