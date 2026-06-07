package com.lms.progress;

import com.lms.course.Course;
import com.lms.lecture.Lecture;
import com.lms.lecture.LectureRepository;
import com.lms.user.User;
import com.lms.quiz.QuizRepository;
import com.lms.quiz.QuizSubmissionRepository;
import com.lms.assignment.AssignmentRepository;
import com.lms.assignment.AssignmentSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private CompletedLectureRepository completedLectureRepository;

    @Autowired
    private LectureRepository lectureRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository assignmentSubmissionRepository;

    public List<Progress> getProgressByStudent(Long studentId) {
        return progressRepository.findByStudentId(studentId);
    }

    public Optional<Progress> getProgressByStudentAndCourse(Long studentId, Long courseId) {
        return progressRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    @Transactional
    public Progress completeLecture(Long lectureId, User student) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Error: Lecture not found!"));

        Course course = lecture.getCourse();

        // Check if already completed
        if (!completedLectureRepository.existsByStudentIdAndLectureId(student.getId(), lectureId)) {
            CompletedLecture completedLecture = CompletedLecture.builder()
                    .student(student)
                    .lecture(lecture)
                    .build();
            completedLectureRepository.save(completedLecture);
        }

        return recalculateProgress(student, course);
    }

    @Transactional
    public Progress uncompleteLecture(Long lectureId, User student) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Error: Lecture not found!"));

        Course course = lecture.getCourse();

        completedLectureRepository.findByStudentIdAndLectureId(student.getId(), lectureId)
                .ifPresent(completedLectureRepository::delete);

        return recalculateProgress(student, course);
    }

    public List<CompletedLecture> getCompletedLecturesByStudentAndCourse(Long studentId, Long courseId) {
        return completedLectureRepository.findByStudentIdAndLectureCourseId(studentId, courseId);
    }

    @Transactional
    public Progress recalculateProgress(User student, Course course) {
        // Get total lectures in course
        long totalLectures = lectureRepository.findByCourseIdOrderByLectureOrderAsc(course.getId()).size();
        
        // Get completed lectures in course by student
        long completedLectures = completedLectureRepository.findByStudentIdAndLectureCourseId(student.getId(), course.getId()).size();

        // Get total quizzes in course
        long totalQuizzes = quizRepository.findByCourseId(course.getId()).size();
        
        // Get completed quizzes (where student has submitted)
        long completedQuizzes = quizSubmissionRepository.findByStudentIdAndQuizCourseId(student.getId(), course.getId())
                .stream().map(sub -> sub.getQuiz().getId()).distinct().count();

        // Get total assignments in course
        long totalAssignments = assignmentRepository.findByCourseId(course.getId()).size();
        
        // Get completed assignments (where student has submitted)
        long completedAssignments = assignmentSubmissionRepository.findByStudentId(student.getId())
                .stream().filter(sub -> sub.getAssignment().getCourse().getId().equals(course.getId())).count();

        long totalItems = totalLectures + totalQuizzes + totalAssignments;
        long completedItems = completedLectures + completedQuizzes + completedAssignments;

        double percentage = 0.0;
        if (totalItems > 0) {
            percentage = ((double) completedItems / totalItems) * 100.0;
        }

        Progress progress = progressRepository.findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElse(Progress.builder()
                        .student(student)
                        .course(course)
                        .build());

        progress.setCompletionPercentage(percentage);
        return progressRepository.save(progress);
    }
}
