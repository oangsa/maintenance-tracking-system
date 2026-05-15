import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { deleteRepairStatus, searchRepairStatuses } from "~/services/repairStatuses.service";
import useColumns, { type IRepairStatusTableRow } from "./hooks/useColumns";

export default function RepairStatusesListPage()
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

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IRepairStatusTableRow>> =>
    {
        const response = await searchRepairStatuses({
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
            data: response.data as IRepairStatusTableRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, []);

    return (
        <Table<IRepairStatusTableRow>
            basePath="/master/repair-statuses"
            columns={columns}
            currentPageValue={currentPage}
            deleteConfig={{
                confirmMessage: "Are you sure you want to delete this repair status?",
                confirmTitle: "Delete Repair Status",
                invalidIdMessage: "The selected repair status has an invalid id and cannot be deleted.",
                onDelete: deleteRepairStatus,
                submitErrorMessage: "Unable to delete the selected repair status.",
            }}
            emptyMessage="No repair statuses found. Create one to get started."
            fetchData={fetchData}
            itemKey="id"
            itemName="repair statuses"
            onCurrentPageChange={handleCurrentPageChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search code or name..."
            searchValue={currentSearch}
            title="Repair Statuses"
        />
    );
}