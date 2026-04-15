import React from "react";
import { createPortal } from "react-dom";
import { FiSearch, FiChevronUp, FiChevronDown, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from "react-icons/fi";
import { TableLoading } from "../Loading";

interface IPickerColumn<T = Record<string, unknown>>
{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
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
    const [loading, setLoading] = React.useState(false);
    const [searchInput, setSearchInput] = React.useState("");
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [sortBy, setSortBy] = React.useState(columns[0]?.key || "id");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = React.useState(10);

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
        fetchData({ search, page, limit: pageSize, sortBy, sortDir })
            .then((res) =>
            {
                if (cancelled) return;
                setData(res.data || []);
                setTotal(res.total || 0);
                setTotalPages(res.totalPages || 0);
            })
            .catch(() =>
            {
                if (!cancelled) setData([]);
            })
            .finally(() =>
            {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [isOpen, fetchData, search, page, pageSize, sortBy, sortDir]);

    const handleSelect = (row: T) =>
    {
        onSelect(row);
        onClose();
    };

    const getPageNumbers = () =>
    {
        const size = 5;
        let start = Math.max(1, page - Math.floor(size / 2));
        let end = Math.min(totalPages, start + size - 1);
        if (end - start + 1 < size) start = Math.max(1, end - size + 1);
        const pages: number[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const btnStyle: React.CSSProperties = { padding: "6px 10px", fontSize: "0.85rem", minWidth: 36 };
    const btnDisabledStyle: React.CSSProperties = { ...btnStyle, opacity: 0.5, cursor: "not-allowed" };
    const btnActiveStyle: React.CSSProperties = {
        ...btnStyle,
        background: "var(--primary)",
        color: "white",
        borderColor: "var(--primary)",
    };

    const colCount = columns.length + 1;

    if (!isOpen) return null;

    return createPortal(
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                padding: 24,
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--shadow-lg)",
                    maxWidth: 720,
                    width: "100%",
                    maxHeight: "85vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>{title}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ position: "relative", width: 240 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={searchPlaceholder}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                                <FiSearch
                                    size={16}
                                    style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                                />
                            </div>
                            <select
                                className="form-control form-control-compact"
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            >
                                {[10, 25, 50].map((n) => (
                                    <option key={n} value={n}>{n} / page</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
                    <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={col.align === "right" ? "text-right" : ""}
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                            onClick={() => handleSort(col.key)}
                                        >
                                            {col.label}
                                            <span style={{ marginLeft: 4, opacity: sortBy === col.key ? 1 : 0.3 }}>
                                                {sortBy === col.key && sortDir === "desc"
                                                    ? <FiChevronDown size={12} />
                                                    : <FiChevronUp size={12} />
                                                }
                                            </span>
                                        </th>
                                    ))}
                                    <th style={{ width: 100 }} className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading
                                    ? <TableLoading colSpan={colCount} />
                                    : (
                                        <>
                                            {data.map((row, index) => (
                                                <tr key={String((row.code ?? row.id ?? index) as string | number)}>
                                                    {columns.map((col) => (
                                                        <td
                                                            key={col.key}
                                                            className={col.align === "right" ? "text-right" : ""}
                                                            style={col.key === "code" ? { fontWeight: 500 } : col.style}
                                                        >
                                                            {col.render
                                                                ? col.render(row[col.key], row)
                                                                : String(row[col.key] ?? "")
                                                            }
                                                        </td>
                                                    ))}
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                                                            onClick={() => handleSelect(row)}
                                                        >
                                                            Select
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {data.length === 0 && (
                                                <tr>
                                                    <td colSpan={colCount} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                                                        {search ? emptySearch : emptyDefault}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        {total} {itemName}{total !== 1 ? "s" : ""} · Page {page} of {totalPages || 1}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button type="button" className="btn btn-outline" style={page <= 1 ? btnDisabledStyle : btnStyle} disabled={page <= 1} onClick={() => setPage(1)}>
                            <FiChevronsLeft size={14} />
                        </button>
                        <button type="button" className="btn btn-outline" style={page <= 1 ? btnDisabledStyle : btnStyle} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            <FiChevronLeft size={14} />
                        </button>
                        {totalPages > 0 && getPageNumbers().map((p) => (
                            <button key={p} type="button" className="btn btn-outline" style={page === p ? btnActiveStyle : btnStyle} onClick={() => setPage(p)}>{p}</button>
                        ))}
                        <button type="button" className="btn btn-outline" style={page >= totalPages ? btnDisabledStyle : btnStyle} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                            <FiChevronRight size={14} />
                        </button>
                        <button type="button" className="btn btn-outline" style={page >= totalPages ? btnDisabledStyle : btnStyle} disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
                            <FiChevronsRight size={14} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
