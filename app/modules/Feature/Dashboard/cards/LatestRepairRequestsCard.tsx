import { Badge } from "~/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { useNavigate } from "react-router";
import type { IDashboardCardComponentProps } from "../types";
import { useLatestRepairRequest } from "../hooks/useLatestRepairRequest";

export default function LatestRepairRequestsCard({}: IDashboardCardComponentProps)
{
    const navigate = useNavigate();
    const { data: latestRepairRequestsData } = useLatestRepairRequest();

    return (
        <div className="space-y-2">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Request No</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Priority</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {latestRepairRequestsData.map((item) => (
                        <TableRow
                            className="cursor-pointer"
                            key={item.requestNo}
                            onClick={() => navigate(`/manager/repair-requests/${item.id}`)}
                        >
                            <TableCell className="font-medium">{item.requestNo}</TableCell>
                            <TableCell>{item.requesterName}</TableCell>
                            <TableCell>{item.statusName}</TableCell>
                            <TableCell className="text-right">
                                <Badge className="capitalize" variant="secondary">{item.priority}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
