import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Unit } from "@/components/expenses-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { Expense } from "@/components/expenses-list";
import { api, ApiError } from "@/lib/api";

interface Props {
  setExpense: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export default function AddExpenseButton({ setExpense }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [unitId, setUnitId] = useState<number>(0);
  const [modeOfPayment, setModeOfPayment] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [units, setUnits] = useState<Unit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const modeOptions = [
    "Cash",
    "GCash",
    "Bank Transfer",
    "Online Payment",
    "Other",
  ];
  const reasonOptions = ["Miscellaneous", "Maintenance"];

  const resetForm = () => {
    setAmount("");
    setDate(undefined);
    setModeOfPayment("");
    setReason("");
    setUnitId(0);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await api.get<Unit[]>("/api/units");
        setUnits(data);
      } catch (err: unknown) {
        const displayMessage =
          err instanceof ApiError
            ? err.message
            : "Failed to fetch units data. Please try again.";
        console.error("fetchUnits error:", err);
        setError(displayMessage);
      }
    };

    fetchUnits();
  }, []);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!unitId) {
      setError("Please select a unit.");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!modeOfPayment) {
      setError("Please select a mode of payment.");
      return;
    }

    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    const body = {
      unitId: Number(unitId),
      amount: Number(amount),
      modeOfPayment,
      reason,
      date: date?.toLocaleDateString("en-CA"),
    };

    try {
      const saved = await api.post("/api/expenses/add", body);
      setExpense((prev) => [saved, ...prev]);
      handleClose();
    } catch (err: unknown) {
      const displayMessage =
        err instanceof ApiError
          ? err.message
          : "Error submitting expense. Please try again.";
      console.error("handleSubmit error:", err);
      setError(displayMessage);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add</Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-[600px] bg-card">
            <CardHeader>
              <CardTitle>Add Expense Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-1 text-sm text-gray-900">
                Unit <span className="text-red-500">*</span>
                <Select onValueChange={(value) => setUnitId(Number(value))}>
                  <SelectTrigger className="w-full h-11 rounded-md border px-3 text-left">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {units.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        Unit {u.unitNumber} - {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="py-1 text-sm text-gray-900">
                Amount <span className="text-red-500">*</span>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-4 py-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="py-1 text-sm text-gray-900">
                    Mode Of Payment <span className="text-red-500">*</span>
                    <Select onValueChange={(value) => setModeOfPayment(value)}>
                      <SelectTrigger className="w-full h-11 rounded-md border px-3 text-left">
                        <SelectValue placeholder="Select Mode of Payment" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {modeOptions.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="py-1 text-sm text-gray-900">
                    Reason <span className="text-red-500">*</span>
                    <Select onValueChange={(value) => setReason(value)}>
                      <SelectTrigger className="w-full h-11 rounded-md border px-3 text-left">
                        <SelectValue placeholder="Select Reason" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {reasonOptions.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
            </CardContent>

            <CardFooter className="flex justify-between">
              <div className="flex gap-4">
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
