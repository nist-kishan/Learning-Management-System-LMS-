package com.lms.quiz;

public class QuizSubmissionResponse {
    private Long submissionId;
    private Integer score;
    private Integer totalQuestions;
    private Integer totalMarks;
    private Double percentage;

    public QuizSubmissionResponse() {
    }

    public QuizSubmissionResponse(Long submissionId, Integer score, Integer totalQuestions, Integer totalMarks, Double percentage) {
        this.submissionId = submissionId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
    }

    // Getters and Setters
    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public static QuizSubmissionResponseBuilder builder() {
        return new QuizSubmissionResponseBuilder();
    }

    public static class QuizSubmissionResponseBuilder {
        private Long submissionId;
        private Integer score;
        private Integer totalQuestions;
        private Integer totalMarks;
        private Double percentage;

        public QuizSubmissionResponseBuilder submissionId(Long submissionId) {
            this.submissionId = submissionId;
            return this;
        }
        public QuizSubmissionResponseBuilder score(Integer score) {
            this.score = score;
            return this;
        }
        public QuizSubmissionResponseBuilder totalQuestions(Integer totalQuestions) {
            this.totalQuestions = totalQuestions;
            return this;
        }
        public QuizSubmissionResponseBuilder totalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
            return this;
        }
        public QuizSubmissionResponseBuilder percentage(Double percentage) {
            this.percentage = percentage;
            return this;
        }
        public QuizSubmissionResponse build() {
            return new QuizSubmissionResponse(submissionId, score, totalQuestions, totalMarks, percentage);
        }
    }
}
