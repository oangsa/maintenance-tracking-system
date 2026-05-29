export const LOOKUP_COLUMNS = {
    department: [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
    ],
    product: [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
        {
            key: "productTypeName",
            label: "Product Type",
        },
    ],

    part: [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
        {
            key: "productTypeName",
            label: "Product Type",
        },
        {
            key: "totalStock",
            label: "Total Stock",
        }
    ],
    productType: [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
    ],
    repairRequestItem: [
        {
            key: "requestNo",
            label: "Request No.",
        },
        {
            key: "productName",
            label: "Product",
        },
        {
            key: "description",
            label: "Description",
        },
    ],
    repairStatus: [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
        {
            key: "orderSequence",
            label: "Order Sequence",
        },
    ],
} as const;

