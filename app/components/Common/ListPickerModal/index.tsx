import React from "react";
import {
    FiSearch,
    FiChevronUp,
    FiChevronDown,
    FiChevronsLeft,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsRight,
} from "react-icons/fi";
import { TableLoading } from "../Loading";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

export interface IPickerColumn<T = Record<string, unknown>>
{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    render?: (value: unknown, row: T) => React.ReactNode;
    style?: React.CSSProperties;
}

export interface IFetchParams
{
    search: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
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

interface IListPickerModalProps<T = Record<string, unknown>>
{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (row: T) => void;
    title?: string;
    searchPlaceholder?: string;
    fetchData: (params: IFetchParams) => Promise<IFetchResult<T>>;
    columns: IPickerColumn<T>[];
    itemName?: string;
    emptySearch?: string;
    emptyDefault?: string;
    getSelectLabel?: (row: T) => string;
    initialSearch?: string;
}

export default function ListPickerModal<T extends Record<string, unknown>>({
    isOpen,
    onClose,
    onSelect,
    title = "Select",
    searchPlaceholder = "Search...",
    fetchData,
    columns = [],
    itemName = "item",
    emptySearch = "No results found.",
    emptyDefault = "No items yet.",
    initialSearch = "",
}: IListPickerModalProps<T>)
{
    const [data, setData] = React.useState<T[]>([]);
    const [total, setTotal] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrevious, setHasPrevious] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [searchInput, setSearchInput] = React.useState("");
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [sortBy, setSortBy] = React.useState(columns[0]?.key || "id");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
    const [pageLimit, setPageLimit] = React.useState(10);

    React.useEffect(() =>
    {
        if (isOpen)
        {
            const v = String(initialSearch ?? "").trim();
            setSearchInput(v);
            setSearch(v);
            setPage(1);
        }
    }, [isOpen, initialSearch]);

    React.useEffect(() =>
    {
        const t = setTimeout(() =>
        {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const handleSort = (key: string) =>
    {
        if (sortBy === key)
        {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        }
        else
        {
            setSortBy(key);
            setSortDir("asc");
        }
        setPage(1);
    };

    React.useEffect(() =>
    {
        if (!isOpen || !fetchData) return;
        let cancelled = false;
        setLoading(true);
        fetchData({ search, page, limit: pageLimit, sortBy, sortDir })
            .then((res) =>
            {
                if (cancelled) return;
                const nextTotalPages = Number(res.totalPages || 0);
                const nextCurrentPage = typeof res.currentPage === "number" && res.currentPage > 0
                    ? res.currentPage
                    : page;

                if (nextTotalPages > 0 && nextCurrentPage > nextTotalPages)
                {
                    setPage(nextTotalPages);
                    return;
                }

                if (nextTotalPages === 0 && nextCurrentPage !== 1)
                {
                    setPage(1);
                    return;
                }

                if (nextCurrentPage !== page)
                {
                    setPage(nextCurrentPage);
                }

                setData(res.data || []);
                setTotal(res.total || 0);
                setTotalPages(nextTotalPages);
                setHasNext(Boolean(res.hasNext));
                setHasPrevious(Boolean(res.hasPrevious));
            })
            .catch(() =>
            {
                if (!cancelled)
                {
                    setData([]);
                    setTotal(0);
                    setTotalPages(0);
                    setHasNext(false);
                    setHasPrevious(false);
                }
            })
            .finally(() =>
            {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [isOpen, fetchData, search, page, pageLimit, sortBy, sortDir]);

    const handleSelect = (row: T) =>
    {
        onSelect(row);
        onClose();
    };

    const resolvedTotalPages = Math.max(totalPages, page + (hasNext ? 1 : 0), 1);
    const canGoPrevious = hasPrevious || page > 1;
    const canGoNext = hasNext || page < resolvedTotalPages;
    const shouldShowPagination = total > 0 || page > 1 || hasPrevious || hasNext;

    const getPageNumbers = (pageCount: number) =>
    {
        const size = 5;
        let start = Math.max(1, page - Math.floor(size / 2));
        let end = Math.min(pageCount, start + size - 1);
        if (end - start + 1 < size) start = Math.max(1, end - size + 1);
        const pages: number[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const colCount = columns.length + 1;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
                showCloseButton={false}
            >
                <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="relative w-52">
                            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select
                            value={String(pageLimit)}
                            onValueChange={(val) =>
                            {
                                setPageLimit(Number(val));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger size="sm" className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-auto flex-1 min-h-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead
                                        key={col.key}
                                        className={col.align === "right" ? "text-right cursor-pointer select-none" : "cursor-pointer select-none"}
                                        onClick={() => handleSort(col.key)}
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
                                            <span className="inline-flex shrink-0 items-center" style={{ opacity: sortBy === col.key ? 1 : 0.3 }}>
                                                {sortBy === col.key && sortDir === "desc"
                                                    ? <FiChevronDown size={12} />
                                                    : <FiChevronUp size={12} />
                                                }
                                            </span>
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="w-24 text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading
                                ? <TableLoading colSpan={colCount} />
                                : (
                                    <>
                                        {data.map((row, index) => (
                                            <TableRow key={String((row.code ?? row.id ?? index) as string | number)}>
                                                {columns.map((col) => (
                                                    <TableCell
                                                        key={col.key}
                                                        className={col.align === "right" ? "text-right" : ""}
                                                        style={col.key === "code" ? { fontWeight: 500 } : col.style}
                                                    >
                                                        {col.render
                                                            ? col.render(row[col.key], row)
                                                            : String(row[col.key] ?? "")
                                                        }
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center">
                                                    <Button
                                                        size="xs"
                                                        onClick={() => handleSelect(row)}
                                                    >
                                                        Select
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={colCount}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    {search ? emptySearch : emptyDefault}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )
                            }
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3 border-t">
                    <span className="text-sm text-muted-foreground">
                        {total} {itemName}{total !== 1 ? "s" : ""} - Page {page} of {resolvedTotalPages}
                    </span>
                    {shouldShowPagination && (
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon-xs" disabled={!canGoPrevious} onClick={() => setPage(1)}>
                                <FiChevronsLeft size={13} />
                            </Button>
                            <Button variant="outline" size="icon-xs" disabled={!canGoPrevious} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}>
                                <FiChevronLeft size={13} />
                            </Button>
                            {getPageNumbers(resolvedTotalPages).map((pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    variant={page === pageNumber ? "default" : "outline"}
                                    size="xs"
                                    onClick={() => setPage(pageNumber)}
                                >
                                    {pageNumber}
                                </Button>
                            ))}
                            <Button variant="outline" size="icon-xs" disabled={!canGoNext} onClick={() => setPage((currentPage) => currentPage + 1)}>
                                <FiChevronRight size={13} />
                            </Button>
                            <Button variant="outline" size="icon-xs" disabled={!canGoNext} onClick={() => setPage(resolvedTotalPages)}>
                                <FiChevronsRight size={13} />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end px-5 py-3 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
