import React, { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { ErrorModal } from "./error-modal";

export function TenantMgt({ toggleModal, onSubmit, editingTenant, isEditing, units }) {
    const [formData, setFormData] = useState({
        firstName: '',
        middleInitial: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        unitId: ''
    });

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Populate form with editing data when editing
    useEffect(() => {
        console.log("TenantMgt: useEffect triggered.");
        console.log("TenantMgt: isEditing =", isEditing);
        console.log("TenantMgt: received editingTenant =", editingTenant); // <<<--- THIS ONE IS THE MOST IMPORTANT

        if (isEditing && editingTenant) {
            // console.log("TenantMgt: Attempting to set formData with unit details:");
            // console.log("  unitName (from editingTenant.unit.name):", editingTenant.unit?.name);
            // console.log("  unitNum (from editingTenant.unit.unitNumber):", editingTenant.unit?.unitNumber);

            setFormData({
                firstName: editingTenant.firstName || '',
                middleInitial: editingTenant.middleInitial || '',
                lastName: editingTenant.lastName || '',
                email: editingTenant.email || '',
                phoneNumber: editingTenant.phoneNumber || '',
                unitId: editingTenant.unit?.id?.toString() || ''
            });
        } else {
            // Reset form when not editing
            setFormData({
                firstName: '',
                middleInitial: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                unitId: ''
            });
        }
    }, [isEditing, editingTenant]);
    
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Special handler for middle initial
    const handleMiddleInitialChange = (e) => {
        let value = e.target.value.toUpperCase(); // uppercase
        if (value.length > 1) value = value.charAt(0); // keep only first letter
        setFormData({ ...formData, middleInitial: value });
    };
    
    const handleSubmit = () => {
        const missingFields: string[] = [];
        if (!formData.firstName) missingFields.push("First Name");
        if (!formData.lastName) missingFields.push("Last Name");
        if (!formData.email) missingFields.push("Email");
        if (!formData.phoneNumber) missingFields.push("Cellphone Number");
        if (!formData.unitId) missingFields.push("Unit");

        if (missingFields.length > 0) {
            setErrorMessage(
                `Please fill in the following required field${missingFields.length > 1 ? "s" : ""}: ${missingFields.join(", ")}.`
            );
            setErrorModalOpen(true);
            return;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage("Please enter a valid email address.");
            setErrorModalOpen(true);
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="p-8 bg-white max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {isEditing ? 'Edit Tenant' : 'Add New Tenant'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEditing ? 'Update tenant information below' : 'Enter tenant information below'}
                    </p>
                </div>
                <button
                    onClick={toggleModal}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
                >
                    ×
                </button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., Juan"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Middle Initial
                        </label>
                        <input
                            type="text"
                            name="middleInitial"
                            value={formData.middleInitial}
                            onChange={handleMiddleInitialChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., A"
                            maxLength={1}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., De La Cruz"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., juan.delacruz@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cellphone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., 09123456789"
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.unitId}
                            onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                        >
                            <SelectTrigger className="w-full min-h-12 rounded-md border px-4 py-3 text-left">
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
                </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={toggleModal}
                    className="flex-1 px-6 py-3 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all font-medium"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-black text-yellow-300 rounded-lg hover:bg-gray-900 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all font-medium shadow-sm"
                >
                    {isEditing ? 'Update Tenant' : 'Add Tenant'}
                </button>
            </div>

            <ErrorModal
                open={errorModalOpen}
                title="Form Error"
                message={errorMessage}
                onClose={() => {
                    setErrorModalOpen(false);
                    setErrorMessage("");
                }}
            />
        </div>
    );
}