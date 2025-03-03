import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
// Validation Schema

const BranchHeader = () => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Edit Purchase</h1>
      </div>
    </div>
  );
};

const createBranch = async ({ id, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/purchases/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (!response.ok) throw responseData;

  return responseData;
};

const EditPurchase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [itemData, setItemData] = useState([]);
  const [formData, setFormData] = useState({
    purchase_date: "",
    purchase_buyer_name: "",
    purchase_buyer_city: "",
    purchase_ref_no: "",
    purchase_vehicle_no: "",
    purchase_status: "",
    purchase_remark: "",
  });
  const [invoiceData, setInvoiceData] = useState([
    {
      purchase_sub_category: "",
      purchase_sub_item: "",
      purchase_sub_size: "",
      purchase_sub_brand: "",
      purchase_sub_weight: 0,
      purchase_sub_box: 0,
      id: "",
    },
  ]);

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
          purchase_sub_weight: 0,
          purchase_sub_box: 0,
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
  const fetchBuyer = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/api/buyers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch buyer data");
    return response.json();
  };

  const { data: buyerData } = useQuery({
    queryKey: ["buyer"],
    queryFn: fetchBuyer,
  });

  const { data: categoryData } = useQuery({
    queryKey: ["categorys"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/categorys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch categorys");
      return response.json();
    },
  });
  const { data: itemsData } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
  });

  useEffect(() => {
    if (itemsData) {
      setItemData(itemsData.items || []);
    }
  }, [itemsData]);

  const {
    data: purchaseByid,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchaseByid", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/purchases/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Purchase order");
      return response.json();
    },
  });

  useEffect(() => {
    if (itemsData && categoryData) {
      if (purchaseByid?.purchase) {
        // Set form data
        setFormData({
          purchase_date: purchaseByid.purchase.purchase_date || "",
          purchase_buyer_name: purchaseByid.purchase.purchase_buyer_name || "",
          purchase_buyer_city: purchaseByid.purchase.purchase_buyer_city || "",
          purchase_ref_no: purchaseByid.purchase.purchase_ref_no || "",
          purchase_vehicle_no: purchaseByid.purchase.purchase_vehicle_no || "",
          purchase_remark: purchaseByid.purchase.purchase_remark || "",
          purchase_status: purchaseByid.purchase.purchase_status || "",
        });

        console.log("Raw purchase_sub data:", purchaseByid.purchaseSub);

        if (Array.isArray(purchaseByid.purchaseSub)) {
          const mappedData = purchaseByid.purchaseSub.map((sub, index) => {
            console.log(`Mapping index ${index}:`, sub.purchase_sub_brand);
            return {
              id: sub.id || "",
              purchase_sub_category: sub.purchase_sub_category || "",
              purchase_sub_item: sub.purchase_sub_item || "",
              purchase_sub_size: sub.purchase_sub_size || "",
              purchase_sub_brand: sub.purchase_sub_brand || "",
              purchase_sub_weight: sub.purchase_sub_weight || 1,
              purchase_sub_box: sub.purchase_sub_box || 0,
            };
          });

          console.log("Final mapped invoiceData:", mappedData);
          setInvoiceData(mappedData);
        } else {
          console.warn("purchase_sub is missing or not an array");
          setInvoiceData([
            {
              purchase_sub_category: "",
              purchase_sub_item: "",
              purchase_sub_size: "",
              purchase_sub_brand: "",
              purchase_sub_weight: 1,
              purchase_sub_box: 0,
            },
          ]);
        }
      }
    }
  }, [purchaseByid, itemsData, categoryData]);

  const handlePaymentChange = (e, rowIndex, fieldName) => {
    const value = e.target.value;

    setInvoiceData((prevData) =>
      prevData.map((row, index) => {
        if (index !== rowIndex) return row;

        const updatedRow = { ...row, [fieldName]: value };

        if (fieldName === "purchase_sub_category") {
          const filteredItems = itemsData?.items?.filter(
            (item) => item.item_category === value
          );
          setItemData(filteredItems || []);
        }

        if (fieldName === "purchase_sub_item") {
          const selectedItem = itemData.find(
            (item) => item.item_name === value
          );
          if (selectedItem) {
            updatedRow.purchase_sub_size = selectedItem.item_size;
            updatedRow.purchase_sub_brand = selectedItem.item_brand;
            updatedRow.purchase_sub_weight = selectedItem.item_weight;
          }
        }

        return updatedRow;
      })
    );
  };

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingFields = [];
    if (!formData.purchase_date) missingFields.push("Purchase Date");
    if (!formData.purchase_buyer_name) missingFields.push("Buyer Name");
    if (!formData.purchase_buyer_city) missingFields.push("Buyer City");
    if (!formData.purchase_ref_no) missingFields.push("Ref");
    if (!formData.purchase_vehicle_no) missingFields.push("Vehicle No");
    if (!formData.purchase_status) missingFields.push("Status");
    invoiceData.forEach((row, index) => {
      if (!row.purchase_sub_category)
        missingFields.push(`Row ${index + 1}: Category`);
      if (!row.purchase_sub_item) missingFields.push(`Row ${index + 1}: Item`);
      if (!row.purchase_sub_size) missingFields.push(`Row ${index + 1}: Size`);
      if (!row.purchase_sub_brand)
        missingFields.push(`Row ${index + 1}: Brand`);
      if (!row.purchase_sub_weight)
        missingFields.push(`Row ${index + 1}: Weight`);
      if (!row.purchase_sub_box) missingFields.push(`Row ${index + 1}: Box`);
    });

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    try {
      const updateData = {
        ...formData,
        purchase_product_data: invoiceData,
      };
      createBranchMutation.mutate({ id, data: updateData });
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
        return;
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
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
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Company <span className="text-red-500">*</span>
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
                    <SelectValue placeholder="Select Company" />
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

              <div className="grid gap-1">
                <label
                  htmlFor="purchase_status"
                  className="text-sm font-medium"
                >
                  Status
                </label>
                <Select
                  value={formData.purchase_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, purchase_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="Inactive">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 overflow-x-auto">
              <Table className="border border-gray-300 rounded-lg shadow-sm">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Category
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                      Item
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
                      <TableCell className="px-4 py-2 min-w-28 ">
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

                      <TableCell className="px-4 py-2 min-w-28 ">
                        <Select
                          key={row.purchase_sub_item}
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
              : "Update Purchase"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default EditPurchase;
