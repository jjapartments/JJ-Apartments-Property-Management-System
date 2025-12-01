package com.jjapartments.backend.dto;

import com.jjapartments.backend.models.Ticket;

public class TicketSubmitRequest {
    private Ticket ticket;
    private String recaptchaToken;

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public String getRecaptchaToken() {
        return recaptchaToken;
    }

    public void setRecaptchaToken(String recaptchaToken) {
        this.recaptchaToken = recaptchaToken;
    }
}
