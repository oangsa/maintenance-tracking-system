import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { cn } from "~/lib/utils";
import { deleteRepairStatus, getRepairStatusById } from "~/services/repairStatuses.service";
import type { IDetailSection } from "~/components/Common/DetailSections";
import type { IRepairStatus } from "~/api/types/types";

interface IConfirmState
{
    isOpen: boolean;
}

export default function RepairStatusDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [pageError, setPageError] = React.useState("");
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    async function confirmDelete()
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected repair status id is invalid.");
            return;
        }

        try
        {
            await deleteRepairStatus(parsedId);
            navigate("/master/repair-statuses", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected repair status.");
        }
    }

    function ActionButtons(repairStatus: IRepairStatus)
    {
        return (
             <>
                <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/master/repair-statuses/${repairStatus.id}/edit`}>
                    Edit Repair Status
                </Link>
                <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete Repair Status
                </Button>
            </>
        )
    }

    function sectionBuilder(repairStatus: IRepairStatus): IDetailSection[]
    {
        return [
            {
                title: "Repair Status Information",
                fields: [
                    { label: "Code", value: repairStatus.code ?? "-" },
                    { label: "Name", value: repairStatus.name ?? "-" },
                ],
            },
            {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(repairStatus.createdAt) },
                    { label: "Updated At", value: formatDateTime(repairStatus.updatedAt) },
                    { label: "Created By", value: repairStatus.createdBy ?? "-" },
                    { label: "Updated By", value: repairStatus.updatedBy ?? "-" },
                ],
            },
        ]
    }

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete"
                isOpen={confirmState.isOpen}
                message="Are you sure you want to delete this repair status?"
                onClose={() => setConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Repair Status"
            />

            <Detail
                actions={ActionButtons}
                backHref="/master/repair-statuses"
                backLabel="Back to Repair Statuses"
                buildSections={sectionBuilder}
                description="Review the selected repair status and continue to edit or delete from the Master section."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested repair status id is invalid."
                loadData={getRepairStatusById}
                loadErrorMessage="Unable to load the selected repair status."
                loadingMessage="Loading repair status..."
                notFoundMessage="Repair status not found."
                title="Repair Status Details"
            />
        </>
    );
}