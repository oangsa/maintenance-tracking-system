import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import DetailSections, { type IDetailSection } from "~/components/Common/DetailSections";
import Loading from "~/components/Common/Loading";
import { ConfirmModal } from "~/components/Common/Modal";
import { buttonVariants, Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { deleteDepartment, getDepartmentById } from "~/services/departments.service";
import { formatDateTime } from "./helpers";
import type { IDepartment } from "~/api/types";

interface IConfirmState
{
    isOpen: boolean;
}

export default function DepartmentDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [department, setDepartment] = React.useState<IDepartment | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [pageError, setPageError] = React.useState("");
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    React.useEffect(() =>
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setLoading(false);
            setPageError("The requested department id is invalid.");
            return;
        }

        async function loadDepartment()
        {
            try
            {
                const response = await getDepartmentById(parsedId);
                setDepartment(response);
            }
            catch (error)
            {
                setPageError((error as Error).message || "Unable to load the selected department.");
            }
            finally
            {
                setLoading(false);
            }
        }

        void loadDepartment();
    }, [params.id]);

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

    if (loading)
    {
        return <Loading message="Loading department..." />;
    }

    if (!department)
    {
        return (
            <div className="card">
                <div className="alert alert-error">{pageError || "Department not found."}</div>
                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/master/departments">
                    Back to Departments
                </Link>
            </div>
        );
    }

    const detailSections: IDetailSection[] = [
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
    ];

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

            <div className="page-header">
                <div>
                    <h1 className="page-title">Department Details</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Review the selected department and continue to edit or delete from the Master section.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/master/departments">
                        Back to Departments
                    </Link>
                    <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/master/departments/${department.id}/edit`}>
                        Edit Department
                    </Link>
                    <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                        Delete Department
                    </Button>
                </div>
            </div>

            {pageError && <div className="alert alert-error">{pageError}</div>}

            <DetailSections sections={detailSections} />
        </>
    );
}
