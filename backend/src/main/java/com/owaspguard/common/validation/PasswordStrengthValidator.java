package com.owaspguard.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PasswordStrengthValidator implements ConstraintValidator<PasswordStrength, String> {

    // Regex: 8-128 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character (non-alphanumeric)
    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,128}$";
    private static final Pattern PATTERN = Pattern.compile(PASSWORD_PATTERN);

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotBlank handle null
        }
        return PATTERN.matcher(value).matches();
    }
}
