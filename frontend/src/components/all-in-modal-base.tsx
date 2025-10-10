import React from "react";
export function AllInModalBase({modalOpen, children}) {
    if (!modalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );  
}