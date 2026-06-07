package com.lms.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompletedLectureRepository extends JpaRepository<CompletedLecture, Long> {
    List<CompletedLecture> findByStudentIdAndLectureCourseId(Long studentId, Long courseId);
    boolean existsByStudentIdAndLectureId(Long studentId, Long lectureId);
    Optional<CompletedLecture> findByStudentIdAndLectureId(Long studentId, Long lectureId);
}
