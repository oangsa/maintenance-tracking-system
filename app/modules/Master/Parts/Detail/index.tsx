import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { cn } from "~/lib/utils";
import { deletePart, getPartById } from "~/services/parts.service";
import type { IDetailSection } from "~/components/Common/DetailSections";
import type { IPart } from "~/api/types/types";


interface IConfirmState
{
    isOpen: boolean;
}

export default function PartDetailPage()
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
            setPageError("The selected part id is invalid.");
            return;
        }

        try
        {
            await deletePart(parsedId);
            navigate("/master/parts", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected part.");
        }
    }

    function ActionButtons(part: IPart)
    {
        return (
             <>
                <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/master/parts/${part.id}/edit`}>
                    Edit Part
                </Link>
                <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete Part
                </Button>
            </>
        )
    }

    function sectionBuilder(part: IPart): IDetailSection[]
    {
        return [
            {
                title: "Part Information",
                fields: [
                    { label: "Code", value: part.code ?? "-" },
                    { label: "Name", value: part.name ?? "-" },
                    { label: "Product Type Code", value: part.productTypeCode ?? "-" },
                    { label: "Product Type Name", value: part.productTypeName ?? "-" },
                    { label: "Total Stock", value: part.totalStock ?? "-" },
                ],
            },
            {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(part.createdAt) },
                    { label: "Updated At", value: formatDateTime(part.updatedAt) },
                    { label: "Created By", value: part.createdBy ?? "-" },
                    { label: "Updated By", value: part.updatedBy ?? "-" },
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
                message="Are you sure you want to delete this part?"
                onClose={() => setConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Part"
            />

            <Detail
                actions={ActionButtons}
                backHref="/master/parts"
                backLabel="Back to Parts"
                buildSections={sectionBuilder}
                description="Review the selected department and continue to edit or delete from the Master section."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested part id is invalid."
                loadData={getPartById}
                loadErrorMessage="Unable to load the selected part."
                loadingMessage="Loading part..."
                notFoundMessage="Part not found."
                title="Part Details"
            />
        </>
    );
}
