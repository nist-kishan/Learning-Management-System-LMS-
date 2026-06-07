package com.lms.enrollment;

import com.lms.course.Course;
import com.lms.course.CourseRepository;
import com.lms.progress.Progress;
import com.lms.progress.ProgressRepository;
import com.lms.user.Role;
import com.lms.user.User;
import com.lms.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @Transactional
    public Enrollment enrollStudent(Long courseId, User student) {
        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Error: Only students can enroll in courses!");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Error: Course not found!"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new RuntimeException("Error: You are already enrolled in this course!");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Initialize progress for the course
        if (progressRepository.findByStudentIdAndCourseId(student.getId(), courseId).isEmpty()) {
            Progress progress = Progress.builder()
                    .student(student)
                    .course(course)
                    .completionPercentage(0.0)
                    .build();
            progressRepository.save(progress);
        }

        return savedEnrollment;
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public boolean isStudentEnrolled(Long studentId, Long courseId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }
}
