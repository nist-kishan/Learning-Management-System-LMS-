package com.lms.assignment;

import com.lms.common.FileStorageService;
import com.lms.course.Course;
import com.lms.course.CourseRepository;
import com.lms.enrollment.EnrollmentRepository;
import com.lms.user.Role;
import com.lms.user.User;
import com.lms.progress.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ProgressService progressService;

    public Assignment createAssignment(Long courseId, String title, String description, LocalDateTime dueDate, User currentUser) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Error: Course not found!"));

        // Access control: only the instructor who created it, or admin
        if (!course.getInstructor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to create assignment for this course!");
        }

        Assignment assignment = Assignment.builder()
                .title(title)
                .description(description)
                .dueDate(dueDate)
                .course(course)
                .build();

        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }

    public AssignmentSubmission submitAssignment(Long assignmentId, MultipartFile file, String content, User student) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Error: Assignment not found!"));

        // Check if student is enrolled
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), assignment.getCourse().getId())) {
            throw new RuntimeException("Error: You must be enrolled in this course to submit assignments!");
        }

        // Check if already submitted
        submissionRepository.findByStudentIdAndAssignmentId(student.getId(), assignmentId)
                .ifPresent(s -> {
                    throw new RuntimeException("Error: You have already submitted this assignment!");
                });

        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            fileUrl = fileStorageService.storeFile(file, "assignments");
        }

        AssignmentSubmission submission = AssignmentSubmission.builder()
                .student(student)
                .assignment(assignment)
                .fileUrl(fileUrl)
                .content(content)
                .submittedAt(LocalDateTime.now())
                .build();

        AssignmentSubmission savedSubmission = submissionRepository.save(submission);

        // Recalculate progress including this assignment submission
        progressService.recalculateProgress(student, assignment.getCourse());

        return savedSubmission;
    }

    public AssignmentSubmission evaluateSubmission(Long submissionId, Double grade, String feedback, User evaluator) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Error: Submission not found!"));

        Course course = submission.getAssignment().getCourse();

        // Access control: only the instructor who created the course, or admin
        if (!course.getInstructor().getId().equals(evaluator.getId()) && evaluator.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to grade this assignment submission!");
        }

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setEvaluatedAt(LocalDateTime.now());
        submission.setEvaluatedBy(evaluator);

        return submissionRepository.save(submission);
    }

    public List<AssignmentSubmission> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public List<AssignmentSubmission> getSubmissionsByCourse(Long courseId, User currentUser) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Error: Course not found!"));

        if (!course.getInstructor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to view submissions for this course!");
        }

        return submissionRepository.findByAssignmentCourseId(courseId);
    }
}
