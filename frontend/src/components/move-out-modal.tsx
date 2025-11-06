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
    error?: string;
};

export function MoveOutModal({
    open,
    title = "Confirm Delete",
    message,
    onCancel,
    onConfirm,
    error,
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
                    required
                />

                <hr className="border-t border-gray-200 mt-2" />

                <DialogFooter className="w-full flex items-center justify-between gap-4">
                    {/* LEFT — Error message */}
                    <div className="flex-1">
                        {error && (
                            <p className="text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* RIGHT — Buttons */}
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm}>Confirm</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}