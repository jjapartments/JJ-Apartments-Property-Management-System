"use client";

import React, { useState } from "react";
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
};

export function TicketDetail({ open, ticket, onClose, currentUser }: TicketModalProps) {
    const [status, setStatus] = useState(ticket.status);
    const [showConfirm, setShowConfirm] = useState(false);

    if (!ticket) return null;

    const reqNum = `REQ-${ticket.id.toString().padStart(6, "0")}`;
    

    const hasUnsavedChanges = status !== ticket.status;

    const handleSaveClick = () => {
        if (hasUnsavedChanges) {
            setShowConfirm(true);
        }
    };

    const handleConfirmStatusChange = () => {
        console.log("Status updated to:", status);
        ticket.status = status;
        ticket.statusUpdatedAt = new Date();
        ticket.statusUpdatedBy = currentUser;

        const payload = {
            ...ticket, 
            statusUpdatedAt: new Date(), 
            statusUpdatedBy: currentUser || "Unknown User",
        };
        console.log("Updating ticket with payload:", payload);

        // API call here

        setShowConfirm(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold">
                            {reqNum}: {ticket.subject}
                        </DialogTitle>
                        <div className="flex gap-8 text-gray-600 text-sm">
                            <div>
                                {ticket.unitNumber} - {ticket.apartmentName}
                            </div>
                            <div>{ticket.submittedAt.toLocaleString()}</div>
                        </div>
                    </DialogHeader>

                    <hr className="border-t border-gray-200 my-2" />

                    {/* Body */}
                    <div className="bg-white border rounded-xl p-4 text-gray-800">
                        {ticket.body}
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h3 className="text-sm font-semibold mt-5 mb-2">
                            Sender Contact Details
                        </h3>
                        <div className="bg-gray-50 border rounded-xl p-4 text-gray-800 text-sm space-y-1">
                            <p>
                                <strong>Name: </strong> {ticket.name}
                            </p>
                            <p>
                                <strong>Phone: </strong> {ticket.phoneNumber}
                            </p>
                            <p>
                                <strong>Email: </strong> {ticket.email || "N/A"}
                            </p>
                            <p>
                                <strong>Messenger / Facebook Link: </strong>
                                {ticket.messengerLink ? (
                                    <a
                                        href={ticket.messengerLink}
                                        className="text-blue-600 underline"
                                        target="_blank"
                                    >
                                        {ticket.messengerLink}
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
                                    {ticket.statusUpdatedBy || "No update yet."}
                                </p>
                                <p>
                                    {ticket.statusUpdatedAt.toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Status Dropdown + Save */}
                        <div className="flex items-start gap-3">
                            <div className="flex flex-col">
                                <Select
                                    value={status}
                                    onValueChange={(value) => setStatus(value)}
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
