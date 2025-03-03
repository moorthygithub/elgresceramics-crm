import React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateItem = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_category: "",
    item_name: "",
    item_size: "",
    item_brand: "",
    item_weight: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

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
  const handleInputChange = (e, key, value) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };
  const handleSubmit = async () => {
    if (
      !formData.item_category.trim() ||
      !formData.item_name.trim() ||
      !formData.item_size.trim() ||
      !formData.item_brand.trim() ||
      !formData.item_weight.trim()
    ) {
      toast({
        title: "Error",
        description: "State name and state number are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/items`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        setFormData({
          item_category: "",
          item_name: "",
          item_size: "",
          item_brand: "",
          item_weight: "",
        });
        await queryClient.invalidateQueries(["buyers"]);
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
        description: error.response?.data?.message || "Failed to create Item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {pathname === "/master/item" ? (
          <Button
            variant="default"
            className={`md:ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            <SquarePlus className="h-4 w-4 mr-2" /> Item
          </Button>
        ) : pathname === "/master/purchase/create" ||
          pathname === "/master/sales/create" ? (
          <p className="text-xs text-red-600  w-32 hover:text-red-300 cursor-pointer">
            Item
          </p>
        ) : (
          <span />
        )}
      </PopoverTrigger>
      <PopoverContent className="md:w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Create New Item</h4>
            <p className="text-sm text-muted-foreground">
              Enter the details for the new Item
            </p>
          </div>
          <div className="grid gap-2">
            <div>
              <Select
                value={formData.item_category}
                onValueChange={(value) =>
                  handleInputChange(null, "item_category", value)
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Item category " />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categoryData?.category?.map((product, index) => (
                    <SelectItem key={index} value={product.category}>
                      {product.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              id="item_name"
              placeholder="Enter Item name"
              value={formData.item_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, item_name: e.target.value }))
              }
            />
            <Input
              id="item_size"
              placeholder="Enter item size"
              value={formData.item_size}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, item_size: e.target.value }))
              }
            />
            <Input
              id="item_brand"
              placeholder="Enter item brand"
              value={formData.item_brand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, item_brand: e.target.value }))
              }
            />
            <Input
              type="number"
              id="item_weight"
              placeholder="Enter item weight"
              value={formData.item_weight}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  item_weight: e.target.value,
                }))
              }
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Item"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateItem;
