"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input";
import { DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TenantDetailsProps {
  tenant: any;
  onUnsavedChange?: (hasChanges: boolean) => void;
}

export function TenantDetails({ tenant, onUnsavedChange }: TenantDetailsProps) {
     const [errors, setErrors] = useState<Record<string, string>>({});

     const [isEditing, setIsEditing] = useState(false);
     const handleEdit = () => {
          setIsEditing(true);
	};

     const [formData, setFormData] = useState({
          firstName: tenant.firstName || "",
          middleName: tenant.middleName || "",
          lastName: tenant.lastName || "",
          email: tenant.email || "",
          phoneNumber: tenant.phoneNumber || "",
          messengerLink: tenant.messengerLink || "",
     });

     const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify({
          firstName: tenant.firstName || "",
          middleName: tenant.middleName || "",
          lastName: tenant.lastName || "",
          email: tenant.email || "",
          phoneNumber: tenant.phoneNumber || "",
          messengerLink: tenant.messengerLink || "",
     });

     const handleCancel = () => {
          setIsEditing(false);
          setErrors({});

          setFormData({
               firstName: tenant.firstName || "",
               middleName: tenant.middleName || "",
               lastName: tenant.lastName || "",
               email: tenant.email || "",
               phoneNumber: tenant.phoneNumber || "",
               messengerLink: tenant.messengerLink || "",
          });
     };

     const handleSubmit = () => {
          const newErrors: Record<string, string> = {};

          if (!formData.firstName.trim()) 
               newErrors.firstName = "First name is required.";
          if (!formData.lastName.trim()) 
               newErrors.lastName = "Last name is required.";

          if (formData.middleName && formData.middleName.length > 1)
               newErrors.middleName = "Middle initial must be one letter only.";

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!formData.email.trim()) 
               newErrors.email = "Email is required.";
          else if (formData.email && !emailRegex.test(formData.email))
               newErrors.email = "Invalid email format.";

          const phoneRegex = /^(09|\+639)\d{9}$/;
          if (!formData.phoneNumber.trim()) 
               newErrors.phoneNumber = "Phone number is required.";
          else if (!phoneRegex.test(formData.phoneNumber))
               newErrors.phoneNumber = "Invalid phone number format.";

          const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/;
          if (formData.messengerLink && !urlRegex.test(formData.messengerLink))
               newErrors.messengerLink = "Invalid link format.";

          setErrors(newErrors);

          if (Object.keys(newErrors).length > 0) return;

          console.log("Submitted values:", formData);
          setIsEditing(false);
          onUnsavedChange?.(false);

          // [TO DO] :: api call
     };

     const handleChange = (field: string, value: string) => {
          setErrors({});
          setFormData((prev) => ({ ...prev, [field]: value }));
     };

	const handleMoveOut = () => {
		console.log("move out was clicked")
	};

     useEffect(() => {
          onUnsavedChange?.(hasUnsavedChanges);
     }, [hasUnsavedChanges]);

     if (!tenant || (!tenant.firstName && !isEditing)) {
          return (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <DialogDescription className="text-s text-muted-foreground text-center">
                         No tenant available.
                    </DialogDescription>
               </div>
          );
     }

     return (
          <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <InputField
                         isEditing={isEditing}
                         label="First Name"
                         value={formData.firstName || ""}
                         placeholder="e.g., Juan"
                         required
                         onChange={(e) => handleChange("firstName", e.target.value)}
                    />
                    <InputField
                         isEditing={isEditing}
                         label="Middle Initial"
                         value={formData.middleName || ""}
                         placeholder="e.g., Santos"
                         onChange={(e) => handleChange("middleName", e.target.value)}
                    />
                    <InputField
                         isEditing={isEditing}
                         label="Last Name"
                         value={formData.lastName || ""}
                         placeholder="e.g., De La Cruz"
                         required
                         onChange={(e) => handleChange("lastName", e.target.value)}
                    />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InputField
                         isEditing={isEditing}
                         label="Email"
                         type="email"
                         value={formData.email || ""}
                         placeholder="e.g., juan.delacruz@email.com"
                         required
                         onChange={(e) => handleChange("email", e.target.value)}
                    />
                    <InputField
                         isEditing={isEditing}
                         label="Cellphone Number"
                         type="tel"
                         value={formData.phoneNumber || ""}
                         placeholder="e.g., 09123456789"
                         required
                         onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <InputField
                         isEditing={isEditing}
                         label="Messenger / Facebook Link"
                         type="url" 
                         value={formData.messengerLink} 
                         placeholder="e.g., https://facebook.com/juan.delacruz"
                         onChange={(e) => handleChange("messengerLink", e.target.value)}
                    />
               </div>

               <hr className="border-t border-gray-200" />

               <DialogFooter className="w-full flex items-center justify-between">
                    <div className="flex-1">
                    {isEditing && (
                    <>
                         {Object.values(errors).length > 0 ? (
                         <ul className="text-sm text-red-500 list-disc list-inside">
                              {Object.values(errors).map((err, idx) => (
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
                              <Button onClick={handleMoveOut}>Move Out</Button>
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