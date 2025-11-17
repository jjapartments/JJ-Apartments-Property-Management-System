"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

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
    const [formData, setFormData] = useState({ unitId: "", category: "" });

    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof window !== "undefined" && window.grecaptcha) {
                window.grecaptcha.render("recaptcha", {
                    sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
                });
                clearInterval(interval);
            }
        }, 500);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const token = window.grecaptcha.getResponse();

        if (!token) {
            alert("Please complete the CAPTCHA!");
            return;
        }

        console.log("Captcha token:", token);
        // Send formData + token to backend
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
            <div className="relative z-10 flex w-full justify-center item-center pt-20 pb-20 px-5">
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
                        label="Apartment and Unit Number"
                        placeholder="Unit A - Maple Residences"
                        required
                    />
                    <FormInput
                        label="Name"
                        placeholder="Juan Dela Cruz"
                        required
                    />
                    <FormInput
                        label="Phone Number"
                        placeholder="09123456789"
                        required
                    />
                    <FormInput
                        label="Email"
                        placeholder="jdelacruz@gmail.com"
                    />
                    <FormInput label="Messenger Link" placeholder="jdela.com" />

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
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
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
                        required
                    />
                    <FormInput
                        label="Description"
                        type="textarea"
                        placeholder="Description here..."
                        required
                    />

                    <hr className="border-gray-300 mb-6 mt-6" />

                    {/* CAPTCHA and Submit */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center px-2 gap-4 md:gap-0">
                        {/* CAPTCHA */}
                        <div
                            className="w-full md:w-1/2 transform scale-85 origin-top-left items-center"
                            id="recaptcha"
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
        </div>
    );
}

// Reusable input component
const FormInput = ({
    label,
    type = "text",
    placeholder,
    required = false,
}: {
    label: string;
    type?: string;
    placeholder: string;
    required?: boolean;
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
