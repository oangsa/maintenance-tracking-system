import React from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { TableLoading } from "../Loading";

interface IReportColumn<T = Record<string, unknown>>
{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    sortable?: boolean;
    render?: (value: unknown, row: T, filters?: unknown) => React.ReactNode;
    style?: React.CSSProperties;
}

interface IReportTableProps<T = Record<string, unknown>>
{
    columns: IReportColumn<T>[];
    data: T[];
    emptyMessage?: string;
    filters?: unknown;
    sortKey?: string;
    sortDir?: "asc" | "desc";
    onSort?: (key: string, dir: "asc" | "desc") => void;
    loading?: boolean;
}

interface ISortIconProps
{
    columnKey: string;
    sortable?: boolean;
    sortKey?: string;
    sortDir?: "asc" | "desc";
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

export default function ReportTable<T extends Record<string, unknown>>({
    columns,
    data,
    emptyMessage = "No data found.",
    filters,
    sortKey,
    sortDir,
    onSort,
    loading = false,
}: IReportTableProps<T>)
{
    const handleSort = (key: string, sortable?: boolean) =>
    {
        if (sortable === false || !onSort) return;
        if (sortKey === key)
        {
            onSort(key, sortDir === "asc" ? "desc" : "asc");
        }
        else
        {
            onSort(key, "asc");
        }
    };

    return (
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
                </tr>
            </thead>
            <tbody>
                {loading
                    ? <TableLoading colSpan={columns.length} />
                    : (
                        <>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map((col) => (
                                        <td key={col.key} className={col.align === "right" ? "text-right" : ""} style={col.style}>
                                            {col.render
                                                ? col.render(row[col.key], row, filters)
                                                : String(row[col.key] ?? "")
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="text-center p-4" style={{ color: "var(--text-muted)" }}>
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </>
                    )
                }
            </tbody>
        </table>
    );
}
