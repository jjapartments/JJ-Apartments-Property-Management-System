"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input";
import { DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useDataRefresh } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { MoveOutModal } from "@/components/move-out-modal";

interface TenantDetailsProps {
    tenant: any;
    isCurrEditing?: (hasChanges: boolean) => void;
}

export function TenantDetails({ tenant, isCurrEditing }: TenantDetailsProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { refreshTrigger, triggerRefresh } = useDataRefresh();

    const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const handleEdit = () => {
        isCurrEditing?.(true);
        setIsEditing(true);
    };

    const [formData, setFormData] = useState({
        firstName: tenant.firstName || "",
        middleInitial: tenant.middleInitial || "",
        lastName: tenant.lastName || "",
        email: tenant.email || "",
        phoneNumber: tenant.phoneNumber || "",
        messengerLink: tenant.messengerLink || "",
    });

    const hasUnsavedChanges =
        JSON.stringify(formData) !==
        JSON.stringify({
            firstName: tenant.firstName || "",
            middleInitial: tenant.middleInitial || "",
            lastName: tenant.lastName || "",
            email: tenant.email || "",
            phoneNumber: tenant.phoneNumber || "",
            messengerLink: tenant.messengerLink || "",
        });

    useEffect(() => {
        if (tenant) {
            setFormData({
                firstName: tenant.firstName || "",
                middleInitial: tenant.middleInitial || "",
                lastName: tenant.lastName || "",
                email: tenant.email || "",
                phoneNumber: tenant.phoneNumber || "",
                messengerLink: tenant.messengerLink || "",
            });
        }
    }, [tenant]);

    const handleCancel = () => {
        setIsEditing(false);
        setErrors({});
        isCurrEditing?.(false);

        setFormData({
            firstName: tenant.firstName || "",
            middleInitial: tenant.middleInitial || "",
            lastName: tenant.lastName || "",
            email: tenant.email || "",
            phoneNumber: tenant.phoneNumber || "",
            messengerLink: tenant.messengerLink || "",
        });
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        // Check if same
        const isSame =
            formData.firstName === (tenant.firstName || "") &&
            formData.middleInitial === (tenant.middleInitial || "") &&
            formData.lastName === (tenant.lastName || "") &&
            formData.email === (tenant.email || "") &&
            formData.phoneNumber === (tenant.phoneNumber || "") &&
            formData.messengerLink === (tenant.messengerLink || "");

        if (isSame) {
            setErrors({ general: "No changes made." });
            return;
        }

        // Check valid input
        if (!formData.firstName.trim())
            newErrors.firstName = "First name is required.";
        if (!formData.lastName.trim())
            newErrors.lastName = "Last name is required.";

        if (formData.middleInitial && formData.middleInitial.length > 1)
            newErrors.middleInitial = "Middle initial must be one letter only.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) newErrors.email = "Email is required.";
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

        // ====== Inputs are valid, proceed to payload ====== //
        setIsEditing(false);
        isCurrEditing?.(false);

        const payload = {
            firstName: formData.firstName,
            middleInitial: formData.middleInitial || null,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            messengerLink: formData.messengerLink,
            unitId: tenant.unit.id,
        };
        console.log("Update tenant payload: ", payload);

        try {
            const res = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
                }/api/tenants/update/${tenant.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to update unit record.");
            }
            console.log("Unit updated successfully");

            setIsEditing(false);
            isCurrEditing?.(false);
            setErrors({});

            triggerRefresh?.();
        } catch (err: any) {
            const message = err?.message || "Failed to update tenant.";
            setErrors({ submit: message });
        }
    };

    const handleChange = (field: string, value: string) => {
        setErrors({});
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMoveOut = () => {
        console.log("Move out was clicked.");
        setIsMoveOutModalOpen(true);
    };

    const cancelMoveOut = () => {
        setIsMoveOutModalOpen(false);
    };

    const confirmMoveOut = async (moveOutDate: string) => {
        setIsMoveOutModalOpen(false);

        try {
            const formattedMoveOutDate = new Date(moveOutDate).toISOString();

            // [TO UPDATE] :: Replace with your actual API endpoint
            /*const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/moveout`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tenantId: tenant.id,
                        moveOutDate: formattedMoveOutDate,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update tenant move-out date.");
            }*/

            const formattedDisplayDate = new Date(
                moveOutDate
            ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            alert(`Tenant has moved out on ${formattedDisplayDate}.`);
            console.log("✅ Move out confirmed:", formattedMoveOutDate);

            window.location.reload();
        } catch (error: any) {
            console.error("❌ Failed to move out tenant:", error);
            alert("Failed to move out tenant. Please try again.");
        }
    };

    useEffect(() => {
        isCurrEditing?.(hasUnsavedChanges);
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
                    value={formData.middleInitial || ""}
                    placeholder="e.g., S"
                    onChange={(e) =>
                        handleChange("middleInitial", e.target.value)
                    }
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
                    onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                <InputField
                    isEditing={isEditing}
                    label="Messenger / Facebook Link"
                    type="url"
                    value={formData.messengerLink}
                    placeholder="e.g., https://facebook.com/juan.delacruz"
                    onChange={(e) =>
                        handleChange("messengerLink", e.target.value)
                    }
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
                            <Button
                                className="min-w-[100px]"
                                onClick={handleCancel}
                            >
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

            <MoveOutModal
                open={isMoveOutModalOpen}
                title="Move Out Tenant"
                message={`Are you sure you want to move out ${tenant.firstName} ${tenant.lastName} from ${tenant.unit.name}? This action cannot be undone.`}
                onCancel={cancelMoveOut}
                onConfirm={(date) => confirmMoveOut(date)}
            />
        </div>
    );
}
