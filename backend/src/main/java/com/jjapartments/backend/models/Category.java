package com.jjapartments.backend.models;

public enum Category {
    MAINTENANCE_AND_REPAIRS("Maintenance & Repairs"),
    SECURITY_AND_SAFETY("Security & Safety"),
    UTILITIES("Utilities"),
    PAYMENT_AND_BILLING("Payment & Billing"),
    AMENITIES_AND_FACILITIES("Amenities & Facilities"),
    OTHERS("Others");

    
    private final String label;

    Category(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static Category fromLabel(String label) {
        if (label == null) {
            return null;
        }
        for (Category c : Category.values()) {
            if (c.label.equalsIgnoreCase(label)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown category label: " + label);
    }
}

