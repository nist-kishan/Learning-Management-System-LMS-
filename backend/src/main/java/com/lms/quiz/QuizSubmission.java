package com.lms.quiz;

import com.lms.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_submissions")
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    public QuizSubmission() {
    }

    public QuizSubmission(Long id, User student, Quiz quiz, Integer score, LocalDateTime completedAt) {
        this.id = id;
        this.student = student;
        this.quiz = quiz;
        this.score = score;
        this.completedAt = completedAt;
    }

    @PrePersist
    protected void onCreate() {
        completedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public static QuizSubmissionBuilder builder() {
        return new QuizSubmissionBuilder();
    }

    public static class QuizSubmissionBuilder {
        private User student;
        private Quiz quiz;
        private Integer score;
        private LocalDateTime completedAt;

        public QuizSubmissionBuilder student(User student) {
            this.student = student;
            return this;
        }
        public QuizSubmissionBuilder quiz(Quiz quiz) {
            this.quiz = quiz;
            return this;
        }
        public QuizSubmissionBuilder score(Integer score) {
            this.score = score;
            return this;
        }
        public QuizSubmissionBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }
        public QuizSubmission build() {
            QuizSubmission submission = new QuizSubmission();
            submission.setStudent(this.student);
            submission.setQuiz(this.quiz);
            submission.setScore(this.score);
            submission.setCompletedAt(this.completedAt);
            return submission;
        }
    }
}
