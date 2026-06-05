package com.agroveda.api.repository;

import com.agroveda.api.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<UserRole, String> {
    List<UserRole> findByUserId(String userId);
    Optional<UserRole> findByUserIdAndRole(String userId, String role);
}
