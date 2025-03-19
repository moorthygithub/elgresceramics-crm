import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, Edit, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import { ITEM_EDIT_GET, ITEM_EDIT_SUMBIT } from "@/api";
const EditItem = ({ ItemId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    item_size: "",
    item_brand: "",
    item_weight: "",
    item_status: "Active",
  });
  const [originalData, setOriginalData] = useState(null);
  // Fetch state data
  const fetchItemData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${ITEM_EDIT_GET}/${ItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const itemData = response.data.items || {};

      setFormData({
        item_size: itemData.item_size || "",
        item_brand: itemData.item_brand || "",
        item_weight: itemData.item_weight || "",
        item_status: itemData.item_status || "Active",
      });

      setOriginalData({
        item_size: itemData.item_size || "",
        item_brand: itemData.item_brand || "",
        item_weight: itemData.item_weight || "",
        item_status: itemData.item_status || "Active",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch buyer data",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchItemData();
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.item_size) missingFields.push("Size");
    if (!formData.item_brand) missingFields.push("Brand");
    if (!formData.item_status) missingFields.push("Status");
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
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${ITEM_EDIT_SUMBIT}/${ItemId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        await queryClient.invalidateQueries(["item"]);
        setOpen(false);
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
        description: error.response?.data?.message || "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if there are changes
  const hasChanges =
    originalData &&
    (formData.item_size !== originalData.item_size ||
      formData.item_brand !== originalData.item_brand ||
      formData.item_weight !== originalData.item_weight ||
      formData.item_status !== originalData.item_status);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <div>
                <div className="sm:hidden">
                  <button
                    variant="default"
                    className={`px-2 py-1 bg-yellow-400 hover:bg-yellow-600 rounded-lg text-black text-xs`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`transition-all duration-200 ${isHovered ? "bg-blue-50" : ""
                      }`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <Edit
                      className={`h-4 w-4 transition-all duration-200 ${isHovered ? "text-blue-500" : ""
                        }`}
                    />
                  </Button>
                </div>
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Item</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="overflow-y-auto max-h-[260px] md:max-h-[360px]">
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Edit Item</h4>
              <p className="text-sm text-muted-foreground">
                Update item details
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <label htmlFor="item_size" className="text-sm font-medium">
                  Item Size
                </label>
                <div className="relative">
                  <Input
                    id="item_size"
                    placeholder="Enter Item Size"
                    value={formData.item_size}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        item_size: e.target.value,
                      }))
                    }
                    className={hasChanges ? "pr-8 border-blue-200" : ""}
                  />
                  {hasChanges &&
                    formData.item_size !== originalData.item_size && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <RefreshCcw
                          className="h-4 w-4 text-blue-500 cursor-pointer hover:rotate-180 transition-all duration-300"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              item_size: originalData.item_size,
                            }))
                          }
                        />
                      </div>
                    )}
                </div>
              </div>
              <div className="grid gap-1">
                <label htmlFor="item_brand" className="text-sm font-medium">
                  Item Brand
                </label>
                <div className="relative">
                  <Input
                    id="item_brand"
                    placeholder="Enter Item Brand"
                    value={formData.item_brand}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        item_brand: e.target.value,
                      }))
                    }
                    className={hasChanges ? "pr-8 border-blue-200" : ""}
                  />
                  {hasChanges &&
                    formData.item_brand !== originalData.item_brand && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <RefreshCcw
                          className="h-4 w-4 text-blue-500 cursor-pointer hover:rotate-180 transition-all duration-300"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              item_brand: originalData.item_brand,
                            }))
                          }
                        />
                      </div>
                    )}
                </div>
              </div>
              <div className="grid gap-1">
                <label htmlFor="item_weight" className="text-sm font-medium">
                  Item Weight
                </label>
                <div className="relative">
                  <Input
                    id="item_weight"
                    placeholder="Enter Item Weight"
                    value={formData.item_weight}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        item_weight: e.target.value,
                      }))
                    }
                    className={hasChanges ? "pr-8 border-blue-200" : ""}
                  />
                  {hasChanges &&
                    formData.item_weight !== originalData.item_weight && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <RefreshCcw
                          className="h-4 w-4 text-blue-500 cursor-pointer hover:rotate-180 transition-all duration-300"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              item_weight: originalData.item_weight,
                            }))
                          }
                        />
                      </div>
                    )}
                </div>
              </div>
              <div className="grid gap-1">
                <label htmlFor="item_status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={formData.item_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, item_status: value }))
                  }
                >
                  <SelectTrigger
                    className={hasChanges ? "border-blue-200" : ""}
                  >
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

              {hasChanges && (
                <Alert className="bg-blue-50 border-blue-200 mt-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-600 text-sm">
                    You have unsaved changes
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !hasChanges}
                className={`mt-2 relative overflow-hidden ${hasChanges
                    ? `${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}  `
                    : ""
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Item"
                )}
                {hasChanges && !isLoading && (
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                )}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default EditItem;
