package com.lms.quiz;

import com.lms.course.Course;
import com.lms.course.CourseRepository;
import com.lms.user.Role;
import com.lms.user.User;
import com.lms.progress.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizSubmissionRepository submissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ProgressService progressService;

    public Quiz createQuiz(Long courseId, Quiz quiz, User currentUser) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Error: Course not found!"));

        // Access control
        if (!course.getInstructor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to create quiz for this course!");
        }

        quiz.setCourse(course);
        if (quiz.getTotalMarks() == null) {
            quiz.setTotalMarks(quiz.getQuestions().size());
        }
        return quizRepository.save(quiz);
    }

    public Quiz getQuizById(Long id, User currentUser) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Quiz not found with id: " + id));

        // If current user is student, secure the quiz questions by stripping the correct answers
        if (currentUser.getRole() == Role.STUDENT) {
            Quiz securedQuiz = new Quiz();
            securedQuiz.setId(quiz.getId());
            securedQuiz.setTitle(quiz.getTitle());
            securedQuiz.setCourse(quiz.getCourse());
            securedQuiz.setTotalMarks(quiz.getTotalMarks());
            securedQuiz.setDuration(quiz.getDuration());
            
            List<Question> securedQuestions = quiz.getQuestions().stream().map(q -> {
                Question securedQ = new Question();
                securedQ.setId(q.getId());
                securedQ.setText(q.getText());
                securedQ.setOptionA(q.getOptionA());
                securedQ.setOptionB(q.getOptionB());
                securedQ.setOptionC(q.getOptionC());
                securedQ.setOptionD(q.getOptionD());
                securedQ.setCorrectAnswer(null); // HIDDEN from students
                return securedQ;
            }).collect(Collectors.toList());
            
            securedQuiz.setQuestions(securedQuestions);
            return securedQuiz;
        }

        return quiz;
    }

    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public QuizSubmissionResponse submitQuiz(QuizSubmissionRequest request, User student) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Error: Quiz not found!"));

        List<Question> questions = quiz.getQuestions();
        if (questions.isEmpty()) {
            throw new RuntimeException("Error: Quiz has no questions!");
        }

        Map<Long, String> studentAnswers = request.getAnswers();
        int correctCount = 0;

        for (Question question : questions) {
            String studentAns = studentAnswers.get(question.getId());
            if (studentAns != null && studentAns.trim().equalsIgnoreCase(question.getCorrectAnswer().trim())) {
                correctCount++;
            }
        }

        // Calculate score based on totalMarks and proportion of correct answers
        int totalMarks = quiz.getTotalMarks() != null ? quiz.getTotalMarks() : questions.size();
        int finalScore = (int) Math.round(((double) correctCount / questions.size()) * totalMarks);
        double percentage = ((double) correctCount / questions.size()) * 100.0;

        QuizSubmission submission = QuizSubmission.builder()
                .student(student)
                .quiz(quiz)
                .score(finalScore)
                .build();

        QuizSubmission savedSubmission = submissionRepository.save(submission);

        // Recalculate progress including this quiz completion
        progressService.recalculateProgress(student, quiz.getCourse());

        return QuizSubmissionResponse.builder()
                .submissionId(savedSubmission.getId())
                .score(finalScore)
                .totalQuestions(questions.size())
                .totalMarks(totalMarks)
                .percentage(percentage)
                .build();
    }

    public List<QuizSubmission> getSubmissionsForStudentAndCourse(Long studentId, Long courseId) {
        return submissionRepository.findByStudentIdAndQuizCourseId(studentId, courseId);
    }
}
