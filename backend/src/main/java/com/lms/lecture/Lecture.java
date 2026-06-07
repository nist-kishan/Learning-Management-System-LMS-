package com.lms.lecture;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lms.course.Course;
import jakarta.persistence.*;

@Entity
@Table(name = "lectures")
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    private Long duration; // duration in seconds

    @Column(name = "lecture_order")
    private Integer lectureOrder;

    public Lecture() {
    }

    public Lecture(Long id, String title, String videoUrl, String description, Course course, Long duration, Integer lectureOrder) {
        this.id = id;
        this.title = title;
        this.videoUrl = videoUrl;
        this.description = description;
        this.course = course;
        this.duration = duration;
        this.lectureOrder = lectureOrder;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }
    public Integer getLectureOrder() { return lectureOrder; }
    public void setLectureOrder(Integer lectureOrder) { this.lectureOrder = lectureOrder; }

    public static LectureBuilder builder() {
        return new LectureBuilder();
    }

    public static class LectureBuilder {
        private String title;
        private String videoUrl;
        private String description;
        private Course course;
        private Long duration;
        private Integer lectureOrder;

        public LectureBuilder title(String title) {
            this.title = title;
            return this;
        }
        public LectureBuilder videoUrl(String videoUrl) {
            this.videoUrl = videoUrl;
            return this;
        }
        public LectureBuilder description(String description) {
            this.description = description;
            return this;
        }
        public LectureBuilder course(Course course) {
            this.course = course;
            return this;
        }
        public LectureBuilder duration(Long duration) {
            this.duration = duration;
            return this;
        }
        public LectureBuilder lectureOrder(Integer lectureOrder) {
            this.lectureOrder = lectureOrder;
            return this;
        }
        public Lecture build() {
            Lecture lecture = new Lecture();
            lecture.setTitle(this.title);
            lecture.setVideoUrl(this.videoUrl);
            lecture.setDescription(this.description);
            lecture.setCourse(this.course);
            lecture.setDuration(this.duration);
            lecture.setLectureOrder(this.lectureOrder);
            return lecture;
        }
    }
}
