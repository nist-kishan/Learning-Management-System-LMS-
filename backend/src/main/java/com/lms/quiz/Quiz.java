package com.lms.quiz;

import com.lms.course.Course;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "total_marks")
    private Integer totalMarks;

    private Integer duration; // in minutes

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "quiz_id")
    private List<Question> questions = new ArrayList<>();

    public Quiz() {
    }

    public Quiz(Long id, String title, Course course, Integer totalMarks, Integer duration, List<Question> questions) {
        this.id = id;
        this.title = title;
        this.course = course;
        this.totalMarks = totalMarks;
        this.duration = duration;
        this.questions = questions;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public static QuizBuilder builder() {
        return new QuizBuilder();
    }

    public static class QuizBuilder {
        private String title;
        private Course course;
        private Integer totalMarks;
        private Integer duration;
        private List<Question> questions = new ArrayList<>();

        public QuizBuilder title(String title) {
            this.title = title;
            return this;
        }
        public QuizBuilder course(Course course) {
            this.course = course;
            return this;
        }
        public QuizBuilder totalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
            return this;
        }
        public QuizBuilder duration(Integer duration) {
            this.duration = duration;
            return this;
        }
        public QuizBuilder questions(List<Question> questions) {
            this.questions = questions;
            return this;
        }
        public Quiz build() {
            Quiz quiz = new Quiz();
            quiz.setTitle(this.title);
            quiz.setCourse(this.course);
            quiz.setTotalMarks(this.totalMarks);
            quiz.setDuration(this.duration);
            quiz.setQuestions(this.questions);
            return quiz;
        }
    }
}
