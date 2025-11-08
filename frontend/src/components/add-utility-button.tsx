import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Utility } from "./utilities-list";
import { api, ApiError } from "@/lib/api";
interface Props {
  type: "Meralco" | "Manila Water";
  setUtilities: React.Dispatch<React.SetStateAction<Utility[]>>;
}

export default function AddUtilityButton({ type, setUtilities }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [unitId, setUnitId] = useState<number>(0);
  const [currentReading, setCurrentReading] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [monthOfStart, setMonthOfStart] = useState<Date | undefined>(undefined);
  const [monthOfEnd, setMonthOfEnd] = useState<Date | undefined>(undefined);
  const [units, setUnits] = useState<Unit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setUnitId(0);
    setCurrentReading("");
    setDueDate(undefined);
    setMonthOfStart(undefined);
    setMonthOfEnd(undefined);
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
      } catch (error: unknown) {
        const displayMessage =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to fetch units data";

        console.error("fetchUnits error:", error);
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

    if (!currentReading || isNaN(Number(currentReading)) || Number(currentReading) <= 0) {
      setError("Please enter a valid reading greater than 0.");
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    if (!monthOfStart) {
      setError("Please select a month of start.");
      return;
    }

    if (!monthOfEnd) {
      setError("Please select a month of end.");
      return;
    }

    const body = {
      type,
      currentReading: Number(currentReading),
      dueDate: dueDate?.toLocaleDateString("en-CA"),
      monthOfStart: monthOfStart?.toLocaleDateString("en-CA"),
      monthOfEnd: monthOfEnd?.toLocaleDateString("en-CA"),
      unitId: Number(unitId),
    };

    try {
      const savedUtility = await api.post("/api/utilities/add", body);
      setUtilities((prev) => [savedUtility, ...prev]);
      handleClose();
    } catch (error: unknown) {
      const displayMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to create utility record";

      console.error("handleSubmit utility error:", error);
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
              <CardTitle>Add {type} Record</CardTitle>
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
                Current Reading <span className="text-red-500">*</span>
                <Input
                  type="number"
                  placeholder="Current Reading"
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
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
