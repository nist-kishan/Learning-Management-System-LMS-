package com.lms.assignment;

import com.lms.course.Course;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public Assignment() {
    }

    public Assignment(Long id, String title, String description, LocalDateTime dueDate, Course course) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public static AssignmentBuilder builder() {
        return new AssignmentBuilder();
    }

    public static class AssignmentBuilder {
        private String title;
        private String description;
        private LocalDateTime dueDate;
        private Course course;

        public AssignmentBuilder title(String title) {
            this.title = title;
            return this;
        }
        public AssignmentBuilder description(String description) {
            this.description = description;
            return this;
        }
        public AssignmentBuilder dueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
            return this;
        }
        public AssignmentBuilder course(Course course) {
            this.course = course;
            return this;
        }
        public Assignment build() {
            Assignment assignment = new Assignment();
            assignment.setTitle(this.title);
            assignment.setDescription(this.description);
            assignment.setDueDate(this.dueDate);
            assignment.setCourse(this.course);
            return assignment;
        }
    }
}
