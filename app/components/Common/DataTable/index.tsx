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
        <span style={{ marginLeft: 4, opacity: isActive ? 1 : 0.3 }}>
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

    const btnStyle: React.CSSProperties = {
        padding: "6px 10px",
        border: "1px solid var(--border)",
        background: "white",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: "0.85rem",
        outline: "none",
        color: "var(--text-main)",
        display: "inline-flex",
        alignItems: "center",
    };

    const btnActiveStyle: React.CSSProperties = {
        ...btnStyle,
        border: "1px solid var(--primary)",
        background: "var(--primary)",
        color: "white",
    };

    const btnDisabledStyle: React.CSSProperties = { ...btnStyle, opacity: 0.5, cursor: "not-allowed" };

    const handleBtnClick = (callback: () => void) => (e: React.MouseEvent<HTMLButtonElement>) =>
    {
        (e.target as HTMLButtonElement).blur();
        callback();
    };

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + data.length, total);
    const rangeLabel = loading
        ? "Loading..."
        : total === 0
            ? `0 ${itemName}`
            : data.length === 0
                ? `0 ${itemName}`
                : `${startIndex + 1}-${endIndex} of ${total} ${itemName}`;

    return (
        <div>
            <div className="page-header">
                <h3 className="page-title">{title}</h3>
                <Link to={`${basePath}/new`} className="btn btn-primary">
                    <FiPlus size={16} />
                    Create New
                </Link>
            </div>

            <div className="card">
                {error && <div className="alert alert-error">{error}</div>}

                <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ position: "relative", width: 280 }}>
                        <FiSearch
                            size={16}
                            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                        />
                        <input
                            type="text"
                            className="form-control"
                            placeholder={searchPlaceholder}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ paddingLeft: 36 }}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            {rangeLabel}
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="form-control form-control-compact"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>{size} / page</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={col.align === "right" ? "text-right" : ""}
                                        onClick={() => handleSort(col.key, col.sortable)}
                                        style={{ cursor: col.sortable !== false ? "pointer" : "default", userSelect: "none" }}
                                    >
                                        {col.label}
                                        <SortIcon columnKey={col.key} sortable={col.sortable} sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                ))}
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? <TableLoading colSpan={columns.length + 1} />
                                : (
                                    <>
                                        {data.map((item) =>
                                        {
                                            const keyVal = getItemKey(item);
                                            const pathSegment = typeof keyVal === "string" ? encodeURIComponent(keyVal) : keyVal;
                                            return (
                                                <tr key={keyVal}>
                                                    {columns.map((col, idx) => (
                                                        <td
                                                            key={col.key}
                                                            className={col.align === "right" ? "text-right" : ""}
                                                            style={col.style}
                                                        >
                                                            {idx === 0
                                                                ? (
                                                                    <Link to={`${basePath}/${pathSegment}`} style={{ fontWeight: 500, color: "var(--primary)" }}>
                                                                        {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? "")}
                                                                    </Link>
                                                                )
                                                                : (col.render ? col.render(item[col.key], item) : String(item[col.key] ?? ""))
                                                            }
                                                        </td>
                                                    ))}
                                                    <td className="text-right">
                                                        <Link
                                                            to={`${basePath}/${pathSegment}/edit`}
                                                            className="btn btn-outline"
                                                            style={{ fontSize: "0.7rem", padding: "4px 8px", marginRight: 8 }}
                                                        >
                                                            <FiEdit2 size={12} />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="btn btn-outline"
                                                            style={{ fontSize: "0.7rem", padding: "4px 8px", color: "#ef4444", borderColor: "#ef4444" }}
                                                        >
                                                            <FiTrash2 size={12} />
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {data.length === 0 && (
                                            <tr>
                                                <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                                                    {search
                                                        ? `No matching ${itemName} found.`
                                                        : (emptyMessage || `No ${itemName} found. Create one to get started.`)
                                                    }
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            }
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px" }}>
                        <button onClick={handleBtnClick(() => setCurrentPage(1))} disabled={currentPage === 1} style={currentPage === 1 ? btnDisabledStyle : btnStyle}>
                            <FiChevronsLeft size={14} />
                        </button>
                        <button onClick={handleBtnClick(() => setCurrentPage((p) => Math.max(1, p - 1)))} disabled={currentPage === 1} style={currentPage === 1 ? btnDisabledStyle : btnStyle}>
                            <FiChevronLeft size={14} />
                        </button>
                        {getPageNumbers().map((page) => (
                            <button key={page} onClick={handleBtnClick(() => setCurrentPage(page))} style={currentPage === page ? btnActiveStyle : btnStyle}>
                                {page}
                            </button>
                        ))}
                        <button onClick={handleBtnClick(() => setCurrentPage((p) => Math.min(totalPages, p + 1)))} disabled={currentPage === totalPages} style={currentPage === totalPages ? btnDisabledStyle : btnStyle}>
                            <FiChevronRight size={14} />
                        </button>
                        <button onClick={handleBtnClick(() => setCurrentPage(totalPages))} disabled={currentPage === totalPages} style={currentPage === totalPages ? btnDisabledStyle : btnStyle}>
                            <FiChevronsRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
