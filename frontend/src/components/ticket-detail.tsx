"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusConfirmModal } from "./status-confirm";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useDataRefresh } from "@/contexts/DataContext";

type Ticket = {
    id: number;
    unitNumber: string;
    apartmentName: string;
    name: string;
    phoneNumber: string;
    email: string | null;
    messengerLink: string | null;
    category: string;
    subject: string;
    body: string;
    status: string;
    submittedAt: Date;
    statusUpdatedAt: Date;
    statusUpdatedBy: string | null;
};

type TicketModalProps = {
    open: boolean;
    ticket: Ticket;
    onClose: () => void;
    currentUser: string;
    onTicketUpdated: (ticket: Ticket) => void;
};

export function TicketDetail({
    open,
    ticket,
    onClose,
    currentUser,
    onTicketUpdated,
}: TicketModalProps) {
    const [status, setStatus] = useState(ticket.status);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const { triggerRefresh } = useDataRefresh();

    const [currTicket, setCurrTicket] = useState(ticket);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const reqNum = `REQ-${ticket.id.toString().padStart(6, "0")}`;

    useEffect(() => {
        if (open) {
            setStatus(ticket.status);
            setCurrTicket(ticket);
            setHasUnsavedChanges(false);
        }
    }, [open, ticket]);

    const handleSaveClick = () => {
        if (hasUnsavedChanges) {
            setShowConfirm(true);
        }
    };

    const handleConfirmStatusChange = async () => {
        if (!currentUser) {
            alert("Please log in first.");
            router.replace("/admin-portal/dashboard");
            return;
        }

        console.log("Status updated to:", status);

        const payload = {
            status: status,
            statusUpdatedAt: new Date().toISOString(),
            statusUpdatedBy: currentUser,
        };

        console.log("Sending payload:", payload);

        try {
            const response = await api.patch(
                `/api/tickets/${ticket.id}/status`,
                payload
            );

            console.log("Status updated:", response);
            alert("Status updated successfully!");

            setCurrTicket(response);
            setStatus(status);

            triggerRefresh();
            onTicketUpdated?.(response);

            setShowConfirm(false);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("Error updating ticket status:", error);

            if (error instanceof ApiError) {
                const status = error.status;
                const message = error.message || "Something went wrong.";

                alert(`Error ${status}: ${message}`);
            } else if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("An unknown error occurred while updating the status.");
            }
        }
    };

    if (!ticket) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold">
                            {reqNum}: {currTicket.subject}
                        </DialogTitle>
                        <div className="flex gap-8 text-gray-600 text-sm">
                            <div>
                                {currTicket.unitNumber} -{" "}
                                {currTicket.apartmentName}
                            </div>
                            <div>{currTicket.submittedAt.toLocaleString()}</div>
                        </div>
                    </DialogHeader>

                    <hr className="border-t border-gray-200 my-2" />

                    {/* Body */}
                    <div className="bg-white border rounded-xl p-4 text-gray-800">
                        {currTicket.body}
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h3 className="text-sm font-semibold mt-5 mb-2">
                            Sender Contact Details
                        </h3>
                        <div className="bg-gray-50 border rounded-xl p-4 text-gray-800 text-sm space-y-1">
                            <p>
                                <strong>Name: </strong> {currTicket.name}
                            </p>
                            <p>
                                <strong>Phone: </strong>{" "}
                                {currTicket.phoneNumber}
                            </p>
                            <p>
                                <strong>Email: </strong>{" "}
                                {currTicket.email || "N/A"}
                            </p>
                            <p>
                                <strong>Messenger / Facebook Link: </strong>
                                {currTicket.messengerLink ? (
                                    <a
                                        href={currTicket.messengerLink}
                                        className="text-blue-600 underline"
                                        target="_blank"
                                    >
                                        {currTicket.messengerLink}
                                    </a>
                                ) : (
                                    "N/A"
                                )}
                            </p>
                        </div>
                    </div>

                    <hr className="border-t border-gray-200 my-2" />

                    {/* Last updated + Status */}
                    <div className="flex justify-between items-start text-sm text-gray-600 mb-1">
                        <div>
                            <p className="font-semibold">Last updated by:</p>
                            <div className="flex gap-8 text-gray-600 text-sm">
                                <p>
                                    {currTicket.statusUpdatedBy ||
                                        "No update yet."}
                                </p>
                                <p>
                                    {new Date(
                                        currTicket.statusUpdatedAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Status Dropdown + Save */}
                        <div className="flex items-start gap-3">
                            <div className="flex flex-col">
                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        setStatus(value);
                                        setHasUnsavedChanges(true);
                                    }}
                                >
                                    <SelectTrigger className="min-w-[180px] rounded-md border border-gray-300 px-3 py-2 text-sm">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="In Progress">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="Resolved">
                                            Resolved
                                        </SelectItem>
                                        <SelectItem value="Closed">
                                            Closed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {hasUnsavedChanges && (
                                    <span className="text-red-500 text-xs mb-1 mt-2">
                                        You have unsaved changes
                                    </span>
                                )}
                            </div>

                            <Button
                                className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg px-6"
                                onClick={handleSaveClick}
                                disabled={!hasUnsavedChanges}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Status Confirmation Modal */}
            <StatusConfirmModal
                open={showConfirm}
                currentStatus={ticket.status}
                newStatus={status}
                onCancel={() => setShowConfirm(false)}
                onConfirm={handleConfirmStatusChange}
            />
        </>
    );
}
