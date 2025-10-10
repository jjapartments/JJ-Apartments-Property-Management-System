"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
          max_num: unit.max_num || "",
          price: unit.price || "",
     });

     const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify({
          name: unit.name || "",
          unitNumber: unit.unitNumber || "",
          description: unit.description || "",
          max_num: unit.max_num || "",
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
               max_num: unit.max_num || "",
               price: unit.price || "",
          });
     };

     const handleSubmit = () => {
          if (!validateForm()) return;

          console.log("Submitted values:", formData);
          setIsEditing(false);
          setErrors({});

          // [TO DO] :: api call
     };

     const handleChange = (field: string, value: string) => {
          setErrors({});
          setFormData((prev) => ({ ...prev, [field]: value }));
     };

     const [errors, setErrors] = useState<{ [key: string]: string }>({});
     const validateForm = () => {
          const newErrors: { [key: string]: string } = {};

          if (!formData.name.trim()) 
               newErrors.name = "Apartment name is required.";
          if (!formData.unitNumber.trim()) 
               newErrors.unitNumber = "Unit number is required.";
          if (!formData.description.trim()) 
               newErrors.description = "Description is required.";

          const maxNumValue = Number(formData.max_num);
          if (isNaN(maxNumValue) || maxNumValue < 0)
               newErrors.max_num = "Maximum occupants must be a non-negative number.";

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
                         value={formData.max_num || 1}
                         placeholder="e.g., 2"
                         required
                         onChange={(e) => handleChange("max_num", e.target.value)}
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