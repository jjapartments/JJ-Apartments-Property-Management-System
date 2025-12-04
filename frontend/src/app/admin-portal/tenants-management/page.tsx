"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDataRefresh } from "@/contexts/DataContext";
import { AllInModal } from "@/components/all-in-modal";
import {
    Mail,
    Phone,
    Building,
    DoorClosed,
    Users,
    LinkIcon,
    Calendar,
} from "lucide-react";
import { DeleteModal } from "@/components/delete-modal";
import { AddTenantModal } from "@/components/add-tenant";
import { MoveOutModal } from "@/components/move-out-modal";
import { api, ApiError } from "@/lib/api";

type SubTenant = {
    firstName: string;
    middleInitial?: string;
    lastName: string;
    link: string;
    phoneNumber: string;
};

type Tenant = {
    id?: number | null;
    firstName?: string | null;
    middleInitial?: string | null;
    lastName?: string | null;
    email?: string | null;
    unit: string;
    phoneNumber?: string | null;
    dateAdded?: string | null;
    messengerLink: string | null;

    moveInDate: string | null;
    moveOutDate: string | null;

    subTenants: SubTenant[];
};

type Unit = {
    id: number;
    unitNumber: string;
    name: string;
    description: string;
    max_num: number;
    price: number;

    activeTenantId: number;
};

type TenantWithUnitDetails = Omit<Tenant, "unit"> & {
    unit: Unit;
};

export default function TenantsManagementPage() {
    const [isLoading, setIsLoading] = useState(true);
    const { refreshTrigger, triggerRefresh } = useDataRefresh();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] =
        useState<TenantWithUnitDetails | null>(null);
    const [tenants, setTenants] = useState<TenantWithUnitDetails[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [units, setUnits] = useState<Unit[]>([]);
    const [emptyUnits, setEmptyUnits] = useState<Unit[]>([]);

    // View
    const [selectedTenant, setSelectedTenant] =
        useState<TenantWithUnitDetails | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [fullTenantData, setFullTenantData] = useState<
        TenantWithUnitDetails[] | null
    >(null);

    // Add Tenant
    const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);

    // Move Out
    const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState(false);
    const [tenantToMoveOut, setTenantToMoveOut] =
        useState<TenantWithUnitDetails | null>(null);
    const [moveOutError, setMoveOutError] = useState<string>("");

    const [tenantFilter, setTenantFilter] = useState<"active" | "movedOut">(
        "active"
    );

    // Tenant Filter
    const [activeTenants, setActiveTenants] = useState<TenantWithUnitDetails[]>(
        []
    );
    const [movedOutTenants, setMovedOutTenants] = useState<
        TenantWithUnitDetails[]
    >([]);

    // ================== //

    useEffect(() => {
        fetchUnits();
    }, []);
    useEffect(() => {
        if (units.length > 0) {
            fetchTenants();
        }
    }, [units]);

    useEffect(() => {
        if (tenants.length === 0) return;

        const id = localStorage.getItem("scrollToTenantId");
        if (!id) return;

        const el = document.getElementById(`tenant-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        localStorage.removeItem("scrollToTenantId");
    }, [tenants]);

    const fetchUnits = async () => {
        try {
            const data = await api.get("/api/units");
            setUnits(data);
            console.log("Units loaded:", data);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };
    const fetchTenants = async () => {
        setIsLoading(true);
        try {
            const [units, tenants] = await Promise.all([
                api.get("/api/units"),
                api.get("/api/tenants"),
            ]);

            const subtenants = await api.get("/api/subtenants");

            const processedTenants = tenants.map((t) => {
                const unitInfo = units.find((u) => u.id === t.unitId);
                return {
                    ...t,

                    middleInitial: t.middleInitial,
                    unit: unitInfo
                        ? unitInfo
                        : {
                              id: t.unit,
                              name: "Unknown Building",
                              unitNumber: "Unknown Unit",
                          },
                    subTenants: subtenants.filter(
                        (s) => s.mainTenantId === t.id
                    ),
                };
            });

            processedTenants.sort((a, b) => {
                // Moved-out tenants go to the bottom
                if (a.moveOutDate && !b.moveOutDate) return 1;
                if (!a.moveOutDate && b.moveOutDate) return -1;

                // Preserve order for active tenants based on tenant ID
                if (a.id && b.id) return a.id - b.id;

                // If any ID is missing, keep as is
                return 0;
            });

            setTenants(processedTenants);

            // Separate Active and Moved Out Tenants
            const active = processedTenants.filter(
                (t) => t.id !== null && t.moveOutDate === null
            );
            const movedOut = processedTenants.filter(
                (t) => t.id !== null && t.moveOutDate !== null
            );

            setActiveTenants(active);
            setMovedOutTenants(movedOut);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);

        if (modalOpen) {
            setEditingTenant(null);
        }
    };

    const getEmptyUnits = () => {
        return units.filter((unit) => unit.activeTenantId == 0);
    };

    const handleAddTenantClick = () => {
        setEditingTenant(null);
        setModalOpen(true);

        const availableUnits = getEmptyUnits();
        setEmptyUnits(availableUnits);

        setIsAddTenantModalOpen(true);
    };
    const handleAddTenant = async (formData) => {
        try {
            const tenantDataPayload = {
                firstName: formData.firstName,
                middleInitial: formData.middleInitial || null,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                messengerLink: formData.messengerLink,
                unitId: formData.unitId,
                moveInDate: formData.moveInDate,
            };
            console.log("Add tenant payload:", tenantDataPayload);

            // Use API helper to include token automatically
            await api.post("/api/tenants/add", tenantDataPayload);

            window.location.reload();
        } catch (error: unknown) {
            console.error("Error adding tenant:", error);

            let displayMessage = "Failed to add tenant. Please try again.";

            if (
                error instanceof ApiError &&
                typeof error.message === "string"
            ) {
                displayMessage = error.message;
            }

            setErrorMessage(displayMessage);
            setErrorModalOpen(true);
        }
    };

    const handleViewTenant = (tenant: TenantWithUnitDetails) => {
        setEditingTenant(tenant);
        setSelectedTenant(tenant);
        setIsViewModalOpen(true);
    };

    const handleUpdates = async () => {
        triggerRefresh();
        fetchTenants();
        setIsViewModalOpen(false);
        setTimeout(() => {
            setIsViewModalOpen(true);
        }, 150);
    };

    const handleMoveOut = (tenant: TenantWithUnitDetails) => {
        console.log(tenant);
        setTenantToMoveOut(tenant);
        setIsMoveOutModalOpen(true);
    };
    const confirmMoveOut = async (moveOutDate: string) => {
        setMoveOutError("");

        try {
            if (!tenantToMoveOut?.id) {
                alert("Tenant ID not found.");
                return;
            }
            const formattedMoveOutDate = moveOutDate;

            await api.patch(`/api/tenants/${tenantToMoveOut.id}/move-out`, {
                move_out_date: formattedMoveOutDate,
            });

            const formattedDisplayDate = new Date(
                moveOutDate
            ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            alert(`Tenant has moved out on ${formattedDisplayDate}.`);
            console.log("Move out confirmed:", formattedMoveOutDate);

            localStorage.setItem(
                "scrollToTenantId",
                tenantToMoveOut.id.toString()
            );

            setIsMoveOutModalOpen(false);
            window.location.reload();
        } catch (error: unknown) {
            console.error("Failed to move out tenant:", error);

            const displayMessage =
                error instanceof ApiError
                    ? error.message
                    : "Failed to move out tenant. Please try again.";

            alert(displayMessage);
            setMoveOutError(displayMessage);
        }
    };

    const cancelMoveOut = () => {
        setMoveOutError("");
        setIsMoveOutModalOpen(false);
    };

    const formatPhoneNumber = (phone?: string) => {
        if (!phone) return "N/A";
        return phone;
    };

    const formatName = (
        firstName?: string,
        lastName?: string,
        middleInitial?: string
    ) => {
        const middle = middleInitial ? ` ${middleInitial}.` : "";
        return `${firstName}${middle} ${lastName}`;
    };

    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log(
                "🔄 Refresh triggered — refetching units and tenants..."
            );
            Promise.all([fetchUnits(), fetchTenants()]);
        }
    }, [refreshTrigger]);

    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchUnitsAndTenants();
        }
    }, [refreshTrigger]);

    useEffect(() => {
        if (selectedTenant && fullTenantData) {
            const updated = fullTenantData.find(
                (ftd) => ftd.unit.id === selectedTenant.unit.id
            );

            if (updated) setSelectedTenant(updated);
        }
    }, [units, fullTenantData, selectedTenant]);

    const fetchUnitsAndTenants = async () => {
        setIsLoading(true);
        try {
            // Fetch all data concurrently with JWT token automatically added
            const [unitData, tenantData, subtenants] = await Promise.all([
                api.get<Unit[]>("/api/units"),
                api.get<any[]>("/api/tenants"),
                api.get<any[]>("/api/subtenants"),
            ]);

            const processed: TenantWithUnitDetails[] = unitData.map(
                (u: Unit) => {
                    const tenant = tenantData.find(
                        (t) => Number(t.unitId) === u.id
                    );
                    const tenantSubs = subtenants.filter(
                        (s) => s.mainTenantId === tenant?.id
                    );

                    if (tenant) {
                        return {
                            id: tenant.id,
                            firstName: tenant.firstName,
                            middleInitial: tenant.middleInitial || null,
                            lastName: tenant.lastName,
                            email: tenant.email,
                            phoneNumber: tenant.phoneNumber,
                            dateAdded: tenant.dateAdded,
                            subTenants: tenantSubs,
                            unit: u,
                            messengerLink: tenant.messengerLink || null,
                            moveInDate: tenant.moveInDate,
                            moveOutDate: tenant.moveOutDate,
                        };
                    } else {
                        return {
                            id: null,
                            firstName: null,
                            middleInitial: null,
                            lastName: null,
                            email: null,
                            phoneNumber: null,
                            dateAdded: null,
                            subTenants: [],
                            unit: u,
                            messengerLink: null,
                            moveInDate: null,
                            moveOutDate: null,
                        } as TenantWithUnitDetails;
                    }
                }
            );

            setFullTenantData(processed);
            setUnits(unitData);

            // Separate Active and Moved Out Tenants
            const active = processed.filter(
                (t) => t.id !== null && t.moveOutDate === null
            );
            const movedOut = processed.filter(
                (t) => t.id !== null && t.moveOutDate !== null
            );

            setActiveTenants(active);
            setMovedOutTenants(movedOut);
        } catch (err: unknown) {
            const displayMessage =
                err instanceof ApiError
                    ? err.message
                    : "Error fetching data. Please try again.";

            console.error("fetchUnitsAndTenants error:", err);
            setErrorMessage(displayMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Tenant Card
    const renderTenantCard = (tenant: TenantWithUnitDetails) => {
        const isMovedOut = !!tenant.moveOutDate;

        return (
            <div
                key={tenant.id}
                className={`p-6 transition-all duration-200 group ${
                    isMovedOut
                        ? "bg-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                        : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                }`}
                id={`tenant-${tenant.id}`}
            >
                <div className="flex flex-col space-y-4">
                    {/* Top row: Name, status, buttons */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-yellow-300 font-semibold text-lg">
                                        {tenant.firstName?.charAt(0)}
                                        {tenant.lastName?.charAt(0)}
                                    </span>
                                </div>

                                {/* Name & status */}
                                <div>
                                    <h3
                                        className={`font-semibold text-lg transition-colors ${
                                            isMovedOut
                                                ? "text-gray-900"
                                                : "text-gray-900 group-hover:text-blue-900"
                                        }`}
                                    >
                                        {formatName(
                                            tenant.firstName || "",
                                            tenant.lastName || "",
                                            tenant.middleInitial || ""
                                        )}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {isMovedOut ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-700">
                                                Moved Out
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Buttons — only for active tenants */}
                            {!isMovedOut && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewTenant(tenant)}
                                        className="px-4 py-2 text-black rounded-lg transition-all duration-200 text-sm font-medium border bg-yellow-300 hover:bg-yellow-400 border-yellow-300 hover:border-yellow-400"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleMoveOut(tenant)}
                                        className="px-4 py-2 text-yellow-300 bg-black hover:text-yellow-400 rounded-lg transition-all duration-200 text-sm font-medium border border-black hover:border-black"
                                    >
                                        Move Out
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bottom section: Contact & Unit Info */}
                        <div className="mt-3 flex flex-wrap justify-between w-full gap-4">
                            {/* Contact Info */}
                            <div className="flex flex-col items-start gap-2 bg-gray-50 rounded-lg p-4 flex-1 min-w-[300px]">
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700">
                                        Email:
                                    </span>
                                    <span className="text-gray-600">
                                        {tenant.email || ""}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700">
                                        Phone:
                                    </span>
                                    <span className="text-gray-600">
                                        {formatPhoneNumber(
                                            tenant.phoneNumber || ""
                                        )}
                                    </span>
                                </div>
                                {tenant.messengerLink && (
                                    <div className="flex items-center space-x-2">
                                        <LinkIcon className="w-4 h-4 text-yellow-600" />
                                        <a
                                            href={tenant.messengerLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-yellow-600 hover:underline flex items-center space-x-1"
                                        >
                                            Messenger / Facebook Link
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Unit Info */}
                            <div className="flex flex-col md:flex-row items-start gap-4 bg-gray-50 rounded-lg p-4 flex-1 min-w-[300px]">
                                <div className="flex flex-col justify-center gap-2 flex-1">
                                    <div className="flex items-center space-x-2">
                                        <DoorClosed className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">
                                            Unit:
                                        </span>
                                        <span className="text-gray-600">
                                            {tenant.unit.unitNumber}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Building className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">
                                            Building:
                                        </span>
                                        <span className="text-gray-600">
                                            {tenant.unit.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">
                                            No. of Sub-Tenants:
                                        </span>
                                        <span className="text-gray-600">
                                            {tenant.subTenants?.length ?? 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-2 flex-1">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">
                                            Move-In Date:
                                        </span>
                                        <span className="text-gray-600">
                                            {tenant.moveInDate
                                                ? new Date(
                                                      tenant.moveInDate
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">
                                            Move-Out Date:
                                        </span>
                                        <span className="text-gray-600">
                                            {tenant.moveOutDate
                                                ? new Date(
                                                      tenant.moveOutDate
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between gap-6">
                        {/* Left: Title */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Tenant Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your property tenants ({tenants.length}{" "}
                                total - {activeTenants.length} active,{" "}
                                {movedOutTenants.length} moved out)
                            </p>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Filter — Segmented Control */}
                            <div className="flex items-center bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
                                <button
                                    className={`
                            px-4 py-2 text-sm font-medium transition
                            ${
                                tenantFilter === "active"
                                    ? "bg-yellow-400 text-black"
                                    : "text-gray-700 hover:bg-gray-200"
                            }
                        `}
                                    onClick={() => setTenantFilter("active")}
                                >
                                    Active
                                </button>

                                <button
                                    className={`
                            px-4 py-2 text-sm font-medium transition
                            ${
                                tenantFilter === "movedOut"
                                    ? "bg-yellow-400 text-black"
                                    : "text-gray-700 hover:bg-gray-200"
                            }
                        `}
                                    onClick={() => setTenantFilter("movedOut")}
                                >
                                    Moved Out
                                </button>
                            </div>

                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search tenant name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 w-80"
                            />

                            {/* Add Tenant Button */}
                            <button
                                onClick={handleAddTenantClick}
                                className="px-4 py-2 text-yellow-300 bg-black hover:text-yellow-400 rounded-lg transition-all duration-200 text-sm font-medium border border-black"
                            >
                                Add Tenant
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-6 py-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        /* Loading State */
                        <div className="p-16 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Loading tenants...
                            </h3>
                            <p className="text-gray-500">Please wait while we fetch your data</p>
                        </div>
                    ) : tenantFilter === "active" ? (
                        activeTenants.length === 0 ? (
                            /* Empty State — Active */
                            <div className="p-16 text-center bg-gradient-to-b from-gray-50 to-white">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No active tenants
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Get started by adding your first tenant to
                                    begin managing your property.
                                </p>
                                <button
                                    onClick={handleAddTenantClick}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Add Your First Tenant
                                </button>
                            </div>
                        ) : (
                            /* Tenant List — Active */
                            <div className="divide-y divide-gray-100">
                                {activeTenants
                                    .filter((tenant) =>
                                        `${tenant.firstName} ${
                                            tenant.middleInitial || ""
                                        } ${tenant.lastName}`
                                            .toLowerCase()
                                            .includes(searchQuery.toLowerCase())
                                    )
                                    .map(renderTenantCard)}
                            </div>
                        )
                    ) : movedOutTenants.length === 0 ? (
                        /* Empty State — Moved Out */
                        <div className="p-16 text-center bg-gradient-to-b from-gray-50 to-white">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No moved out tenants
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Tenants who previously stayed here will appear
                                once someone moves out.
                            </p>
                        </div>
                    ) : (
                        /* Tenant List — Moved Out */
                        <div className="divide-y divide-gray-100">
                            {movedOutTenants
                                .sort(
                                    (a, b) =>
                                        new Date(b.moveOutDate!).getTime() -
                                        new Date(a.moveOutDate!).getTime()
                                )
                                .filter((tenant) =>
                                    `${tenant.firstName} ${
                                        tenant.middleInitial || ""
                                    } ${tenant.lastName}`
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase())
                                )
                                .map(renderTenantCard)}
                        </div>
                    )}
                </div>
            </div>

            <AddTenantModal
                open={isAddTenantModalOpen}
                onClose={() => setIsAddTenantModalOpen(false)}
                units={emptyUnits}
                onSubmit={handleAddTenant}
            />

            {selectedTenant && (
                <AllInModal
                    open={isViewModalOpen}
                    selectedTab={"tenant"}
                    onClose={() => {
                        setIsViewModalOpen(false),
                            setSelectedTenant(null),
                            setEditingTenant(null);
                    }}
                    tenant={selectedTenant}
                    onUpdateTenant={handleUpdates}
                />
            )}

            <MoveOutModal
                open={isMoveOutModalOpen}
                title="Move Out Tenant"
                message={`Are you sure you want to move out ${tenantToMoveOut?.firstName} ${tenantToMoveOut?.lastName} from ${tenantToMoveOut?.unit.name}? This action cannot be undone.`}
                onCancel={cancelMoveOut}
                onConfirm={(date) => confirmMoveOut(date)}
                error={moveOutError}
            />

            {/* Error Modal */}
            {errorModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Unable to Add Tenant
                                </h3>
                                <button
                                    onClick={() => setErrorModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">{errorMessage}</p>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setErrorModalOpen(false)}
                                    className="px-6 py-2 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-all duration-200 font-medium border border-yellow-300 hover:border-yellow-400"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
