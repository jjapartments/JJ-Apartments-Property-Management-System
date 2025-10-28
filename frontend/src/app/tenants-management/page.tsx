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
};

type TenantWithUnitDetails = Omit<Tenant, "unit"> & {
    unit: Unit;
};

export default function TenantsManagementPage() {
    const { refreshTrigger, triggerRefresh } = useDataRefresh();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] =
        useState<TenantWithUnitDetails | null>(null);
    const [tenants, setTenants] = useState<TenantWithUnitDetails[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] =
        useState<TenantWithUnitDetails | null>(null);

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

    useEffect(() => {
        fetchUnits();
    }, []);
    useEffect(() => {
        if (units.length > 0) {
            fetchTenants();
        }
    }, [units]);

    const fetchUnits = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/units`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch units");
            }
            const data = await response.json();
            setUnits(data);
            console.log("Units loaded:", data);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };
    const fetchTenants = async () => {
        try {
            const [unitsResponse, tenantsResponse] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`),
            ]);

            const units = await unitsResponse.json();
            const tenants = await tenantsResponse.json();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/subtenants`
            );
            const subtenants = await response.json();

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

            // Sort
            processedTenants.sort((a, b) => {
                if (a.moveOutDate && !b.moveOutDate) return 1;
                if (!a.moveOutDate && b.moveOutDate) return -1;
                return 0;
            });

            setTenants(processedTenants);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);

        if (modalOpen) {
            setEditingTenant(null);
        }
    };

    const getEmptyUnits = () => {
        return units.filter(
            (unit) => !tenants.some((tenant) => tenant.unit.id === unit.id)
        );
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

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/add`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(tenantDataPayload),
                }
            );

            if (!res.ok) {
                const errorData = await res
                    .json()
                    .catch(() => ({ message: "Unknown error" }));

                // Handle specific error messages from backend
                let displayMessage = "Failed to add tenant. Please try again.";
                if (errorData.error && typeof errorData.error === "string") {
                    if (errorData.error.includes("email is already taken")) {
                        displayMessage =
                            "This email address is already registered with another tenant. Please use a different email address.";
                    } else if (
                        errorData.error.includes(
                            "phone number is already taken"
                        )
                    ) {
                        displayMessage =
                            "This phone number is already registered with another tenant. Please use a different phone number.";
                    } else if (
                        errorData.error.includes("tenant is already registered")
                    ) {
                        displayMessage =
                            "This tenant is already registered in the system.";
                    } else {
                        displayMessage = errorData.error;
                    }
                }

                setErrorMessage(displayMessage);
                setErrorModalOpen(true);
                return;
            }
            
            window.location.reload();
        } catch (error) {
            console.error("Error adding tenant:", error);
            setErrorMessage(
                "An unexpected error occurred while adding the tenant. Please try again."
            );
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
    }

    const handleMoveOut = (tenant: TenantWithUnitDetails) => {
        console.log(tenant);
        setTenantToMoveOut(tenant);
        setIsMoveOutModalOpen(true);
    };
    const confirmMoveOut = async (moveOutDate: string) => {
        setIsMoveOutModalOpen(false);

        try {
            const formattedMoveOutDate = new Date(moveOutDate).toISOString();

            // [TO UPDATE] :: Replace with your actual API endpoint
            /*const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/moveout`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tenantId: tenant.id,
                        moveOutDate: formattedMoveOutDate,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update tenant move-out date.");
            }*/

            const formattedDisplayDate = new Date(
                moveOutDate
            ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            alert(`Tenant has moved out on ${formattedDisplayDate}.`);
            console.log("✅ Move out confirmed:", formattedMoveOutDate);

            window.location.reload();
        } catch (error: any) {
            console.error("❌ Failed to move out tenant:", error);
            alert("Failed to move out tenant. Please try again.");
        }
    };

    const cancelMoveOut = () => {
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
            console.log("🔄 Refresh triggered — refetching units and tenants...");
            Promise.all([fetchUnits(), fetchTenants()]);
        }
    }, [refreshTrigger]);

    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchUnitsAndTenants()
        }
    }, [refreshTrigger]);

    useEffect(() => {
        if (selectedTenant && fullTenantData) {
            const updated = fullTenantData.find(
                (ftd) => ftd.unit.id === selectedTenant.unit.id
            );

            if (updated) setSelectedTenant(updated);
        }
    }, [units, fullTenantData]);

    const fetchUnitsAndTenants = async () => {
        try {
            //setLoading(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/units`
            );
            if (!res.ok) throw new Error("Error fetching units");
            const unitData = await res.json();

            const tenantRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tenants`
            );
            if (!tenantRes.ok) throw new Error("Error fetching tenants");
            const tenantData = await tenantRes.json();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/subtenants`
            );
            const subtenants = await response.json();

            const processed: TenantWithUnitDetails[] = unitData.map(
                (u: Unit) => {
                    const tenant = tenantData.find(
                        (t: any) => Number(t.unitId) === u.id
                    );
                    const tenantSubs = subtenants.filter(
                        (s: any) => s.mainTenantId === tenant?.id
                    );

                    if (tenant) {
                        return {
                            id: tenant.id,
                            firstName: tenant.firstName,
                            middleInitial:
                                tenant.middleInitial || tenant.middleInitial,
                            lastName: tenant.lastName,
                            email: tenant.email,
                            phoneNumber: tenant.phoneNumber,
                            dateAdded: tenant.dateAdded,
                            subTenants: tenantSubs,
                            unit: u,
                            messengerLink: tenant.messengerLink,
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
                            moveOutDate: null
                        } as TenantWithUnitDetails;
                    }
                }
            );

            setFullTenantData(processed);
            setUnits(unitData);
        } catch (err: any) {
            setErrorMessage(err.message || "Error fetching data");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Tenant Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your property tenants ({tenants.length}{" "}
                                total)
                            </p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search tenant name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 w-150"
                        />

                        <button
                            onClick={handleAddTenantClick}
                            className="px-4 py-2 text-yellow-300 bg-black hover:text-yellow-400 rounded-lg transition-all duration-200 text-sm font-medium border border-black hover:border-black"
                        >
                            Add Tenant
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-6 py-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {tenants.length === 0 ? (
                        <div className="p-16 text-center bg-gradient-to-b from-gray-50 to-white">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No tenants yet
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Get started by adding your first tenant to begin
                                managing your property
                            </p>
                            <button
                                onClick={handleAddTenantClick}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Add Your First Tenant
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tenants
                                .filter((tenant) =>
                                    `${tenant.firstName} ${
                                        tenant.middleInitial || ""
                                    } ${tenant.lastName}`
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase())
                                )
                                .map((tenant) => (
                                    <div
                                        key={tenant.id}
                                        className={`p-6 transition-all duration-200 group 
                                        ${
                                            tenant.moveOutDate
                                                ? "bg-gray-100"
                                                : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                                        }
                                        `}
                                    >
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-md">
                                                            <span className="text-yellow-300 font-semibold text-lg">
                                                                {tenant.firstName?.charAt(
                                                                    0
                                                                )}
                                                                {tenant.lastName?.charAt(
                                                                    0
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3
                                                                className={`font-semibold text-lg transition-colors 
                                                                ${
                                                                    tenant.moveOutDate
                                                                        ? "text-gray-900"
                                                                        : "text-gray-900 group-hover:text-blue-900"
                                                                }
                                                            `}
                                                            >
                                                                {formatName(
                                                                    tenant.firstName ||
                                                                        "",
                                                                    tenant.lastName ||
                                                                        "",
                                                                    tenant.middleInitial ||
                                                                        ""
                                                                )}
                                                            </h3>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                {tenant.moveOutDate ? (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-700">
                                                                        Moved
                                                                        Out
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 🔘 Buttons */}
                                                    <div className="flex space-x-2">
                                                        {!tenant.moveOutDate && (
                                                            <button
                                                                onClick={() =>
                                                                    handleViewTenant(
                                                                        tenant
                                                                    )
                                                                }
                                                                className={`px-4 py-2 text-black rounded-lg transition-all duration-200 text-sm font-medium border 
                                                                ${
                                                                    tenant.moveOutDate
                                                                        ? "bg-gray-300 border-gray-300 cursor-not-allowed"
                                                                        : "bg-yellow-300 hover:bg-yellow-400 border-yellow-300 hover:border-yellow-400"
                                                                }
                                                            `}
                                                            >
                                                                View
                                                            </button>
                                                        )}

                                                        {!tenant.moveOutDate && (
                                                            <button
                                                                onClick={() =>
                                                                    handleMoveOut(
                                                                        tenant
                                                                    )
                                                                }
                                                                className="px-4 py-2 text-yellow-300 bg-black hover:text-yellow-400 rounded-lg transition-all duration-200 text-sm font-medium border border-black hover:border-black"
                                                            >
                                                                Move Out
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap justify-between w-full gap-4">
                                                    {/* Left: Contact Info */}
                                                    <div className="flex flex-col justify-center gap-2 bg-gray-50 rounded-lg p-4 flex-1 min-w-[300px]">
                                                        <div className="flex items-center space-x-2">
                                                            <Mail className="w-4 h-4 text-gray-500" />
                                                            <span className="font-medium text-gray-700">
                                                                Email:
                                                            </span>
                                                            <span className="text-gray-600">
                                                                {tenant.email ||
                                                                    ""}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <Phone className="w-4 h-4 text-gray-500" />
                                                            <span className="font-medium text-gray-700">
                                                                Phone:
                                                            </span>
                                                            <span className="text-gray-600">
                                                                {formatPhoneNumber(
                                                                    tenant.phoneNumber ||
                                                                        ""
                                                                )}
                                                            </span>
                                                        </div>

                                                        {tenant.messengerLink && (
                                                            <div className="flex items-center space-x-2">
                                                                <LinkIcon className="w-4 h-4 text-yellow-600" />
                                                                <a
                                                                    href={
                                                                        tenant.messengerLink
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-medium text-yellow-600 hover:underline flex items-center space-x-1"
                                                                >
                                                                    <span>
                                                                        Messenger
                                                                        /
                                                                        Facebook
                                                                        Link
                                                                    </span>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right: Unit Info */}
                                                    <div className="flex flex-col md:flex-row items-start gap-4 bg-gray-50 rounded-lg p-4 flex-1 min-w-[300px]">
                                                        {/* Left Column: Unit Details */}
                                                        <div className="flex flex-col justify-center gap-2 flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <DoorClosed className="w-4 h-4 text-gray-500" />
                                                                <span className="font-medium text-gray-700">
                                                                    Unit:
                                                                </span>
                                                                <span className="text-gray-600">
                                                                    {
                                                                        tenant
                                                                            .unit
                                                                            .unitNumber
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <Building className="w-4 h-4 text-gray-500" />
                                                                <span className="font-medium text-gray-700">
                                                                    Building:
                                                                </span>
                                                                <span className="text-gray-600">
                                                                    {
                                                                        tenant
                                                                            .unit
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <Users className="w-4 h-4 text-gray-500" />
                                                                <span className="font-medium text-gray-700">
                                                                    No. of
                                                                    Sub-Tenants:
                                                                </span>
                                                                <span className="text-gray-600">
                                                                    {tenant
                                                                        .subTenants
                                                                        ?.length ??
                                                                        0}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right Column: Dates */}
                                                        <div className="flex flex-col justify-center gap-2 flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                                <span className="font-medium text-gray-700">
                                                                    Move-In
                                                                    Date:
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
                                                                    Move-Out
                                                                    Date:
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
                                ))}
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
