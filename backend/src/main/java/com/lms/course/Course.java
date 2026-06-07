package com.lms.course;

import com.lms.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    private Double price;

    private String thumbnail;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Course() {
    }

    public Course(Long id, String title, String description, String category, Double price, String thumbnail, User instructor) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.price = price;
        this.thumbnail = thumbnail;
        this.instructor = instructor;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public User getInstructor() { return instructor; }
    public void setInstructor(User instructor) { this.instructor = instructor; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static CourseBuilder builder() {
        return new CourseBuilder();
    }

    public static class CourseBuilder {
        private String title;
        private String description;
        private String category;
        private Double price;
        private String thumbnail;
        private User instructor;

        public CourseBuilder title(String title) {
            this.title = title;
            return this;
        }
        public CourseBuilder description(String description) {
            this.description = description;
            return this;
        }
        public CourseBuilder category(String category) {
            this.category = category;
            return this;
        }
        public CourseBuilder price(Double price) {
            this.price = price;
            return this;
        }
        public CourseBuilder thumbnail(String thumbnail) {
            this.thumbnail = thumbnail;
            return this;
        }
        public CourseBuilder instructor(User instructor) {
            this.instructor = instructor;
            return this;
        }
        public Course build() {
            Course course = new Course();
            course.setTitle(this.title);
            course.setDescription(this.description);
            course.setCategory(this.category);
            course.setPrice(this.price);
            course.setThumbnail(this.thumbnail);
            course.setInstructor(this.instructor);
            return course;
        }
    }
}
