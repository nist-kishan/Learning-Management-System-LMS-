package com.lms.progress;

import com.lms.course.Course;
import com.lms.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "completion_percentage", nullable = false)
    private Double completionPercentage = 0.0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Progress() {
    }

    public Progress(Long id, User student, Course course, Double completionPercentage, LocalDateTime updatedAt) {
        this.id = id;
        this.student = student;
        this.course = course;
        this.completionPercentage = completionPercentage;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public Double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ProgressBuilder builder() {
        return new ProgressBuilder();
    }

    public static class ProgressBuilder {
        private User student;
        private Course course;
        private Double completionPercentage = 0.0;
        private LocalDateTime updatedAt;

        public ProgressBuilder student(User student) {
            this.student = student;
            return this;
        }
        public ProgressBuilder course(Course course) {
            this.course = course;
            return this;
        }
        public ProgressBuilder completionPercentage(Double completionPercentage) {
            this.completionPercentage = completionPercentage;
            return this;
        }
        public Progress build() {
            Progress progress = new Progress();
            progress.setStudent(this.student);
            progress.setCourse(this.course);
            progress.setCompletionPercentage(this.completionPercentage);
            return progress;
        }
    }
}
