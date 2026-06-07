package com.lms.assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByStudentId(Long studentId);
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    List<AssignmentSubmission> findByAssignmentCourseId(Long courseId);
    Optional<AssignmentSubmission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
}
