import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { deleteProduct, searchProducts } from "~/services/products.service";
import { useColumns, type IProductTableRow } from "./hooks/useColumns";
import useFieldFilter from "./hooks/useFieldFilter";

export default function ProductListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const columns = useColumns();

    const {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm,
    } = useFieldFilter({ searchParams });

    const {
        currentPage,
        currentSearch,
        handleCurrentPageChange,
        handleFilterChange,
        handleSearchChange,
    } = useTableSearchParams({
        buildFilterParams,
        currentFilters,
        normalizeFilters,
        searchParams,
        setSearchParams,
    });

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IProductTableRow>> =>
    {
        const response = await searchProducts({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir, "code asc"),
            pageNumber: params.page,
            pageSize: params.limit,
            search: buildFilterSearch(params.search),
            searchTerm: params.searchTerm
            ? {
                name: searchTerm,
                value: params.searchTerm,
            }
            : undefined,
        });

        return {
            data: response.data as IProductTableRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, [buildFilterSearch, searchTerm]);

    return (
        <Table<IProductTableRow>
            basePath="/master/products"
            columns={columns}
            currentPageValue={currentPage}
            deleteConfig={{
                confirmMessage: "Are you sure you want to delete this product?",
                confirmTitle: "Delete Product",
                invalidIdMessage: "The selected product has an invalid id and cannot be deleted.",
                onDelete: deleteProduct,
                submitErrorMessage: "Unable to delete the selected product.",
            }}
            emptyMessage="No products found. Create one to get started."
            fetchData={fetchData}
            filterFields={fieldFilters}
            filterValues={currentFiltersRecord}
            itemKey="id"
            itemName="products"
            onCurrentPageChange={handleCurrentPageChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search code or product name..."
            searchValue={currentSearch}
            title="Products"
        />
    );
}
