import EditProductTypePage from "~/modules/Master/ProductTypes/Edit";

export function meta()
{
    return [
        { title: "Edit Product Type — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing product type in the Master section." },
    ];
}

export default function MasterProductTypeEditRoute()
{
    return <EditProductTypePage />;
}
