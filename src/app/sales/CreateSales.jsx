import Page from "@/app/dashboard/page";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchBuyers,
  useFetchCategory,
  useFetchItems,
} from "@/hooks/useApi";
import { useMutation } from "@tanstack/react-query";
import { MinusCircle, PlusCircle, SquarePlus } from "lucide-react";
import moment from "moment";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import CreateBuyer from "../master/buyer/CreateBuyer";
import CreateItem from "../master/item/CreateItem";
// Validation Schema

const productRowSchema = z.object({
  sales_sub_category: z.string().min(1, "Category data is required"),
  sales_sub_item: z.string().min(1, "item data is required"),
  sales_sub_size: z.string().min(1, "Size data is required"),
  sales_sub_brand: z.string().min(1, "Brand data is required"),
  sales_sub_weight: z.number().min(1, "Weight data is required"),
  sales_sub_box: z.string().min(1, "Box data is required"),
});

const contractFormSchema = z.object({
  sales_date: z.string().min(1, "P Date is required"),
  sales_buyer_name: z.string().min(1, "Buyer Name is required"),
  sales_buyer_city: z.string().min(1, "City is required"),
  sales_ref_no: z.string().min(1, "Ref is required"),
  sales_vehicle_no: z.any().optional(),
  sales_remark: z.any().optional(),
  sales_product_data: z.array(productRowSchema),
});

const BranchHeader = () => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Create Dispatch</h1>
      </div>
    </div>
  );
};

const createBranch = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/sales`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
};

const CreateSales = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const today = moment().format("YYYY-MM-DD");

  const [formData, setFormData] = useState({
    sales_date: today,
    sales_buyer_name: "",
    sales_buyer_city: "",
    sales_ref_no: "",
    sales_vehicle_no: "",
    sales_remark: "",
  });
  const [invoiceData, setInvoiceData] = useState([
    {
      sales_sub_category: "",
      sales_sub_item: "",
      sales_sub_size: "",
      sales_sub_brand: "",
      sales_sub_weight: "",
      sales_sub_box: "",
    },
  ]);
  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        sales_sub_category: "",
        sales_sub_item: "",
        sales_sub_size: "",
        sales_sub_brand: "",
        invoicePSub_bank_c: "",
        sales_sub_weight: "",
        sales_sub_box: "",
      },
    ]);
  }, []);
  const removeRow = useCallback(
    (index) => {
      if (invoiceData.length > 1) {
        setInvoiceData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [invoiceData.length]
  );
  const createBranchMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/dispatch");
      } else if (response.code == 400) {
        toast({
          title: "Duplicate Entry",
          description: response.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: response.msg || "Something unexpected happened.",
          variant: "destructive",
        });
      }
      setFormData({
        sales_date: "",
        sales_buyer_name: "",
        sales_buyer_city: "",
        sales_ref_no: "",
        sales_vehicle_no: "",
        sales_remark: "",
      });

      setInvoiceData([
        {
          sales_sub_category: "",
          sales_sub_item: "",
          sales_sub_size: "",
          sales_sub_brand: "",
          sales_sub_weight: "",
          sales_sub_box: "",
        },
      ]);
    },
    onError: (error) => {
      console.error("API Error:", error);

      toast({
        title: "Error",
        description: error.msg || "Something went wrong",
        variant: "destructive",
      });
    },
  });
  const { data: buyerData } = useFetchBuyers();
  const { data: categoryData } = useFetchCategory();
  const { data: itemsData } = useFetchItems();
  const handlePaymentChange = (selectedValue, rowIndex, fieldName) => {
    let value;

    if (selectedValue && selectedValue.target) {
      value = selectedValue.target.value;
    } else {
      value = selectedValue;
    }

    console.log("Selected Value:", value);

    const updatedData = [...invoiceData];

    if (fieldName === "sales_sub_item") {
      updatedData[rowIndex][fieldName] = value;

      const selectedItem = itemsData?.items?.find(
        (item) => item.item_name === value
      );

      if (selectedItem) {
        updatedData[rowIndex]["sales_sub_category"] =
          selectedItem.item_category;
        updatedData[rowIndex]["sales_sub_size"] = selectedItem.item_size;
        updatedData[rowIndex]["sales_sub_brand"] = selectedItem.item_brand;
        updatedData[rowIndex]["sales_sub_weight"] = selectedItem.item_weight;
      }

      setInvoiceData(updatedData);
    } else {
      if (["sales_sub_weight", "sales_sub_box"].includes(fieldName)) {
        if (!/^\d*$/.test(value)) {
          console.log("Invalid input. Only digits are allowed.");
          return;
        }
      }

      updatedData[rowIndex][fieldName] = value;
      setInvoiceData(updatedData);
    }
  };

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;

    let updatedFormData = { ...formData, [field]: value };

    if (field === "sales_buyer_name") {
      const selectedBuyer = buyerData?.buyers.find(
        (buyer) => buyer.buyer_name === value
      );

      if (selectedBuyer) {
        updatedFormData.sales_buyer_city = selectedBuyer.buyer_city;
      } else {
        updatedFormData.sales_buyer_city = "";
      }
    }

    setFormData(updatedFormData);
  };
  const fieldLabels = {
    sales_date: "Sales Date",
    sales_buyer_name: "Buyer Name",
    sales_buyer_city: "Buyer City",
    sales_ref_no: "Ref No",
    sales_vehicle_no: "Vehicle No",
    sales_sub_category: "Category",
    sales_sub_item: "Item",
    sales_sub_size: "Size",
    sales_sub_brand: "Brand",
    sales_sub_weight: "Weight",
    sales_sub_box: "Box",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validatedData = contractFormSchema.parse({
        ...formData,
        sales_product_data: invoiceData,
      });

      createBranchMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) acc[field] = [];
          acc[field].push(err.message);
          return acc;
        }, {});

        const errorMessages = Object.entries(groupedErrors).map(
          ([field, messages]) => {
            const fieldKey = field.split(".").pop();
            const label = fieldLabels[fieldKey] || field;
            return `${label}: ${messages.join(", ")}`;
          }
        );

        toast({
          title: "Validation Error",
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4 grid grid-cols-1">
        <BranchHeader />
        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            <div className="grid  grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Date<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.sales_date}
                    onChange={(e) => handleInputChange(e, "sales_date")}
                    placeholder="Enter Date"
                    type="date"
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium flex justify-between items-center`}
                >
                  <span className="flex items-center space-x-1">
                    <SquarePlus className="h-3 w-3 text-red-600" />
                    <CreateBuyer />
                  </span>
                </label>

                <MemoizedSelect
                  value={formData.sales_buyer_name}
                  onChange={(e) => handleInputChange(e, "sales_buyer_name")}
                  options={
                    buyerData?.buyers?.map((buyer) => ({
                      value: buyer.buyer_name,
                      label: buyer.buyer_name,
                    })) || []
                  }
                  placeholder="Select Buyer"
                />
              </div>

              <div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    City<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.sales_buyer_city}
                    onChange={(e) => handleInputChange(e, "sales_buyer_city")}
                    placeholder="Enter City"
                    disabled
                  />
                </div>
              </div>

              <div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Ref No<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.sales_ref_no}
                    onChange={(e) => handleInputChange(e, "sales_ref_no")}
                    placeholder="Enter Ref No"
                  />
                </div>
              </div>
              <div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Vehicle No
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.sales_vehicle_no}
                    onChange={(e) => handleInputChange(e, "sales_vehicle_no")}
                    placeholder="Enter Vehicle No"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Remark
                  </label>
                  <Textarea
                    className="bg-white"
                    value={formData.sales_remark}
                    onChange={(e) => handleInputChange(e, "sales_remark")}
                    placeholder="Enter Remark"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Table className="border border-gray-300 rounded-lg shadow-sm">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      <div className="flex items-center">
                        <SquarePlus className="h-3 w-3 mr-1 text-red-600" />
                        <CreateItem />
                      </div>
                    </TableHead>

                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Box<span className="text-red-500 ml-1">*</span>
                    </TableHead>
                    <TableHead className="text-sm font-semibold py-3 px-4 w-1/6 text-center">
                      Action
                      <PlusCircle
                        onClick={addRow}
                        className="inline-block ml-2 cursor-pointer text-blue-500 hover:text-gray-800 h-4 w-4"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="px-4 py-2">
                        <MemoizedProductSelect
                          value={row.sales_sub_item}
                          onChange={(e) =>
                            handlePaymentChange(e, rowIndex, "sales_sub_item")
                          }
                          options={
                            itemsData?.items?.map((product) => ({
                              value: product.item_name,
                              label: product.item_name,
                            })) || []
                          }
                          placeholder="Select Item"
                        />
                        {row.sales_sub_item && (
                          <div className="text-sm text-black mt-1">
                            •{row.sales_sub_category} • {row.sales_sub_size}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 py-2 min-w-28 ">
                        <Input
                          className="bg-white border border-gray-300"
                          value={row.sales_sub_box}
                          onChange={(e) =>
                            handlePaymentChange(e, rowIndex, "sales_sub_box")
                          }
                          placeholder="Enter Box"
                        />
                        {row.sales_sub_item && (
                          <div className="text-sm text-black mt-1">
                            • {row.sales_sub_brand}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-2 border">
                        <Button
                          variant="ghost"
                          onClick={() => removeRow(rowIndex)}
                          disabled={invoiceData.length === 1}
                          className="text-red-500 "
                          type="button"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createBranchMutation.isPending}
          >
            {createBranchMutation.isPending ? "Submitting..." : "Create Dispatch"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateSales;
