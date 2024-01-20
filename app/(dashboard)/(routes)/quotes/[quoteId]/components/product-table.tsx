"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Category,
  Image
} from "@prisma/client";
import Link from "next/link";

type Props = {
  data: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      barcode: string | null;
      category: Category;
      images: Image[];
    };
  }[];
};
function ProductTable({ data }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Barcode</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Qty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <Link
              href={`${process.env.flexURL}/f5/ui/#inventory-model/${item.product.id}/quantity`}
            >
              <TableCell>{item.product.name}</TableCell>
            </Link>
            <TableCell>{item.product.barcode}</TableCell>
            <TableCell>{item.product.category.name}</TableCell>
            <TableCell>{item.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter className="bg-card text-card-foreground border-t">
        <TableRow>
          <TableCell colSpan={3}>Total Items</TableCell>
          <TableCell>
            {data.reduce((total, item) => {
              return total + Number(item.quantity);
            }, 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
export default ProductTable;
