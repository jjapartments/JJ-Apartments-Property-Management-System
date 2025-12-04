"use client";

import React, { useState } from "react";
import { TicketList } from "@/components/ticket-list";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export default function RequestTicketsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); 

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Request Ticket Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your tenants&apos; tickets
                            </p>
                        </div>

                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 w-48"
                            />

                            <div className="flex flex-col">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => setStatusFilter(value)}
                                >
                                    <SelectTrigger className="min-w-[180px] rounded-md border border-gray-300 px-3 py-2 text-sm">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
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
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                <TicketList
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                />
            </div>
        </div>
    );
}