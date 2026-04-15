import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface IModalProps
{
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

interface IConfirmModalProps
{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary";
    closeOnConfirm?: boolean;
}

interface IAlertModalProps
{
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string | React.ReactNode;
    buttonText?: string;
}

export default function Modal({ isOpen, onClose, title, children, footer }: IModalProps)
{
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-lg" showCloseButton>
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                )}
                <div>{children}</div>
                {footer && (
                    <DialogFooter>
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    closeOnConfirm = true,
}: IConfirmModalProps)
{
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <AlertDialogContent size="sm">
                {title && (
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </AlertDialogHeader>
                )}
                <AlertDialogDescription>{message}</AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        variant={variant === "danger" ? "destructive" : "default"}
                        onClick={() =>
                        {
                            onConfirm();
                            if (closeOnConfirm) onClose();
                        }}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function AlertModal({ isOpen, onClose, title, message, buttonText = "OK" }: IAlertModalProps)
{
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <AlertDialogContent size="sm">
                {title && (
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </AlertDialogHeader>
                )}
                <AlertDialogDescription>
                    {message}
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>{buttonText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
