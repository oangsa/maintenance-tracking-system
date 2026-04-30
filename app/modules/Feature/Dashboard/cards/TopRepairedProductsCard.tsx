import { Badge } from "~/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import type { IDashboardCardComponentProps } from "../types";

interface ITopRepairedProductItem
{
    productName: string;
    value: number;
}

const mockTopRepairedProductsData: ITopRepairedProductItem[] = [
    {
        productName: "Laptop A",
        value: 25,
    },
    {
        productName: "Printer B",
        value: 14,
    },
];

export default function TopRepairedProductsCard({}: IDashboardCardComponentProps)
{
    return (
        <div className="space-y-2">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Repairs</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockTopRepairedProductsData.map((item) => (
                        <TableRow key={item.productName}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant="secondary">{item.value}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
