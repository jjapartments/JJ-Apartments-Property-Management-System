"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input";
import { DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Subtenant {
     id?: string;
     firstName: string;
     middleName?: string;
     lastName: string;
     phoneNumber: string;
     link: string;
}

interface SubTenantDetailsProps {
     subtenants: Subtenant[];
     maxOccupants: number;
     onUnsavedChange?: (hasChanges: boolean) => void;
     noTenant: Boolean
}
interface SubtenantWIndex {
     subtenant: any;
     index: number;
     isEditing: boolean;
}

export function SubTenantDetails({ subtenants, maxOccupants, onUnsavedChange, noTenant }: SubTenantDetailsProps) {
     const [isEditing, setIsEditing] = useState(false);
     const [formData, setFormData] = useState<Subtenant[]>([]);
     const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
     const [validationError, setValidationError] = useState<string | null>(null);

     useEffect(() => {
          setFormData(subtenants);
     }, [subtenants]);

     useEffect(() => {
          if (isEditing) {
               const hasChanges = JSON.stringify(formData) !== JSON.stringify(subtenants);
               setHasUnsavedChanges(hasChanges);
               onUnsavedChange?.(hasChanges);
          } else {
               setHasUnsavedChanges(false);
          }
     }, [formData, isEditing, subtenants, onUnsavedChange]);


     const handleEdit = () => {
          setIsEditing(true);
     };

     const handleCancel = () => {
          setFormData(subtenants);
          setIsEditing(false);
          setHasUnsavedChanges(false);
          onUnsavedChange?.(false);
     };

     const validateForm = () => {
          const errors: string[] = [];

          formData.forEach((sub, i) => {
               if (!sub.firstName || !sub.lastName)
                    errors.push(`Name fields cannot be empty.`);

               if (sub.middleName && sub.middleName.length > 1)
                    errors.push(`Middle initial must be one letter.`);

               if (!/^(09|\+639)\d{9}$/.test(sub.phoneNumber))
                    errors.push(`Invalid phone number.`);

               if (sub.link && !/^https?:\/\/(www\.)?(facebook|m\.me)\.com/.test(sub.link))
                    errors.push(`Invalid Messenger/Facebook link.`);
          });

          return [...new Set(errors)];
     };

     const handleSubmit = () => {
          const errors = validateForm();
          if (errors.length > 0) {
               setValidationError(errors.join(" "));
               return;
          }
          setValidationError(null);

          console.log("Updated Subtenants:", formData);
          setIsEditing(false);
          setHasUnsavedChanges(false);

          // [TODO]: api call
     };

     const handleChange = (index: number, field: string, value: string) => {
          setValidationError(null);
          setFormData((prev) => {
               const updated = prev.map((sub, i) =>
                    i === index ? { ...sub, [field]: value } : sub
               );
               const hasChanges = JSON.stringify(updated) !== JSON.stringify(subtenants);
               setHasUnsavedChanges(hasChanges);
               onUnsavedChange?.(hasChanges);
               return updated;
          });
     };

     const handleAddSubtenant = () => {
          if (formData.length >= maxOccupants - 1) return;
          setFormData((prev) => [
               ...prev,
               { id: Date.now().toString(), firstName: "", middleName: "", lastName: "", phoneNumber: "", link: "" },
          ]);
     };

     const handleRemoveSubtenant = (index: number) => {
          setFormData((prev) => prev.filter((_, i) => i !== index));
     };

     if ((subtenants.length === 0 && !isEditing) || (formData.length === 0 && !isEditing)) {
          var totalOcc = 0
          var canAdd = false
          if (!noTenant) {
               totalOcc = 1 + subtenants.length
               canAdd = totalOcc < maxOccupants;
          } else {
               canAdd = false
          }

          console.log(totalOcc, canAdd, noTenant, maxOccupants)

          return (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <DialogDescription className="text-s text-muted-foreground text-center">
                         No subtenant/s available.
                    </DialogDescription>

                    {canAdd && (
                         <Button
                              onClick={handleAddSubtenant}
                              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-s rounded-lg py-3 flex items-center justify-center"
                         >
                              + Add Subtenant
                         </Button>
                    )}
               </div>
          );
     }

     return (
          <div>
               <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2 mb-4">
               {formData.map((s, index) => (
                    <SubtenantInfo
                    key={s.id || index}
                    subtenant={s}
                    index={index}
                    isEditing={isEditing}
                    onChange={(field, value) => handleChange(index, field, value)}
                    onRemove={() => handleRemoveSubtenant(index)}
                    canRemove={isEditing}
                    />
               ))}

               {isEditing && formData.length < maxOccupants - 1 && (
                    <Button
                         onClick={handleAddSubtenant}
                         className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-s rounded-lg py-3 flex items-center justify-center"
                    >
                         + Add Subtenant
                    </Button>
               )}
               </div>

               <hr className="border-t border-gray-200" />

               <DialogFooter className="w-full flex items-center justify-between">
                    <div className="flex-1">
                         {isEditing && (
                         <>
                              {validationError ? (
                              <ul className="text-sm text-red-500 list-disc list-inside">
                                   {validationError.split(". ").map((err, idx) => (
                                   <li key={idx}>{err}</li>
                                   ))}
                              </ul>
                              ) : hasUnsavedChanges ? (
                              <p className="text-sm text-gray-500 italic">
                                   You have unsaved changes.
                              </p>
                              ) : null}
                         </>
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

interface SubtenantInfoProps {
     subtenant: Subtenant;
     index: number;
     isEditing: boolean;
     onChange: (field: string, value: string) => void;
     onRemove: () => void;
     canRemove: boolean;
}

function SubtenantInfo({
     subtenant,
     index,
     isEditing,
     onChange,
     onRemove,
     canRemove,
}: SubtenantInfoProps) {
     return (
          <div className="w-full border border-gray-300 rounded-2xl p-4 space-y-3">
               <div className="flex justify-between items-center mb-2">
               <h3 className="font-semibold text-lg">Sub-Tenant {index + 1}</h3>
               {canRemove && (
                    <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={onRemove}
                    >
                    Remove
                    </Button>
               )}
               </div>

               <div className="grid grid-cols-3 gap-4">
               <InputField
                    isEditing={isEditing}
                    label="First Name"
                    value={subtenant.firstName}
                    placeholder="First Name"
                    required
                    onChange={(e) => onChange("firstName", e.target.value)}
               />
               <InputField
                    isEditing={isEditing}
                    label="Middle Initial"
                    value={subtenant.middleName || ""}
                    placeholder="M"
                    maxLength={1}
                    onChange={(e) => onChange("middleName", e.target.value)}
               />
               <InputField
                    isEditing={isEditing}
                    label="Last Name"
                    value={subtenant.lastName}
                    placeholder="Last Name"
                    required
                    onChange={(e) => onChange("lastName", e.target.value)}
               />
               </div>

               <div className="grid grid-cols-2 gap-4">
               <InputField
                    isEditing={isEditing}
                    label="Cellphone Number"
                    value={subtenant.phoneNumber}
                    placeholder="0917XXXXXXX"
                    onChange={(e) => onChange("phoneNumber", e.target.value)}
                    required
               />
               <InputField
                    isEditing={isEditing}
                    label="Messenger / Facebook Link"
                    value={subtenant.link}
                    placeholder="https://m.me/username"
                    onChange={(e) => onChange("link", e.target.value)}
               />
               </div>
          </div>
     );
}