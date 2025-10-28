"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";

type MoveOutModalProps = {
    open: boolean;
    title?: string;
    message: string;
    onCancel: () => void;
    onConfirm: (moveOutDate: string) => void;
};

export function MoveOutModal({
    open,
    title = "Confirm Delete",
    message = "Are you sure you want to delete this record?",
    onCancel,
    onConfirm,
}: MoveOutModalProps) {
    const [moveOutDate, setMoveOutDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );

    const handleConfirm = () => {
        onConfirm(moveOutDate);
    };

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <hr className="border-t border-gray-200" />
                <p>{message}</p>
                <InputField
                    isEditing={true}
                    label="Move-out Date"
                    type="date"
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    required={true}
                />
                <hr className="border-t border-gray-200" />
                <DialogFooter>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
