"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/contexts/DataContext';
import { AllInModal } from "@/components/all-in-modal";
import { Mail, Phone, Building, DoorClosed, Users } from "lucide-react";
import { DeleteModal } from "@/components/delete-modal";
import { AddTenantModal } from "@/components/add-tenant";
import { MoveOutModal } from "@/components/move-out-modal"; 

type SubTenant = {
    firstName: string,
    middleInitial?: string;
    lastName: string;
    link: string;
    phoneNumber: string;
}

type Tenant = {
    id?: number | null;
    firstName?: string | null;
    middleInitial?: string | null;
    lastName?: string | null;
    email?: string | null;
    unit: string;
    phoneNumber?: string | null;
    dateAdded?: string | null;

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

type TenantWithUnitDetails = Omit<Tenant, 'unit'> & {
    unit: Unit; 
};

export default function TenantsManagementPage() {
    const { isLoggedIn, isLoading } = useAuth();
    const { refreshTrigger, triggerRefresh } = useDataRefresh();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<TenantWithUnitDetails | null>(null);
    const [tenants, setTenants] = useState<TenantWithUnitDetails[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<TenantWithUnitDetails | null>(null);
    
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [units, setUnits] = useState<Unit[]>([]);
    const [emptyUnits, setEmptyUnits] = useState<Unit[]>([]);

    // View
    const [selectedTenant, setSelectedTenant] = useState<TenantWithUnitDetails | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [fullTenantData, setFullTenantData] = useState<TenantWithUnitDetails[] | null>(null);

    // Add Tenant
    const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false)

    // Move Out
    const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState(false)
    const [tenantToMoveOut, setTenantToMoveOut] = useState<TenantWithUnitDetails | null>(null);
    
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`);
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
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`)
            ]);

            const units = await unitsResponse.json();
            const tenants = await tenantsResponse.json();

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subtenants`);
            const subtenants = await response.json();

            const processedTenants = tenants.map(t => {
                const unitInfo = units.find(u => u.id === t.unitId);
                return {
                    ...t,
                    
                    middleInitial: t.middleInitial, 
                    unit: unitInfo ? unitInfo : {
                        id: t.unit,
                        name: 'Unknown Building',
                        unitNumber: 'Unknown Unit'
                    },
                    subTenants: subtenants.filter(s => s.mainTenantId === t.id)
                };
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

        setIsAddTenantModalOpen(true)
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
                moveInDate: formData.moveInDate
            };
            console.log("Add tenant payload:", tenantDataPayload)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tenantDataPayload),
            })
            
            if (!res.ok){
                const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                
                // Handle specific error messages from backend
                let displayMessage = 'Failed to add tenant. Please try again.';
                if (errorData.error && typeof errorData.error === 'string') {
                    if (errorData.error.includes('email is already taken')) {
                        displayMessage = 'This email address is already registered with another tenant. Please use a different email address.';
                    } else if (errorData.error.includes('phone number is already taken')) {
                        displayMessage = 'This phone number is already registered with another tenant. Please use a different phone number.';
                    } else if (errorData.error.includes('tenant is already registered')) {
                        displayMessage = 'This tenant is already registered in the system.';
                    } else {
                        displayMessage = errorData.error;
                    }
                }
                
                setErrorMessage(displayMessage);
                setErrorModalOpen(true);
                return;
            }
            
            console.log("Tenant added successfully, triggering refresh...");
            toggleModal();
            console.log("About to call triggerRefresh()");
            await fetchTenants();
            triggerRefresh(); 
            console.log("triggerRefresh() called successfully");
        } catch (error) {
            console.error('Error adding tenant:', error);
            setErrorMessage('An unexpected error occurred while adding the tenant. Please try again.');
            setErrorModalOpen(true);
        }
    };

    const handleViewTenant = (tenant: TenantWithUnitDetails) => {
        setEditingTenant(tenant)
        setSelectedTenant(tenant);
        setIsViewModalOpen(true);
    };
    const handleUpdates = async (updatedData: any) => {
        if (updatedData)
            handleUpdateTenant(updatedData)

        triggerRefresh(); 
        fetchTenants(); 
        setIsViewModalOpen(false);
    }

    const handleUpdateTenant = async (updatedData: any) => {
        if (!editingTenant) {
            console.error('No tenant selected for update.');
            return;
        }

        const tenantUpdatePayload = {
            firstName: updatedData.firstName,
            middleInitial: updatedData.middleInitial || null,
            lastName: updatedData.lastName,
            email: updatedData.email,
            phoneNumber: updatedData.phoneNumber,
            unitId: updatedData.unitId
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/tenants/update/${editingTenant.id}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tenantUpdatePayload)
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                
                // Handle specific error messages from backend
                let displayMessage = 'Failed to update tenant. Please try again.';
                if (errorData.error && typeof errorData.error === 'string') {
                    if (errorData.error.includes('email is already taken')) {
                        displayMessage = 'This email address is already registered with another tenant. Please use a different email address.';
                    } else if (errorData.error.includes('phone number is already taken')) {
                        displayMessage = 'This phone number is already registered with another tenant. Please use a different phone number.';
                    } else if (errorData.error.includes('tenant is already registered')) {
                        displayMessage = 'This tenant is already registered in the system.';
                    } else {
                        displayMessage = errorData.error;
                    }
                }
                
                setErrorMessage(displayMessage);
                setErrorModalOpen(true);
                return;
            }
            
            console.log("About to call triggerRefresh()");
            await fetchTenants();
            triggerRefresh();
            console.log("triggerRefresh() called successfully");

            if (selectedTenant) {
                const updatedTenant = tenants.find(t => t.id === selectedTenant.id);
                if (updatedTenant) {
                    setSelectedTenant(updatedTenant);
                }
            }
        } catch (error) {
            console.error('Error updating tenant:', error);
            setErrorMessage('An unexpected error occurred while updating the tenant. Please try again.');
            setErrorModalOpen(true);
        }
    };

    const handleMoveOut = (tenant: TenantWithUnitDetails) => {
        console.log(tenant)
        setTenantToMoveOut(tenant)
        setIsMoveOutModalOpen(true)
    }
    const confirmMoveOut = async () => {
        if (!tenantToMoveOut) 
            return;
        setIsMoveOutModalOpen(false);

        try {
            // [TO UPDATE] :: Proper API call
            const today = new Date();
            const formattedDate = today.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            alert(`Tenant has moved out today, ${formattedDate}.`);
            console.log("Move out confirmed");
        } catch (error: any) {
            console.log("Failed to move out tenant.", error)
        }
    }

    const cancelMoveOut = () => {
        setIsMoveOutModalOpen(false);
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setTenantToDelete(null);
    };

    const formatPhoneNumber = (phone?: string) => {
        if (!phone) return 'N/A';
        return phone;
    };

    const formatName = (firstName?: string, lastName?: string, middleInitial?: string) => {
        const middle = middleInitial ? ` ${middleInitial}.` : '';
        return `${firstName}${middle} ${lastName}`;
    };

    useEffect(() => {
        console.log("triggered 1")
        if (refreshTrigger > 0) {
            console.log("Refreshing Apartment List...");
            console.log("triggered 2")
            fetchUnitsAndTenants();
        }
    }, [refreshTrigger]);
    
    useEffect(() => {
          if (selectedTenant && fullTenantData) {
            const updated = fullTenantData.find(
              ftd => ftd.unit.id === selectedTenant.unit.id
            );
    
            if (updated) setSelectedTenant(updated);
          }
        }, [units, fullTenantData]);

    const fetchUnitsAndTenants = async () => {
        try {
            //setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`);
            if (!res.ok) throw new Error("Error fetching units");
            const unitData = await res.json();
    
            const tenantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`);
            if (!tenantRes.ok) throw new Error("Error fetching tenants");
            const tenantData = await tenantRes.json();
    
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subtenants`);
            const subtenants = await response.json();
    
            const processed: TenantWithUnitDetails[] = unitData.map((u: Unit) => {
                const tenant = tenantData.find((t: any) => Number(t.unitId) === u.id);
                const tenantSubs = subtenants.filter((s: any) => s.mainTenantId === tenant?.id);
        
                if (tenant) {
                    return {
                        id: tenant.id,
                        firstName: tenant.firstName,
                        middleInitial: tenant.middleInitial || tenant.middleInitial,
                        lastName: tenant.lastName,
                        email: tenant.email,
                        phoneNumber: tenant.phoneNumber,
                        dateAdded: tenant.dateAdded,
                        subTenants: tenantSubs,
                        unit: u,
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
                    } as TenantWithUnitDetails;
                }
            });
    
            setFullTenantData(processed);
            setUnits(unitData);
        } catch (err: any) {
            setErrorMessage(err.message || "Error fetching data");
        } finally {
            //setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your property tenants ({tenants.length} total)
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tenants yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by adding your first tenant to begin managing your property</p>
                            <button
                                onClick={handleAddTenantClick}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Add Your First Tenant
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tenants.filter((tenant) =>
                                        `${tenant.firstName} ${tenant.middleInitial || ""} ${tenant.lastName}`
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase())
                                    )
                                    .map((tenant) => (
                                <div key={tenant.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-md">
                                                    <span className="text-yellow-300 font-semibold text-lg">
                                                        {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-900 transition-colors">
                                                        {formatName(tenant.firstName || "", tenant.lastName || "", tenant.middleInitial || "")}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex flex-wrap justify-left items-start text-sm bg-gray-50 rounded-lg p-4">
                                                <div className="md:space-x-10 flex justify-left items-left w-1/2"> 
                                                    <div className="flex items-center space-x-2 mb-2 md:mb-0">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-700">Email:</span>
                                                        <span className="text-gray-600">{tenant.email || ""}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2 mb-2 md:mb-0">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-700">Phone:</span>
                                                        <span className="text-gray-600">{formatPhoneNumber(tenant.phoneNumber || "")}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="md:space-x-10 flex justify-right items-right w-auto"> 
                                                    <div className="flex items-center space-x-2 mb-2 md:mb-0">
                                                        <DoorClosed  className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-700">Unit:</span>
                                                        <span className="text-gray-600">{tenant.unit.unitNumber}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Building className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-700">Building:</span>
                                                        <span className="text-gray-600">{tenant.unit.name}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-700">No. of Sub-Tenants:</span>
                                                        <span className="text-gray-600">{tenant.subTenants?.length ?? 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2 ml-6">
                                            <button
                                                onClick={() => handleViewTenant(tenant)}
                                                className="px-4 py-2 text-black bg-yellow-300 hover:bg-yellow-400 rounded-lg transition-all duration-200 text-sm font-medium border border-yellow-300 hover:border-yellow-400"
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
                    onClose={() => {setIsViewModalOpen(false), setSelectedTenant(null), setEditingTenant(null)}}
                    tenant={selectedTenant}
                    onUpdateTenant={handleUpdates}
                />
            )}

            <MoveOutModal
                open={isMoveOutModalOpen}
                title="Move Out Tenant"
                message={`Are you sure you want to move out ${tenantToMoveOut?.firstName} ${tenantToMoveOut?.lastName} from ${tenantToMoveOut?.unit.name}? This action cannot be undone.`}
                onCancel={cancelMoveOut}
                onConfirm={() => confirmMoveOut()}
            />
                
            {/* Error Modal */}
            {errorModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Unable to Add Tenant</h3>
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