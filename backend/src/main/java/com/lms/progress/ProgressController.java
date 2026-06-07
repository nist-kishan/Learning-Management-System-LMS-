package com.lms.progress;

import com.lms.auth.dto.MessageResponse;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping("/{studentId}")
    public ResponseEntity<List<Progress>> getProgressByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(progressService.getProgressByStudent(studentId));
    }

    @PostMapping("/lecture/{lectureId}/complete")
    public ResponseEntity<?> completeLecture(@PathVariable Long lectureId, @AuthenticationPrincipal User currentUser) {
        try {
            Progress progress = progressService.completeLecture(lectureId, currentUser);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/lecture/{lectureId}/complete")
    public ResponseEntity<?> uncompleteLecture(@PathVariable Long lectureId, @AuthenticationPrincipal User currentUser) {
        try {
            Progress progress = progressService.uncompleteLecture(lectureId, currentUser);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseProgress(@PathVariable Long courseId, @AuthenticationPrincipal User currentUser) {
        try {
            Progress progress = progressService.getProgressByStudentAndCourse(currentUser.getId(), courseId)
                    .orElse(Progress.builder()
                            .student(currentUser)
                            .completionPercentage(0.0)
                            .build());
            
            List<CompletedLecture> completed = progressService.getCompletedLecturesByStudentAndCourse(currentUser.getId(), courseId);
            
            return ResponseEntity.ok(Map.of(
                    "progress", progress,
                    "completedLectures", completed
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
