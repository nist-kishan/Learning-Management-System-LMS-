package com.lms.auth.service;

import com.lms.auth.dto.*;
import com.lms.security.JwtUtils;
import com.lms.user.User;
import com.lms.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public MessageResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        userRepository.save(user);
        return new MessageResponse("User registered successfully!");
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User userDetails = (User) authentication.getPrincipal();

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getRole()
        );
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // To prevent username enumeration, we still return success but don't do anything
            return new MessageResponse("If the email exists, a reset code has been generated.");
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase(); // 8 character code
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Print/log to console since SMTP is optional
        System.out.println("=================================================");
        System.out.println("RESET PASSWORD REQUEST FOR: " + user.getEmail());
        System.out.println("RESET CODE: " + token);
        System.out.println("=================================================");

        return new MessageResponse("Password reset code generated and printed to console.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        // Find user by reset token
        // In a real database, we would query by token
        // Let's implement a custom query or stream through users since it's a small app
        User user = userRepository.findAll().stream()
                .filter(u -> request.getToken().equals(u.getResetToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error: Invalid reset token!"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Error: Reset token has expired!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return new MessageResponse("Password has been reset successfully.");
    }
}
