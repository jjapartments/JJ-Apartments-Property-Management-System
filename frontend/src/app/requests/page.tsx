'use client';

import React, { useState, useEffect } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

type Unit = {
    id: number;
    unitNumber: string;
    name: string;
    description: string;
    max_num: number;
    price: number;
    
    activeTenantId: number
};

export default function RequestsPage() {
    const [formData, setFormData] = useState({ unitId: "", category:"" });

    return (
        <div className="relative min-h-screen">
            <div
                className="
                    absolute inset-0 
                    bg-cover bg-center bg-no-repeat
                    filter blur-[2px] saturate-50
                "
                style={{ backgroundImage: "url('/apartment.png')" }}
            />

            <div className="relative z-10 flex w-full justify-center pt-20 pb-10 pl-5 pr-5">
                <div className="w-full max-w-4xl rounded-2xl bg-white p-10 shadow-2xl">
                    <div className="flex justify-between items-end mb-4">
                        <h1 className="text-2xl font-bold">Request Form</h1>
                    </div>

                    <hr className="border-gray-300 mb-6" />

                    <FormInput label="Apartment and Unit Number" placeholder="Unit A - Maple Residences" required />
                    <FormInput label="Name" placeholder="Juan Dela Cruz" required />
                    <FormInput label="Phone Number" placeholder="09123456789" required />
                    <FormInput label="Email" placeholder="jdelacruz@gmail.com" />
                    <FormInput label="Messenger Link" placeholder="jdela.com" />

                    <hr className="border-gray-300 mb-6 mt-6" />

                    <div className="w-full mb-3 px-2">
                        <div className="flex flex-col md:flex-row md:items-center">
                            {/* Label */}
                            <label className="text-sm font-medium text-gray-700 mb-1 md:mb-0 md:w-1/4 text-right mr-5">
                                Category <span className="text-red-500">*</span>
                            </label>

                            {/* Select */}
                            <Select
                            value={formData.category || ""}
                            onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                            }
                            >
                            <SelectTrigger className="w-full md:w-3/4 min-h-8 rounded-md border border-gray-300 px-2 py-1 text-left text-sm">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>

                            <SelectContent className="w-full md:w-3/4">
                                {[
                                "Maintenance & Repairs",
                                "Security & Safety",
                                "Utilities",
                                "Payment & Billing",
                                "Amenities & Facilities",
                                "Others",
                                ].map((category, index) => (
                                <SelectItem key={index} value={category}>
                                    {category}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <FormInput label="Subject" placeholder="Subject here..." required />
                    <FormInput label="Description" type="textarea" placeholder="Description here..." required />
                </div>
            </div>
        </div>
    );
}

const FormInput = ({ label, type = "text", placeholder, required = false }) => {
    return (
        <div className="w-full mb-3 px-2">
        <div className="flex flex-col md:flex-row md:items-start">
            {/* Label */}
            <label className="text-sm font-medium text-gray-700 mb-1 md:mb-0 md:w-1/4 text-right mr-5">
            {label} {required && <span className="text-red-500">*</span>}
            </label>

            {/* Input or Textarea */}
            {type === "textarea" ? (
            <textarea
                placeholder={placeholder}
                required={required}
                rows={4} // default height
                className="w-full md:w-3/4 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
            ) : (
            <input
                type={type}
                placeholder={placeholder}
                required={required}
                className="w-full md:w-3/4 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            )}
        </div>
        </div>
    );
};