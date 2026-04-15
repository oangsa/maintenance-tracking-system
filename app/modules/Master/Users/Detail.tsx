import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import Loading from "~/components/Common/Loading";
import { ConfirmModal } from "~/components/Common/Modal";
import { deleteUser, getUserById } from "~/services/users.service";
import { formatDateTime, formatRoleLabel } from "./helpers";
import type { IUser } from "~/api/types";

interface IConfirmState
{
    isOpen: boolean;
}

interface IDetailField
{
    label: string;
    value: string;
}

export default function UserDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [user, setUser] = React.useState<IUser | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [pageError, setPageError] = React.useState("");
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    React.useEffect(() =>
    {
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
    }, [params.id]);

    async function confirmDelete()
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected user id is invalid.");
            return;
        }

        try
        {
            await deleteUser(parsedId);
            navigate("/master/users", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected user.");
        }
    }

    if (loading)
    {
        return <Loading message="Loading user..." />;
    }

    if (!user)
    {
        return (
            <div className="card">
                <div className="alert alert-error">{pageError || "User not found."}</div>
                <Link className="btn btn-outline" to="/master/users">
                    Back to Users
                </Link>
            </div>
        );
    }

    const detailFields: IDetailField[] = [
        { label: "Name", value: user.name ?? "-" },
        { label: "Email", value: user.email },
        { label: "Role", value: formatRoleLabel(user.role) },
        { label: "Department Code", value: user.departmentCode ?? "-" },
        { label: "Department Name", value: user.departmentName ?? "-" },
    ];

    const commonFields: IDetailField[] = [
        { label: "Created At", value: formatDateTime(user.createdAt) },
        { label: "Updated At", value: formatDateTime(user.updatedAt) },
        { label: "Created By", value: user.createdBy ?? "-" },
        { label: "Updated By", value: user.updatedBy ?? "-" },
    ];

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete"
                isOpen={confirmState.isOpen}
                message="Are you sure you want to delete this user?"
                onClose={() => setConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete User"
            />

            <div className="page-header">
                <div>
                    <h1 className="page-title">User Details</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Review the selected user and continue to edit or delete from the Master section.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link className="btn btn-outline" to="/master/users">
                        Back to Users
                    </Link>
                    <Link className="btn btn-outline" to={`/master/users/${user.id}/edit`}>
                        Edit User
                    </Link>
                    <button className="btn btn-danger" onClick={() => setConfirmState({ isOpen: true })} type="button">
                        Delete User
                    </button>
                </div>
            </div>

            {pageError && <div className="alert alert-error">{pageError}</div>}

            <div className="card">
                <div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            User Information
                        </p>
                        <div className="mt-4 grid gap-5 md:grid-cols-2">
                            {detailFields.map((field) => (
                                <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-4" key={field.label}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                        {field.label}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[var(--text-main)]">
                                        {field.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="my-6 h-px bg-[var(--border)]" />

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Common Information
                        </p>
                        <div className="mt-4 grid gap-5 md:grid-cols-2">
                            {commonFields.map((field) => (
                                <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-4" key={field.label}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                        {field.label}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[var(--text-main)]">
                                        {field.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
