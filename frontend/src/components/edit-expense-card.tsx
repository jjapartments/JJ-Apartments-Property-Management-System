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
import { Expense } from './expenses-list'
import { Unit } from './expenses-list'
import { DatePicker } from './date-picker'
import { api, ApiError } from '@/lib/api'
type Props = {
  open: boolean
  onClose: () => void
  onSave: (updated: any) => void
  expense: any // ideally Expense type
}

export default function EditExpenseCard({ open, onClose, onSave, expense }: Props) {
    const [form, setForm] = useState<Expense>(() => ({ ...expense }));
    const [units, setUnits] = useState<Unit[]>([]);
    const [originalForm, setOriginalForm] = useState<Expense>(() => ({ ...expense }));
    const modeOptions = ["Cash", "GCash", "Bank Transfer", "Online Expense", "Other"];
    const reasonOptions = ["Miscellaneous", "Maintenance"];
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
    if (open && expense) {
        setForm({ ...expense });
        setOriginalForm({ ...expense });
    }
    }, [open, expense]);

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        onSave(form);
        onClose();
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
        if (typeof form.amount !== "number" || isNaN(form.amount) || form.amount <= 0) {
            return "Amount must be a valid number greater than 0.";
        }

        if (!form.unitId || !form.amount || !form.modeOfPayment || !form.reason || !form.date) {
            return "Please fill in all required fields.";
        }

        

        return null;
    };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
            <DialogTitle>Edit Expense Record</DialogTitle>
        </DialogHeader>
            <div className="grid gap-4 py-2">
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

                <div >
                    <Label className="py-1">Amount</Label>
                    <Input
                        type="number"
                        value={form.amount ?? ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange("amount", val === "" ? "" : Number(val));
                        }}
                        />
                </div>

                <div>
                    <Label className="py-1">Mode Of Payment</Label>
                    <Select value={form.modeOfPayment?.toString() || ""} onValueChange={(value) => handleChange("modeOfPayment", value)}>
                        <SelectTrigger className="w-full h-11 rounded-md border px-3 text-left">
                            <SelectValue placeholder="Select Mode of Expense" />
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
                <div>
                    <Label className="py-1">Reason</Label>
                    <Select value={form.reason?.toString() || ""} onValueChange={(value) => handleChange("reason", value)}>
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
        
            
        <div>
            <Label className="py-1">Date</Label>
            <DatePicker
                date={form.date ? new Date(form.date) : undefined}
                setDate={(selectedDate) =>
                    setForm((prev) => ({
                    ...prev,
                    date: selectedDate ? selectedDate.toLocaleDateString('en-CA') : "",
                    }))
                }
            />
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
