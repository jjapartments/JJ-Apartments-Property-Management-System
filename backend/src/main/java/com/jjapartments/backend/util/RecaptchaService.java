package com.jjapartments.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class RecaptchaService {

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    @Value("${recaptcha.secret-key}")
    private String secretKey;

    public boolean verify(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("secret", secretKey);
            form.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

            RecaptchaVerifyResponse response = restTemplate.postForObject(
                    VERIFY_URL,
                    request,
                    RecaptchaVerifyResponse.class);

            return response != null && Boolean.TRUE.equals(response.isSuccess());
        } catch (Exception e) {
            return false;
        }
    }

    public static class RecaptchaVerifyResponse {
        private Boolean success;

        public Boolean isSuccess() {
            return success;
        }

        public void setSuccess(Boolean success) {
            this.success = success;
        }
    }
}
