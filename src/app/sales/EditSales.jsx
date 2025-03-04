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
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchBuyers,
  useFetchCategory,
  useFetchItems,
} from "@/hooks/useApi";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { PlusCircle, SquarePlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import SalesTable from "./SalesTable";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { Textarea } from "@/components/ui/textarea";
import CreateBuyer from "../master/buyer/CreateBuyer";
import { decryptId } from "@/components/common/Encryption";
// Validation Schema

const BranchHeader = () => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Edit Dispatch</h1>
      </div>
    </div>
  );
};

const createBranch = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/sales/${decryptedId}`, {
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

const EditSales = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const [itemData, setItemData] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [formData, setFormData] = useState({
    sales_date: "",
    sales_buyer_name: "",
    sales_buyer_city: "",
    sales_ref_no: "",
    sales_vehicle_no: "",
    sales_remark: "",
    sales_status: "",
  });
  const [invoiceData, setInvoiceData] = useState([
    {
      sales_sub_category: "",
      sales_sub_item: "",
      sales_sub_size: "",
      sales_sub_brand: "",
      sales_sub_weight: "",
      sales_sub_box: "",
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
        sales_status: "",
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

  const {
    data: SalesId,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["salesByid", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/sales/${decryptedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch sales order");
      return response.json();
    },
  });

  useEffect(() => {
    if (itemsData && categoryData) {
      if (SalesId?.sales) {
        // Set form data
        setFormData({
          sales_date: SalesId.sales.sales_date || "",
          sales_buyer_name: SalesId.sales.sales_buyer_name || "",
          sales_buyer_city: SalesId.sales.sales_buyer_city || "",
          sales_ref_no: SalesId.sales.sales_ref_no || "",
          sales_vehicle_no: SalesId.sales.sales_vehicle_no || "",
          sales_remark: SalesId.sales.sales_remark || "",
          sales_status: SalesId.sales.sales_status || "",
        });

        if (Array.isArray(SalesId.salesSub)) {
          const mappedData = SalesId.salesSub.map((sub, index) => {
            return {
              id: sub.id || "",
              sales_sub_category: sub.sales_sub_category || "",
              sales_sub_item: sub.sales_sub_item || "",
              sales_sub_size: sub.sales_sub_size || "",
              sales_sub_brand: sub.sales_sub_brand || "",
              sales_sub_weight: sub.sales_sub_weight || "",
              sales_sub_box: sub.sales_sub_box || 0,
            };
          });

          console.log("Final mapped invoiceData:", mappedData);
          setInvoiceData(mappedData);
        } else {
          console.warn("sale_sub is missing or not an array");
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
        }
      }
    }
  }, [SalesId, itemsData, categoryData]);

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
  const fieldLabels = {
    sales_date: " Invoice Ref",
    sales_buyer_name: "Payment Date",
  };
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/sales-sub/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete Purchase Table");

      return response.json();
    },
    onSuccess: (data) => {
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
          title: "Unexpected Response",
          description: data.msg || "Something unexpected happened.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const confirmDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(deleteItemId);
      setContractData((prevData) =>
        prevData.filter((row) => row.id !== deleteItemId)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingFields = [];
    if (!formData.sales_date) missingFields.push("Date");
    if (!formData.sales_buyer_name) missingFields.push("Name");
    if (!formData.sales_buyer_city) missingFields.push("Buyer");
    if (!formData.sales_ref_no) missingFields.push("Ref No");
    if (!formData.sales_status) missingFields.push("Status");
    invoiceData.forEach((row, index) => {
      if (!row.sales_sub_category)
        missingFields.push(`Row ${index + 1}: Category`);
      if (!row.sales_sub_item) missingFields.push(`Row ${index + 1}: Item`);
      if (!row.sales_sub_size) missingFields.push(`Row ${index + 1}: Size`);
      if (!row.sales_sub_brand) missingFields.push(`Row ${index + 1}: Brand`);
      if (!row.sales_sub_weight) missingFields.push(`Row ${index + 1}: Weight`);
      if (!row.sales_sub_box) missingFields.push(`Row ${index + 1}: Box`);
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
        sales_product_data: invoiceData,
      };
      createBranchMutation.mutate({ decryptedId, data: updateData });
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
                    placeholder="Enter Sales Date"
                    type="date"
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-3  font-medium flex justify-between items-center`}
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
              <div className="col-span-2">
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

              <div className="grid gap-1">
                <label htmlFor="sales_status" className="text-sm font-medium">
                  Status<span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.sales_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, sales_status: value }))
                  }
                >
                  <SelectTrigger className="bg-white border border-gray-300 rounded-md">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-md">
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
            <SalesTable
              invoiceData={invoiceData}
              itemData={itemData}
              setInvoiceData={setInvoiceData}
              addRow={addRow}
              itemsData={itemsData}
              handleDeleteRow={handleDeleteRow}
              removeRow={removeRow}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={invoiceData.length < 1 || createBranchMutation.isPending}
          >
            {createBranchMutation.isPending ? "Submitting..." : "Update Dispatch"}
          </Button>
        </div>
      </form>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Dispatch.
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

export default EditSales;
