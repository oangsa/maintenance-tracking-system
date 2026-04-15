import type { ISearchConditionOperator } from "../../../constants";

export interface ISearchCondition
{
    name: string;
    condition: ISearchConditionOperator;
    value: string;
}

export interface ISearchTerm
{
    name: string;
    value: string;
}

export interface ISearchRequest
{
    pageNumber?: number;
    pageSize?: number;
    orderBy?: string;
    search?: ISearchCondition[];
    searchTerm?: ISearchTerm;
    deleted?: boolean;
}

export interface IPaginationMeta
{
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface IPagedResult<T>
{
    data: T[];
    pagination: IPaginationMeta;
}
