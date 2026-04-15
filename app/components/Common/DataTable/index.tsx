import React from "react";
import { Link } from "react-router";
import {
    FiPlus,
    FiSearch,
    FiChevronUp,
    FiChevronDown,
    FiEdit2,
    FiTrash2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface IColumn<T = Record<string, unknown>>
{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    sortable?: boolean;
    render?: (value: unknown, row: T) => React.ReactNode;
    style?: React.CSSProperties;
}

interface IFetchParams
{
    search: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

interface IFetchResult<T>
{
    data: T[];
    total: number;
    totalPages: number;
}

interface IDataTableProps<T = Record<string, unknown>>
{
    title: string;
    fetchData: (params: IFetchParams) => Promise<IFetchResult<T>>;
    columns: IColumn<T>[];
    searchPlaceholder?: string;
    itemName?: string;
    basePath?: string;
    itemKey?: keyof T & string;
    onDelete?: (id: string | number) => void;
    emptyMessage?: string;
    defaultPageSize?: number;
    refreshTrigger?: number;
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
        <span className="ml-1" style={{ opacity: isActive ? 1 : 0.3 }}>
            {isActive && sortDir === "desc"
                ? <FiChevronDown size={12} />
                : <FiChevronUp size={12} />
            }
        </span>
    );
}

export default function DataTable<T extends Record<string, unknown>>({
    title,
    fetchData,
    columns = [],
    searchPlaceholder = "Search...",
    itemName = "items",
    basePath = "",
    itemKey = "id",
    onDelete,
    emptyMessage,
    defaultPageSize = 10,
    refreshTrigger = 0,
}: IDataTableProps<T>)
{
    const [data, setData] = React.useState<T[]>([]);
    const [total, setTotal] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [search, setSearch] = React.useState("");
    const [searchInput, setSearchInput] = React.useState("");
    const [sortKey, setSortKey] = React.useState<string | null>(null);
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(defaultPageSize);

    React.useEffect(() =>
    {
        const timer = setTimeout(() =>
        {
            setSearch(searchInput);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const loadData = React.useCallback(async () =>
    {
        setLoading(true);
        setError("");
        try
        {
            const params: IFetchParams = { search, page: currentPage, limit: pageSize };

            if (sortKey)
            {
                params.sortBy = sortKey;
                params.sortDir = sortDir;
            }

            const result = await fetchData(params);
            const nextTotalPages = Number(result.totalPages || 0);

            if (nextTotalPages > 0 && currentPage > nextTotalPages)
            {
                setCurrentPage(nextTotalPages);
                return;
            }

            if (nextTotalPages === 0 && currentPage !== 1)
            {
                setCurrentPage(1);
            }

            setData(result.data || []);
            setTotal(result.total || 0);
            setTotalPages(nextTotalPages);
        }
        catch (e)
        {
            setError(String((e as Error).message || e));
        }
        finally
        {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, search, currentPage, pageSize, sortKey, sortDir, refreshTrigger]);

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

        setCurrentPage(1);
    };

    const getItemKey = (item: T) => (item[itemKey] ?? item.id) as string | number;

    const handleDelete = (item: T) =>
    {
        onDelete?.(getItemKey(item));
    };

    const getPageNumbers = () =>
    {
        const size = 5;
        let start = Math.max(1, currentPage - Math.floor(size / 2));
        let end = Math.min(totalPages, start + size - 1);
        if (end - start + 1 < size) start = Math.max(1, end - size + 1);
        const pages: number[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + data.length, total);
    const rangeLabel = loading
        ? "Loading..."
        : total === 0
            ? `0 ${itemName}`
            : data.length === 0
                ? `0 ${itemName}`
                : `${startIndex + 1}???${endIndex} of ${total} ${itemName}`;

    return (
        <div>
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h3 className="text-xl font-bold">{title}</h3>
                <Link
                    to={`${basePath}/new`}
                    className={cn(buttonVariants({ variant: "default" }), "gap-1.5")}
                >
                    <FiPlus size={15} />
                    Create New
                </Link>
            </div>

            <div className="rounded-lg border bg-card shadow-xs p-4">
                {error && (
                    <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="relative w-64">
                        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{rangeLabel}</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(val) =>
                            {
                                setPageSize(Number(val));
                                setCurrentPage(1);
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
                                        {col.label}
                                        <SortIcon columnKey={col.key} sortable={col.sortable} sortKey={sortKey} sortDir={sortDir} />
                                    </TableHead>
                                ))}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading
                                ? <TableLoading colSpan={columns.length + 1} />
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
                                                            {idx === 0
                                                                ? (
                                                                    <Link
                                                                        to={`${basePath}/${pathSegment}`}
                                                                        className="font-medium text-primary hover:underline"
                                                                    >
                                                                        {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? "")}
                                                                    </Link>
                                                                )
                                                                : (col.render ? col.render(item[col.key], item) : String(item[col.key] ?? ""))
                                                            }
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className="text-right">
                                                        <Link
                                                            to={`${basePath}/${pathSegment}/edit`}
                                                            className={cn(buttonVariants({ variant: "outline", size: "xs" }), "mr-2")}
                                                        >
                                                            <FiEdit2 size={12} />
                                                            Edit
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(item)}
                                                        >
                                                            <FiTrash2 size={12} />
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={columns.length + 1}
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

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-end items-center gap-1">
                        <Button variant="outline" size="icon-xs" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                            <FiChevronsLeft size={13} />
                        </Button>
                        <Button variant="outline" size="icon-xs" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                            <FiChevronLeft size={13} />
                        </Button>
                        {getPageNumbers().map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="xs"
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button variant="outline" size="icon-xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                            <FiChevronRight size={13} />
                        </Button>
                        <Button variant="outline" size="icon-xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                            <FiChevronsRight size={13} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
