"use client";

import React, { useState } from "react";
import Script from "next/script";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { ReceiptModal } from "@/components/receipt-modal";

declare global {
    interface Window {
        grecaptcha: any;
    }
}

type Unit = {
    id: number;
    unitNumber: string;
    name: string;
    description: string;
    max_num: number;
    price: number;
    activeTenantId: number;
};

export default function RequestsPage() {
    const [formData, setFormData] = useState({
        unit: "",
        apartment: "",
        name: "",
        phone: "",
        email: "",
        messenger: "",
        category: "",
        subject: "",
        description: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receiptData, setReceiptData] = useState({ id: "", timestamp: "" });

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.unit.trim()) newErrors.unit = "Required";
        if (!formData.apartment.trim()) newErrors.apartment = "Required";
        if (!formData.name.trim()) newErrors.name = "Required";
        if (!formData.phone.trim()) newErrors.phone = "Required";
        if (!formData.category.trim()) newErrors.category = "Required";
        if (!formData.subject.trim()) newErrors.subject = "Required";
        if (!formData.description.trim()) newErrors.description = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) {
            alert("Please fill all required fields!");
            return;
        }

        const token = window.grecaptcha.getResponse();
        if (!token) {
            alert("Please complete the CAPTCHA!");
            return;
        }

        const payload = {
            recaptchaToken: token,
            ticket: {
                unitNumber: formData.unit,
                apartmentName: formData.apartment,
                name: formData.name,
                phoneNumber: formData.phone,
                email: formData.email,
                messengerLink: formData.messenger,
                category: formData.category,
                subject: formData.subject,
                body: formData.description,
                submittedAt: new Date().toISOString(),
            },
        };

        console.log("Payload:", payload);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to submit ticket");
                console.error("Backend error:", data);
                return;
            }

            const date = new Date(payload.ticket.submittedAt);

            const formatted = date.toLocaleString("en-US", {
                month: "long",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true, // AM/PM
            });

            setReceiptData({
                id: data.id.toString(),
                timestamp: formatted,
            });

            setReceiptOpen(true);

            console.log("Backend response:", data);
            alert("Ticket submitted successfully!");

            setFormData({
                unit: "",
                apartment: "",
                name: "",
                phone: "",
                email: "",
                messenger: "",
                category: "",
                subject: "",
                description: "",
            });
            window.grecaptcha.reset();
        } catch (error) {
            console.error("Error submitting ticket:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[2px] saturate-50"
                style={{ backgroundImage: "url('/apartment.png')" }}
            />
            {/* Load reCAPTCHA script */}
            <Script
                src="https://www.google.com/recaptcha/api.js"
                strategy="afterInteractive"
            />
            {/* Form Container */}
            <div className="relative z-10 flex items-center justify-center min-h-screen pt-10 pb-10 px-5">
                <form
                    className="w-full max-w-4xl rounded-2xl bg-white p-10 shadow-2xl"
                    onSubmit={handleSubmit}
                >
                    <div className="flex justify-between items-end mb-4">
                        <h1 className="text-2xl font-bold">Request Form</h1>
                    </div>

                    <hr className="border-gray-300 mb-6" />

                    {/* Inputs */}
                    <FormInput
                        label="Unit Number"
                        placeholder="Unit A"
                        value={formData.unit}
                        onChange={(v) => handleChange("unit", v)}
                        required
                        error={errors.unit}
                    />
                    <FormInput
                        label="Apartment Name"
                        placeholder="Maple Residences"
                        value={formData.apartment}
                        onChange={(v) => handleChange("apartment", v)}
                        required
                        error={errors.apartment}
                    />
                    <FormInput
                        label="Name"
                        placeholder="Juan Dela Cruz"
                        value={formData.name}
                        onChange={(v) => handleChange("name", v)}
                        required
                        error={errors.name}
                    />
                    <FormInput
                        label="Phone Number"
                        placeholder="09123456789"
                        value={formData.phone}
                        onChange={(v) => handleChange("phone", v)}
                        required
                        error={errors.phone}
                    />
                    <FormInput
                        label="Email"
                        placeholder="jdela@gmail.com"
                        value={formData.email}
                        onChange={(v) => handleChange("email", v)}
                    />
                    <FormInput
                        label="Messenger Link"
                        placeholder="jdela.com"
                        value={formData.messenger}
                        onChange={(v) => handleChange("messenger", v)}
                    />

                    <hr className="border-gray-300 mb-6 mt-6" />

                    {/* Category Select */}
                    <div className="w-full mb-3 px-2">
                        <div className="flex flex-col md:flex-row md:items-center">
                            <label className="text-sm font-medium text-gray-700 mb-1 md:mb-0 md:w-1/4 text-left md:text-right mr-3">
                                Category <span className="text-red-500">*</span>
                            </label>

                            <Select
                                value={formData.category || ""}
                                onValueChange={(value) =>
                                    handleChange("category", value)
                                }
                            >
                                <SelectTrigger className="w-full md:w-3/4 min-h-6 rounded-md border border-gray-300 px-2 py-1 text-left text-sm">
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
                                        <SelectItem
                                            key={index}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <FormInput
                        label="Subject"
                        placeholder="Subject here..."
                        value={formData.subject}
                        onChange={(v) => handleChange("subject", v)}
                        required
                        error={errors.subject}
                    />
                    <FormInput
                        label="Description"
                        placeholder="Description here..."
                        type="textarea"
                        value={formData.description}
                        onChange={(v) => handleChange("description", v)}
                        required
                        error={errors.description}
                    />

                    <hr className="border-gray-300 mb-6 mt-6" />

                    {/* CAPTCHA and Submit */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center px-2 gap-4 md:gap-0">
                        <div
                            className="g-recaptcha w-full md:w-1/2 transform scale-85 origin-top-left items-center"
                            data-sitekey={
                                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                            }
                        ></div>

                        {/* Submit Button */}
                        <div className="w-full md:w-1/2 flex justify-start md:justify-end items-center">
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-medium text-sm px-4 py-2 rounded-lg shadow"
                            >
                                SUBMIT
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <ReceiptModal
                open={receiptOpen}
                requestId={receiptData.id}
                timestamp={receiptData.timestamp}
                onClose={() => setReceiptOpen(false)}
            />
        </div>
    );
}

// Reusable input component
const FormInput = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
    error,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
}) => {
    return (
        <div className="w-full mb-3 px-2">
            <div className="flex flex-col md:flex-row md:items-start">
                <label className="text-sm w-full font-medium text-gray-700 mb-1 md:mb-0 md:w-1/4 text-left md:text-right mr-3">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                </label>

                {type === "textarea" ? (
                    <textarea
                        placeholder={placeholder}
                        required={required}
                        rows={4}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full md:w-3/4 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    />
                ) : (
                    <input
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full md:w-3/4 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};
