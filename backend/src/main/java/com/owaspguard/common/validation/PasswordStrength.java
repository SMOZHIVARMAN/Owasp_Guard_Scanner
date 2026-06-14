package com.owaspguard.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordStrengthValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordStrength {
    String message() default "Password does not meet the complexity requirements: must be 8-128 characters long, and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
