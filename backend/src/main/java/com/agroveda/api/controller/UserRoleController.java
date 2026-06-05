package com.agroveda.api.controller;

import com.agroveda.api.model.UserRole;
import com.agroveda.api.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user_roles")
public class UserRoleController {

    @Autowired
    private UserRoleRepository userRoleRepository;

    @GetMapping
    public ResponseEntity<?> getUserRoles(
            @RequestParam(value = "user_id", required = false) String userId,
            @RequestParam(value = "role", required = false) String role) {
        if (userId != null && role != null) {
            Optional<UserRole> userRole = userRoleRepository.findByUserIdAndRole(userId, role);
            if (userRole.isPresent()) {
                return ResponseEntity.ok(List.of(userRole.get()));
            } else {
                return ResponseEntity.ok(List.of());
            }
        } else if (userId != null) {
            List<UserRole> roles = userRoleRepository.findByUserId(userId);
            return ResponseEntity.ok(roles);
        } else {
            return ResponseEntity.ok(userRoleRepository.findAll());
        }
    }
}
