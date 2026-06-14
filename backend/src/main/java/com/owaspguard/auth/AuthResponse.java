package com.owaspguard.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication response.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;

    @Builder.Default
    private String type = "Bearer";
}
