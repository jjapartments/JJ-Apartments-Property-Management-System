import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input";
import { DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDataRefresh } from '@/contexts/DataContext';

interface Subtenant {
     id?: string;
     firstName: string;
     middleInitial?: string;
     lastName: string;
     phoneNumber: string;
     link: string;
}

interface SubTenantDetailsProps {
     subtenants: Subtenant[];
     maxOccupants: number;
     isCurrEditing?: (hasChanges: boolean) => void;
     noTenant: Boolean;
     mainTenantId: number
     onSubmit?: (updatedData: any) => Promise<void> | void;
}

export function SubTenantDetails({ subtenants, maxOccupants, isCurrEditing, noTenant, mainTenantId, onSubmit }: SubTenantDetailsProps) {
     const [isEditing, setIsEditing] = useState(false);
     const [formData, setFormData] = useState<Subtenant[]>([]);
     const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
     const [validationError, setValidationError] = useState<string | null>(null);
     const [originalData, setOriginalData] = useState<Subtenant[]>([]);
     const { triggerRefresh } = useDataRefresh();

     useEffect(() => {
          setFormData(subtenants);
          setOriginalData(subtenants)
     }, [subtenants]);

     useEffect(() => {
          if (isEditing) {
               const hasChanges = JSON.stringify(formData) !== JSON.stringify(subtenants);
               setHasUnsavedChanges(hasChanges);
               isCurrEditing?.(hasChanges);
          } else {
               setHasUnsavedChanges(false);
          }
     }, [formData, isEditing, subtenants, isCurrEditing]);

     const handleEdit = () => {
          isCurrEditing?.(true)
          setIsEditing(true);
     };

     const handleCancel = () => {
          setFormData(subtenants);
          setIsEditing(false);
          setHasUnsavedChanges(false);
          isCurrEditing?.(false);
     };

     const validateForm = () => {
          const errors: string[] = [];

          formData.forEach((sub, i) => {
               if (!sub.firstName || !sub.lastName)
                    errors.push(`Name fields cannot be empty.`);

               if (sub.middleInitial && sub.middleInitial.length > 1)
                    errors.push(`Middle initial must be one letter.`);

               if (!/^(09|\+639)\d{9}$/.test(sub.phoneNumber))
                    errors.push(`Invalid phone number.`);
          });

          return [...new Set(errors)];
     };

     const handleSubmit = async () => {
          const errors = validateForm();
          if (errors.length > 0) {
               setValidationError(errors.join(" "));
               return;
          }
          setValidationError(null);

          const currentIds = new Set(formData.filter(st => st.id).map(st => st.id));

          const added = formData.filter(st => st.id == "");
          const FIELDS_TO_COMPARE = ["firstName", "middleInitial", "lastName", "phoneNumber", "link"];
          const updated = formData.filter(st => {
               if (!st.id) 
                    return false;

               const original = subtenants.find(o => o.id === st.id);
               if (!original)
                     return false;

               return FIELDS_TO_COMPARE.some(field => st[field as keyof Subtenant] !== original[field as keyof Subtenant]);
          });
          const removed = subtenants.filter(st => !currentIds.has(st.id));

          console.log("Added:", added);
          console.log("Updated:", updated);
          console.log("Removed:", removed);

          // Check if there are any real changes
          const hasAdded = formData.some(st => !st.id);
          const hasRemoved = subtenants.length !== formData.length;
          const hasUpdated = formData.some(st => {
          const original = subtenants.find(o => o.id === st.id);
               return original && JSON.stringify(st) !== JSON.stringify(original);
          });

          if (!hasAdded && !hasUpdated && !hasRemoved) {
               setValidationError("No changes made.");
               return;
          }

          try {
               const requests: Promise<void>[] = [];

               // Add new subtenants
               for (const sub of added) {
                    requests.push(
                         fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subtenants/add`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(sub),
                         })
                         .then(async res => {
                              if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              throw new Error(err?.error || `Failed to add subtenant ${sub.firstName || ""}`);
                              }
                              return res.json();
                         })
                    );
               }

               // Update existing subtenants
               for (const sub of updated) {
                    requests.push(
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subtenants/update/${sub.id}`, {
                         method: "PATCH",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(sub),
                    }).then(async res => {
                         if (!res.ok) {
                         const err = await res.json().catch(() => ({}));
                         throw new Error(err?.error || `Failed to update subtenant ${sub.firstName || sub.id}`);
                         }
                    })
                    );
               }

               // Delete removed subtenants
               for (const sub of removed) {
                    requests.push(
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subtenants/${sub.id}`, {
                         method: "DELETE",
                    }).then(async res => {
                         if (!res.ok) {
                         const text = await res.text();
                         throw new Error(text || `Failed to delete subtenant ${sub.firstName || sub.id}`);
                         }
                    })
                    );
               }

               await Promise.all(requests);

               // Refresh if success
               setValidationError(null);
               setIsEditing(false);
               setHasUnsavedChanges(false);
               isCurrEditing?.(false);
               if (onSubmit) {
                    await onSubmit(null); 
               }
               triggerRefresh?.(); 
          } catch (error: any) {
               console.error("❌ Error updating subtenants:", error);
               setValidationError(error.message || "Failed to update one or more subtenants.");
          }
     };

     const handleChange = (index: number, field: string, value: string) => {
          setValidationError(null);

          const updated = formData.map((sub, i) =>
               i === index ? { ...sub, [field]: value } : sub
          );

          setFormData(updated);

          // side effects after state update
          const hasChanges = JSON.stringify(updated) !== JSON.stringify(subtenants);
          setHasUnsavedChanges(hasChanges);
          isCurrEditing?.(hasChanges);
     };

     const handleAddSubtenant = () => {
          setIsEditing(true)
          if (formData.length >= maxOccupants - 1) return;
          setFormData((prev) => [
               ...prev,
               { id: "", firstName: "", middleInitial: "", lastName: "", phoneNumber: "", link: "", mainTenantId: mainTenantId },
          ]);
     };

     const handleRemoveSubtenant = (index: number) => {
          setFormData((prev) => prev.filter((_, i) => i !== index));
     };

     if ((subtenants.length === 0 && !isEditing) || (formData.length === 0 && !isEditing)) {
          let totalOcc = 0
          let canAdd = false
          if (!noTenant) {
               totalOcc = 1 + subtenants.length
               canAdd = totalOcc < maxOccupants;
          } else {
               canAdd = false
          }

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
               <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 mb-4">
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

               <hr className="border-t border-gray-200 mb-3" />

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
                    value={subtenant.middleInitial || ""}
                    placeholder="M"
                    maxLength={1}
                    onChange={(e) => onChange("middleInitial", e.target.value)}
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