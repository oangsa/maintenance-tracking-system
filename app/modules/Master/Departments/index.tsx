import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { deleteDepartment, searchDepartments } from "~/services/departments.service";
import useColumns, { type IDepartmentTableRow } from "./hooks/useColumns";

export default function DepartmentsListPage()
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

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IDepartmentTableRow>> =>
    {
        const response = await searchDepartments({
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
            data: response.data as IDepartmentTableRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, []);

    return (
        <Table<IDepartmentTableRow>
            basePath="/master/departments"
            columns={columns}
            currentPageValue={currentPage}
            deleteConfig={{
                confirmMessage: "Are you sure you want to delete this department?",
                confirmTitle: "Delete Department",
                invalidIdMessage: "The selected department has an invalid id and cannot be deleted.",
                onDelete: deleteDepartment,
                submitErrorMessage: "Unable to delete the selected department.",
            }}
            emptyMessage="No departments found. Create one to get started."
            fetchData={fetchData}
            itemKey="id"
            itemName="departments"
            onCurrentPageChange={handleCurrentPageChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search code or department name..."
            searchValue={currentSearch}
            title="Departments"
        />
    );
}
