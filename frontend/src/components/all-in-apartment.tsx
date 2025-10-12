"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDataRefresh } from '@/contexts/DataContext';

interface ApartmentDetails {
     unit: any;
     onUnsavedChange?: (hasChanges: boolean) => void;
}

export function ApartmentDetails({ unit, onUnsavedChange }: ApartmentDetails) {
     const [isEditing, setIsEditing] = useState(false);
     const handleEdit = () => {
          setIsEditing(true);
	};

     const [formData, setFormData] = useState({
          name: unit.name || "",
          unitNumber: unit.unitNumber || "",
          description: unit.description || "",
          num_occupants: unit.num_occupants || "",
          price: unit.price || "",
     });
     const [currentUnit, setCurrentUnit] = useState(unit);

     useEffect(() => {
          setCurrentUnit(unit);

          setFormData({
               name: unit.name || "",
               unitNumber: unit.unitNumber || "",
               description: unit.description || "",
               num_occupants: unit.num_occupants || "",
               price: unit.price || "",
          });
     }, [unit]);

     const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify({
          name: unit.name || "",
          unitNumber: unit.unitNumber || "",
          description: unit.description || "",
          num_occupants: unit.num_occupants || "",
          price: unit.price || "",
     });
     useEffect(() => {
          onUnsavedChange?.(hasUnsavedChanges);
     }, [hasUnsavedChanges]);

     const handleCancel = () => {
          setIsEditing(false);
          setErrors({});

          setFormData({
               name: unit.name || "",
               unitNumber: unit.unitNumber || "",
               description: unit.description || "",
               num_occupants: unit.num_occupants || "",
               price: unit.price || "",
          });
     };

     const { triggerRefresh } = useDataRefresh();
     const handleSubmit = async () => {
          if (!validateForm()) return;

          const body = {
               name: formData.name,
               unitNumber: formData.unitNumber,
               description: formData.description,
               num_occupants: Number(formData.num_occupants),
               price: Number(formData.price),
          };

          console.log("Submitted values:", formData);
          setIsEditing(false);
          setErrors({});

          try {
               const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/update/${unit.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
               });

               if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error || "Failed to update unit record.");
               }

               console.log("Unit updated successfully");
               setIsEditing(false);
               setErrors({});

               setCurrentUnit(body); 
               setFormData(body)

               triggerRefresh();
          } catch (error: any) {
               console.error("Error updating unit:", error);
               setErrors({ general: error.message || "Failed to update unit record." });
          }
     };

     const handleChange = (field: string, value: string) => {
          setErrors({});
          setFormData((prev) => ({ ...prev, [field]: value }));
     };

     const [errors, setErrors] = useState<{ [key: string]: string }>({});
     const validateForm = () => {
          // Check is inputs are same
          const isSame =
               formData.name === (unit.name || "") &&
               formData.unitNumber === (unit.unitNumber || "") &&
               formData.description === (unit.description || "") &&
               String(formData.num_occupants) === String(unit.num_occupants || "") &&
               String(formData.price) === String(unit.price || "");

          if (isSame) {
               setErrors({ general: "No changes made." });
               return true;
          }

          // Check if inputs are valid

          const newErrors: { [key: string]: string } = {};

          if (!formData.name.trim()) 
               newErrors.name = "Apartment name is required.";
          if (!formData.unitNumber.trim()) 
               newErrors.unitNumber = "Unit number is required.";
          if (!formData.description.trim()) 
               newErrors.description = "Description is required.";

          const maxNumValue = Number(formData.num_occupants);
          if (isNaN(maxNumValue) || maxNumValue < 0)
               newErrors.num_occupants = "Maximum occupants must be a non-negative number.";

          if (formData.price === "" || Number(formData.price) < 0)
               newErrors.price = "Price must be a non-negative number.";

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     return (
          <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <InputField
                         isEditing={isEditing}
                         label="Apartment Name"
                         value={formData.name || ""}
                         placeholder="Maple Residences"
                         required
                         onChange={(e) => handleChange("name", e.target.value)}
                    />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <InputField
                         isEditing={isEditing}
                         label="Unit Number"
                         value={formData.unitNumber || ""}
                         placeholder="e.g., 1"
                         required
                         onChange={(e) => handleChange("unitNumber", e.target.value)}
                    />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <InputField
                         isEditing={isEditing}
                         label="Description"
                         value={formData.description || ""}
                         placeholder="e.g., Studio Unit"
                         required
                         onChange={(e) => handleChange("description", e.target.value)}
                    />
               </div>

               <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                    <InputField
                         isEditing={isEditing}
                         label="Maximum Number of Occupants"
                         type="number"
                         value={formData.num_occupants || 1}
                         placeholder="e.g., 2"
                         required
                         onChange={(e) => handleChange("num_occupants", e.target.value)}
                    />
                    <InputField
                         isEditing={isEditing}
                         label="Price"
                         type="number"
                         value={formData.price || 0}
                         placeholder="e.g., 1200"
                         required
                         onChange={(e) => handleChange("price", e.target.value)}
                    />
               </div>

               <hr className="border-t border-gray-200" />

               <DialogFooter className="w-full flex items-center justify-between">
                    <div className="flex-1">
                         {isEditing && hasUnsavedChanges && Object.keys(errors).length === 0 && (
                              <p className="text-sm text-gray-500 italic">You have unsaved changes.</p>
                         )}
                         {Object.values(errors).length > 0 && (
                              <ul className="text-sm text-red-500 list-disc list-inside">
                                   {Object.values(errors).map((err, idx) => (
                                   <li key={idx}>{err}</li>
                                   ))}
                              </ul>
                         )}
                    </div>

                    <div className="flex gap-2">
                         {isEditing ? (
                              <>
                              <Button className="min-w-[100px]" onClick={handleCancel}>
                                   Cancel
                              </Button>
                              <Button variant="secondary" onClick={handleSubmit}>
                                   Submit
                              </Button>
                              </>
                         ) : (
                              <>
                              <Button
                                   className="min-w-[100px]"
                                   variant="secondary"
                                   onClick={handleEdit}
                              >
                                   Edit
                              </Button>
                              </>
                         )}
                    </div>
               </DialogFooter>
          </div>
     );
}