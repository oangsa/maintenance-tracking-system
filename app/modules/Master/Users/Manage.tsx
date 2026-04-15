import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import Loading from "~/components/Common/Loading";
import { buttonVariants } from "~/components/ui/button";
import { createUser, getUserById, updateUser } from "~/services/users.service";
import UserForm from "./UserForm";
import {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyUserFormValues,
    mapUserToFormValues,
} from "./helpers";
import type { IUser } from "~/api/types";
import type { IUserFormValues } from "./helpers";

interface IManageUserPageProps
{
    mode: "create" | "edit";
}

function getPageCopy(mode: "create" | "edit")
{
    if (mode === "create")
    {
        return {
            description: "Add a new user in the Master section.",
            submitError: "Unable to create the user.",
            title: "Create User",
        };
    }

    return {
        description: "Update the selected user in the Master section.",
        submitError: "Unable to update the user.",
        title: "Edit User",
    };
}

export default function ManageUserPage({ mode }: IManageUserPageProps)
{
    const navigate = useNavigate();
    const params = useParams();
    const pageCopy = getPageCopy(mode);

    const [user, setUser] = React.useState<IUser | null>(null);
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
            setPageError("The requested user id is invalid.");
            return;
        }

        async function loadUser()
        {
            try
            {
                const response = await getUserById(parsedId);
                setUser(response);
            }
            catch (error)
            {
                setPageError((error as Error).message || "Unable to load the selected user.");
            }
            finally
            {
                setLoading(false);
            }
        }

        void loadUser();
    }, [mode, params.id]);

    async function handleSubmit(values: IUserFormValues)
    {
        setSubmitting(true);
        setPageError("");

        try
        {
            if (mode === "create")
            {
                await createUser(buildCreatePayload(values));
            }
            else
            {
                const parsedId = Number(params.id);

                if (!Number.isFinite(parsedId))
                {
                    throw new Error("The selected user id is invalid.");
                }

                await updateUser(parsedId, buildUpdatePayload(values));
            }

            navigate("/master/users", { replace: true });
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
        return <Loading message="Loading user..." />;
    }

    if (mode === "edit" && !user)
    {
        return (
            <div className="card">
                <div className="alert alert-error">{pageError || "User not found."}</div>
                <Link className={buttonVariants({ variant: "outline" })} to="/master/users">
                    Back to Users
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

                <Link className={buttonVariants({ variant: "outline" })} to="/master/users">
                    Back to Users
                </Link>
            </div>

            <UserForm
                error={pageError}
                initialValues={mode === "edit" && user ? mapUserToFormValues(user) : createEmptyUserFormValues()}
                mode={mode}
                onCancel={() => navigate("/master/users")}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </>
    );
}
