package com.lms.quiz;

import java.util.Map;

public class QuizSubmissionRequest {
    private Long quizId;
    private Map<Long, String> answers; // maps questionId -> selectedOption ("A", "B", "C", "D")

    public QuizSubmissionRequest() {
    }

    public QuizSubmissionRequest(Long quizId, Map<Long, String> answers) {
        this.quizId = quizId;
        this.answers = answers;
    }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    public Map<Long, String> getAnswers() { return answers; }
    public void setAnswers(Map<Long, String> answers) { this.answers = answers; }
}
