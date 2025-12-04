"use client";

import React, { useState, useEffect } from "react";
import { TicketDetail } from "./ticket-detail";
import { useAuth } from "@/hooks/useAuth";
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

type TicketListProps = {
    searchQuery: string;
    statusFilter: string;
};

export function TicketList({ searchQuery, statusFilter }: TicketListProps) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const { username: currentUser } = useAuth();

    const { triggerRefresh } = useDataRefresh();

    const now = new Date();
    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter((t) => {
        if (!searchQuery) {
            const matchesStatus =
                statusFilter === "all" || t.status === statusFilter;
            return matchesStatus;
        }

        const query = searchQuery.toLowerCase().trim();
        
        // Handle REQ- prefixed searches (e.g., "REQ-000123" or "req-123")
        let idMatch = false;
        if (query.startsWith("req-") || query.startsWith("req")) {
            const numericPart = query.replace(/^req-?/i, "");
            idMatch = t.id.toString() === numericPart || 
                      t.id.toString().padStart(6, "0") === numericPart;
        } else {
            // Direct numeric search - handles both "123" and "000123"
            const paddedId = t.id.toString().padStart(6, "0");
            idMatch = t.id.toString().includes(query) || paddedId.includes(query);
        }

        const matchesSearch =
            idMatch ||
            t.subject.toLowerCase().includes(query) ||
            t.unitNumber.toLowerCase().includes(query) ||
            t.apartmentName.toLowerCase().includes(query) ||
            t.name.toLowerCase().includes(query);

        const matchesStatus =
            statusFilter === "all" || t.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsViewModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex-1 bg-gray-50 p-6 overflow-auto">
                <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Loading requests...
                    </h3>
                    <p className="text-gray-500">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

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
                    onTicketUpdated={(updated) => {
                        setSelectedTicket(updated);
                        setTickets((prev) =>
                            prev.map((t) => (t.id === updated.id ? updated : t))
                        );
                    }}
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
                            isClosed
                                ? "bg-gray-100 text-gray-500" 
                                : categoryColors[ticket.category] || 
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