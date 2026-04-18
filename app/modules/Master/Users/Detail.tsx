import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import Loading from "~/components/Common/Loading";
import { ConfirmModal } from "~/components/Common/Modal";
import DetailSections, { type IDetailSection } from "~/components/Common/DetailSections";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { deleteUser, getUserById } from "~/services/users.service";
import { formatRoleLabel } from "./helpers";
import type { IUser } from "~/api/types";
import { cn } from "~/lib/utils";

interface IConfirmState
{
    isOpen: boolean;
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
                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/master/users">
                    Back to Users
                </Link>
            </div>
        );
    }

    const detailSections: IDetailSection[] = [
        {
            title: "User Information",
            fields: [
                { label: "Name", value: user.name ?? "-" },
                { label: "Email", value: user.email },
                { label: "Role", value: formatRoleLabel(user.role) },
                { label: "Department Code", value: user.departmentCode ?? "-" },
                { label: "Department Name", value: user.departmentName ?? "-" },
            ],
        },
        {
            title: "Common Information",
            fields: [
                { label: "Created At", value: formatDateTime(user.createdAt) },
                { label: "Updated At", value: formatDateTime(user.updatedAt) },
                { label: "Created By", value: user.createdBy ?? "-" },
                { label: "Updated By", value: user.updatedBy ?? "-" },
            ],
        },
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
                    <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/master/users">
                        Back to Users
                    </Link>
                    <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/master/users/${user.id}/edit`}>
                        Edit User
                    </Link>
                    <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                        Delete User
                    </Button>
                </div>
            </div>

            {pageError && <div className="alert alert-error">{pageError}</div>}

            <DetailSections sections={detailSections} />
        </>
    );
}
