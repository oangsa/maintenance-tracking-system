import React from "react";
import useColumns, { type IRepairRequestItemStatusTableRow } from "./hooks/useColumns";
import useTableSearchParams from "@/components/Maintain/Table/useSearchParams";
import { useSearchParams } from "react-router";
import { deleteRepairRequestItemStatus, searchRepairRequestItemStatus } from "~/services/repairRequestItemStatus.service";
import type { IFetchParams, IFetchResult } from "@/components/Common/DataTable";
import Table from "@/components/Maintain/Table";

export default function RepairRequestItemStatusPage()
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

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IRepairRequestItemStatusTableRow>> =>
    {
        const res = await searchRepairRequestItemStatus({
            orderBy: "id asc",
            pageNumber: params.page,
            pageSize: params.limit,
            searchTerm: params.searchTerm ? {
                name: "code,name",
                value: params.searchTerm,
            } : undefined,
        });

        return {
            data: res.data as IRepairRequestItemStatusTableRow[],
            total: res.pagination.totalCount,
            totalPages: res.pagination.totalPages,
            pageItemCount: res.pagination.pageSize,
            currentPage: res.pagination.currentPage,
            hasNext: res.pagination.hasNext,
            hasPrevious: res.pagination.hasPrevious,
        }
    }, []);


    return (
        <Table<IRepairRequestItemStatusTableRow>
            basePath="/master/repair-request-item-status"
            columns={columns}
            currentPageValue={currentPage}
            onCurrentPageChange={handleCurrentPageChange}
            onSearchChange={handleSearchChange}
            fetchData={fetchData}
            itemKey="id"
            itemName="Repair Request Item Status"
            searchPlaceholder="Search by code or name"
            searchValue={currentSearch}
            title="Repair Request Item Status"
            deleteConfig={
                {
                    confirmMessage: "Are you sure you want to delete this repair request item status?",
                    confirmTitle: "Delete Repair Request Item Status",
                    invalidIdMessage: "The selected repair request item status has an invalid id and cannot be deleted.",
                    onDelete: deleteRepairRequestItemStatus,
                    submitErrorMessage: "Unable to delete the selected status.",
                }
            }
        />
    )
}
