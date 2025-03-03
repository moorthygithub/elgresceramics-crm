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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetchCategory, useFetchItems } from "@/hooks/useApi";
import { MinusCircle } from "lucide-react";
const SalesTable = ({ invoiceData, setInvoiceData }) => {
  const { data: categoryData } = useFetchCategory();
  const { data: itemsData } = useFetchItems();

  // console.log(itemsData, "itemsData");
  // console.log(categoryData, "categoryData");
  return (
    <div className="mt-4">
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
          {invoiceData.map((row, rowIndex) => {
            const filteredItems = itemsData?.items?.filter(
              (item) => item.item_category === row.sales_sub_category
            );
            // console.log(row.sales_sub_item, "sales_sub_item");
            const handlePaymentChange = (e, rowIndex, fieldName) => {
              const value = e.target.value;
              console.log(fieldName, "fieldName");
              console.log(value, "value");
              setInvoiceData((prevData) =>
                prevData.map((row, index) => {
                  if (index !== rowIndex) return row;

                  console.log(row, "row");

                  const updatedRow = { ...row, [fieldName]: value };
                  console.log(filteredItems, "filteredItems");
                  if (fieldName === "sales_sub_item") {
                    const selectedItem = filteredItems.find(
                      (item) => item.item_name === value
                    );
                    if (selectedItem) {
                      updatedRow.sales_sub_size = selectedItem.item_size;
                      updatedRow.sales_sub_brand = selectedItem.item_brand;
                      updatedRow.sales_sub_weight = selectedItem.item_weight;
                    }
                  }

                  return updatedRow;
                })
              );
            };
            return (
              <TableRow
                key={rowIndex}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <TableCell className="px-4 py-2 min-w-28 ">
                  <Select
                    value={row.sales_sub_category}
                    onValueChange={(value) => {
                      handlePaymentChange(
                        { target: { value } },
                        rowIndex,
                        "sales_sub_category"
                      );
                    }}
                  >
                    <SelectTrigger className="bg-white border border-gray-300">
                      <SelectValue placeholder="Select Category">
                        {row.sales_sub_category || "Select Category"}
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
                    key={row.sales_sub_item}
                    value={row.sales_sub_item}
                    onValueChange={(value) => {
                      handlePaymentChange(
                        { target: { value } },
                        rowIndex,

                        "sales_sub_item"
                      );
                    }}
                  >
                    <SelectTrigger className="bg-white border border-gray-300">
                      <SelectValue placeholder="Select Item">
                        {row.sales_sub_item || "Select Item"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {filteredItems?.map((product, index) => (
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
                    value={row.sales_sub_size}
                    onChange={(e) =>
                      handlePaymentChange(e, rowIndex, "sales_sub_size")
                    }
                    placeholder="Enter Size"
                    disabled
                  />
                </TableCell>
                <TableCell className="px-4 py-2 min-w-28 ">
                <Input
                    className="bg-white border border-gray-300"
                    value={row.sales_sub_brand}
                    onChange={(e) =>
                      handlePaymentChange(e, rowIndex, "sales_sub_brand")
                    }
                    placeholder="Enter Brand"
                    disabled
                  />
                </TableCell>
                <TableCell className="px-4 py-2 min-w-28 ">
                <Input
                    className="bg-white border border-gray-300"
                    value={row.sales_sub_weight}
                    onChange={(e) =>
                      handlePaymentChange(e, rowIndex, "sales_sub_weight")
                    }
                    placeholder="Enter Weight"
                    disabled
                  />
                </TableCell>
                <TableCell className="px-4 py-2 min-w-28 ">
                <Input
                    className="bg-white border border-gray-300"
                    value={row.sales_sub_box}
                    onChange={(e) =>
                      handlePaymentChange(e, rowIndex, "sales_sub_box")
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;
