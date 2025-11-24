'use client';

import React, { useEffect, useRef, useState } from "react";
import { TicketDetail } from "./ticket-detail";
import { useAuth } from '@/hooks/useAuth';

type Ticket = {
    id: number;
    unitNumber: string;
    apartmentName: string;
    name: string;
    phoneNumber: string;
    email: string;
    messengerLink: string;
    category: string;
    subject: string;
    body: string;
    status: string;
    submittedAt: Date;
    statusUpdatedAt: Date;
    statusUpdatedBy: string;
};

export function TicketList() {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const { username: currentUser } = useAuth();

    // Sample Data
    const now = new Date();
    const tickets = [
        {
            id: 1,
            unitNumber: "Unit A",
            apartmentName: "Maple Residences",
            name: "Ben Grimm",
            phoneNumber: "09482930129",
            email: null,
            messengerLink: null,
            category: "Maintenance & Repairs",
            subject: "Sample Ticket 1",
            body: "This is a sample ticket.",
            status: "Pending",
            submittedAt: now,
            statusUpdatedAt: now,
            statusUpdatedBy: null,
        },
        {
            id: 2,
            unitNumber: "Unit B",
            apartmentName: "Maple Residences",
            name: "Ben Grimm",
            phoneNumber: "09482930129",
            email: null,
            messengerLink: null,
            category: "Safety & Security",
            subject: "Sample Ticket 2",
            body: "This is a sample ticket.",
            status: "Pending",
            submittedAt: now,
            statusUpdatedAt: now,
            statusUpdatedBy: null,
        },
    ];

    const handleViewTicket = (data: Ticket) => {
        console.log("Showing details for", data.subject);
        setSelectedTicket(data);
        setIsViewModalOpen(true);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-auto">
            {tickets.map((t) => (
                <TicketItem key={t.id} ticket={t} onView={handleViewTicket} />
            ))}

            <TicketDetail
                open={isViewModalOpen}
                ticket={selectedTicket!}
                onClose={() => setIsViewModalOpen(false)}
                currentUser={currentUser}
            />
        </div>
    );
}

export function TicketItem({ ticket, onView }) {
    const reqNum = `REQ-${ticket.id.toString().padStart(6, "0")}`;

    return (
        <div className="w-full bg-white p-6 flex flex-col gap-4 border border-gray-200">
            {/* Top Row */}
            <div className="flex justify-between items-start">
                {/* Left Info */}
                <div className="flex flex-col gap-1">
                    <span className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-sm inline-block text-sm">
                        {reqNum}
                    </span>
                    <div className="ml-5">
                        <h2 className="text-xl font-semibold">
                            {ticket.subject}
                        </h2>
                        <div className="flex gap-4 text-gray-600 text-sm">
                            <span>
                                {ticket.unitNumber} - {ticket.apartmentName}
                            </span>
                            <span>
                                {ticket.submittedAt.toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {ticket.category}
                    </span>
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        {ticket.status}
                    </span>
                    <button
                        onClick={() => onView(ticket)}
                        className="px-4 py-2 bg-yellow-400 rounded-sm font-medium text-black text-sm ml-6 
                        hover:bg-yellow-500 transition-colors"
                    >
                        View
                    </button>
                </div>
            </div>

            {/* Bottom Details */}
            <div className="ml-5 bg-gray-100 rounded-xl p-4 flex flex-wrap gap-6 text-sm text-gray-700">
                <div className="flex gap-2">
                    <strong>Name:</strong> <span>{ticket.name}</span>
                </div>
                <div className="flex gap-2">
                    <strong>Phone:</strong> <span>{ticket.phoneNumber}</span>
                </div>
                <div className="flex gap-2">
                    <strong>Email:</strong> <span>{ticket.email}</span>
                </div>
                <div className="flex gap-2">
                    <strong>Messenger / FB Link:</strong>{" "}
                    <span>{ticket.messengerLink}</span>
                </div>
            </div>
        </div>
    );
}
