import { PURCHASE_REPORT } from "@/api";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchBuyers } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ExcelJS from "exceljs";
import { Printer, Search } from "lucide-react";
import moment from "moment";
import { useMemo, useRef, useState } from "react";
import { RiFileExcel2Line } from "react-icons/ri";
import { useReactToPrint } from "react-to-print";
import Page from "../dashboard/page";
const PurchaseReport = () => {
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    purchase_buyer: "",
  });
  const { toast } = useToast();

  const handleInputChange = (field, e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    refetch();
  };

  const PurchaseStock = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${PURCHASE_REPORT}`,
      { ...formData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };

  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchasedata", formData],
    queryFn: PurchaseStock,
    enabled: false,
  });

  const { data: buyerData } = useFetchBuyers();

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Purchase_report",
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
  const downloadExcel = async () => {
    if (reportData?.purchase?.length == undefined) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Purchase");

    // Add title and metadata
    worksheet.addRow([`Purchase Report`]);
    worksheet.addRow([
      `From: ${moment(formData.from_date).format("DD-MM-YYYY")} To: ${moment(
        formData.to_date
      ).format("DD-MM-YYYY")}`,
    ]);
    worksheet.addRow([]);

    // Add headers
    const headers = ["Ref", "Date", "Buyer", "Vehicle No", "Box"];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F3F4F6" },
      };
      cell.alignment = { horizontal: "center" };
    });

    // Add transactions
    reportData?.purchase?.forEach((transaction) => {
      worksheet.addRow([
        transaction.purchase_ref_no,
        moment(transaction.purchase_date).format("DD MMM YYYY"),
        transaction.purchase_buyer_name,
        transaction.purchase_vehicle_no,

        transaction.sum_purchase_sub_box,
      ]);
    });

    // Generate and download Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `purchase_report.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="w-full max-w-md mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Purchase Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Unable to retrieve Purchase information. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (reportData?.purchase?.length > 0) {
      return (
        <div ref={containerRef} className="mt-4">
          <div className="bg-white rounded-lg shadow-sm p-0 md:p-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold mb-4">Purchase Report </h2>

              <div className="hidden print:block">
                <h2 className="text-lg font-bold mb-4 flex justify-center">
                  From Date - {moment(formData.from_date).format("DD MMM YYYY")}{" "}
                  To -{moment(formData.to_date).format("DD MMM YYYY")}{" "}
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-[11px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-2 text-center md:w-20">
                      Ref No
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left">
                      Buyer Name
                    </th>

                    <th className="border border-gray-300 px-2 py-2 text-right">
                      Vehicle No
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-right">
                      Box{" "}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Transactions */}
                  {reportData?.purchase?.map((transaction, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1 text-right border-l border-r">
                        {transaction?.purchase_ref_no}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 font-medium">
                        {moment(transaction?.purchase_date).format(
                          "DD MMM YYYY"
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {transaction?.purchase_buyer_name}
                      </td>

                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {transaction?.purchase_vehicle_no}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                        {transaction?.sum_purchase_sub_box}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Search className="h-12 w-12 mb-2 opacity-30" />
        <p className="text-md">Search for an item to view purchase details</p>
      </div>
    );
  };

  return (
    <Page>
      <div className="p-0 md:p-4">
        {/* Mobile View (sm:hidden) */}
        <div className="sm:hidden">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              {/* Title + Print Button */}
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-gray-800 px-2">
                  Purchase Stock
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={downloadExcel}
                  >
                    <RiFileExcel2Line className="h-3 w-3 " />
                  </button>
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={handlePrintPdf}
                  >
                    <Printer className="h-3 w-3 " />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="bg-white p-2 rounded-md shadow-xs"
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.from_date}
                      className="text-xs h-7"
                      onChange={(e) => handleInputChange("from_date", e)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.to_date}
                      className="text-xs h-7"
                      onChange={(e) => handleInputChange("to_date", e)}
                    />
                  </div>

                  <div className="space-y-1">
                    <MemoizedSelect
                      value={formData.purchase_buyer}
                      onChange={(e) => handleInputChange("purchase_buyer", e)}
                      options={
                        buyerData?.buyers?.map((buyer) => ({
                          value: buyer.buyer_name,
                          label: buyer.buyer_name,
                        })) || []
                      }
                      placeholder="Select Buyer"
                      className="text-xs h-7 flex-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Button
                      type="submit"
                      size="sm"
                      className={`h-9 w-full ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      <Search className="h-3 w-3 mr-1" /> Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Desktop View (hidden sm:block) */}
        <div className="hidden sm:block">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="lg:w-64 xl:w-72 shrink-0">
                <h1 className="text-xl font-bold text-gray-800 truncate">
                  Purchase Stock
                </h1>
                <p className="text-md text-gray-500 truncate">
                  View purchase stock
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-3 rounded-md shadow-xs  "
              >
                <div className="flex flex-col lg:flex-col lg:items-end gap-3  ">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 flex-1  items-center">
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={formData.from_date}
                        className="text-xs h-8 w-full"
                        onChange={(e) => handleInputChange("from_date", e)}
                      />
                    </div>
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={formData.to_date}
                        className="text-xs h-8 w-full"
                        onChange={(e) => handleInputChange("to_date", e)}
                      />
                    </div>
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        Buyer
                      </label>
                      <MemoizedSelect
                        value={formData.purchase_buyer}
                        onChange={(e) => handleInputChange("purchase_buyer", e)}
                        options={
                          buyerData?.buyers?.map((buyer) => ({
                            value: buyer.buyer_name,
                            label: buyer.buyer_name,
                          })) || []
                        }
                        placeholder="Select Buyer"
                        className="text-xs h-8 w-full"
                      />
                    </div>
                    <div className="md:mt-5 flex space-x-3">
                      <Button
                        type="submit"
                        size="sm"
                        className={`h-8  ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                      >
                        <Search className="h-3 w-3 mr-1" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handlePrintPdf}
                      >
                        <Printer className="h-3 w-3 mr-1" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={downloadExcel}
                      >
                        <RiFileExcel2Line className="h-3 w-3 mr-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Buttons - Fixed width to prevent jumping */}
                  {/* <div className="flex gap-2  ">
                    <Button
                      type="submit"
                      size="sm"
                      className={`h-8 w-24 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      <Search className="h-3 w-3 mr-1" /> Search
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 w-24"
                      onClick={handlePrintPdf}
                    >
                      <Printer className="h-3 w-3 mr-1" /> Print
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 w-24"
                      onClick={downloadExcel}
                    >
                      <RiFileExcel2Line className="h-3 w-3 mr-1" /> Excel
                    </Button>
                  </div> */}
                </div>
              </form>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </Page>
  );
};

export default PurchaseReport;
