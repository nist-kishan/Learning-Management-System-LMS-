package com.lms.quiz;

import com.lms.auth.dto.MessageResponse;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    public ResponseEntity<?> createQuiz(
            @RequestParam("courseId") Long courseId,
            @RequestBody Quiz quiz,
            @AuthenticationPrincipal User currentUser) {
        try {
            Quiz newQuiz = quizService.createQuiz(courseId, quiz, currentUser);
            return ResponseEntity.ok(newQuiz);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            Quiz quiz = quizService.getQuizById(id, currentUser);
            return ResponseEntity.ok(quiz);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmissionRequest request, @AuthenticationPrincipal User currentUser) {
        try {
            QuizSubmissionResponse response = quizService.submitQuiz(request, currentUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}/submissions/my")
    public ResponseEntity<List<QuizSubmission>> getMySubmissions(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizService.getSubmissionsForStudentAndCourse(currentUser.getId(), courseId));
    }
}
