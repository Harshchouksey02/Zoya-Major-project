package com.agroveda.api.controller;

import com.agroveda.api.model.User;
import com.agroveda.api.model.UserRole;
import com.agroveda.api.repository.UserRepository;
import com.agroveda.api.repository.UserRoleRepository;
import com.agroveda.api.security.BCryptHelper;
import com.agroveda.api.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private BCryptHelper bcryptHelper;

    @Autowired
    private JwtUtil jwtUtil;

    // Helper request DTOs
    public static class AuthRequest {
        public String email;
        public String password;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest req) {
        if (req.email == null || req.password == null || req.email.trim().isEmpty() || req.password.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Email and password required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        Optional<User> existingUser = userRepository.findByEmail(req.email.trim());
        if (existingUser.isPresent()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "This email is already registered");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        // Generate UUID and hash password
        String userId = UUID.randomUUID().toString();
        String hash = bcryptHelper.hash(req.password);

        User user = new User();
        user.setId(userId);
        user.setEmail(req.email.trim());
        user.setPasswordHash(hash);
        userRepository.save(user);

        // Assign role (first registered user gets admin, rest get user)
        long usersCount = userRepository.count();
        String role = usersCount == 1 ? "admin" : "user";

        UserRole userRole = new UserRole();
        userRole.setId(UUID.randomUUID().toString());
        userRole.setUserId(userId);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        // Create JWT token and return session response
        String token = jwtUtil.generateToken(userId, user.getEmail(), role);

        return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(user, role, token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        if (req.email == null || req.password == null || req.email.trim().isEmpty() || req.password.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Email and password required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        Optional<User> optionalUser = userRepository.findByEmail(req.email.trim());
        if (optionalUser.isEmpty() || !bcryptHelper.verify(req.password, optionalUser.get().getPasswordHash())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        User user = optionalUser.get();
        List<UserRole> roles = userRoleRepository.findByUserId(user.getId());
        String role = roles.isEmpty() ? "user" : roles.get(0).getRole();

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), role);

        return ResponseEntity.ok(buildAuthResponse(user, role, token));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Access Token Required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        User user = optionalUser.get();
        List<UserRole> roles = userRoleRepository.findByUserId(user.getId());
        String role = roles.isEmpty() ? "user" : roles.get(0).getRole();

        Map<String, String> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("role", role);

        return ResponseEntity.ok(response);
    }

    // Helper method to format response matching Lovable's expectations
    private Map<String, Object> buildAuthResponse(User user, String role, String token) {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("role", role);
        response.put("user", userData);

        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("access_token", token);
        
        Map<String, Object> sessionUser = new HashMap<>();
        sessionUser.put("id", user.getId());
        sessionUser.put("email", user.getEmail());
        sessionData.put("user", sessionUser);
        
        response.put("session", sessionData);

        return response;
    }
}
