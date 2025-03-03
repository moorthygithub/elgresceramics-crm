import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useReactToPrint } from "react-to-print";

const BuyerReport = () => {
  const containerRef = useRef();
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortedData, setSortedData] = useState([]);

  // Fetch data from API
  const fetchBuyerData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/report-buyer-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.buyer;
    } catch (error) {
      console.error("Error fetching buyer data:", error);
      return [];
    }
  };

  const {
    data: buyerData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["buyerData"],
    queryFn: fetchBuyerData,
  });

  // Update sortedData when buyerData changes
  useEffect(() => {
    if (buyerData) {
      setSortedData(buyerData);
    }
  }, [buyerData]);

  // Sorting function
  const handleSort = () => {
    if (!sortedData) return;

    const sorted = [...sortedData].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.buyer_status.localeCompare(b.buyer_status);
      } else {
        return b.buyer_status.localeCompare(a.buyer_status);
      }
    });

    setSortedData(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`${BASE_URL}/api/download-buyer-data`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "buyer.csv");
      document.body.appendChild(link);
      link.click();

      toast({
        title: "Success",
        description: "Buyer data downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Download failed",
        variant: "destructive",
      });
    }
  };
  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Product_Stock",
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
  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className=" h-4 w-4 animate-spin" />
            Loading Buyer
          </Button>
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Buyer
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
      <div className="p-4">
        <div
          className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-4 mb-2`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Title Section */}
            <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left">
              Buyer Summary
            </h1>

            {/* Button Section */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlePrintPdf}
              >
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button
                className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={onSubmit}
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto text-[11px] grid grid-cols-1" ref={containerRef}>
          <h1 className="text-center text-2xl font-semibold mb-3 hidden print:block">
            Buyer Summary
          </h1>
          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-2 py-2 text-center">
                  Name
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  City
                </th>
                <th
                  className="border border-black px-2 py-2 text-center cursor-pointer"
                  onClick={handleSort}
                >
                  Status{" "}
                  <span className="print:hidden">
                    {sortOrder === "asc" ? "▲" : "▼"}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData && sortedData.length > 0 ? (
                sortedData.map((buyer, index) => (
                  <tr key={buyer.id || index} className="hover:bg-gray-50">
                    <td className="border border-black px-2 py-2">
                      {buyer.buyer_name}
                    </td>
                    <td className="border border-black px-2 py-2">
                      {buyer.buyer_city}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                      {buyer.buyer_status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default BuyerReport;
