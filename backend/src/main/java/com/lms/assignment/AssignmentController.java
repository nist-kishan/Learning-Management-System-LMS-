package com.lms.assignment;

import com.lms.auth.dto.MessageResponse;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(
            @RequestParam("courseId") Long courseId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("dueDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDate,
            @AuthenticationPrincipal User currentUser) {
        try {
            Assignment assignment = assignmentService.createAssignment(courseId, title, description, dueDate, currentUser);
            return ResponseEntity.ok(assignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/assignments/course/{courseId}")
    public ResponseEntity<?> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
    }

    @PostMapping("/submissions")
    public ResponseEntity<?> submitAssignment(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "content", required = false) String content,
            @AuthenticationPrincipal User currentUser) {
        try {
            AssignmentSubmission submission = assignmentService.submitAssignment(assignmentId, file, content, currentUser);
            return ResponseEntity.ok(submission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/submissions/student/{studentId}")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissionsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(assignmentService.getSubmissionsByStudent(studentId));
    }

    @GetMapping("/submissions/course/{courseId}")
    public ResponseEntity<?> getSubmissionsByCourse(@PathVariable Long courseId, @AuthenticationPrincipal User currentUser) {
        try {
            List<AssignmentSubmission> submissions = assignmentService.getSubmissionsByCourse(courseId, currentUser);
            return ResponseEntity.ok(submissions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/submissions/{id}/evaluate")
    public ResponseEntity<?> evaluateSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal User currentUser) {
        try {
            Double grade = Double.valueOf(payload.get("grade").toString());
            String feedback = (String) payload.get("feedback");
            AssignmentSubmission submission = assignmentService.evaluateSubmission(id, grade, feedback, currentUser);
            return ResponseEntity.ok(submission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
