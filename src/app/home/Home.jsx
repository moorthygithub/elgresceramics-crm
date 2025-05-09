import { STOCK_REPORT } from "@/api";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonConfig } from "@/config/ButtonConfig";
import { getTodayDate } from "@/utils/currentDate";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ExcelJS from "exceljs";
import { ChevronDown, Download, Printer, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
const tabs = [
  { value: "stock-view", label: "Stock View" },
  { value: "purchase", label: "Stock < 0" },
  { value: "dispatch", label: "Stock < 100" },
];
const Home = () => {
  const containerRef = useRef();
  const currentDate = getTodayDate();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCategoryZero, setSelectedCategoryZero] =
    useState("All Categories");
  const [selectedCategoryHundered, setSelectedCategoryHundered] =
    useState("All Categories");
  const [categories, setCategories] = useState(["All Categories"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryZero, setSearchQueryZero] = useState("");
  const [searchQueryHundered, setSearchQueryHundered] = useState("");
  /*--------------------------------stock view-------------- */
  const fetchStockData = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${STOCK_REPORT}`,

      {
        from_date: "2024-01-01",
        to_date: currentDate,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.stock;
  };
  const {
    data: stockData,
    isLoading: isLoadingStock,
    isError: isErrorStock,
    refetch: refetchStock,
  } = useQuery({
    queryKey: ["stockData"],
    queryFn: fetchStockData,
  });

  /*--------------------------------stock view-------------- */
  // State for table management

  //THIS IS FILTER FOR THE LESS THEN ZERO
  const filteredStockDataZero = (stockData || []).filter((item) => {
    const available =
      item.openpurch - item.closesale + (item.purch - item.sale);
    return available < 0;
  });
  //THIS IS FILTER FOR THE LESS THEN HUNDERED

  const filteredStockDataHundered = (stockData || []).filter((item) => {
    const available =
      item.openpurch - item.closesale + (item.purch - item.sale);
    console.log(available);

    return available > 0 && available < 100;
  });

  useEffect(() => {
    if (stockData && stockData.length > 0) {
      const uniqueCategories = [
        ...new Set(stockData.map((item) => item.item_category)),
      ];
      setCategories(["All Categories", ...uniqueCategories]);
    }
  }, [stockData]);
  //THIS IS STOCK DATA REPORT  IN SMALL SCREEN

  const filteredItems =
    stockData?.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.item_name.toLowerCase().includes(searchLower) ||
        item.item_category.toLowerCase().includes(searchLower) ||
        item.item_size.toLowerCase().includes(searchLower) ||
        (item.openpurch - item.closesale + (item.purch - item.sale))
          .toString()
          .toLowerCase()
          .includes(searchLower);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.item_category === selectedCategory;

      return matchesSearch && matchesCategory;
    }) || [];
  //THIS IS >0 FILTER DATA
  const filteredItemsZero = (stockData || []).filter((item) => {
    const available =
      item.openpurch - item.closesale + (item.purch - item.sale);
    if (available >= 0) return false;
    const searchLower = searchQueryZero.toLowerCase();
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchLower) ||
      item.item_category.toLowerCase().includes(searchLower) ||
      available.toString().toLowerCase().includes(searchLower);
    const matchesCategory =
      selectedCategoryZero === "All Categories" ||
      item.item_category === selectedCategoryZero;

    return matchesSearch && matchesCategory;
  });
  //THIS IS >100 FILTER DATA
  const filteredItemsHundered = (stockData || []).filter((item) => {
    const available =
      item.openpurch - item.closesale + (item.purch - item.sale);

    if (available >= 100) return false;
    const searchLower = searchQueryHundered.toLowerCase();
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchLower) ||
      item.item_category.toLowerCase().includes(searchLower) ||
      available.toString().toLowerCase().includes(searchLower);
    const matchesCategory =
      selectedCategoryHundered == "All Categories" ||
      item.item_category === selectedCategoryHundered;

    return matchesSearch && matchesCategory;
  });

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Stock",
    pageStyle: `
        @page {
      size: A4 portrait;
           margin: 5mm;
        }
        @media print {
          body {
            font-size: 10px; 
            margin: 0mm;
            padding: 0mm;
          }
          table {
            font-size: 11px;
          }
          .print-hide {
            display: none;
          }
        }
      `,
  });

  const downloadCSV = async (stockData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Summary");

    // Add headers
    const headers = ["Item Name", "Category", "Size", "Available"];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "000000" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" }, // Yellow background
      };
      cell.alignment = { horizontal: "center" };
    });

    // Add data rows
    stockData.forEach((item) => {
      const row = [
        item.item_name,
        item.item_category,
        item.item_size,
        (
          item.openpurch -
          item.closesale +
          (item.purch - item.sale)
        ).toLocaleString(),
      ];
      worksheet.addRow(row);
    });

    // Generate and download Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock_summary_${getTodayDate()}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoadingStock) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

  // Render error state
  if (isErrorStock) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Home
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetchStock()} variant="outline">
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
          <Tabs defaultValue="stock-view" className="sm:hidden">
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Stock Tab Content */}
            <TabsContent value="stock-view">
              <Card className="shadow-sm  border-0">
                <CardHeader className="px-3 py-2 border-b">
                  <div className="flex flex-col space-y-2">
                    {/* Title and Buttons */}
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-black">
                        Stock
                      </CardTitle>
                      <div className="flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className=" w-32 truncate"
                            >
                              <span className="truncate">
                                {selectedCategory}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                            align="start"
                            sideOffset={5}
                            collisionPadding={10}
                          >
                            {categories.map((category, index) => (
                              <DropdownMenuItem
                                key={index}
                                onSelect={() => setSelectedCategory(category)}
                                className="flex items-center justify-between"
                              >
                                <span className="truncate">{category}</span>
                                {selectedCategory === category && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="flex-shrink-0 ml-2"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          className={`flex items-center justify-center sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg`}
                          onClick={handlePrintPdf}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                        </button>

                        <button
                          className={`flex items-center justify-center sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg`}
                          onClick={() => downloadCSV(stockData)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                        </button>
                      </div>
                    </div>

                    {/* Search Bar and Filtered Items Count */}
                    <div className="flex items-center justify-between space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search stock..."
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {filteredItems.length} items
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  {stockData?.length ? (
                    <div
                      className="overflow-x-auto text-[11px] grid grid-cols-1"
                      ref={containerRef}
                    >
                      <div className="hidden print:block">
                        <div className="flex justify-between ">
                          <h1 className="text-left text-2xl font-semibold mb-3 ">
                            Stock Summary
                          </h1>
                          <div className="flex space-x-6">
                            <h1> From - 2024-01-01</h1>
                            <h1>To -{currentDate}</h1>
                          </div>
                        </div>
                      </div>

                      <table className="w-full border-collapse border border-black">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                          <tr>
                            <th className="border border-black px-2 py-2 text-center">
                              Item Name
                            </th>
                            <th className="border border-black px-2 py-2 text-center">
                              Category
                            </th>
                            <th className=" hidden print:block border border-black px-2 py-2 text-center">
                              Size
                            </th>

                            <th className="border border-black px-2 py-2 text-center">
                              Available
                            </th>
                          </tr>
                        </thead>
                        {filteredItems && (
                          <tbody>
                            {filteredItems.map((item, index) => (
                              <>
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-black px-2 py-2 ">
                                    {item.item_name}
                                  </td>
                                  <td className="border border-black px-2 py-2 text-right">
                                    {item.item_category}
                                  </td>
                                  <td className="hidden print:block border border-black px-2 py-2 text-right">
                                    {item.item_size}
                                  </td>

                                  <td className="border border-black px-2 py-2 text-right">
                                    {(
                                      item.openpurch -
                                      item.closesale +
                                      (item.purch - item.sale)
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              </>
                            ))}
                          </tbody>
                        )}
                      </table>
                    </div>
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
                      No stock data available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchase Tab Content */}
            <TabsContent value="purchase">
              <Card className="shadow-sm  border-0">
                <CardHeader className="px-3 py-2 border-b">
                  <div className="flex flex-col space-y-2">
                    {/* Title and Buttons */}
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-black">
                        Stock {"<"} 0
                      </CardTitle>
                      <div className="flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className=" w-32 truncate"
                            >
                              <span className="truncate">
                                {selectedCategoryZero}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                            align="start"
                            sideOffset={5}
                            collisionPadding={10}
                          >
                            {categories.map((category, index) => (
                              <DropdownMenuItem
                                key={index}
                                onSelect={() =>
                                  setSelectedCategoryZero(category)
                                }
                                className="flex items-center justify-between"
                              >
                                <span className="truncate">{category}</span>
                                {selectedCategoryZero === category && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="flex-shrink-0 ml-2"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Search Bar and Filtered Items Count */}
                    <div className="flex items-center justify-between space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search stock < 0..."
                          value={searchQueryZero}
                          onChange={(event) =>
                            setSearchQueryZero(event.target.value)
                          }
                          className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {filteredItemsZero.length} items
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  {stockData?.length ? (
                    <div
                      className="overflow-x-auto text-[11px] grid grid-cols-1"
                      ref={containerRef}
                    >
                      <div className="hidden print:block">
                        <div className="flex justify-between ">
                          <h1 className="text-left text-2xl font-semibold mb-3 ">
                            Stock Summary
                          </h1>
                          <div className="flex space-x-6">
                            <h1> From - 2024-01-01</h1>
                            <h1>To -{currentDate}</h1>
                          </div>
                        </div>
                      </div>

                      <table className="w-full border-collapse border border-black">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                          <tr>
                            <th className="border border-black px-2 py-2 text-center">
                              Item Name
                            </th>
                            <th className="border border-black px-2 py-2 text-center">
                              Category
                            </th>

                            <th className="border border-black px-2 py-2 text-center">
                              Available
                            </th>
                          </tr>
                        </thead>
                        {filteredItemsZero && (
                          <tbody>
                            {filteredItemsZero.map((item, index) => (
                              <>
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-black px-2 py-2 ">
                                    {item.item_name}
                                  </td>
                                  <td className="border border-black px-2 py-2 text-right">
                                    {item.item_category}
                                  </td>

                                  <td className="border border-black px-2 py-2 text-right">
                                    {(
                                      item.openpurch -
                                      item.closesale +
                                      (item.purch - item.sale)
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              </>
                            ))}
                          </tbody>
                        )}
                      </table>
                    </div>
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
                      No stock data available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dispatch Tab Content */}
            <TabsContent value="dispatch">
              {" "}
              <Card className="shadow-sm  border-0">
                <CardHeader className="px-3 py-2 border-b">
                  <div className="flex flex-col space-y-2">
                    {/* Title and Buttons */}
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-black">
                        Stock {"<"} 100
                      </CardTitle>
                      <div className="flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className=" w-32 truncate"
                            >
                              <span className="truncate">
                                {selectedCategoryHundered}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                            align="start"
                            sideOffset={5}
                            collisionPadding={10}
                          >
                            {categories.map((category, index) => (
                              <DropdownMenuItem
                                key={index}
                                onSelect={() =>
                                  setSelectedCategoryHundered(category)
                                }
                                className="flex items-center justify-between"
                              >
                                <span className="truncate">{category}</span>
                                {selectedCategoryHundered === category && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="flex-shrink-0 ml-2"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Search Bar and Filtered Items Count */}
                    <div className="flex items-center justify-between space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search stock < 100..."
                          value={searchQueryHundered}
                          onChange={(event) =>
                            setSearchQueryHundered(event.target.value)
                          }
                          className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {filteredItemsHundered.length} items
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  {stockData?.length ? (
                    <div
                      className="overflow-x-auto text-[11px] grid grid-cols-1"
                      ref={containerRef}
                    >
                      <div className="hidden print:block">
                        <div className="flex justify-between ">
                          <h1 className="text-left text-2xl font-semibold mb-3 ">
                            Stock
                          </h1>
                          <div className="flex space-x-6">
                            <h1> From - 2024-01-01</h1>
                            <h1>To -{currentDate}</h1>
                          </div>
                        </div>
                      </div>

                      <table className="w-full border-collapse border border-black">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                          <tr>
                            <th className="border border-black px-2 py-2 text-center">
                              Item Name
                            </th>
                            <th className="border border-black px-2 py-2 text-center">
                              Category
                            </th>

                            <th className="border border-black px-2 py-2 text-center">
                              Available
                            </th>
                          </tr>
                        </thead>
                        {filteredItemsHundered && (
                          <tbody>
                            {filteredItemsHundered.map((item, index) => (
                              <>
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-black px-2 py-2 ">
                                    {item.item_name}
                                  </td>
                                  <td className="border border-black px-2 py-2 text-right">
                                    {item.item_category}
                                  </td>

                                  <td className="border border-black px-2 py-2 text-right">
                                    {(
                                      item.openpurch -
                                      item.closesale +
                                      (item.purch - item.sale)
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              </>
                            ))}
                          </tbody>
                        )}
                      </table>
                    </div>
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
                      No stock data available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>

        <>
          {/* median screen  */}

          <div className="hidden sm:block rounded-md border max-h-[500px] overflow-y-auto mb-4">
            <table className="w-full border-collapse border">
              <thead
                className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
              >
                <tr>
                  <th
                    colSpan="4"
                    className={`text-left sticky top-0  z-10 px-2 py-2 border-b ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                  >
                    Stock Less Than 0
                  </th>
                </tr>
                <tr
                  className={`text-[14px] sticky top-[40px]  z-10 ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                >
                  <th className="border-b px-2 py-2 text-left">Index</th>
                  <th className="border-b px-2 py-2 text-left">Item Name</th>
                  <th className="border-b px-2 py-2 text-left">Category</th>
                  <th className="border-b px-2 py-2 text-left">Available</th>
                </tr>
              </thead>
              {filteredStockDataZero && (
                <tbody>
                  {filteredStockDataZero.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 text-[14px]">
                      <td className="border-b px-2 py-2">{index + 1}</td>
                      <td className="border-b px-2 py-2">{item.item_name}</td>
                      <td className="border-b px-2 py-2">
                        {item.item_category}
                      </td>
                      <td className="border-b px-2 py-2">
                        {(
                          item.openpurch -
                          item.closesale +
                          (item.purch - item.sale)
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          <div className="hidden sm:block rounded-md border max-h-[500px] overflow-y-auto">
            <table className="w-full border-collapse border ">
              <thead
                className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
              >
                <tr>
                  <th
                    colSpan="4"
                    className={`text-left sticky top-0  z-10 px-2 py-2 border-b ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                  >
                    Stock Less Than 100
                  </th>
                </tr>
                <tr
                  className={`text-[14px] sticky top-[40px]  z-10 ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                >
                  <th className="border-b  px-2 py-2 text-left">Index</th>
                  <th className="border-b  px-2 py-2 text-left">Item Name</th>
                  <th className="border-b  px-2 py-2 text-left">Category</th>
                  <th className="border-b  px-2 py-2 text-left">Available</th>
                </tr>
              </thead>
              {filteredStockDataHundered && (
                <tbody>
                  {filteredStockDataHundered.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 text-[14px]">
                      <td className="border-b  px-2 py-2 ">{index + 1}</td>
                      <td className="border-b  px-2 py-2 ">{item.item_name}</td>
                      <td className="border-b px-2 py-2 ">
                        {item.item_category}
                      </td>

                      <td className="border-b  px-2 py-2 ">
                        {(
                          item.openpurch -
                          item.closesale +
                          (item.purch - item.sale)
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>{" "}
          </div>
        </>
      </div>
    </Page>
  );
};

export default Home;
