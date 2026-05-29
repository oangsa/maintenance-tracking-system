import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime, formatDepartmentLabel } from "~/lib/formatters";
import { cn } from "~/lib/utils";
import { deleteProductType, getProductTypeById } from "~/services/productTypes.service";
import type { IDetailSection } from "~/components/Common/DetailSections";
import type { IProductType } from "~/api/types/types";

interface IConfirmState
{
    isOpen: boolean;
}

export default function ProductTypeDetailPage()
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
            setPageError("The selected product type id is invalid.");
            return;
        }

        try
        {
            await deleteProductType(parsedId);
            navigate("/master/product-types", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected product type.");
        }
    }

    function ActionButtons(productType: IProductType)
    {
        return (
            <>
                <Link
                    className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 text-foreground! hover:text-foreground!")}
                    to={`/master/product-types/${productType.id}/edit`}
                >
                    Edit Product Type
                </Link>
                <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete Product Type
                </Button>
            </>
        );
    }

    function buildSections(productType: IProductType): IDetailSection[]
    {
        return [
            {
                title: "Product Type Information",
                fields: [
                    { label: "Code", value: productType.code ?? "-" },
                    { label: "Name", value: productType.name ?? "-" },
                    { label: "Description", value: productType.description ?? "-" },
                    { label: "Department Code", value: productType.departmentCode ?? "-" },
                    { label: "Department Name", value: productType.departmentName ?? "-" },
                ],
            },
            {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(productType.createdAt) },
                    { label: "Updated At", value: formatDateTime(productType.updatedAt) },
                    { label: "Department", value: formatDepartmentLabel(productType.departmentCode, productType.departmentName) },
                ],
            },
        ];
    }

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete"
                isOpen={confirmState.isOpen}
                message="Are you sure you want to delete this product type?"
                onClose={() => setConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Product Type"
            />

            <Detail
                actions={ActionButtons}
                backHref="/master/product-types"
                backLabel="Back to Product Types"
                buildSections={buildSections}
                description="Review the selected product type and continue to edit or delete it from the Master section."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested product type id is invalid."
                loadData={getProductTypeById}
                loadErrorMessage="Unable to load the selected product type."
                loadingMessage="Loading product type..."
                notFoundMessage="Product type not found."
                title="Product Type Details"
            />
        </>
    );
}
