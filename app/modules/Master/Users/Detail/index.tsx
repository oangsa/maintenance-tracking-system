import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import type { IUser } from "~/api/types/types";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { deleteUser, getUserById } from "~/services/users.service";
import { formatRoleLabel } from "../hooks/helpers";
import { cn } from "~/lib/utils";

interface IConfirmState
{
    isOpen: boolean;
}

export default function UserDetailPage()
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

    function ActionButtons(user: IUser)
    {
        return (
            <>
                <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/master/users/${user.id}/edit`}>
                    Edit User
                </Link>
                <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete User
                </Button>
            </>
        );
    }

    function sectionBuilder(user: IUser): IDetailSection[]
    {
        return [
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
            }
        ];
    }

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

            <Detail
                actions={ActionButtons}
                backHref="/master/users"
                backLabel="Back to Users"
                buildSections={sectionBuilder}
                description="Review the selected user and continue to edit or delete from the Master section."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested user id is invalid."
                loadData={getUserById}
                loadErrorMessage="Unable to load the selected user."
                loadingMessage="Loading user..."
                notFoundMessage="User not found."
                title="User Details"
            />
        </>
    );
}
