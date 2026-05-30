import React from "react";
import { XIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogOverlay,
    DialogPortal,
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

const DEFAULT_MIN_PERCENTAGE = 0.9;
const DEFAULT_MAX_PERCENTAGE = 2;

interface IModalPosition
{
    x: number;
    y: number;
}

interface IModalSize
{
    height: number;
    width: number;
}

interface IModalDragInteraction
{
    startMouseX: number;
    startMouseY: number;
    startPositionX: number;
    startPositionY: number;
    type: "drag";
}

interface IModalResizeInteraction
{
    handle: "se" | "sw" | "ne" | "nw";
    startHeight: number;
    startMouseX: number;
    startMouseY: number;
    startPositionX: number;
    startPositionY: number;
    startWidth: number;
    type: "resize";
}

type TModalInteraction = IModalDragInteraction | IModalResizeInteraction;

interface IModalProps
{
    children: React.ReactNode;
    contentClassName?: string;
    defaultHeight?: number;
    defaultWidth?: number;
    draggable?: boolean;
    footer?: React.ReactNode;
    isOpen: boolean;
    maxPercentage?: number;
    minPercentage?: number;
    onClose: () => void;
    resizable?: boolean;
    title?: string;
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

function clamp(value: number, minValue: number, maxValue: number): number
{
    return Math.min(Math.max(value, minValue), maxValue);
}

function getCenteredPosition(size: IModalSize): IModalPosition
{
    if (typeof window === "undefined")
    {
        return { x: 16, y: 16 };
    }

    return {
        x: Math.max(16, (window.innerWidth - size.width) / 2),
        y: Math.max(16, (window.innerHeight - size.height) / 2),
    };
}

export default function Modal({
    children,
    contentClassName,
    defaultHeight = 440,
    defaultWidth = 720,
    draggable = true,
    footer,
    isOpen,
    maxPercentage = DEFAULT_MAX_PERCENTAGE,
    minPercentage = DEFAULT_MIN_PERCENTAGE,
    onClose,
    resizable = true,
    title,
}: IModalProps)
{
    const [position, setPosition] = React.useState<IModalPosition>(() => getCenteredPosition({ height: defaultHeight, width: defaultWidth }));
    const [size, setSize] = React.useState<IModalSize>({
        height: defaultHeight,
        width: defaultWidth,
    });

    const interactionRef = React.useRef<TModalInteraction | null>(null);

    const minWidth = defaultWidth * minPercentage;
    const minHeight = defaultHeight * minPercentage;
    const maxWidth = defaultWidth * maxPercentage;
    const maxHeight = defaultHeight * maxPercentage;

    React.useEffect(() =>
    {
        if (!isOpen)
        {
            return;
        }

        const initialSize = {
            height: defaultHeight,
            width: defaultWidth,
        };

        setSize(initialSize);
        setPosition(getCenteredPosition(initialSize));
    }, [defaultHeight, defaultWidth, isOpen]);

    React.useEffect(() =>
    {
        if (!isOpen)
        {
            return;
        }

        function handleEscape(event: KeyboardEvent)
        {
            if (event.key === "Escape")
            {
                onClose();
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    React.useEffect(() =>
    {
        function handleMouseMove(event: MouseEvent)
        {
            const interaction = interactionRef.current;

            if (!interaction)
            {
                return;
            }

            if (interaction.type === "drag")
            {
                const deltaX = event.clientX - interaction.startMouseX;
                const deltaY = event.clientY - interaction.startMouseY;

                setPosition({
                    x: interaction.startPositionX + deltaX,
                    y: interaction.startPositionY + deltaY,
                });

                return;
            }

            const deltaX = event.clientX - interaction.startMouseX;
            const deltaY = event.clientY - interaction.startMouseY;

            let nextWidth = interaction.startWidth;
            let nextHeight = interaction.startHeight;
            let nextX = interaction.startPositionX;
            let nextY = interaction.startPositionY;

            if (interaction.handle.includes("e"))
            {
                nextWidth = interaction.startWidth + deltaX;
            }

            if (interaction.handle.includes("w"))
            {
                nextWidth = interaction.startWidth - deltaX;
            }

            if (interaction.handle.includes("s"))
            {
                nextHeight = interaction.startHeight + deltaY;
            }

            if (interaction.handle.includes("n"))
            {
                nextHeight = interaction.startHeight - deltaY;
            }

            const clampedWidth = clamp(nextWidth, minWidth, maxWidth);
            const clampedHeight = clamp(nextHeight, minHeight, maxHeight);

            if (interaction.handle.includes("w"))
            {
                nextX = interaction.startPositionX + (interaction.startWidth - clampedWidth);
            }

            if (interaction.handle.includes("n"))
            {
                nextY = interaction.startPositionY + (interaction.startHeight - clampedHeight);
            }

            setSize({
                height: clampedHeight,
                width: clampedWidth,
            });

            setPosition({
                x: nextX,
                y: nextY,
            });
        }

        function handleMouseUp()
        {
            interactionRef.current = null;
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () =>
        {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [maxHeight, maxWidth, minHeight, minWidth]);

    function handleDragStart(event: React.MouseEvent<HTMLDivElement>)
    {
        if (!draggable)
        {
            return;
        }

        const targetElement = event.target as HTMLElement | null;
        const shouldSkipDrag = Boolean(targetElement?.closest("[data-modal-no-drag='true']"));

        if (shouldSkipDrag)
        {
            return;
        }

        interactionRef.current = {
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            startPositionX: position.x,
            startPositionY: position.y,
            type: "drag",
        };
    }

    function handleResizeStart(event: React.MouseEvent<HTMLButtonElement>, handle: "se" | "sw" | "ne" | "nw")
    {
        if (!resizable)
        {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        interactionRef.current = {
            handle,
            startHeight: size.height,
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            startPositionX: position.x,
            startPositionY: position.y,
            startWidth: size.width,
            type: "resize",
        };
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            {isOpen && (
            <DialogPortal>
                <DialogOverlay onClick={onClose} />

                <div className="fixed inset-0 z-50 pointer-events-none">
                    <div
                        className={cn(
                            "pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10",
                            contentClassName,
                        )}
                        style={{
                            height: `${size.height}px`,
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            width: `${size.width}px`,
                        }}
                    >
                        <div
                            className={cn(
                                "flex items-center justify-between border-b px-6 py-4",
                                draggable ? "cursor-move select-none" : "",
                            )}
                            onMouseDown={handleDragStart}
                        >
                            <div className="font-heading leading-none font-medium">
                                {title}
                            </div>
                            <Button
                                data-modal-no-drag="true"
                                onClick={onClose}
                                onMouseDown={(event) =>
                                {
                                    event.stopPropagation();
                                }}
                                size="icon-sm"
                                type="button"
                                variant="ghost"
                            >
                                <XIcon />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
                            {children}
                        </div>

                        {footer && (
                            <div className="flex justify-end gap-2 border-t px-6 py-4">
                                {footer}
                            </div>
                        )}

                        {resizable && (
                            <>
                                <button className="absolute right-0 bottom-0 size-3 cursor-se-resize bg-transparent" onMouseDown={(event) => handleResizeStart(event, "se")} type="button" />
                                <button className="absolute bottom-0 left-0 size-3 cursor-sw-resize bg-transparent" onMouseDown={(event) => handleResizeStart(event, "sw")} type="button" />
                                <button className="absolute top-0 right-0 size-3 cursor-ne-resize bg-transparent" onMouseDown={(event) => handleResizeStart(event, "ne")} type="button" />
                                <button className="absolute top-0 left-0 size-3 cursor-nw-resize bg-transparent" onMouseDown={(event) => handleResizeStart(event, "nw")} type="button" />
                            </>
                        )}
                    </div>
                </div>
            </DialogPortal>
            )}
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
