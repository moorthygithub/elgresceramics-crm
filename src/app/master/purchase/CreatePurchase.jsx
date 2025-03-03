import Page from "@/app/dashboard/page";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/BaseUrl";
import { MinusCircle, PlusCircle, SquarePlus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import CreateCategory from "../category/CreateCategory";
import CreateItem from "../item/CreateItem";
import CreateBuyer from "../buyer/CreateBuyer";
import {
  useFetchBuyers,
  useFetchCategory,
  useFetchItems,
} from "@/hooks/useApi";
// Validation Schema

const productRowSchema = z.object({
  purchase_sub_category: z.string().min(1, "Category data is required"),
  purchase_sub_item: z.string().min(1, "item data is required"),
  purchase_sub_size: z.string().min(1, "Size data is required"),
  purchase_sub_brand: z.string().min(1, "Brand data is required"),
  purchase_sub_weight: z.number().min(1, "Weight data is required"),
  purchase_sub_box: z.string().min(1, "Box data is required"),
});

const contractFormSchema = z.object({
  purchase_date: z.string().min(1, "Purchase Date is required"),
  purchase_buyer_name: z.string().min(1, "Buyer Name is required"),
  purchase_buyer_city: z.string().min(1, "City is required"),
  purchase_ref_no: z.string().min(1, "Ref is required"),
  purchase_vehicle_no: z.string().min(1, "Vehicle No is required"),
  purchase_remark: z.any().optional(),
  purchase_product_data: z.array(productRowSchema),
});

const BranchHeader = () => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Create Purchase</h1>
      </div>
    </div>
  );
};

const createBranch = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/purchases`, {
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

const CreatePurchase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [itemData, setItemData] = useState([]);
  const [formData, setFormData] = useState({
    purchase_date: "",
    purchase_buyer_name: "",
    purchase_buyer_city: "",
    purchase_ref_no: "",
    purchase_vehicle_no: "",
    purchase_remark: "",
  });
  const [invoiceData, setInvoiceData] = useState([
    {
      purchase_sub_category: "",
      purchase_sub_item: "",
      purchase_sub_size: "",
      purchase_sub_brand: "",
      invoicePSub_bank_c: "",
      purchase_sub_weight: "",
      purchase_sub_box: "",
    },
  ]);
  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        purchase_sub_category: "",
        purchase_sub_item: "",
        purchase_sub_size: "",
        purchase_sub_brand: "",
        invoicePSub_bank_c: "",
        purchase_sub_weight: "",
        purchase_sub_box: "",
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
        navigate("/master/purchase");
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
        purchase_date: "",
        purchase_buyer_name: "",
        purchase_buyer_city: "",
        purchase_ref_no: "",
        purchase_vehicle_no: "",
        purchase_remark: "",
      });

      setInvoiceData([
        {
          purchase_sub_category: "",
          purchase_sub_item: "",
          purchase_sub_size: "",
          purchase_sub_brand: "",
          invoicePSub_bank_c: "",
          purchase_sub_weight: "",
          purchase_sub_box: "",
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

  const handlePaymentChange = (e, rowIndex, fieldName) => {
    const value = e.target.value;
    const updatedData = [...invoiceData];

    if (fieldName === "purchase_sub_category") {
      updatedData[rowIndex][fieldName] = value;
      setInvoiceData(updatedData);

      const filteredItems = itemsData?.items?.filter(
        (item) => item.item_category === value
      );

      setItemData(filteredItems || []);
      console.log("Filtered Items:", filteredItems);
    } else if (fieldName === "purchase_sub_item") {
      updatedData[rowIndex][fieldName] = value;

      const selectedItem = itemData.find((item) => item.item_name === value);

      if (selectedItem) {
        updatedData[rowIndex]["purchase_sub_size"] = selectedItem.item_size;
        updatedData[rowIndex]["purchase_sub_brand"] = selectedItem.item_brand;
        updatedData[rowIndex]["purchase_sub_weight"] = selectedItem.item_weight;
      }

      setInvoiceData(updatedData);
      console.log(updatedData, "updatedData");
    } else {
      if (["purchase_sub_weight", "purchase_sub_box"].includes(fieldName)) {
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

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fieldLabels = {
    purchase_date: "Purchase Date",
    purchase_buyer_name: "Buyer Name",
    purchase_buyer_city: "Buyer City",
    purchase_ref_no: "Ref No",
    purchase_vehicle_no: "Vehicle No",
    purchase_sub_category: "Category",
    purchase_sub_item: "Item",
    purchase_sub_size: "Size",
    purchase_sub_brand: "Brand",
    purchase_sub_weight: "Weight",
    purchase_sub_box: "Box",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validatedData = contractFormSchema.parse({
        ...formData,
        purchase_product_data: invoiceData,
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
      <form onSubmit={handleSubmit} className="w-full p-4">
        <BranchHeader />
        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Purchase Date<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.purchase_date}
                    onChange={(e) => handleInputChange(e, "purchase_date")}
                    placeholder="Enter Payment Date"
                    type="date"
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium flex justify-between items-center`}
                >
                  <span className="flex items-center">
                    Buyer <span className="text-red-500 ml-1">*</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <SquarePlus className="h-3 w-3 text-red-600" />
                    <CreateBuyer />
                  </span>
                </label>

                <Select
                  value={formData.purchase_buyer_name}
                  onValueChange={(value) =>
                    handleInputChange(
                      { target: { value } },
                      "purchase_buyer_name"
                    )
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Buyer" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectContent>
                      {buyerData?.buyers?.map((branch) => (
                        <SelectItem
                          key={branch.buyer_name}
                          value={branch.buyer_name}
                        >
                          {branch.buyer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectContent>
                </Select>
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
                    value={formData.purchase_buyer_city}
                    onChange={(e) =>
                      handleInputChange(e, "purchase_buyer_city")
                    }
                    placeholder="Enter City"
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
                    value={formData.purchase_ref_no}
                    onChange={(e) => handleInputChange(e, "purchase_ref_no")}
                    placeholder="Enter  Ref No"
                  />
                </div>
              </div>
              <div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Vehicle No<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.purchase_vehicle_no}
                    onChange={(e) =>
                      handleInputChange(e, "purchase_vehicle_no")
                    }
                    placeholder="Enter Vehicle No"
                  />
                </div>
              </div>
              <div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Remark<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.purchase_remark}
                    onChange={(e) => handleInputChange(e, "purchase_remark")}
                    placeholder="Enter Remark"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1">
              <Table className="border border-gray-300 rounded-lg shadow-sm">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      <div className="flex items-center">
                        <SquarePlus className="h-3 w-3 mr-1 text-red-600" />
                        <CreateCategory />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      <div className="flex items-center">
                        <SquarePlus className="h-3 w-3 mr-1 text-red-600" />
                        <CreateItem />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Size
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Brand
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Weight
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Box
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Action{" "}
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
                        <Select
                          value={row.purchase_sub_category}
                          onValueChange={(value) => {
                            handlePaymentChange(
                              { target: { value } },
                              rowIndex,
                              "purchase_sub_category"
                            );
                          }}
                        >
                          <SelectTrigger className="bg-white border border-gray-300">
                            <SelectValue placeholder="Select Payment">
                              {row.purchase_sub_category || "Select Payment"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {categoryData?.category?.map((product, index) => (
                              <SelectItem key={index} value={product.category}>
                                {product.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="px-4 py-2">
                        <Select
                          value={row.purchase_sub_item}
                          onValueChange={(value) => {
                            handlePaymentChange(
                              { target: { value } },
                              rowIndex,
                              "purchase_sub_item"
                            );
                          }}
                        >
                          <SelectTrigger className="bg-white border border-gray-300">
                            <SelectValue placeholder="Select Payment">
                              {row.purchase_sub_item || "Select Payment"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {itemData?.map((product, index) => (
                              <SelectItem key={index} value={product.item_name}>
                                {product.item_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="px-4 py-2 min-w-28 ">
                        <Input
                          className="bg-white border border-gray-300"
                          value={row.purchase_sub_size}
                          onChange={(e) =>
                            handlePaymentChange(
                              e,
                              rowIndex,
                              "purchase_sub_size"
                            )
                          }
                          placeholder="Enter Size"
                          disabled
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2 min-w-28 ">
                        <Input
                          className="bg-white border border-gray-300"
                          value={row.purchase_sub_brand}
                          onChange={(e) =>
                            handlePaymentChange(
                              e,
                              rowIndex,
                              "purchase_sub_brand"
                            )
                          }
                          placeholder="Enter Brand"
                          disabled
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2 min-w-28 ">
                        <Input
                          className="bg-white border border-gray-300"
                          value={row.purchase_sub_weight}
                          onChange={(e) =>
                            handlePaymentChange(
                              e,
                              rowIndex,
                              "purchase_sub_weight"
                            )
                          }
                          placeholder="Enter Weight"
                          disabled
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2 min-w-28 ">
                        <Input
                          className="bg-white border border-gray-300"
                          value={row.purchase_sub_box}
                          onChange={(e) =>
                            handlePaymentChange(e, rowIndex, "purchase_sub_box")
                          }
                          placeholder="Enter Box"
                          type="number"
                        />
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
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={addRow}
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createBranchMutation.isPending}
          >
            {createBranchMutation.isPending
              ? "Submitting..."
              : "Create Purchase"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreatePurchase;
