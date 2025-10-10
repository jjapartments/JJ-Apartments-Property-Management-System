"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, User, Users } from "lucide-react";
import { TenantDetails } from "@/components/all-in-tenant";
import { ApartmentDetails } from "./all-in-apartment";
import { SubTenantDetails } from "./all-in-subtenants";

interface AllInModalProps {
	open: boolean
	selectedTab: String
	onClose: () => void
	tenant: any; 
}

export function AllInModal({ open, selectedTab, onClose, tenant }: AllInModalProps) {
	const [activeTab, setActiveTab] = useState<"apartment" | "tenant" | "subtenants">(
		selectedTab as "apartment" | "tenant" | "subtenants"
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const renderTabContent = () => {
		switch (activeTab) {
			case "tenant":
				return <TenantDetails tenant={tenant} onUnsavedChange={setHasUnsavedChanges} />;
			case "apartment":
				return <ApartmentDetails unit={tenant.unit} onUnsavedChange={setHasUnsavedChanges} />;
			case "subtenants":
				return (
				<SubTenantDetails
					subtenants={tenant.subTenants || []}
					maxOccupants={tenant.unit?.max_num || 1}
					onUnsavedChange={setHasUnsavedChanges}
					noTenant={tenant.firstName == null}
				/>
			);
			default:
				return null;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl sm:max-w-3xl w-full">
				<DialogHeader className="flex flex-col">
					{/* Top Row: Centered Tab Buttons */}
					<div className="flex justify-center">
						<div className="flex gap-3">
							<button
								disabled={hasUnsavedChanges && activeTab !== "apartment"}
								className={`p-2 rounded-lg transition ${
								activeTab === "apartment"
									? "bg-yellow-400"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								} ${hasUnsavedChanges && activeTab !== "apartment" ? "opacity-50 cursor-not-allowed" : ""}`}
								onClick={() => setActiveTab("apartment")}
							>
								<Home size={18} />
							</button>

							<button
								disabled={hasUnsavedChanges && activeTab !== "tenant"}
								className={`p-2 rounded-lg transition ${
								activeTab === "tenant"
									? "bg-yellow-400"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								} ${hasUnsavedChanges && activeTab !== "tenant" ? "opacity-50 cursor-not-allowed" : ""}`}
								onClick={() => setActiveTab("tenant")}
							>
								<User size={18} />
							</button>

							<button
								disabled={hasUnsavedChanges && activeTab !== "subtenants"}
								className={`p-2 rounded-lg transition ${
								activeTab === "subtenants"
									? "bg-yellow-400"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								} ${hasUnsavedChanges && activeTab !== "subtenants" ? "opacity-50 cursor-not-allowed" : ""}`}
								onClick={() => setActiveTab("subtenants")}
							>
								<Users size={18} />
							</button>
						</div>
					</div>

					{/* Left-aligned Tab Title */}
					<DialogTitle className="text-2xl font-semibold">
						{activeTab === "apartment"
						? "Apartment"
						: activeTab === "tenant"
						? "Tenant"
						: "Sub-Tenants"}
					</DialogTitle>

					<DialogDescription className="text-sm text-muted-foreground">
						{activeTab === "apartment"
							? "View apartment details"
							: activeTab === "tenant"
							? "View tenant information"
							: "View sub-tenant information"}
					</DialogDescription>

					{/* Divider */}
					<hr className="border-t border-gray-200" />
				</DialogHeader>

				{/* Tab-Specific Content */}
				{renderTabContent()}
			</DialogContent>
		</Dialog>
	);
}