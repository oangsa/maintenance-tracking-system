import React from "react";
import Modal from "~/components/Common/Modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

export interface IModalColumn<TRow = object>
{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    render?: (value: unknown, row: TRow) => React.ReactNode;
}

interface ITableModalProps<TRow = object>
{
    columns: IModalColumn<TRow>[];
    data: TRow[];
    emptyMessage?: string;
    error?: string;
    isLoading?: boolean;
    isOpen: boolean;
    loadingMessage?: string;
    onClose: () => void;
    title: string;
    description?: React.ReactNode;
}

export default function TableModal<TRow extends object>({
    columns,
    data,
    emptyMessage = "No data found.",
    error,
    isLoading = false,
    isOpen,
    loadingMessage = "Loading...",
    onClose,
    title,
    description,
}: ITableModalProps<TRow>)
{
    return (
        <Modal
            defaultHeight={620}
            defaultWidth={1200}
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="space-y-3">
                {description && (
                    <div className="text-sm text-muted-foreground">
                        {description}
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                {isLoading
                    ? <div className="text-sm text-muted-foreground">{loadingMessage}</div>
                    : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead
                                            className={column.align === "right" ? "text-right" : ""}
                                            key={column.key}
                                        >
                                            {column.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 && (
                                    <TableRow>
                                        <TableCell className="text-muted-foreground" colSpan={columns.length}>
                                            {emptyMessage}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {data.map((row, index) =>
                                {
                                    const rowValueRecord = row as Record<string, unknown>;
                                    const rowKey = rowValueRecord.id ?? rowValueRecord.code ?? index;

                                    return (
                                        <TableRow key={String(rowKey as string | number)}>
                                            {columns.map((column) => (
                                                <TableCell
                                                    className={column.align === "right" ? "text-right" : ""}
                                                    key={column.key}
                                                >
                                                    {column.render
                                                        ? column.render(rowValueRecord[column.key], row)
                                                        : String(rowValueRecord[column.key] ?? "")
                                                    }
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )
                }
            </div>
        </Modal>
    );
}
