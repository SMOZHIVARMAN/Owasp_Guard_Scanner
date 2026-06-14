package com.owaspguard.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = SafeUrlValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface SafeUrl {
    String message() default "Target URL is invalid or resolved to a restricted internal IP address";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
