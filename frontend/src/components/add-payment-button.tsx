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
import { Payment } from "./payments-list";
import { api, ApiError } from "@/lib/api";

interface Props {
  setPayment: React.Dispatch<React.SetStateAction<Payment[]>>;
}

export default function AddPaymentButton({ setPayment }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [unitId, setUnitId] = useState<number>(0);
  const [modeOfPayment, setModeOfPayment] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [monthOfStart, setMonthOfStart] = useState<Date | undefined>(undefined);
  const [monthOfEnd, setMonthOfEnd] = useState<Date | undefined>(undefined);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const modeOptions = [
    "Cash",
    "GCash",
    "Bank Transfer",
    "Online Payment",
    "Other",
  ];
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setUnitId(0);
    setAmount("");
    setDueDate(undefined);
    setModeOfPayment("");
    setMonthOfStart(undefined);
    setMonthOfEnd(undefined);
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
    resetForm();
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await api.get<Unit[]>("/api/units");
        setUnits(data);
      } catch (error: unknown) {
        const displayMessage =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to fetch data";
        console.error("fetchUnits error:", error);
        setError(displayMessage);
      }
    };

    fetchUnits();
  }, []);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!unitId) return setError("Please select a unit.");
    if (!modeOfPayment) return setError("Please select a mode of payment.");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setError("Please enter a valid amount greater than 0.");
    if (!dueDate) return setError("Please select a due date.");
    if (!monthOfStart) return setError("Please select a month of start.");
    if (!monthOfEnd) return setError("Please select a month of end.");

    const body = {
      unitId,
      modeOfPayment,
      amount: Number(amount),
      dueDate: dueDate?.toLocaleDateString("en-CA"),
      monthOfStart: monthOfStart?.toLocaleDateString("en-CA"),
      monthOfEnd: monthOfEnd?.toLocaleDateString("en-CA"),
    };

    try {
      setLoading(true);
      const saved = await api.post("/api/payments/add", body);
      setPayment((prev) => [saved, ...prev]);
      handleClose();
    } catch (error: unknown) {
      const displayMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Error submitting payment";
      console.error("handleSubmit error:", error);
      setError(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add</Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-[600px] bg-card">
            <CardHeader>
              <CardTitle>Add Payment Record</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Adding payment...
                  </h3>
                  <p className="text-gray-500">Please wait</p>
                </div>
              ) : (
                <>
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
                    Amount <span className="text-red-500">*</span>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="py-1 text-sm text-gray-900">
                    Due Date <span className="text-red-500">*</span>
                    <DatePicker date={dueDate} setDate={setDueDate} />
                  </div>

                  <div className="grid gap-4 py-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="py-1 text-sm text-gray-900">
                        Month Of Start <span className="text-red-500">*</span>
                        <DatePicker date={monthOfStart} setDate={setMonthOfStart} />
                      </div>
                      <div className="py-1 text-sm text-gray-900">
                        Month Of End <span className="text-red-500">*</span>
                        <DatePicker date={monthOfEnd} setDate={setMonthOfEnd} />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                      {error}
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <div className="flex gap-4">
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
