import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { deleteProductType, searchProductTypes } from "~/services/productTypes.service";
import useColumns, { type IProductTypeTableRow } from "./hooks/useColumns";

export default function ProductTypeList()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const columns = useColumns();
    const {
        currentPage,
        currentSearch,
        handleCurrentPageChange,
        handleSearchChange,
    } = useTableSearchParams({
        searchParams,
        setSearchParams,
    });

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IProductTypeTableRow>> =>
    {
        const response = await searchProductTypes({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir, "code asc"),
            pageNumber: params.page,
            pageSize: params.limit,
            searchTerm: params.searchTerm
                ? {
                    name: "code,name",
                    value: params.searchTerm,
                }
                : undefined,
        });

        return {
            data: response.data as IProductTypeTableRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, []);

    return (
        <Table<IProductTypeTableRow>
            basePath="/master/product-types"
            columns={columns}
            currentPageValue={currentPage}
            deleteConfig={{
                confirmMessage: "Are you sure you want to delete this product type?",
                confirmTitle: "Delete Product Type",
                invalidIdMessage: "The selected product type has an invalid id and cannot be deleted.",
                onDelete: deleteProductType,
                submitErrorMessage: "Unable to delete the selected product type.",
            }}
            emptyMessage="No product types found. Create one to get started."
            fetchData={fetchData}
            itemKey="id"
            itemName="product types"
            onCurrentPageChange={handleCurrentPageChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search code or product type name..."
            searchValue={currentSearch}
            title="Product Types"
        />
    );
}
