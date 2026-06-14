package com.owaspguard.user;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper interface for converting User entity to DTOs.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    UserResponse toResponse(User user);
}
