'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select"
import { Utility } from './utilities-list'
import { Unit } from './expenses-list'
import { DatePicker } from './date-picker'
import { api, ApiError } from '@/lib/api'
type Props = {
  open: boolean
  onClose: () => void
  onSave: (updated: any) => void
  utility: any // ideally Utility type
}

export default function EditUtilityCard({ open, onClose, onSave, utility }: Props) {
    const [form, setForm] = useState<Utility>(() => ({ ...utility }));
    const [units, setUnits] = useState<Unit[]>([]);
    const [originalForm, setOriginalForm] = useState<Utility>(() => ({ ...utility }));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    if (open && utility) {
        setForm({ ...utility });
        setOriginalForm({ ...utility });
    }
    }, [open, utility]);

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null); // clear previous errors
        
        onSave(form)
        onClose()
    }

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
                : "Failed to fetch units data.";
            console.error("fetchUnits error:", error);
            setError(displayMessage);
            }
        };

        fetchUnits();
    }, []);



    const handleCancel = () => {
        setForm({ ...originalForm });
    };
    const validateForm = () => {
        if (!form.type || !form.unitId || form.currentReading === undefined || form.previousReading === undefined || !form.dueDate || !form.monthOfStart || !form.monthOfEnd) {
            return "Please fill in all required fields.";
        }

        if (form.currentReading < form.previousReading) {
            return "Current reading cannot be less than previous reading.";
        }

        if (new Date(form.monthOfEnd) < new Date(form.monthOfStart)) {
            return "Month of end cannot be before month of start.";
        }

        if (form.isPaid && !form.paidAt) {
            return "Paid at date is required when marked as paid.";
        }

        if (!form.isPaid && form.paidAt) {
            return "Paid at should be empty if the record is not marked as paid.";
        }

        return null; // No error
    };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
            <DialogTitle>Edit Utility Record</DialogTitle>
        </DialogHeader>
            <div className="grid gap-4 py-2">
                <div>
              
                <Label className="py-1">Type</Label>
                <Select
                    value={form.type || ""}
                    onValueChange={(value) => handleChange("type", value)}
                >
                    <SelectTrigger className="w-full h-11 rounded-md border px-3 text-left">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                        <SelectItem value="Meralco">Meralco</SelectItem>
                        <SelectItem value="Manila Water">Manila Water</SelectItem>
                    </SelectContent>
                </Select>
            </div>

                <div>
                    <Label className="py-1">Unit</Label>
                    <Select value={form.unitId?.toString() || ""} onValueChange={(value) => handleChange("unitId", Number(value))}>
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
            <div className="grid grid-cols-2 gap-4">
                <div >
                <Label className="py-1">Previous Reading</Label>
                <Input
                    type="number"
                    value={form.previousReading ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        handleChange("previousReading", val === "" ? "" : Number(val));
                    }}
                    />
                </div>
            <div>
                <Label className="py-1">Current Reading</Label>
                <Input
                    type="number"
                    value={form.currentReading ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        handleChange("currentReading", val === "" ? "" : Number(val));
                    }}
                />
            </div>
        </div>

        <div>
            <Label className="py-1">Due Date</Label>
            <DatePicker
                date={form.dueDate ? new Date(form.dueDate) : undefined}
                setDate={(selectedDate) =>
                    setForm((prev) => ({
                    ...prev,
                    dueDate: selectedDate ? selectedDate.toLocaleDateString('en-CA') : "",
                    }))
                }
            />
        </div>

          

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="py-1">Month Of Start</Label>
                    <DatePicker
                        date={form.monthOfStart ? new Date(form.monthOfStart) : undefined}
                        setDate={(date) =>
                        setForm(prev => ({
                        ...prev,
                        monthOfStart: date?.toLocaleDateString('en-CA') || ""
                        }))
                    }
                    />
                </div>
                
                <div>
                    <Label className="py-1">Month Of End</Label>
                    <DatePicker
                    date={form.monthOfEnd ? new Date(form.monthOfEnd) : undefined}
                    setDate={(date) =>
                        setForm(prev => ({
                        ...prev,
                        monthOfEnd: date?.toLocaleDateString('en-CA') || ""
                        }))
                    }
                />
                </div>
                
        </div>

        <div className="grid grid-cols-2 gap-4">
            
            <div>
              <Label className="py-1">Is Paid?</Label>
              <Select
                value={form.isPaid ? "yes" : "no"}
                onValueChange={(value) => handleChange("isPaid", value === "yes")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
                <Label className="py-1">Paid At</Label>
                <DatePicker
                    date={form.paidAt ? new Date(form.paidAt) : undefined}
                    setDate={(selectedDate) =>
                        setForm((prev) => ({
                            ...prev,
                            paidAt: selectedDate ? selectedDate.toLocaleDateString('en-CA') : "",
                        }))
                    }
                />
            </div>

            
        </div>
        {error && (
            <div className="text-sm text-red-600 bg-red-100 rounded px-3 py-2 mb-2">
                {error}
            </div>
        )}
            


          </div>
        <DialogFooter>
          <Button variant="secondary"  
            onClick={() => {
                handleCancel();
                onClose();
            }}>
                Cancel
            </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    
  )
}
