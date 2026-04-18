import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { cn } from "~/lib/utils";
import { deleteDepartment, getDepartmentById } from "~/services/departments.service";
import type { IDetailSection } from "~/components/Common/DetailSections";

interface IConfirmState
{
    isOpen: boolean;
}

export default function DepartmentDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [pageError, setPageError] = React.useState("");
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    async function confirmDelete()
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected department id is invalid.");
            return;
        }

        try
        {
            await deleteDepartment(parsedId);
            navigate("/master/departments", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected department.");
        }
    }

    async function ActionButtons(department)
    {
        return (
             <>
                <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/master/departments/${department.id}/edit`}>
                    Edit Department
                </Link>
                <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete Department
                </Button>
            </>
        )
    }

    function sectionBuilder(department): IDetailSection[]
    {
        return [
            {
                title: "Department Information",
                fields: [
                    { label: "Code", value: department.code ?? "-" },
                    { label: "Name", value: department.name ?? "-" },
                ],
            },
            {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(department.createdAt) },
                    { label: "Updated At", value: formatDateTime(department.updatedAt) },
                    { label: "Created By", value: department.createdBy ?? "-" },
                    { label: "Updated By", value: department.updatedBy ?? "-" },
                ],
            },
        ]
    }


    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete"
                isOpen={confirmState.isOpen}
                message="Are you sure you want to delete this department?"
                onClose={() => setConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Department"
            />

            <Detail
                actions={ActionButtons}
                backHref="/master/departments"
                backLabel="Back to Departments"
                buildSections={sectionBuilder}
                description="Review the selected department and continue to edit or delete from the Master section."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested department id is invalid."
                loadData={getDepartmentById}
                loadErrorMessage="Unable to load the selected department."
                loadingMessage="Loading department..."
                notFoundMessage="Department not found."
                title="Department Details"
            />
        </>
    );
}
