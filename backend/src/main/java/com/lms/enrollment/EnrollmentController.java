package com.lms.enrollment;

import com.lms.auth.dto.MessageResponse;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody Map<String, Long> payload, @AuthenticationPrincipal User currentUser) {
        Long courseId = payload.get("courseId");
        if (courseId == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: courseId is required!"));
        }
        try {
            Enrollment enrollment = enrollmentService.enrollStudent(courseId, currentUser);
            return ResponseEntity.ok(enrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }
}
