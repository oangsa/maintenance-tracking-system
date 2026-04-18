import React from "react";
import { Link } from "react-router";
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiChevronUp,
    FiChevronDown,
    FiEdit2,
    FiTrash2,
    FiX,
    FiChevronsLeft,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsRight,
} from "react-icons/fi";
import { TableLoading } from "../Loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const ALL_FILTER_OPTION = "All";
const EMPTY_FILTER_FIELDS: IDataTableFilterField[] = [];

export interface IColumn<T = Record<string, unknown>>
{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    sortable?: boolean;
    render?: (value: unknown, row: T) => React.ReactNode;
    style?: React.CSSProperties;
}

export interface IFetchParams
{
    searchTerm: string;
    page: number;
    limit: number;
    search?: Record<string, string>;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

export interface IDataTableFilterOption
{
    label: string;
    value: string;
}

export interface IDataTableFilterField
{
    key: string;
    label: string;
    placeholder?: string;
    type: "text" | "select";
    options?: IDataTableFilterOption[];
}

export interface IFetchResult<T>
{
    data: T[];
    total: number;
    totalPages: number;
    pageItemCount?: number;
    currentPage?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
}

export interface IDataTableProps<T = Record<string, unknown>>
{
    title: string;
    fetchData: (params: IFetchParams) => Promise<IFetchResult<T>>;
    columns: IColumn<T>[];
    filterFields?: IDataTableFilterField[];
    filterValues?: Record<string, string>;
    searchPlaceholder?: string;
    itemName?: string;
    basePath?: string;
    itemKey?: keyof T & string;
    onDelete?: (id: string | number) => void;
    emptyMessage?: string;
    defaultPageSize?: number;
    refreshTrigger?: number;
    searchValue?: string;
    currentPageValue?: number;
    onFilterChange?: (filters: Record<string, string>) => void;
    onSearchChange?: (search: string) => void;
    onCurrentPageChange?: (page: number) => void;
    showCreateButton?: boolean;
    showEditAction?: boolean;
    showDeleteAction?: boolean;
}

interface ISortIconProps
{
    columnKey: string;
    sortable?: boolean;
    sortKey: string | null;
    sortDir: "asc" | "desc";
}

function SortIcon({ columnKey, sortable, sortKey, sortDir }: ISortIconProps)
{
    if (sortable === false) return null;
    const isActive = sortKey === columnKey;

    return (
        <span className="inline-flex shrink-0 items-center" style={{ opacity: isActive ? 1 : 0.3 }}>
            {isActive && sortDir === "desc"
                ? <FiChevronDown size={12} />
                : <FiChevronUp size={12} />
            }
        </span>
    );
}

function normalizeFilterValues(filterFields: IDataTableFilterField[], values?: Record<string, string>): Record<string, string>
{
    const nextValues: Record<string, string> = {};

    for (const field of filterFields)
    {
        nextValues[field.key] = values?.[field.key] ?? "";
    }

    return nextValues;
}

function hasActiveFilterValue(value?: string): boolean
{
    return Boolean(value?.trim());
}

function areFilterValuesEqual(left: Record<string, string>, right: Record<string, string>): boolean
{
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length)
    {
        return false;
    }

    return leftKeys.every((key) => left[key] === right[key]);
}

export default function DataTable<T extends Record<string, unknown>>({
    title,
    fetchData,
    columns = [],
    filterFields = EMPTY_FILTER_FIELDS,
    filterValues,
    searchPlaceholder = "Search...",
    itemName = "items",
    basePath = "",
    itemKey = "id",
    onDelete,
    emptyMessage,
    defaultPageSize = 10,
    refreshTrigger = 0,
    searchValue,
    currentPageValue,
    onFilterChange,
    onSearchChange,
    onCurrentPageChange,
    showCreateButton = true,
    showEditAction = true,
    showDeleteAction = true,
}: IDataTableProps<T>)
{
    const [data, setData] = React.useState<T[]>([]);
    const [total, setTotal] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrevious, setHasPrevious] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [searchState, setSearchState] = React.useState(searchValue ?? "");
    const [searchInput, setSearchInput] = React.useState(searchValue ?? "");
    const [sortKey, setSortKey] = React.useState<string | null>(null);
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
    const [currentPageState, setCurrentPageState] = React.useState(currentPageValue ?? 1);
    const [pageLimit, setPageLimit] = React.useState(defaultPageSize);
    const [pageItemCount, setPageItemCount] = React.useState(0);
    const [filterState, setFilterState] = React.useState<Record<string, string>>(() => normalizeFilterValues(filterFields, filterValues));
    const [filterDraft, setFilterDraft] = React.useState<Record<string, string>>(() => normalizeFilterValues(filterFields, filterValues));
    const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);

    const search = searchValue ?? searchState;
    const currentPage = currentPageValue ?? currentPageState;
    const shouldShowDetailLinks = Boolean(basePath);
    const shouldShowCreateAction = showCreateButton && shouldShowDetailLinks;
    const shouldShowEditRowAction = showEditAction && shouldShowDetailLinks;
    const shouldShowDeleteRowAction = showDeleteAction && onDelete !== undefined;
    const shouldShowActionsColumn = shouldShowEditRowAction || shouldShowDeleteRowAction;
    const totalTableColumns = columns.length + (shouldShowActionsColumn ? 1 : 0);
    const filters = React.useMemo(() =>
    {
        if (filterValues !== undefined)
        {
            return normalizeFilterValues(filterFields, filterValues);
        }

        return normalizeFilterValues(filterFields, filterState);
    }, [filterFields, filterState, filterValues]);
    const activeFilters = React.useMemo(() => filterFields
        .filter((field) => hasActiveFilterValue(filters[field.key]))
        .map((field) =>
        {
            const rawValue = filters[field.key];
            const displayValue = field.type === "select"
                ? field.options?.find((option) => option.value === rawValue)?.label ?? rawValue
                : rawValue;

            return {
                displayValue,
                field,
            };
        }), [filterFields, filters]);
    const activeFilterCount = activeFilters.length;

    const setResolvedCurrentPage = React.useCallback((nextPage: number) =>
    {
        const normalizedPage = Math.max(1, nextPage);

        if (normalizedPage === currentPage)
        {
            return;
        }

        if (currentPageValue !== undefined)
        {
            onCurrentPageChange?.(normalizedPage);
            return;
        }

        setCurrentPageState(normalizedPage);
    }, [currentPage, currentPageValue, onCurrentPageChange]);

    const updateFilters = React.useCallback((nextFilters: Record<string, string>) =>
    {
        const normalizedFilters = normalizeFilterValues(filterFields, nextFilters);

        if (filterValues !== undefined)
        {
            onFilterChange?.(normalizedFilters);
            return;
        }

        setFilterState(normalizedFilters);
        setResolvedCurrentPage(1);
    }, [filterFields, filterValues, onFilterChange, setResolvedCurrentPage]);

    React.useEffect(() =>
    {
        if (searchValue !== undefined)
        {
            setSearchInput(searchValue);
        }
    }, [searchValue]);

    React.useEffect(() =>
    {
        setFilterState((currentValues) =>
        {
            const normalizedValues = normalizeFilterValues(filterFields, currentValues);

            if (areFilterValuesEqual(currentValues, normalizedValues))
            {
                return currentValues;
            }

            return normalizedValues;
        });
    }, [filterFields]);

    React.useEffect(() =>
    {
        if (filterValues !== undefined && !isFilterDialogOpen)
        {
            setFilterDraft((currentValues) =>
            {
                const normalizedValues = normalizeFilterValues(filterFields, filterValues);

                if (areFilterValuesEqual(currentValues, normalizedValues))
                {
                    return currentValues;
                }

                return normalizedValues;
            });
        }
    }, [filterFields, filterValues, isFilterDialogOpen]);

    React.useEffect(() =>
    {
        const timer = setTimeout(() =>
        {
            if (searchInput === search)
            {
                return;
            }

            if (searchValue !== undefined)
            {
                onSearchChange?.(searchInput);
                return;
            }

            setSearchState(searchInput);
            setResolvedCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [onSearchChange, search, searchInput, searchValue, setResolvedCurrentPage]);

    const loadData = React.useCallback(async () =>
    {
        setLoading(true);
        setError("");

        try
        {
            const params: IFetchParams = { searchTerm: search, page: currentPage, limit: pageLimit, search: filters };

            if (sortKey)
            {
                params.sortBy = sortKey;
                params.sortDir = sortDir;
            }

            const result = await fetchData(params);
            const nextTotalPages = Number(result.totalPages || 0);
            const nextCurrentPage = typeof result.currentPage === "number" && result.currentPage > 0
                ? result.currentPage
                : currentPage;
            const nextData = result.data || [];
            const nextPageItemCount = typeof result.pageItemCount === "number" && result.pageItemCount >= 0
                ? result.pageItemCount
                : nextData.length;

            if (nextTotalPages > 0 && nextCurrentPage > nextTotalPages)
            {
                setResolvedCurrentPage(nextTotalPages);
                return;
            }

            if (nextTotalPages === 0 && nextCurrentPage !== 1)
            {
                setResolvedCurrentPage(1);
                return;
            }

            if (nextCurrentPage !== currentPage)
            {
                setResolvedCurrentPage(nextCurrentPage);
            }

            setData(nextData);
            setTotal(result.total || 0);
            setTotalPages(nextTotalPages);
            setPageItemCount(nextPageItemCount);
            setHasNext(Boolean(result.hasNext));
            setHasPrevious(Boolean(result.hasPrevious));
        }
        catch (e)
        {
            setError(String((e as Error).message || e));
            setPageItemCount(0);
            setHasNext(false);
            setHasPrevious(false);
        }
        finally
        {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, filters, search, currentPage, pageLimit, sortKey, sortDir, refreshTrigger, setResolvedCurrentPage]);

    React.useEffect(() =>
    {
        loadData();
    }, [loadData]);

    const handleSort = (key: string, sortable?: boolean) =>
    {
        if (sortable === false) return;

        if (sortKey === key)
        {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        }
        else
        {
            setSortKey(key);
            setSortDir("asc");
        }

        setResolvedCurrentPage(1);
    };

    const getItemKey = (item: T) => (item[itemKey] ?? item.id) as string | number;

    const handleDelete = (item: T) =>
    {
        onDelete?.(getItemKey(item));
    };

    const handleFilterDialogOpen = () =>
    {
        setFilterDraft(filters);
        setIsFilterDialogOpen(true);
    };

    const handleFilterDraftChange = (fieldKey: string, value: string) =>
    {
        setFilterDraft((currentValues) => ({
            ...currentValues,
            [fieldKey]: value,
        }));
    };

    const handleApplyFilters = () =>
    {
        updateFilters(filterDraft);
        setIsFilterDialogOpen(false);
    };

    const handleResetFilters = () =>
    {
        const emptyFilters = normalizeFilterValues(filterFields, {});

        setFilterDraft(emptyFilters);
        updateFilters(emptyFilters);
        setIsFilterDialogOpen(false);
    };

    const handleClearSingleFilter = (fieldKey: string) =>
    {
        updateFilters({
            ...filters,
            [fieldKey]: "",
        });
    };

    const resolvedTotalPages = Math.max(totalPages, currentPage + (hasNext ? 1 : 0), 1);
    const canGoPrevious = hasPrevious || currentPage > 1;
    const canGoNext = hasNext || currentPage < resolvedTotalPages;
    const shouldShowPagination = total > 0 || currentPage > 1 || hasPrevious || hasNext;

    const getPageNumbers = (pageCount: number) =>
    {
        const size = 5;
        let start = Math.max(1, currentPage - Math.floor(size / 2));
        let end = Math.min(pageCount, start + size - 1);
        if (end - start + 1 < size) start = Math.max(1, end - size + 1);
        const pages: number[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const startIndex = (currentPage - 1) * pageLimit;
    const endIndex = Math.min(startIndex + pageItemCount, total);
    const rangeLabel = loading
        ? "Loading..."
        : total === 0
            ? `0 ${itemName}`
            : data.length === 0
                ? `0 ${itemName}`
                : `${startIndex + 1}-${endIndex} of ${total} ${itemName}`;

    return (
        <div>
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h3 className="text-xl font-bold">{title}</h3>
                {shouldShowCreateAction && (
                    <Link
                        to={`${basePath}/new`}
                        className={cn(
                            buttonVariants({ variant: "default" }),
                            "gap-1.5 !text-primary-foreground hover:!text-primary-foreground"
                        )}
                    >
                        <FiPlus size={15} />
                        Create New
                    </Link>
                )}
            </div>

            <div className="rounded-lg border bg-card shadow-xs p-4">
                {error && (
                    <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative w-64">
                            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {filterFields.length > 0 && (
                            <Button
                                variant={activeFilterCount > 0 ? "default" : "outline"}
                                size="sm"
                                onClick={handleFilterDialogOpen}
                            >
                                <FiFilter size={14} />
                                Filter
                                {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{rangeLabel}</span>
                        <Select
                            value={String(pageLimit)}
                            onValueChange={(val) =>
                            {
                                setPageLimit(Number(val));
                                setResolvedCurrentPage(1);
                            }}
                        >
                            <SelectTrigger size="sm" className="w-[110px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={String(s)}>
                                        {s} / page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {activeFilterCount > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Filters
                        </span>
                        {activeFilters.map(({ displayValue, field }) => (
                            <Button
                                key={field.key}
                                variant="outline"
                                size="xs"
                                className="max-w-full"
                                onClick={() => handleClearSingleFilter(field.key)}
                            >
                                <span className="truncate">
                                    {field.label}: {displayValue}
                                </span>
                                <FiX size={12} />
                            </Button>
                        ))}
                        <Button variant="ghost" size="xs" onClick={handleResetFilters}>
                            Clear all
                        </Button>
                    </div>
                )}

                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead
                                        key={col.key}
                                        className={col.align === "right" ? "text-right" : ""}
                                        style={{ cursor: col.sortable !== false ? "pointer" : "default", userSelect: "none" }}
                                        onClick={() => handleSort(col.key, col.sortable)}
                                    >
                                        <div
                                            className={cn(
                                                "inline-flex items-center gap-1 whitespace-nowrap align-middle",
                                                col.align === "right"
                                                    ? "justify-end"
                                                    : col.align === "center"
                                                        ? "justify-center"
                                                        : "justify-start"
                                            )}
                                        >
                                            <span>{col.label}</span>
                                            <SortIcon columnKey={col.key} sortable={col.sortable} sortKey={sortKey} sortDir={sortDir} />
                                        </div>
                                    </TableHead>
                                ))}
                                {shouldShowActionsColumn && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading
                                ? <TableLoading colSpan={totalTableColumns} />
                                : (
                                    <>
                                        {data.map((item) =>
                                        {
                                            const keyVal = getItemKey(item);
                                            const pathSegment = typeof keyVal === "string" ? encodeURIComponent(keyVal) : keyVal;

                                            return (
                                                <TableRow key={keyVal}>
                                                    {columns.map((col, idx) => (
                                                        <TableCell
                                                            key={col.key}
                                                            className={col.align === "right" ? "text-right" : ""}
                                                            style={col.style}
                                                        >
                                                            {idx === 0 && shouldShowDetailLinks
                                                                ? (
                                                                    <Link
                                                                        to={`${basePath}/${pathSegment}`}
                                                                        className="font-medium !text-primary hover:underline"
                                                                    >
                                                                        {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? "")}
                                                                    </Link>
                                                                )
                                                                : (col.render ? col.render(item[col.key], item) : String(item[col.key] ?? ""))
                                                            }
                                                        </TableCell>
                                                    ))}
                                                    {shouldShowActionsColumn && (
                                                        <TableCell className="text-right">
                                                            {shouldShowEditRowAction && (
                                                                <Link
                                                                    to={`${basePath}/${pathSegment}/edit`}
                                                                    className={cn(
                                                                        buttonVariants({ variant: "outline", size: "xs" }),
                                                                        shouldShowDeleteRowAction ? "mr-2 !text-foreground hover:!text-foreground" : "!text-foreground hover:!text-foreground"
                                                                    )}
                                                                >
                                                                    <FiEdit2 size={12} />
                                                                    Edit
                                                                </Link>
                                                            )}
                                                            {shouldShowDeleteRowAction && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="xs"
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleDelete(item)}
                                                                >
                                                                    <FiTrash2 size={12} />
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                        {data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={totalTableColumns}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    {search
                                                        ? `No matching ${itemName} found.`
                                                        : (emptyMessage || `No ${itemName} found. Create one to get started.`)
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )
                            }
                        </TableBody>
                    </Table>
                </div>

                {shouldShowPagination && (
                    <div className="mt-4 flex justify-end items-center gap-1">
                        <Button variant="outline" size="icon-xs" disabled={!canGoPrevious} onClick={() => setResolvedCurrentPage(1)}>
                            <FiChevronsLeft size={13} />
                        </Button>
                        <Button variant="outline" size="icon-xs" disabled={!canGoPrevious} onClick={() => setResolvedCurrentPage(currentPage - 1)}>
                            <FiChevronLeft size={13} />
                        </Button>
                        {getPageNumbers(resolvedTotalPages).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="xs"
                                onClick={() => setResolvedCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button variant="outline" size="icon-xs" disabled={!canGoNext} onClick={() => setResolvedCurrentPage(currentPage + 1)}>
                            <FiChevronRight size={13} />
                        </Button>
                        <Button variant="outline" size="icon-xs" disabled={!canGoNext} onClick={() => setResolvedCurrentPage(resolvedTotalPages)}>
                            <FiChevronsRight size={13} />
                        </Button>
                    </div>
                )}

                {filterFields.length > 0 && (
                    <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Filter {title}</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {filterFields.map((field) => (
                                    <div className="grid gap-2" key={field.key}>
                                        <Label htmlFor={`filter-${field.key}`}>{field.label}</Label>
                                        {field.type === "select"
                                            ? (
                                                <Select
                                                    value={filterDraft[field.key] || ALL_FILTER_OPTION}
                                                    onValueChange={(value) => handleFilterDraftChange(field.key, value === ALL_FILTER_OPTION ? "" : (value ?? ""))}
                                                >
                                                    <SelectTrigger id={`filter-${field.key}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={ALL_FILTER_OPTION}>All</SelectItem>
                                                        {field.options?.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )
                                            : (
                                                <Input
                                                    id={`filter-${field.key}`}
                                                    placeholder={field.placeholder}
                                                    value={filterDraft[field.key] ?? ""}
                                                    onChange={(e) => handleFilterDraftChange(field.key, e.target.value)}
                                                />
                                            )}
                                    </div>
                                ))}
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" onClick={handleResetFilters}>Reset</Button>
                                <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleApplyFilters}>Apply Filters</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}
