import * as React from "react"

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

interface InputFieldProps {
    label: string;
    value: string;
    placeholder?: string;
    type?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxLength?: number;
    required?: boolean;
    isEditing?: boolean;
}

function InputField({ label, value, placeholder, type = "text", maxLength, required, isEditing, onChange }: InputFieldProps) {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500"> *</span>}
        </label>
        <input
            type={type}
            value={isEditing ? inputValue : value}
            readOnly={!isEditing}
            onChange={onChange}
            className={`w-full px-4 py-3 border rounded-lg transition-colors 
            ${
                isEditing
                ? "bg-white border-gray-400 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                : "bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed"
            }`}
            placeholder={placeholder}
            maxLength={maxLength}
        />
        </div>
    );
}

export { Input, InputField }
