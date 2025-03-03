import React, { useEffect, useRef, useState } from "react";
import Page from "../dashboard/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, Mail, MessageCircle, File } from "lucide-react";
import html2pdf from "html2pdf.js";
import BASE_URL, {
  getImageUrl,
  LetterHead,
  SIGN_IN_PURCHASE,
} from "@/config/BaseUrl";
import { useParams } from "react-router-dom";
import { getTodayDate } from "@/utils/currentDate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import moment from "moment";
import { toWords } from "number-to-words";
import EmailDialog from "./EmailDialog";
import logo from "../../../public/letterHead/AceB.png";
import sign from "../../../public/sign/AceB_sign.png";
import white from "../../../public/letterHead/white.png";
// import { saveAs } from "file-saver";

const ViewPurchaseOrder = () => {
  const containerRef = useRef();
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeSign, setIncludeSign] = useState(true);
  const { id } = useParams();
  const [purchaseProductData, setPurchaseProductData] = useState({});
  const [purchaseProductSubData, setPurchaseProductSubData] = useState([]);
  const [branchData, setBranchData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const Subject = "PURCHASE ORDER";
  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${BASE_URL}/api/panel-fetch-purchase-product-view-by-id/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch contract data");
        }

        const data = await response.json();
        if (!data?.branch?.branch_letter_head) {
          setLoading(true);
          setError("Letter head data is missing");
          return;
        }
        setPurchaseProductData(data.purchaseProduct);
        setPurchaseProductSubData(data.purchaseProductSub);
        setBranchData(data.branch);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, [id]);
  const formatToPascalCase = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  };

  const totalAmount = purchaseProductSubData
    .reduce((total, item) => {
      return (
        total +
        (item.purchase_productSub_qntyInMt *
          item.purchase_productSub_rateInMt || 0)
      );
    }, 0)
    .toFixed(2);

  const totalInWords = toWords(Math.floor(totalAmount));
  const cents = Math.round((totalAmount - Math.floor(totalAmount)) * 100);
  const formattedAmount =
    formatToPascalCase(totalInWords) +
    (cents > 0 ? `And${toWords(cents)}Cents` : "") +
    " Dollars";

  const [pdfFile, setPdfFile] = useState(null);

  // const handleSaveAsPdf = async () => {
  //   if (!containerRef.current) return;

  //   const opt = {
  //     margin: 10,
  //     filename: "purchase_order.pdf",
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  //   };

  //   try {
  //     const pdfArrayBuffer = await html2pdf()
  //       .from(containerRef.current)
  //       .set(opt)
  //       .outputPdf("arraybuffer");
  //     // .save();

  //     const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  //     console.log("Generated PDF Blob for file name:", pdfBlob);
  //     setPdfFile(pdfBlob);

  //     if (pdfBlob) {
  //       setIsDialogOpen(true);
  //     }
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };
  const handleSaveAsPdf = async () => {
    if (!containerRef.current) return;

    const opt = {
      margin: 10,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      // Generate PDF as a Blob
      const pdfBlob = await html2pdf()
        .from(containerRef.current)
        .set(opt)
        .outputPdf("blob");

      // Create a File-like Object (Blob)
      const pdfFile = new Blob([pdfBlob], { type: "application/pdf" });

      // Create a downloadable link (optional for debugging)
      const pdfUrl = URL.createObjectURL(pdfFile);
      console.log("Generated PDF URL:", pdfUrl);

      // Save in state for later use
      setPdfFile(pdfFile);

      if (pdfFile) {
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Printable Document",
    pageStyle: `
    @media print {
      /* Ensure header repeats */
      thead { display: table-header-group; }
      
      .print-header {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        padding: 10px 0;
        background: white;
        border-bottom: 2px solid black;
      }

      /* Push content down to avoid overlap */
      .print-container {
        margin-top: 20px;
      }

      .print-body {
        margin-top: 10px;
        page-break-inside: avoid;
      }

      .print-section {
        margin-bottom: 20px;
      }

      /* Ensure second page starts with margin-top: 100px */
      .page-margin {
        margin-top: 100px !important;
      }

      .page-break {
        page-break-before: always;
      }

      @page {
        size: A4;
        margin: 5mm;
      }
    }
  `,
  });

  const PrintHeader = ({ includeHeader }) => {
    return (
      <div className="print-header hidden print:block">
        {includeHeader && (
          <>
            <div className="hidden print:block">
              <img
                src={getImageUrl(branchData?.branch_letter_head)}
                alt="logo"
                className="w-full max-h-[120px] object-contain"
              />

              <h1 className="text-center text-[15px] font-bold mt-2 ">
                PURCHASE ORDER
              </h1>
            </div>
          </>
        )}
      </div>
    );
  };
  const handleSaveAsPdf1 = async () => {
    if (!containerRef.current) return;

    const opt = {
      margin: 10,
      filename: "purchase_order.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(containerRef.current).set(opt).save();
  };

  return (
    <Page>
      <div className=" flex w-full p-2 gap-2 relative ">
        <div className="w-[85%]">
          <div ref={containerRef} className="print-container">
            <table>
              <thead>
                <tr>
                  <td colSpan="2">
                    <div>
                      <div className="print:hidden">
                        {includeHeader && (
                          <>
                            {/* <img src={logo} alt="logo" className="w-full" /> */}
                            {/* src=
                            {getImageUrl(
                              branchData?.branch?.branch_letter_head
                            )} */}
                            <img
                              src={getImageUrl(branchData?.branch_letter_head)}
                              alt="logo"
                              // className="w-full max-h-[120px] object-contain"
                            />
                            <h1 className="text-center text-[15px] font-bold ">
                              PURCHASE ORDER
                            </h1>
                          </>
                        )}
                      </div>
                      <div>
                        {!includeHeader && (
                          <div>
                            {" "}
                            <img src={white} alt="logo" className="w-full" />
                            <h1 className="text-center text-[15px] font-bold ">
                              PURCHASE ORDER
                            </h1>
                          </div>
                        )}
                      </div>
                    </div>
                    <PrintHeader includeHeader={includeHeader} />
                  </td>
                </tr>
              </thead>

              <tbody>
                {/* {data.map((item, index) => ( */}
                <tr className={`print-section`}>
                  <td className="print-body">
                    <div className="border border-black">
                      <div className="mx-4">
                        <div className="w-full mx-auto grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-bold">
                              {purchaseProductData?.purchase_product_seller}
                            </p>
                            <p>
                              {purchaseProductData?.purchase_product_seller_add}
                            </p>
                            <p>
                              GSTIN:{" "}
                              {purchaseProductData?.purchase_product_seller_gst}
                            </p>
                            <p>
                              Kind Attn.:{" "}
                              {
                                purchaseProductData?.purchase_product_seller_contact
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p>
                              PO DATE:{" "}
                              {purchaseProductData?.purchase_product_date
                                ? moment(
                                    purchaseProductData.purchase_product_date
                                  ).format("DD-MM-YYYY")
                                : ""}
                            </p>
                            <p>
                              PO NO.:{" "}
                              <span className="font-semibold">
                                {purchaseProductData?.purchase_product_ref}
                              </span>
                            </p>
                            <p>
                              DELIVERY DATE:{" "}
                              {purchaseProductData?.purchase_product_delivery_date
                                ? moment(
                                    purchaseProductData.purchase_product_delivery_date
                                  ).format("DD-MM-YYYY")
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="w-full mx-auto mt-6">
                          <p>Dear Sir,</p>
                        </div>
                      </div>

                      <div className="text-[12px]">
                        <div className="mx-4">
                          {" "}
                          <table className="w-full border-collapse table-auto border border-black my-2">
                            <thead>
                              <tr className="border-b border-black">
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "30%" }}
                                >
                                  Product
                                </th>

                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "35%" }}
                                >
                                  <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                                </th>
                                <th
                                  className="border-r border-black p-2 px-3 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  QUANTITY IN MT
                                </th>
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  RATE PER MT IN USD
                                </th>
                                <th
                                  className="p-2 text-center text-[11px]"
                                  style={{ width: "15%" }}
                                >
                                  AMOUNT (USD)
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {purchaseProductSubData.map((item, index) => (
                                <>
                                  <tr key={item.id}>
                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_name}
                                    </td>

                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_qntyInMt} MTS
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_rateInMt} MTS
                                    </td>
                                    <td className="p-2 text-right">
                                      $
                                      {(
                                        item.purchase_productSub_qntyInMt *
                                        item.purchase_productSub_rateInMt
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-t border-black p-2 text-right font-bold">
                                  $
                                  {purchaseProductSubData
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.purchase_productSub_qntyInMt *
                                          item.purchase_productSub_rateInMt ||
                                          0)
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table className="w-full border-collapse table-auto border border-black my-2">
                            <thead>
                              <tr className="border-b border-black">
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "30%" }}
                                >
                                  Product
                                </th>

                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "35%" }}
                                >
                                  <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                                </th>
                                <th
                                  className="border-r border-black p-2 px-3 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  QUANTITY IN MT
                                </th>
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  RATE PER MT IN USD
                                </th>
                                <th
                                  className="p-2 text-center text-[11px]"
                                  style={{ width: "15%" }}
                                >
                                  AMOUNT (USD)
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {purchaseProductSubData.map((item, index) => (
                                <>
                                  <tr key={index}>
                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_name}
                                    </td>

                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_qntyInMt} MTS
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_rateInMt} MTS
                                    </td>
                                    <td className="p-2 text-right">
                                      $
                                      {(
                                        item.purchase_productSub_qntyInMt *
                                        item.purchase_productSub_rateInMt
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-t border-black p-2 text-right font-bold">
                                  $
                                  {purchaseProductSubData
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.purchase_productSub_qntyInMt *
                                          item.purchase_productSub_rateInMt ||
                                          0)
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table className="w-full border-collapse table-auto border border-black my-2">
                            <thead>
                              <tr className="border-b border-black">
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "30%" }}
                                >
                                  Product
                                </th>

                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "35%" }}
                                >
                                  <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                                </th>
                                <th
                                  className="border-r border-black p-2 px-3 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  QUANTITY IN MT
                                </th>
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  RATE PER MT IN USD
                                </th>
                                <th
                                  className="p-2 text-center text-[11px]"
                                  style={{ width: "15%" }}
                                >
                                  AMOUNT (USD)
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {purchaseProductSubData.map((item, index) => (
                                <>
                                  <tr key={index}>
                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_name}
                                    </td>

                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_qntyInMt} MTS
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_rateInMt} MTS
                                    </td>
                                    <td className="p-2 text-right">
                                      $
                                      {(
                                        item.purchase_productSub_qntyInMt *
                                        item.purchase_productSub_rateInMt
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-t border-black p-2 text-right font-bold">
                                  $
                                  {purchaseProductSubData
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.purchase_productSub_qntyInMt *
                                          item.purchase_productSub_rateInMt ||
                                          0)
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table className="w-full border-collapse table-auto border border-black my-2">
                            <thead>
                              <tr className="border-b border-black">
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "30%" }}
                                >
                                  Product
                                </th>

                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "35%" }}
                                >
                                  <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                                </th>
                                <th
                                  className="border-r border-black p-2 px-3 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  QUANTITY IN MT
                                </th>
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  RATE PER MT IN USD
                                </th>
                                <th
                                  className="p-2 text-center text-[11px]"
                                  style={{ width: "15%" }}
                                >
                                  AMOUNT (USD)
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {purchaseProductSubData.map((item, index) => (
                                <>
                                  <tr key={index}>
                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_name}
                                    </td>

                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_qntyInMt} MTS
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_rateInMt} MTS
                                    </td>
                                    <td className="p-2 text-right">
                                      $
                                      {(
                                        item.purchase_productSub_qntyInMt *
                                        item.purchase_productSub_rateInMt
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-t border-black p-2 text-right font-bold">
                                  $
                                  {purchaseProductSubData
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.purchase_productSub_qntyInMt *
                                          item.purchase_productSub_rateInMt ||
                                          0)
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table className="w-full border-collapse table-auto border border-black my-2">
                            <thead>
                              <tr className="border-b border-black">
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "30%" }}
                                >
                                  Product
                                </th>

                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "35%" }}
                                >
                                  <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                                </th>
                                <th
                                  className="border-r border-black p-2 px-3 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  QUANTITY IN MT
                                </th>
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  RATE PER MT IN USD
                                </th>
                                <th
                                  className="p-2 text-center text-[11px]"
                                  style={{ width: "15%" }}
                                >
                                  AMOUNT (USD)
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {purchaseProductSubData.map((item, index) => (
                                <>
                                  <tr key={index}>
                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_name}
                                    </td>

                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_qntyInMt} MTS
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_rateInMt} MTS
                                    </td>
                                    <td className="p-2 text-right">
                                      $
                                      {(
                                        item.purchase_productSub_qntyInMt *
                                        item.purchase_productSub_rateInMt
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-t border-black p-2 text-right font-bold">
                                  $
                                  {purchaseProductSubData
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.purchase_productSub_qntyInMt *
                                          item.purchase_productSub_rateInMt ||
                                          0)
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table className="w-full border-collapse table-auto border border-black my-2">
                            <thead>
                              <tr className="border-b border-black">
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "30%" }}
                                >
                                  Product
                                </th>

                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "35%" }}
                                >
                                  <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                                </th>
                                <th
                                  className="border-r border-black p-2 px-3 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  QUANTITY IN MT
                                </th>
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  RATE PER MT IN USD
                                </th>
                                <th
                                  className="p-2 text-center text-[11px]"
                                  style={{ width: "15%" }}
                                >
                                  AMOUNT (USD)
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {purchaseProductSubData.map((item, index) => (
                                <>
                                  <tr key={index}>
                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_name}
                                    </td>

                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_qntyInMt} MTS
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_rateInMt} MTS
                                    </td>
                                    <td className="p-2 text-right">
                                      $
                                      {(
                                        item.purchase_productSub_qntyInMt *
                                        item.purchase_productSub_rateInMt
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-t border-black p-2 text-right font-bold">
                                  $
                                  {purchaseProductSubData
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.purchase_productSub_qntyInMt *
                                          item.purchase_productSub_rateInMt ||
                                          0)
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table className="w-full border-collapse table-auto border border-black my-2">
                            <thead>
                              <tr className="border-b border-black">
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "30%" }}
                                >
                                  Product
                                </th>

                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "35%" }}
                                >
                                  <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                                </th>
                                <th
                                  className="border-r border-black p-2 px-3 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  QUANTITY IN MT
                                </th>
                                <th
                                  className="border-r border-black p-2 text-center text-[11px]"
                                  style={{ width: "10%" }}
                                >
                                  RATE PER MT IN USD
                                </th>
                                <th
                                  className="p-2 text-center text-[11px]"
                                  style={{ width: "15%" }}
                                >
                                  AMOUNT (USD)
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {purchaseProductSubData.map((item, index) => (
                                <>
                                  <tr key={index}>
                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_name}
                                    </td>

                                    <td className="border-r border-black p-2">
                                      {item.purchase_productSub_description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_qntyInMt} MTS
                                    </td>
                                    <td className="border-r border-black p-2 text-center">
                                      {item.purchase_productSub_rateInMt} MTS
                                    </td>
                                    <td className="p-2 text-right">
                                      $
                                      {(
                                        item.purchase_productSub_qntyInMt *
                                        item.purchase_productSub_rateInMt
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-r border-black p-2"></td>
                                <td className="border-t border-black p-2 text-right font-bold">
                                  $
                                  {purchaseProductSubData
                                    .reduce((total, item) => {
                                      return (
                                        total +
                                        (item.purchase_productSub_qntyInMt *
                                          item.purchase_productSub_rateInMt ||
                                          0)
                                      );
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div>
                            <p>
                              AMOUNT CHARGEABLE IN WORDS -{" "}
                              <span className=" font-semibold ml-3">
                                {formattedAmount}{" "}
                              </span>
                            </p>
                            <p>
                              GST NOTIFICATION :
                              <span className="font-bold">
                                {" "}
                                {
                                  purchaseProductData.purchase_product_gst_notification
                                }
                              </span>{" "}
                            </p>
                          </div>
                          <div>
                            QUALITY{" "}
                            {purchaseProductData.purchase_product_quality}
                          </div>
                          <div>
                            PAYMENT :{" "}
                            {purchaseProductData.purchase_product_payment_terms}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 mt-3 text-[12px]">
                        <div className="col-span-1 pl-4">
                          <div className="leading-none">
                            <p className="font-bold"> DELIVERY AT </p>

                            <p className="my-2">
                              {purchaseProductData.purchase_product_delivery_at}
                            </p>
                          </div>
                        </div>

                        <div className="col-span-1 border-t border-l border-black w-full h-full">
                          <div className="p-4 h-full relative">
                            <p className="font-bold leading-none">
                              For {purchaseProductData.branch_name}
                            </p>

                            <div className="relative w-[200px] h-auto min-h-36">
                              {/* {includeSign && (
                          <p className="font-bold leading-none absolute bottom-0 right-0 -translate-x-1/2 text-black opacity-50 z-10">
                            Authorised Signatory :
                          </p>
                        )} */}
                              {!includeSign && (
                                <p className="font-bold leading-none absolute bottom-0 right-0 -translate-x-1/2 text-black opacity-50 z-10 ">
                                  Authorised Signatory :
                                </p>
                              )}
                              {includeSign && (
                                <>
                                  <img
                                    src={sign}
                                    alt="logo MISSING"
                                    className="w-[120px] h-auto relative"
                                  />

                                  <p className="font-bold leading-none absolute bottom-0 right-0 -translate-x-1/2 text-black opacity-50 z-10 ">
                                    Authorised Signatory :
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                {/* ))} */}
              </tbody>
            </table>
          </div>
        </div>
        <div className=" w-[15%] flex flex-col  border border-gray-200  h-screen rounded-lg  p-2 ">
          <Tabs defaultValue="header" className="w-full ">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="header">Actions</TabsTrigger>
            </TabsList>
            <TabsContent value="header">
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={handlePrint}
                  className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </Button>
                <Button
                  onClick={handleSaveAsPdf1}
                  className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2"
                >
                  <File className="h-4 w-4" />
                  <span>Pdf</span>
                </Button>

                <Button
                  onClick={handleSaveAsPdf}
                  className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Button>
                <EmailDialog
                  open={isDialogOpen}
                  onClose={() => setIsDialogOpen(false)}
                  handleSaveAsPdf={pdfFile}
                  Subject={Subject}
                  purchaseProductData={purchaseProductData}
                />
              </div>

              <div className="mb-2">
                <label className="font-semibold mr-2 text-sm">Print:</label>
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">
                  {includeHeader ? "With Header" : "Without Header"}
                </span>
              </div>

              <div className="mb-2">
                <label className="font-semibold mr-2 text-sm">Sign:</label>
                <input
                  type="checkbox"
                  checked={includeSign}
                  onChange={(e) => setIncludeSign(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">
                  {includeSign ? "With Sign" : "Without Sign"}
                </span>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Page>
  );
};

export default ViewPurchaseOrder;
