"use client";

import React, { useState, useEffect } from "react";
import { TicketDetail } from "./ticket-detail";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";

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

type TicketListProps = {
    searchQuery: string;
    statusFilter: string;
};

export function TicketList({ searchQuery, statusFilter }: TicketListProps) {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const { username: currentUser } = useAuth();

    const now = new Date();
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get("/api/tickets");
                console.log("Fetched tickets; ", response);

                const ticketsWithDates = response.map((ticket: any) => ({
                    ...ticket,
                    submittedAt: new Date(ticket.submittedAt),
                    statusUpdatedAt: new Date(ticket.statusUpdatedAt),
                }));

                setTickets(ticketsWithDates);
            } catch (error) {
                console.error("Failed to fetch tickets:", error);
            }
        };

        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter((t) => {
        const matchesSearch =
            t.id.toString().includes(searchQuery) || !searchQuery;
        const matchesStatus =
            statusFilter === "all" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsViewModalOpen(true);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-auto">
            {filteredTickets.length === 0 ? (
                <div className="w-full text-center py-20 text-gray-500 text-lg italic">
                    No tickets available...
                </div>
            ) : (
                filteredTickets.map((t) => (
                    <TicketItem
                        key={t.id}
                        ticket={t}
                        onView={handleViewTicket}
                    />
                ))
            )}

            {selectedTicket && (
                <TicketDetail
                    open={isViewModalOpen}
                    ticket={selectedTicket}
                    currentUser={currentUser}
                    onClose={() => setIsViewModalOpen(false)}
                />
            )}
        </div>
    );
}

type TicketItemProps = {
    ticket: Ticket;
    onView: (ticket: Ticket) => void;
};

export function TicketItem({ ticket, onView }: TicketItemProps) {
    const reqNum = `REQ-${ticket.id.toString().padStart(6, "0")}`;

    const statusColors: Record<string, string> = {
        Pending: "bg-yellow-100 text-yellow-700",
        "In Progress": "bg-blue-100 text-blue-700",
        Resolved: "bg-green-100 text-green-700",
        Closed: "bg-gray-100 text-gray-500",
    };

    const categoryColors: Record<string, string> = {
        "Maintenance & Repairs": "bg-purple-100 text-purple-700",
        "Security & Safety": "bg-red-100 text-red-700",
        Utilities: "bg-blue-100 text-blue-700",
        "Payment & Billing": "bg-green-100 text-green-700",
        "Amenities & Facilities": "bg-yellow-100 text-yellow-700",
        Others: "bg-gray-100 text-gray-700",
    };

    const isClosed = ticket.status === "Closed";
    const textClass = isClosed ? "text-gray-500" : "text-gray-700";
    const idBgClass = isClosed
        ? "bg-gray-200 text-gray-500"
        : "bg-yellow-400 text-black";

    return (
        <div className="w-full bg-white p-6 flex flex-col gap-4 border border-gray-200">
            {/* Top Row */}
            <div className="flex justify-between items-start">
                {/* Left Info */}
                <div className="flex flex-col gap-1">
                    <span
                        className={`px-4 py-2 rounded-sm inline-block text-sm font-semibold ${idBgClass}`}
                    >
                        {reqNum}
                    </span>
                    <div className="ml-5">
                        <h2 className={`text-xl font-semibold ${textClass}`}>
                            {ticket.subject}
                        </h2>
                        <div className={`flex gap-4 text-sm ${textClass}`}>
                            <span>
                                {ticket.unitNumber} - {ticket.apartmentName}
                            </span>
                            <span>{ticket.submittedAt.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Tags + View */}
                <div className="flex items-center gap-2">
                    <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                            categoryColors[ticket.category] ||
                            "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {ticket.category}
                    </span>
                    <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                            statusColors[ticket.status] ||
                            "bg-gray-100 text-gray-500"
                        }`}
                    >
                        {ticket.status}
                    </span>
                    <button
                        onClick={() => onView(ticket)}
                        className="px-4 py-2 bg-yellow-400 rounded-sm font-medium text-black text-sm ml-6 hover:bg-yellow-500 transition-colors"
                    >
                        View
                    </button>
                </div>
            </div>

            {/* Bottom Details */}
            <div
                className={`ml-5 bg-gray-100 rounded-xl p-4 flex flex-wrap gap-6 text-sm ${textClass}`}
            >
                <div className="flex gap-2">
                    <strong>Name:</strong> <span>{ticket.name}</span>
                </div>
                <div className="flex gap-2">
                    <strong>Phone:</strong> <span>{ticket.phoneNumber}</span>
                </div>
                <div className="flex gap-2">
                    <strong>Email:</strong> <span>{ticket.email || "N/A"}</span>
                </div>
                <div className="flex gap-2">
                    <strong>Messenger / FB Link:</strong>{" "}
                    <span>{ticket.messengerLink || "N/A"}</span>
                </div>
            </div>
        </div>
    );
}
