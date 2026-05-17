import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getProductById, updateProduct } from "~/services/products.service";
import ProductForm from "../form";
import { buildUpdatePayload, mapProductToFormValues } from "../hooks/helpers";

export default function ProductEditPage()
{
    const navigate = useNavigate();
    const params = useParams();

    async function handleSubmit({ id, values }: { id: number; values: ReturnType<typeof mapProductToFormValues> })
    {
        await updateProduct(String(id), buildUpdatePayload(values));
        navigate(`/master/products/${id}`, { replace: true });
    }

    async function handleCancel()
    {
        navigate(`/master/products/${params.id}`);
    }

    return (
        <Edit
            backHref={`/master/products/${params.id}`}
            backLabel="Back to Product Details"
            description="Edit an existing product in the Master section."
            Form={ProductForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested product id is invalid."
            loadData={(id: number) => getProductById(String(id))}
            loadErrorMessage="Unable to load the selected product."
            loadingMessage="Loading product..."
            mapDataToInitialValues={mapProductToFormValues}
            notFoundMessage="Product not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the product."
            title="Edit Product"
        />
    );
}
