import { Trash2, History, Eye } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import EditUnitCard from "./edit-unit-card";
import { DeleteModal } from "./delete-modal";
import AddUnitButton from "./add-unit-button";
import { useDataRefresh } from '@/contexts/DataContext';
import { ErrorModal } from "./error-modal";
import { AllInModal } from "@/components/all-in-modal";

export type Unit = {
  id: number;
  unitNumber: string;
  name: string;
  description: string;
  numOccupants: number;
  price: number;
};

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

export type TenantWithUnitDetails = Omit<Tenant, 'unit'> & {
  unit: Unit;
};


export function ApartmentList() {
  const { refreshTrigger, triggerRefresh } = useDataRefresh();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [fullTenantData, setFullTenantData] = useState<TenantWithUnitDetails[] | null>(null);
  const [forViewTenantData, setForViewTenantData] = useState<TenantWithUnitDetails[] | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithUnitDetails | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    const cancelSearch = () => {
        setSearchTerm('');
        setForViewTenantData(fullTenantData)
        window.location.reload();
    }
    const handleEdit = (u: Unit) => {
      setSelectedUnit(u)
      setEditOpen(true)
    }
    const handleDelete = (u: Unit) => {
      setSelectedUnit(u)
      setShowConfirm(true)
    }
    const handleViewApartment = (data: TenantWithUnitDetails) => {
      setSelectedTenant(data);
      setIsViewModalOpen(true);
    };
    const handleViewHistory = () => {
      console.log("History here...")
    }
      
    const confirmDelete = async (id: number) => {
      setShowConfirm(false);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
  
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error || "Failed to delete unit record.");
        }
        console.log("Unit deleted successfully");
  
        window.location.reload();
      } catch (error: any) {
        setError(error.message || "Failed to delete unit record.")
      }
    };
    
    const cancelDelete = () => {
      setShowConfirm(false);
    };
    
    const handleSave = async (updated: Unit) => {
        const body = updated
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/update/${updated.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
    
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err?.error || "Failed to update unit record.");
          }
    
          console.log("Unit updated successfully");
          //window.location.reload();
          triggerRefresh();
        } catch (error: any) {
          setError(error.message || "Failed to update unit record.")
        }
    
      }

    /*const handleSearch = async (searchTerm: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/search?q=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err?.error || "Something went wrong");
            }
            const searchedUnits: Unit[] = await response.json(); 
            setUnits(searchedUnits);
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        }
    };*/

    const handleSearch = async (searchTerm: string) => {
      if (searchTerm === '') {
        setForViewTenantData(fullTenantData)
        setUnits(fullTenantData?.map(t => t.unit) || []);
        return;
      }

      try {
        const filtered = fullTenantData?.filter((data) => {
          const lower = searchTerm.toLowerCase();
          return (
            data.unit.name.toLowerCase().includes(lower) ||
            data.unit.unitNumber.toLowerCase().includes(lower) ||
            data.firstName?.toLowerCase().includes(lower) ||
            data.lastName?.toLowerCase().includes(lower)
          );
        }) || [];
        setForViewTenantData(filtered)
        setUnits(filtered.map(f => f.unit));
      } catch (err: any) {
        setError(err.message || "Something went wrong while filtering");
      }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('en-US');
    };

    useEffect(() => {
        const fetchUnits = async () => {
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`);
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || "Error fetching units");
              }
              const unitData = await res.json();
              setUnits(unitData);

              const tenantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`);
              if (!tenantRes.ok) {
                throw new Error("Error fetching apartment data");
              }
              const tenantData = await tenantRes.json();

              const subtenantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subtenants`);
              if (!subtenantRes.ok) {
                throw new Error("Error fetching apartment data");
              }
              const subtenantData = await subtenantRes.json();

              const processed: TenantWithUnitDetails[] = unitData.map((u: Unit) => {
              const tenant = tenantData.find((t: any) => Number(t.unitId) === u.id);

              const tenantSubs = subtenantData.filter(
                (s: any) => s.mainTenantId === tenant?.id
              );

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
              setForViewTenantData(processed)
            } catch (error: any) {
              setError(error.message || "Error fetching units")
            }
        };
        fetchUnits();
    }, []);

    useEffect(() => {
      if (refreshTrigger > 0) {
        console.log("Refreshing Apartment List...");
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
        setLoading(true);
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
        setForViewTenantData(processed);
        setUnits(unitData);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    // Listen for refresh triggers from other components (like when tenants are added/removed)
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                console.log("Apartment list: Refreshing units due to trigger:", refreshTrigger);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`);
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err?.error || "Error fetching units");
                }
                const data = await res.json();
                console.log("Apartment list: Fetched units data:", data);
                setUnits(data);
                console.log("Apartment list: Units refreshed successfully");
            } catch (error: any) {
                setError(error.message || "Error refreshing units")
            }
        };
        // Trigger refresh on any change in refreshTrigger (except initial load)
        if (refreshTrigger > 0) {
            console.log("Apartment list: refreshTrigger changed to:", refreshTrigger, "- fetching units");
            fetchUnits();
        }
    }, [refreshTrigger]);

    useEffect(() =>{
          const handleKeyDown = (event: KeyboardEvent) => {
              if (event.key === 'Escape') {
                  if (searchTerm !== '') {
                      cancelSearch();
                  }
              }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
          document.removeEventListener('keydown', handleKeyDown);
      };

    }, [searchTerm])

  const createTable = (data: Unit[]) => {
    return (
        
        <div className="bg-white rounded-lg shadow-sm overflow-auto" ref={areaRef}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-10">
                    <h2 className="text-lg font-medium text-gray-900">Apartments</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Search:</span>
                        <input 
                        type="text"
                        className="px-3 py-1 border border-gray-300 rounded text-sm w-80"
                        placeholder="Search apartments..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            
                            handleSearch(searchTerm);
                        }
                        }}
                        />
                    </div>
                    
                    
                    
                </div>
                
                <div className="flex items-center gap-2">
                  <AddUnitButton/>
                  {/* <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)}>
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button> */}
                </div>
                </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit no, contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartment Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupants</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forViewTenantData?.map((data) => (
                <tr key={data.unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.unit.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{data.unit.unitNumber}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        data.phoneNumber 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {/* TODO: This will be joined from tenants table in the future */}
                        {data.phoneNumber || "No tenant"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.unit.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{data.unit.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(data.subTenants.length + (data.firstName ? 1 : 0))} / {data.unit.numOccupants}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(data.unit.price)}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button 
                      onClick={() => handleViewApartment(data)}
                      className="inline-flex items-center px-3 py-1 bg-yellow-300 text-black text-xs rounded hover:bg-yellow-400 transition-colors border border-yellow-300 hover:border-yellow-400">
                        <Eye size={12} className="mr-1" />
                        View
                      </button>
                      <button 
                      onClick={() => handleViewHistory}
                      className="inline-flex items-center px-3 py-1 bg-gray-300 text-black text-xs rounded hover:bg-yellow-400 transition-colors border border-gray-300 hover:border-yellow-400">
                        <History size={12} className="mr-1" />
                        History
                      </button>
                      <button 
                      onClick={() => handleDelete(data.unit)}
                      className="inline-flex items-center px-3 ml-10 py-1 bg-black text-yellow-300 text-xs rounded hover:text-yellow-400 transition-colors border border-black hover:border-black">
                        <Trash2 size={12} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{units.length}</span> entries
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (loading) return <p>Loading payments...</p>;
  
  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">

      {createTable(units)}

      {selectedUnit && 
      <EditUnitCard
        open={editOpen}
        onClose={() => {setEditOpen(false), setSelectedUnit(null)}}
        onSave={handleSave}
        unit={selectedUnit}
      />
      }

      {selectedUnit && 
        <DeleteModal
        open={showConfirm}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        onCancel={cancelDelete}
        onConfirm={() => confirmDelete(selectedUnit.id)}
        />}

      <ErrorModal
        open={error !== null}
        message={error || ""}
        onClose={() => setError(null)}
      />

      {selectedTenant && (
          <AllInModal 
              open={isViewModalOpen}
              selectedTab={"apartment"}
              onClose={() => {setIsViewModalOpen(false), setSelectedTenant(null)}}
              tenant={selectedTenant}
          />
      )}
    </div>
  );
};