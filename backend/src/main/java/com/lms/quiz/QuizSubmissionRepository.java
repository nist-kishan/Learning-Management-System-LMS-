package com.lms.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {
    List<QuizSubmission> findByStudentId(Long studentId);
    List<QuizSubmission> findByStudentIdAndQuizCourseId(Long studentId, Long courseId);
    List<QuizSubmission> findByQuizId(Long quizId);
    Optional<QuizSubmission> findFirstByStudentIdAndQuizIdOrderByCompletedAtDesc(Long studentId, Long quizId);
}
