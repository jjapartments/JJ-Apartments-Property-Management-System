import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { useDataRefresh } from "@/contexts/DataContext";
import { Rate } from "./utilities-list";
import { api, ApiError } from "@/lib/api";

interface AddRateButtonProps {
  type: "Meralco" | "Manila Water";
  setRates: React.Dispatch<React.SetStateAction<Rate[]>>;
}

export default function AddRateButton({ type, setRates }: AddRateButtonProps) {
  const [rate, setRate] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const resetForm = () => {
    setRate("");
    setDate(undefined);
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
    resetForm();
  };
  
  const handleSubmit = async () => {
    const body = {
      type,
      rate: Number(rate),
      date: date?.toLocaleDateString("en-CA"),
    };

    try {
      setLoading(true);
      const savedRate = await api.post("/api/rates/add", body);
      setRates((prev) => [savedRate, ...prev]);
      handleClose();
    } catch (error: unknown) {
      const displayMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Error submitting rate";

      console.error("handleSubmit error:", error);
      setError(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Rate Record</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Adding rate...
            </h3>
            <p className="text-gray-500">Please wait</p>
          </div>
        ) : (
          <>
            <div className="py-1 text-sm text-gray-900">
              Rate <span className="text-red-500">*</span>
              <Input
                type="number"
                placeholder="Amount"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>

            <div className="py-1 text-sm text-gray-900">
              Date <span className="text-red-500">*</span>
              <DatePicker date={date} setDate={setDate} />
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                {error}
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </DialogTrigger>
          <Button onClick={handleSubmit} disabled={!rate || !date || loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}