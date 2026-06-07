package com.lms.user;

import com.lms.auth.dto.MessageResponse;
import com.lms.course.CourseRepository;
import com.lms.enrollment.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
        
        user.setActive(!user.isActive());
        userRepository.save(user);
        
        String status = user.isActive() ? "unblocked" : "blocked";
        return ResponseEntity.ok(new MessageResponse("User " + status + " successfully."));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        
        long totalStudents = userRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long totalInstructors = userRepository.findAll().stream().filter(u -> u.getRole() == Role.INSTRUCTOR).count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalCourses", totalCourses,
                "totalEnrollments", totalEnrollments,
                "totalStudents", totalStudents,
                "totalInstructors", totalInstructors
        ));
    }
}
