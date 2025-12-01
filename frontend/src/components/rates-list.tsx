"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "./delete-modal";
import { Rate } from "./utilities-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ErrorModal } from "./error-modal";
import AddRateButton from "./add-rate-button";
import { api, ApiError } from "@/lib/api";
interface RatesListProps {
  open: boolean;
  type: "Meralco" | "Manila Water";
  onClose: () => void;
}
export default function RatesList({ open, type, onClose }: RatesListProps) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

  const handleDelete = (r: Rate) => {
    setSelectedRate(r);
    setShowConfirm(true);
  };

  const confirmDelete = async (id: number) => {
    setShowConfirm(false);
    try {
      await api.delete(`/api/rates/${id}`);
      console.log("Rate deleted successfully");

      setRates((prev) => prev.filter((rate) => rate.id !== id));
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to delete rate record.";
      console.error("Error deleting rate:", error);
      setError(message);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  useEffect(() => {
    if (!open) return;

    const fetchRates = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.get<Rate[]>(`/api/rates/type?type=${type}`);
        setRates(data);
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to fetch data";
        console.error("Error fetching rates:", error);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [open, type]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{type} Rates</DialogTitle>
          </DialogHeader>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p role="status" className="text-red-500">
              {error}
            </p>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full text-sm text-left border">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-4 text-sm text-gray-900"></th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        ₱{rate.rate.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(rate.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(rate)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <AddRateButton type={type} setRates={setRates} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedRate && (
        <DeleteModal
          open={showConfirm}
          title="Delete Record"
          message="Are you sure you want to delete this record? This action cannot be undone."
          onCancel={cancelDelete}
          onConfirm={() => confirmDelete(selectedRate.id)}
        />
      )}

      {error && (
        <ErrorModal
          open={error !== null}
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
