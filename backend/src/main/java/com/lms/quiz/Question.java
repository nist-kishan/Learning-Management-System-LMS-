package com.lms.quiz;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false)
    private String optionA;

    @Column(nullable = false)
    private String optionB;

    @Column(nullable = false)
    private String optionC;

    @Column(nullable = false)
    private String optionD;

    @Column(nullable = false)
    private String correctAnswer; // "A", "B", "C", or "D"

    public Question() {
    }

    public Question(Long id, String text, String optionA, String optionB, String optionC, String optionD, String correctAnswer) {
        this.id = id;
        this.text = text;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctAnswer = correctAnswer;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getOptionA() { return optionA; }
    public void setOptionA(String optionA) { this.optionA = optionA; }
    public String getOptionB() { return optionB; }
    public void setOptionB(String optionB) { this.optionB = optionB; }
    public String getOptionC() { return optionC; }
    public void setOptionC(String optionC) { this.optionC = optionC; }
    public String getOptionD() { return optionD; }
    public void setOptionD(String optionD) { this.optionD = optionD; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public static QuestionBuilder builder() {
        return new QuestionBuilder();
    }

    public static class QuestionBuilder {
        private String text;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;

        public QuestionBuilder text(String text) {
            this.text = text;
            return this;
        }
        public QuestionBuilder optionA(String optionA) {
            this.optionA = optionA;
            return this;
        }
        public QuestionBuilder optionB(String optionB) {
            this.optionB = optionB;
            return this;
        }
        public QuestionBuilder optionC(String optionC) {
            this.optionC = optionC;
            return this;
        }
        public QuestionBuilder optionD(String optionD) {
            this.optionD = optionD;
            return this;
        }
        public QuestionBuilder correctAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer;
            return this;
        }
        public Question build() {
            Question question = new Question();
            question.setText(this.text);
            question.setOptionA(this.optionA);
            question.setOptionB(this.optionB);
            question.setOptionC(this.optionC);
            question.setOptionD(this.optionD);
            question.setCorrectAnswer(this.correctAnswer);
            return question;
        }
    }
}
