import React from "react";
import { useParams, useNavigate } from "react-router";
import type { IProductType } from "~/api/types/types";
import Edit from "~/components/Maintain/Edit";
import { getProductTypeById, updateProductType } from "~/services/productTypes.service";
import ProductTypeForm from "../form";
import { buildUpdatePayload, mapProductTypeToFormValues, type IProductTypeFormValues } from "../hooks/helpers";

export default function EditProductTypePage()
{
    const { id } = useParams();
    const navigate = useNavigate();

    async function handleSubmit({ id: productTypeId, values }: { id: number; values: IProductTypeFormValues })
    {
        await updateProductType(productTypeId, buildUpdatePayload(values));
        navigate("/master/product-types", { replace: true });
    }

    return (
        <Edit<IProductType, IProductTypeFormValues, { mode: "edit" }>
            backHref="/master/product-types"
            backLabel="Back to Product Types"
            description="Update the selected product type in the Master section."
            Form={ProductTypeForm}
            formProps={{ mode: "edit" } as const}
            id={id as string}
            invalidIdMessage="The requested product type id is invalid."
            loadData={(loadId) => getProductTypeById(Number(loadId))}
            loadErrorMessage="Unable to load the selected product type."
            loadingMessage="Loading product type..."
            mapDataToInitialValues={mapProductTypeToFormValues}
            notFoundMessage="Product type not found."
            onCancel={() => navigate("/master/product-types")}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the product type."
            title="Edit Product Type"
        />
    );
}
