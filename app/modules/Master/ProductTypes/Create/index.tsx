import React from "react";
import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createProductType } from "~/services/productTypes.service";
import ProductTypeForm from "../form";
import { buildCreatePayload, createEmptyProductTypeFormValues } from "../hooks/helpers";

export default function CreateProductTypePage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: ReturnType<typeof createEmptyProductTypeFormValues>)
    {
        await createProductType(buildCreatePayload(values));
        navigate("/master/product-types", { replace: true });
    }

    return (
        <Create
            backHref="/master/product-types"
            backLabel="Back to Product Types"
            Form={ProductTypeForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyProductTypeFormValues()}
            onCancel={() => navigate("/master/product-types")}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the product type."
            title="Create Product Type"
        />
    );
}
