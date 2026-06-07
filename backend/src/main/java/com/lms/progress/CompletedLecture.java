package com.lms.progress;

import com.lms.lecture.Lecture;
import com.lms.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "completed_lectures", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "lecture_id"})
})
public class CompletedLecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    public CompletedLecture() {
    }

    public CompletedLecture(Long id, User student, Lecture lecture, LocalDateTime completedAt) {
        this.id = id;
        this.student = student;
        this.lecture = lecture;
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
    public Lecture getLecture() { return lecture; }
    public void setLecture(Lecture lecture) { this.lecture = lecture; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public static CompletedLectureBuilder builder() {
        return new CompletedLectureBuilder();
    }

    public static class CompletedLectureBuilder {
        private User student;
        private Lecture lecture;
        private LocalDateTime completedAt;

        public CompletedLectureBuilder student(User student) {
            this.student = student;
            return this;
        }
        public CompletedLectureBuilder lecture(Lecture lecture) {
            this.lecture = lecture;
            return this;
        }
        public CompletedLectureBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }
        public CompletedLecture build() {
            CompletedLecture completedLecture = new CompletedLecture();
            completedLecture.setStudent(this.student);
            completedLecture.setLecture(this.lecture);
            completedLecture.setCompletedAt(this.completedAt);
            return completedLecture;
        }
    }
}
