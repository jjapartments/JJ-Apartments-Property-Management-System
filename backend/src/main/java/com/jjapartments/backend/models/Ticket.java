package com.jjapartments.backend.models;
public class Ticket {

    private int id;
    private String unitNumber;          
    private String apartmentName;       
    private String name;              
    private String phoneNumber;         
    private String email;               
    private String messengerLink;       
    private Category category;          
    private String subject;           
    private String body;              
    private Status status;            
    private String submittedAt;       
    private String statusUpdatedAt;    
    private String statusUpdatedBy;  


    public Ticket() {}
    
    public Ticket(
            int id,
            String unitNumber,
            String apartmentName,
            String name,
            String phoneNumber,
            String email,
            String messengerLink,
            Category category,
            String subject,
            String body,
            Status status,
            String submittedAt,
            String statusUpdatedAt,
            String statusUpdatedBy) {
        this.id = id;
        this.unitNumber = unitNumber;
        this.apartmentName = apartmentName;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.messengerLink = messengerLink;
        this.category = category;
        this.subject = subject;
        this.body = body;
        this.status = status;
        this.submittedAt = submittedAt;
        this.statusUpdatedAt = statusUpdatedAt;
        this.statusUpdatedBy = statusUpdatedBy;
    }
    
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

    public String getApartmentName() {
        return apartmentName;
    }
    public void setApartmentName(String apartmentName) {
        this.apartmentName = apartmentName;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessengerLink() {
        return messengerLink;
    }
    public void setMessengerLink(String messengerLink) {
        this.messengerLink = messengerLink;
    }

    public Category getCategory() {
        return category;
    }
    public void setCategory(Category category) {
        this.category = category;
    }

    public String getSubject() {
        return subject;
    }
    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }
    public void setBody(String body) {
        this.body = body;
    }

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public String getSubmittedAt() {
        return submittedAt;
    }
    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getStatusUpdatedAt() {
        return statusUpdatedAt;
    }
    public void setStatusUpdatedAt(String statusUpdatedAt) {
        this.statusUpdatedAt = statusUpdatedAt;
    }

    public String getStatusUpdatedBy() {
        return statusUpdatedBy;
    }
    public void setStatusUpdatedBy(String statusUpdatedBy) {
        this.statusUpdatedBy = statusUpdatedBy;
    }
}