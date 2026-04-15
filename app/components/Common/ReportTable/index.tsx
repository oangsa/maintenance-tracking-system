import React from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { TableLoading } from "../Loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

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
        <span className="ml-1" style={{ opacity: isActive ? 1 : 0.3 }}>
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
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading
                    ? <TableLoading colSpan={columns.length} />
                    : (
                        <>
                            {data.map((row, idx) => (
                                <TableRow key={idx}>
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.key}
                                            className={col.align === "right" ? "text-right" : ""}
                                            style={col.style}
                                        >
                                            {col.render
                                                ? col.render(row[col.key], row, filters)
                                                : String(row[col.key] ?? "")
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </>
                    )
                }
            </TableBody>
        </Table>
    );
}
