import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import Loading from "~/components/Common/Loading";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
    createDepartment,
    getDepartmentById,
    updateDepartment,
} from "~/services/departments.service";
import DepartmentForm from "./DepartmentForm";
import {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyDepartmentFormValues,
    mapDepartmentToFormValues,
} from "./helpers";
import type { IDepartment } from "~/api/types";
import type { IDepartmentFormValues } from "./helpers";

interface IManageDepartmentPageProps
{
    mode: "create" | "edit";
}

function getPageCopy(mode: "create" | "edit")
{
    if (mode === "create")
    {
        return {
            description: "Add a new department in the Master section.",
            submitError: "Unable to create the department.",
            title: "Create Department",
        };
    }

    return {
        description: "Update the selected department in the Master section.",
        submitError: "Unable to update the department.",
        title: "Edit Department",
    };
}

export default function ManageDepartmentPage({ mode }: IManageDepartmentPageProps)
{
    const navigate = useNavigate();
    const params = useParams();
    const pageCopy = getPageCopy(mode);

    const [department, setDepartment] = React.useState<IDepartment | null>(null);
    const [loading, setLoading] = React.useState(mode === "edit");
    const [submitting, setSubmitting] = React.useState(false);
    const [pageError, setPageError] = React.useState("");

    React.useEffect(() =>
    {
        if (mode !== "edit")
        {
            return;
        }

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
    }, [mode, params.id]);

    async function handleSubmit(values: IDepartmentFormValues)
    {
        setSubmitting(true);
        setPageError("");

        try
        {
            if (mode === "create")
            {
                await createDepartment(buildCreatePayload(values));
            }
            else
            {
                const parsedId = Number(params.id);

                if (!Number.isFinite(parsedId))
                {
                    throw new Error("The selected department id is invalid.");
                }

                await updateDepartment(parsedId, buildUpdatePayload(values));
            }

            navigate("/master/departments", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || pageCopy.submitError);
        }
        finally
        {
            setSubmitting(false);
        }
    }

    if (loading)
    {
        return <Loading message="Loading department..." />;
    }

    if (mode === "edit" && !department)
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

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{pageCopy.title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {pageCopy.description}
                    </p>
                </div>

                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/master/departments">
                    Back to Departments
                </Link>
            </div>

            <DepartmentForm
                error={pageError}
                initialValues={mode === "edit" && department ? mapDepartmentToFormValues(department) : createEmptyDepartmentFormValues()}
                mode={mode}
                onCancel={() => navigate("/master/departments")}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </>
    );
}