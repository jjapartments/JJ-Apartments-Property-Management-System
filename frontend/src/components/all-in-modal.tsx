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
	onUpdateTenant?: (updatedData: any) => Promise<void> | void;
}

export function AllInModal({ open, selectedTab, onClose, tenant, onUpdateTenant }: AllInModalProps) {
	const [activeTab, setActiveTab] = useState<"apartment" | "tenant" | "subtenants">(
		selectedTab as "apartment" | "tenant" | "subtenants"
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const renderTabContent = () => {
		switch (activeTab) {
			case "tenant":
				return 	<TenantDetails 
							tenant={tenant} 
							isCurrEditing={setIsEditing} 
							onSubmit={onUpdateTenant}
						/>;
			case "apartment":
				return 	<ApartmentDetails 
							unit={tenant.unit} 
							isCurrEditing={setIsEditing} 
							onSubmit={onUpdateTenant} 
						/>;
			case "subtenants":
				return (
					<SubTenantDetails
						subtenants={tenant.subTenants || []}
						maxOccupants={tenant.unit?.numOccupants}
						isCurrEditing={setIsEditing}
						noTenant={tenant.firstName == null}
						mainTenantId={tenant.id}
						onSubmit={onUpdateTenant}
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
								disabled={isEditing && activeTab !== "apartment"}
								className={`p-2 rounded-lg transition ${
								activeTab === "apartment"
									? "bg-yellow-400"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								} ${isEditing && activeTab !== "apartment" ? "opacity-50 cursor-not-allowed" : ""}`}
								onClick={() => !isEditing && setActiveTab("apartment")}
							>
								<Home size={18} />
							</button>

							<button
								disabled={isEditing && activeTab !== "tenant"}
								className={`p-2 rounded-lg transition ${
								activeTab === "tenant"
									? "bg-yellow-400"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								} ${isEditing && activeTab !== "tenant" ? "opacity-50 cursor-not-allowed" : ""}`}
								onClick={() => !isEditing && setActiveTab("tenant")}
							>
								<User size={18} />
							</button>

							<button
								disabled={isEditing && activeTab !== "subtenants"}
								className={`p-2 rounded-lg transition ${
								activeTab === "subtenants"
									? "bg-yellow-400"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								} ${isEditing && activeTab !== "subtenants" ? "opacity-50 cursor-not-allowed" : ""}`}
								onClick={() => !isEditing && setActiveTab("subtenants")}
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