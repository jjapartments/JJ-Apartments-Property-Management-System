"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TicketList } from "@/components/ticket-list";

export default function RequestTicketsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Request Ticket Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your tenants' tickets
                            </p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search ticket number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 w-150"
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                <TicketList />
            </div>
        </div>
    );
}