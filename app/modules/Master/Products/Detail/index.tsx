import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { cn } from "~/lib/utils";
import { deleteProduct, getProductById } from "~/services/products.service";
import type { IDetailSection } from "~/components/Common/DetailSections";
import type { IProduct } from "~/api/types/types";

interface IConfirmState
{
    isOpen: boolean;
}

export default function ProductDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();
    const [pageError, setPageError] = React.useState("");
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    async function confirmDelete()
    {
        const productId = params.id ? Number(params.id) : NaN;

        if (!Number.isFinite(productId))
        {
            setPageError("The selected product id is invalid.");
            return;
        }

        try
        {
            await deleteProduct(productId);
            navigate("/master/products", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected product.");
        }
    }

    function ActionButtons(product: IProduct)
    {
        return (
            <>
                <Link
                    className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 text-foreground! hover:text-foreground!")}
                    to={`/master/products/${product.id}/edit`}
                >
                    Edit Product
                </Link>
                <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete Product
                </Button>
            </>
        );
    }

    function buildSections(product: IProduct): IDetailSection[]
    {
        const productTypeLabel = product.productTypeCode && product.productTypeName
            ? `[${product.productTypeCode}] ${product.productTypeName}`
            : product.productTypeCode || product.productTypeName || "-";

        return [
            {
                title: "Product Information",
                fields: [
                    { label: "Code", value: product.code ?? "-" },
                    { label: "Name", value: product.name ?? "-" },
                    { label: "Product Type", value: productTypeLabel },
                ],
            },
            {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(product.createdAt) },
                    { label: "Updated At", value: formatDateTime(product.updatedAt) },
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
                message="Are you sure you want to delete this product?"
                onClose={() => setConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Product"
            />

            <Detail
                actions={ActionButtons}
                backHref="/master/products"
                backLabel="Back to Products"
                buildSections={buildSections}
                description="Review the selected product and continue to edit or delete it from the Master section."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested product id is invalid."
                loadData={(id: number) => getProductById(String(id))}
                loadErrorMessage="Unable to load the selected product."
                loadingMessage="Loading product..."
                notFoundMessage="Product not found."
                title="Product Details"
            />
        </>
    );
}
