import ProductTypesListPage from "~/modules/Master/ProductTypes";

export function meta()
{
    return [
        { title: "Product Types — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage product types from the Master section." },
    ];
}

export default function MasterProductTypesRoute()
{
    return <ProductTypesListPage />;
}
