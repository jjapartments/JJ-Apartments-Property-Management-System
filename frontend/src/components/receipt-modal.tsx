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
import { AlertCircle } from "lucide-react";

type ReceiptModalProps = {
    open: boolean;
    requestId: string;
    timestamp: string;
    onClose: () => void;
};

export function ReceiptModal({
    open,
    requestId,
    timestamp,
    onClose,
}: ReceiptModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request Submitted!</DialogTitle>
                </DialogHeader>

                <hr className="border-t border-gray-200" />

                <div>
                    <p className="text-m">
                        Success! Your request has been submitted.
                    </p>
                    <p className="mt-4">
                        <span className="font-semibold">Reference:</span>{" "}
                        {`REQ-${requestId.toString().padStart(6, "0")}`}
                    </p>
                    <p>
                        <span className="font-semibold">Timestamp:</span>{" "}
                        {timestamp}
                    </p>
                    <div className="bg-gray-100 p-3 rounded-md mt-10 flex items-center gap-2">
                        <AlertCircle className="text-yellow-800 w-5 h-5" />
                        <p className="text-yellow-800 text-[0.875rem] font-medium">
                            Please screenshot this dialog for reference.
                        </p>
                    </div>
                </div>

                <hr className="border-t mt-1 border-gray-200" />

                <DialogFooter className="flex justify-end">
                    <Button
                        className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg px-4 py-2"
                        onClick={onClose}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
