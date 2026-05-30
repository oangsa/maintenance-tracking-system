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
import { 
    useTopRepairedProducts, 
    type IUseTopRepairedProductsResult 
} from "../hooks/useTopRepairedProducts";

interface ITopRepairedProductsCardProps extends IDashboardCardComponentProps {
    topRepairedProductsState?: IUseTopRepairedProductsResult;
}

export default function TopRepairedProductsCard({
    topRepairedProductsState,
}: ITopRepairedProductsCardProps) {
    
    const resolvedState = topRepairedProductsState ?? useTopRepairedProducts();
    const {
        data: topRepairedProductsData,
        loading,
        error,
    } = resolvedState;

    return (
        <div className="space-y-3">
            {error ? (
                <div className="flex h-[18rem] w-full items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 text-sm text-destructive">
                    {error}
                </div>
            ) : loading ? (
                <div className="flex h-[18rem] w-full items-center justify-center text-sm text-muted-foreground">
                    Loading...
                </div>
            ) : topRepairedProductsData.length === 0 ? (
                <div className="flex h-[18rem] w-full items-center justify-center text-sm text-muted-foreground">
                    No data available for the selected period.
                </div>
            ) : (
                <div className="h-[18rem] w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Repairs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topRepairedProductsData.map((item, index) => (
                                <TableRow key={`${item.productName}-${index}`}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary">{item.value}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}