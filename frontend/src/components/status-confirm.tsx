"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type StatusConfirmModalProps = {
    open: boolean;
    currentStatus: string;
    newStatus: string;
    onCancel: () => void;
    onConfirm: () => void;
};

export function StatusConfirmModal({
    open,
    currentStatus,
    newStatus,
    onCancel,
    onConfirm,
}: StatusConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Status Change</DialogTitle>
                </DialogHeader>

                <hr className="border-t border-gray-200" />

                <p>
                    Are you sure you want to change the status from{" "}
                    <strong>{currentStatus}</strong> to{" "}
                    <strong>{newStatus}</strong>?
                </p>

                <hr className="border-t border-gray-200" />

                <DialogFooter>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm}>Yes, Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
