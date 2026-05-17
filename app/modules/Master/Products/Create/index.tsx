import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createProduct } from "~/services/products.service";
import ProductForm from "../form";
import { buildCreatePayload, createEmptyProductFormValues } from "../hooks/helpers";

export default function ProductCreatePage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: ReturnType<typeof createEmptyProductFormValues>)
    {
        const payload = buildCreatePayload(values);
        const response = await createProduct(payload);

        navigate(`/master/products/${response.id}`, { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/products");
    }

    return (
        <Create
            backHref="/master/products"
            backLabel="Back to Products"
            description="Add a new product in the Master section."
            Form={ProductForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyProductFormValues()}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the product."
            title="Create Product"
        />
    );
}
