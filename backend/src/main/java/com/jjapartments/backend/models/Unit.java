package com.jjapartments.backend.models;

public class Unit {

    private int id;
    private String unitNumber;
    private String name;
    private String description;
    private float price;
    private int numOccupants;
    private int currOccupants;
    private String contactNumber;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public float getPrice() {
        return this.price;
    }

    public void setPrice(float price) {
        this.price = price;
    }

    public int getNumOccupants() {
        return this.numOccupants;
    }

    public void setNumOccupants(int numOccupants) {
        this.numOccupants = numOccupants;
    }

    public int getCurrOccupants() {
        return currOccupants;
    }

    public void setCurrOccupants(int currOccupants) {
        this.currOccupants = currOccupants;
    }

    public String getContactNumber() {
        return this.contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}
