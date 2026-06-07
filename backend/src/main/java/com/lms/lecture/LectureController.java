package com.lms.lecture;

import com.lms.auth.dto.MessageResponse;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lectures")
public class LectureController {

    @Autowired
    private LectureService lectureService;

    @PostMapping
    public ResponseEntity<?> createLecture(
            @RequestParam("courseId") Long courseId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "duration", required = false) Long duration,
            @RequestParam(value = "lectureOrder", required = false) Integer lectureOrder,
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @AuthenticationPrincipal User currentUser) {
        try {
            Lecture lecture = lectureService.createLecture(
                    courseId, title, description, duration, lectureOrder, videoFile, videoUrl, currentUser
            );
            return ResponseEntity.ok(lecture);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getLecturesByCourse(@PathVariable Long courseId) {
        try {
            List<Lecture> lectures = lectureService.getLecturesByCourseId(courseId);
            return ResponseEntity.ok(lectures);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLecture(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            lectureService.deleteLecture(id, currentUser);
            return ResponseEntity.ok(new MessageResponse("Lecture deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
