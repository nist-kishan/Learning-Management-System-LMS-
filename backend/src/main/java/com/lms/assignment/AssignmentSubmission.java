package com.lms.assignment;

import com.lms.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Double grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "evaluated_by")
    private User evaluatedBy;

    public AssignmentSubmission() {
    }

    public AssignmentSubmission(Long id, User student, Assignment assignment, String fileUrl, String content, Double grade, String feedback, LocalDateTime submittedAt, LocalDateTime evaluatedAt, User evaluatedBy) {
        this.id = id;
        this.student = student;
        this.assignment = assignment;
        this.fileUrl = fileUrl;
        this.content = content;
        this.grade = grade;
        this.feedback = feedback;
        this.submittedAt = submittedAt;
        this.evaluatedAt = evaluatedAt;
        this.evaluatedBy = evaluatedBy;
    }

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
    public User getEvaluatedBy() { return evaluatedBy; }
    public void setEvaluatedBy(User evaluatedBy) { this.evaluatedBy = evaluatedBy; }

    public static AssignmentSubmissionBuilder builder() {
        return new AssignmentSubmissionBuilder();
    }

    public static class AssignmentSubmissionBuilder {
        private User student;
        private Assignment assignment;
        private String fileUrl;
        private String content;
        private Double grade;
        private String feedback;
        private LocalDateTime submittedAt;
        private LocalDateTime evaluatedAt;
        private User evaluatedBy;

        public AssignmentSubmissionBuilder student(User student) {
            this.student = student;
            return this;
        }
        public AssignmentSubmissionBuilder assignment(Assignment assignment) {
            this.assignment = assignment;
            return this;
        }
        public AssignmentSubmissionBuilder fileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
            return this;
        }
        public AssignmentSubmissionBuilder content(String content) {
            this.content = content;
            return this;
        }
        public AssignmentSubmissionBuilder grade(Double grade) {
            this.grade = grade;
            return this;
        }
        public AssignmentSubmissionBuilder feedback(String feedback) {
            this.feedback = feedback;
            return this;
        }
        public AssignmentSubmissionBuilder submittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
            return this;
        }
        public AssignmentSubmissionBuilder evaluatedAt(LocalDateTime evaluatedAt) {
            this.evaluatedAt = evaluatedAt;
            return this;
        }
        public AssignmentSubmissionBuilder evaluatedBy(User evaluatedBy) {
            this.evaluatedBy = evaluatedBy;
            return this;
        }
        public AssignmentSubmission build() {
            AssignmentSubmission submission = new AssignmentSubmission();
            submission.setStudent(this.student);
            submission.setAssignment(this.assignment);
            submission.setFileUrl(this.fileUrl);
            submission.setContent(this.content);
            submission.setGrade(this.grade);
            submission.setFeedback(this.feedback);
            submission.setSubmittedAt(this.submittedAt);
            submission.setEvaluatedAt(this.evaluatedAt);
            submission.setEvaluatedBy(this.evaluatedBy);
            return submission;
        }
    }
}
