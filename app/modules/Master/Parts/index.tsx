import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { deletePart, searchParts } from "~/services/parts.service";
import useColumns, { type IPartTableRow } from "./hooks/useColumns";

export default function PartsListPage()
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

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IPartTableRow>> =>
    {
        const response = await searchParts({
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
            data: response.data as IPartTableRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, []);

    return (
        <Table<IPartTableRow>
            basePath="/master/parts"
            columns={columns}
            currentPageValue={currentPage}
            deleteConfig={{
                confirmMessage: "Are you sure you want to delete this part?",
                confirmTitle: "Delete Part",
                invalidIdMessage: "The selected part has an invalid id and cannot be deleted.",
                onDelete: deletePart,
                submitErrorMessage: "Unable to delete the selected part.",
            }}
            emptyMessage="No parts found. Create one to get started."
            fetchData={fetchData}
            itemKey="id"
            itemName="parts"
            onCurrentPageChange={handleCurrentPageChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search code, part name, or product type..."
            searchValue={currentSearch}
            title="Parts"
        />
    );
}