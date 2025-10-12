package com.jjapartments.backend.models;

public class SubTenant {

    private int id;
    private String lastName;
    private String firstName;
    private String middleInitial;
    private String phoneNumber;
    private String messengerLink;
    private int mainTenantId;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getMiddleInitial() {
        return middleInitial;
    }

    public void setMiddleInitial(String middleInitial) {
        this.middleInitial = middleInitial;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getMessengerLink() {
        return messengerLink;
    }

    public void setMessengerLink(String messengerLink) {
        this.messengerLink = messengerLink;
    }

    public int getMainTenantId() {
        return mainTenantId;
    }

    public void setMainTenantId(int mainTenantId) {
        this.mainTenantId = mainTenantId;
    }
}