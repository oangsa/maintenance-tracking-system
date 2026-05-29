import CreateProductTypePage from "~/modules/Master/ProductTypes/Create";

export function meta()
{
    return [
        { title: "Create Product Type — Maintenance Tracking System" },
        { name: "description", content: "Create a new product type in the Master section." },
    ];
}

export default function MasterProductTypesCreateRoute()
{
    return <CreateProductTypePage />;
}
