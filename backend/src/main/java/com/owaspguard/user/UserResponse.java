package com.owaspguard.user;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for User response.
 * Does not expose sensitive information like password.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}
