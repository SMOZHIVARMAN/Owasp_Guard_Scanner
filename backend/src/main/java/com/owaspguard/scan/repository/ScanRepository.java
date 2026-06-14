package com.owaspguard.scan.repository;

import com.owaspguard.scan.entity.ScanEntity;
import com.owaspguard.scan.model.ScanStatus;
import com.owaspguard.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for managing database persistence of security scans.
 */
@Repository
public interface ScanRepository extends JpaRepository<ScanEntity, Long> {

    List<ScanEntity> findByUser(User user);

    Page<ScanEntity> findByUser(User user, Pageable pageable);

    long countByUser(User user);

    List<ScanEntity> findTop5ByUserOrderByStartedAtDesc(User user);

    List<ScanEntity> findByUserOrderByStartedAtDesc(User user);

    List<ScanEntity> findByUserAndStatus(User user, ScanStatus status);

    List<ScanEntity> findByUserAndStatusOrderByStartedAtDesc(
            User user,
            ScanStatus status
    );

    long countByUserAndStatus(User user, ScanStatus status);
}