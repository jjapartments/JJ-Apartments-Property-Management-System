import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";

interface Tenant {
  id?: string;
  firstName: string;
  email: string;
  middleInitial?: string;
  lastName: string;
  phoneNumber: string;
  link: string;
  moveInDate: string;
  moveOutDate: string;
}

interface Unit {
  id: number;
  unitNumber: string;
  name: string;
  description: string;
  numOccupants: number;
  price: number;
}

interface UnitHistoryProps {
  unit: Unit;
  open: boolean;
  onClose: () => void;
}

export function UnitHistoryModal({ open, onClose, unit }: UnitHistoryProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !unit?.id) return; // Only fetch when modal is open and unit exists

    const fetchTenants = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.get<Tenant[]>(
          `/api/tenants/moved-out/${unit.id}`
        );
        setTenants(data);
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Error fetching tenants";
        console.error("Error fetching tenants:", error);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [open, unit?.id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:max-w-3xl w-full">
        <DialogHeader className="flex flex-col">
          <DialogTitle className="text-2xl font-semibold">
            {unit.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            View past tenant/s of this unit.
          </DialogDescription>

          <hr className="border-t border-gray-200" />
        </DialogHeader>

        {loading ? (
          <p className="text-center text-sm text-gray-500 mt-4">
            Loading tenants...
          </p>
        ) : error ? (
          <p className="text-center text-sm text-red-500 mt-4">{error}</p>
        ) : tenants.length === 0 ? (
          <p className="text-center text-sm text-gray-500 mt-4">
            No past tenants found.
          </p>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
            {tenants.map((t, index) => (
              <TenantInfo key={t.id || index} tenant={t} index={index} />
            ))}
          </div>
        )}

        <hr className="border-t border-gray-200" />
      </DialogContent>
    </Dialog>
  );
}

interface TenantInfoProps {
  tenant: Tenant;
  index: number;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function TenantInfo({ tenant, index }: TenantInfoProps) {
  return (
    <div className="w-full border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm bg-white">
      {/* Top Row: Name + Dates */}
      <div className="flex justify-between items-center mb-2">
        <span className="bg-yellow-300 px-4 py-1 rounded-xl font-semibold text-base">
          {tenant.firstName}{" "}
          {tenant.middleInitial ? `${tenant.middleInitial}. ` : ""}
          {tenant.lastName}
        </span>
        <span className="text-sm text-gray-500 mr-3">
          {formatDate(tenant.moveInDate)} to {formatDate(tenant.moveOutDate)}
        </span>
      </div>

      {/* Contact Info Box */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
        <p>
          <span className="font-medium text-gray-700">Email:</span>{" "}
          {tenant.email || "N/A"}
        </p>
        <p>
          <span className="font-medium text-gray-700">Phone:</span>{" "}
          {tenant.phoneNumber}
        </p>
        <p>
          <span className="font-medium text-gray-700">
            Messenger / Facebook Link:
          </span>{" "}
          <a
            href={tenant.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {tenant.link}
          </a>
        </p>
      </div>
    </div>
  );
}
