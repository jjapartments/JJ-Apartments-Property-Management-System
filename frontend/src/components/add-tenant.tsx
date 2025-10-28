import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Button } from "@/components/ui/button"; 
import { useDataRefresh } from '@/contexts/DataContext';

interface Tenant {
     id?: string;
     firstName: string;
     email: string;
     middleInitial?: string;
     lastName: string;
     phoneNumber: string;
     link: string;
     moveInDate: string;
     moveOutDate: string; 
}

interface AddTenantProps {
     open: boolean;
     units: any;
     onClose: () => void;
     onSubmit?: (formData: any) => Promise<void>;
}

export function AddTenantModal({ open, onClose, units, onSubmit }: AddTenantProps) {
     const [isDirty, setIsDirty] = useState(false);
     const [errors, setErrors] = useState<Record<string, string>>({});
     const { refreshTrigger, triggerRefresh } = useDataRefresh();

     const [formData, setFormData] = useState({
          firstName: "",
          middleInitial: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          messengerLink: "",
          moveInDate: new Date().toISOString().split("T")[0], 
          unitId: "",
     });

     const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify({
          firstName: "",
          middleInitial:  "",
          lastName: "",
          email: "",
          phoneNumber:  "",
          messengerLink:  "",
          moveInDate: "",
          unitId: "",
     });

     useEffect(() => {
          if (!open) {
               setFormData({
                    firstName: "",
                    middleInitial: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    messengerLink: "",
                    moveInDate: new Date().toISOString().split("T")[0],
                    unitId: "",
               });
               setErrors({});
               setIsDirty(false);
          }
     }, [open]);

     const handleChange = (field: string, value: string) => {
          setErrors({});
          setIsDirty(true);
          setFormData((prev) => ({ ...prev, [field]: value }));
     };

     const handleSubmit = async () => {
          console.log("Adding tenant...")

          const newErrors: Record<string, string> = {};

          // Check valid input
          if (!formData.firstName.trim()) 
               newErrors.firstName = "First name is required.";
          if (!formData.lastName.trim()) 
               newErrors.lastName = "Last name is required.";

          if (formData.middleInitial && formData.middleInitial.length > 1)
               newErrors.middleInitial = "Middle initial must be one letter only.";

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

          console.log(newErrors)

          if (Object.keys(newErrors).length > 0) 
               return;

          if (onSubmit) {
               // Transform date to ISO format
               const isoMoveInDate = new Date(formData.moveInDate).toISOString();
               formData.moveInDate = isoMoveInDate

               await onSubmit(formData); 
               onClose();
               
               return;
          }
     }

     const handleCancel = () => {
          setErrors({});

          setFormData({
               firstName: "",
               middleInitial:  "",
               lastName: "",
               email: "",
               phoneNumber:  "",
               messengerLink:  "",
               moveInDate: new Date().toISOString().split("T")[0], 
               unitId: ""
          });

          setIsDirty(false);
          onClose();
     };

     return (
          <Dialog open={open} onOpenChange={onClose}>
               <DialogContent className="max-w-4xl sm:max-w-3xl w-full">
                    <DialogHeader className="flex flex-col">
                         <DialogTitle className="text-2xl font-semibold">Add Tenant</DialogTitle>
                         <DialogDescription className="text-sm text-muted-foreground">
                             Enter tenant information below.
                         </DialogDescription>

                         <hr className="border-t border-gray-200" />
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                         <InputField
                              isEditing={true}
                              label="First Name"
                              value={formData.firstName || ""}
                              placeholder="e.g., Juan"
                              required
                              onChange={(e) => handleChange("firstName", e.target.value)}
                         />
                         <InputField
                              isEditing={true}
                              label="Middle Initial"
                              value={formData.middleInitial || ""}
                              placeholder="e.g., S"
                              onChange={(e) => handleChange("middleInitial", e.target.value)}
                         />
                         <InputField
                              isEditing={true}
                              label="Last Name"
                              value={formData.lastName || ""}
                              placeholder="e.g., De La Cruz"
                              required
                              onChange={(e) => handleChange("lastName", e.target.value)}
                         />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         <InputField
                              isEditing={true}
                              label="Email"
                              type="email"
                              value={formData.email || ""}
                              placeholder="e.g., juan.delacruz@email.com"
                              required
                              onChange={(e) => handleChange("email", e.target.value)}
                         />
                         <InputField
                              isEditing={true}
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
                              isEditing={true}
                              label="Messenger / Facebook Link"
                              type="url" 
                              value={formData.messengerLink} 
                              placeholder="e.g., https://facebook.com/juan.delacruz"
                              onChange={(e) => handleChange("messengerLink", e.target.value)}
                         />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                         <div className="mb-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                   Unit <span className="text-red-500">*</span>
                              </label>
                              <Select
                                   value={formData.unitId}
                                   onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                              >
                                   <SelectTrigger className="w-full min-h-12 rounded-md border-gray-400 border px-4 py-3 text-left">
                                        <SelectValue placeholder="Select Unit" />
                                   </SelectTrigger>
                                   <SelectContent className="w-full">
                                        {units.length === 0 ? (
                                             <div className="px-4 py-3 text-sm text-gray-500">
                                                  No available units
                                             </div>
                                        ) : (
                                             units.map((u) => (
                                                  <SelectItem key={u.id} value={String(u.id)}>
                                                  Unit {u.unitNumber} - {u.name}
                                                  </SelectItem>
                                             ))
                                        )}
                                   </SelectContent>
                              </Select>
                         </div>

                         <InputField
                              isEditing={true}
                              label="Move-in Date"
                              type="date"
                              value={formData.moveInDate}
                              onChange={(e) => handleChange("moveInDate", e.target.value)}
                              required={true}
                         />
                    </div>

                    <hr className="border-t border-gray-200" />

                    <DialogFooter className="w-full flex items-center justify-between">
                         <div className="flex-1">
                              {Object.values(errors).length > 0 ? (
                                   <p className="text-sm text-red-500">
                                        {Object.values(errors).length > 1
                                             ? "Please fill in the required fields."
                                             : Object.values(errors)[0]}
                                   </p>
                              ) : isDirty ? (
                                   <p className="text-sm text-gray-500 italic">
                                        You have unsaved changes.
                                   </p>
                              ) : null}
                         </div>

                         <div className="flex gap-2">
                              <Button className="min-w-[100px]" onClick={handleCancel}>
                                   Cancel
                              </Button>
                              <Button variant="secondary" onClick={handleSubmit}>
                                   Submit
                              </Button>
                         </div>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}