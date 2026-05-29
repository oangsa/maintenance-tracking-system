import ProductTypeDetailPage from "~/modules/Master/ProductTypes/Detail";

export function meta()
{
    return [
        { title: "Product Type Details — Maintenance Tracking System" },
        { name: "description", content: "View product type details from the Master section." },
    ];
}

export default function MasterProductTypeDetailRoute()
{
    return <ProductTypeDetailPage />;
}
