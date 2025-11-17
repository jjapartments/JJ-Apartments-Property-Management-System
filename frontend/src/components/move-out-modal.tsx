"use client";

import { useState, useEffect } from "react";
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
    moveInDate?: string; 
};

export function MoveOutModal({
    open,
    title = "Confirm Move Out",
    message,
    onCancel,
    onConfirm,
    error,
    moveInDate,
}: MoveOutModalProps) {

    const [moveOutDate, setMoveOutDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [validationError, setValidationError] = useState<string>("");

    // Reset validation error when modal opens/closes
    useEffect(() => {
        if (open) {
            setValidationError("");
            setMoveOutDate(new Date().toISOString().split("T")[0]);
        }
    }, [open]);

    // Validate move-out date against move-in date
    const validateDates = (moveOut: string): boolean => {
        if (!moveInDate) return true;

        const moveInDateObj = new Date(moveInDate);
        const moveOutDateObj = new Date(moveOut);

        if (moveOutDateObj < moveInDateObj) {
            setValidationError("Move-out date cannot be before move-in date");
            return false;
        }

        setValidationError("");
        return true;
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setMoveOutDate(newDate);
        validateDates(newDate);
    };

    const handleConfirm = () => {
        if (validateDates(moveOutDate)) {
            onConfirm(moveOutDate);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <hr className="border-t border-gray-200" />

                <p>{message}</p>

                {moveInDate && (
                    <p className="text-sm text-gray-600">
                        Move-in date: {new Date(moveInDate).toLocaleDateString()}
                    </p>
                )}

                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Move-out Date
                        <span className="text-red-500"> *</span>
                    </label>
                    <input
                        type="date"
                        value={moveOutDate}
                        onChange={handleDateChange}
                        min={moveInDate} 
                        className="w-full px-4 py-3 border rounded-lg transition-colors bg-white border-gray-400 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                        required
                    />
                </div>

                <hr className="border-t border-gray-200 mt-2" />

                <DialogFooter className="w-full flex items-center justify-between gap-4">
                    {/* LEFT — Error message */}
                    <div className="flex-1">
                        {(validationError || error) && (
                            <p className="text-sm text-red-500">
                                {validationError || error}
                            </p>
                        )}
                    </div>

                    {/* RIGHT — Buttons */}
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleConfirm}
                            disabled={!!validationError}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}