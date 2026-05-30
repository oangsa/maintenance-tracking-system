import React from "react";
import ListPickerModal, { type IFetchParams, type IFetchResult, type IPickerColumn } from "~/components/Common/ListPickerModal";
import Modal from "~/components/Common/Modal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatTitleCase } from "~/lib/formatters";
import type { IWorkTaskAssignment } from "~/api/types/types";
import type { IWorkTaskAssigneeCandidate } from "../hooks/useWorkTaskAssignment";

interface IAssignmentModalProps
{
    currentAssignee: IWorkTaskAssignment | null;
    currentUserId: number | null;
    fetchAssigneeOptions: (params: IFetchParams) => Promise<IFetchResult<IWorkTaskAssigneeCandidate>>;
    isDepartmentResolved: boolean;
    isOpen: boolean;
    isSubmitting: boolean;
    mode: "assign" | "reassign";
    onClose: () => void;
    onSubmit: (assigneeId: number) => Promise<void>;
    submitError?: string;
}

const assigneeColumns: IPickerColumn<IWorkTaskAssigneeCandidate>[] = [
    {
        key: "name",
        label: "Name",
        render: (_value: unknown, row: IWorkTaskAssigneeCandidate) => row.name?.trim() || "-",
    },
    {
        key: "email",
        label: "Email",
    },
    {
        key: "role",
        label: "Role",
        render: (_value: unknown, row: IWorkTaskAssigneeCandidate) => formatTitleCase(row.role),
    },
    {
        key: "departmentName",
        label: "Department",
        render: (_value: unknown, row: IWorkTaskAssigneeCandidate) => row.departmentName || "-",
    },
];

function renderAssigneeLabel(assignee: IWorkTaskAssigneeCandidate | null): string
{
    if (!assignee)
    {
        return "Not selected";
    }

    const name = assignee.name?.trim() || "Unnamed User";

    return `${name} (${assignee.email})`;
}

export default function AssignmentModal({
    currentAssignee,
    currentUserId,
    fetchAssigneeOptions,
    isDepartmentResolved,
    isOpen,
    isSubmitting,
    mode,
    onClose,
    onSubmit,
    submitError,
}: IAssignmentModalProps)
{
    const [isPickerOpen, setIsPickerOpen] = React.useState(false);
    const [selectedAssignee, setSelectedAssignee] = React.useState<IWorkTaskAssigneeCandidate | null>(null);
    const [localError, setLocalError] = React.useState("");

    React.useEffect(() =>
    {
        if (!isOpen)
        {
            setIsPickerOpen(false);
            setSelectedAssignee(null);
            setLocalError("");
        }
    }, [isOpen]);

    const isSelfAssignment = Number(currentUserId) > 0 && selectedAssignee?.id === currentUserId;

    async function handleSubmit()
    {
        if (!selectedAssignee)
        {
            setLocalError("Please select a technician before submitting.");

            return;
        }

        setLocalError("");

        try
        {
            await onSubmit(selectedAssignee.id);
            onClose();
        }
        catch (error)
        {
            setLocalError((error as Error).message || "Unable to submit assignment.");
        }
    }

    const footer = (
        <>
            <Button disabled={isSubmitting} onClick={onClose} type="button" variant="outline">
                Cancel
            </Button>
            <Button
                disabled={!selectedAssignee || isSubmitting || !isDepartmentResolved}
                onClick={handleSubmit}
                type="button"
                variant="default"
            >
                {isSubmitting ? "Saving..." : mode === "reassign" ? "Confirm Reassignment" : "Assign Technician"}
            </Button>
        </>
    );

    return (
        <>
            <Modal
                footer={footer}
                isOpen={isOpen}
                onClose={onClose}
                title={mode === "reassign" ? "Reassign Technician" : "Assign Technician"}
            >
                <div className="space-y-4">
                    <div className="rounded-md border bg-muted/40 p-3">
                        <div className="text-sm font-medium">Current Responsible Person</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            {currentAssignee?.assigneeName || currentAssignee?.assigneeEmail
                                ? `${currentAssignee.assigneeName || "Unnamed User"} (${currentAssignee.assigneeEmail || "No email"})`
                                : "No active assignee"
                            }
                        </div>
                    </div>

                    {mode === "reassign" && (
                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                            Reassigning this task will close the current active assignment and transfer responsibility.
                        </div>
                    )}

                    {!isDepartmentResolved && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            Unable to resolve department for this work order item. Assignment is temporarily unavailable.
                        </div>
                    )}

                    <div className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <div className="text-sm font-medium">Selected Technician</div>
                                <div className="mt-1 text-sm text-muted-foreground">{renderAssigneeLabel(selectedAssignee)}</div>
                            </div>
                            <Button
                                disabled={!isDepartmentResolved}
                                onClick={() => setIsPickerOpen(true)}
                                type="button"
                                variant="outline"
                            >
                                Choose Technician
                            </Button>
                        </div>

                        {isSelfAssignment && (
                            <div className="mt-2">
                                <Badge variant="secondary">Self Assignment</Badge>
                            </div>
                        )}
                    </div>

                    {(localError || submitError) && (
                        <div className="alert alert-error">{localError || submitError}</div>
                    )}
                </div>
            </Modal>

            <ListPickerModal<IWorkTaskAssigneeCandidate>
                columns={assigneeColumns}
                emptyDefault="No eligible technicians were found for this department."
                emptySearch="No technicians matched your search."
                fetchData={fetchAssigneeOptions}
                isOpen={isPickerOpen}
                itemName="technician"
                onClose={() => setIsPickerOpen(false)}
                onSelect={(assignee) =>
                {
                    setSelectedAssignee(assignee);
                    setLocalError("");
                }}
                searchPlaceholder="Search by name or email"
                title="Select Technician"
            />
        </>
    );
}
