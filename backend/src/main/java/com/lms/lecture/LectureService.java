package com.lms.lecture;

import com.lms.common.FileStorageService;
import com.lms.course.Course;
import com.lms.course.CourseRepository;
import com.lms.user.Role;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class LectureService {

    @Autowired
    private LectureRepository lectureRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Lecture createLecture(Long courseId, String title, String description, Long duration, Integer lectureOrder, MultipartFile videoFile, String videoUrl, User currentUser) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Error: Course not found!"));

        // Access control: only the instructor who created it, or admin
        if (!course.getInstructor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to add lectures to this course!");
        }

        String finalVideoUrl = videoUrl;
        if (videoFile != null && !videoFile.isEmpty()) {
            finalVideoUrl = fileStorageService.storeFile(videoFile, "videos");
        }

        Lecture lecture = Lecture.builder()
                .title(title)
                .description(description)
                .duration(duration)
                .lectureOrder(lectureOrder != null ? lectureOrder : 0)
                .videoUrl(finalVideoUrl)
                .course(course)
                .build();

        return lectureRepository.save(lecture);
    }

    public List<Lecture> getLecturesByCourseId(Long courseId) {
        // Find course first
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Error: Course not found!");
        }
        return lectureRepository.findByCourseIdOrderByLectureOrderAsc(courseId);
    }

    public Lecture getLectureById(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Lecture not found with id: " + id));
    }

    public void deleteLecture(Long id, User currentUser) {
        Lecture lecture = getLectureById(id);
        Course course = lecture.getCourse();

        // Access control
        if (!course.getInstructor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to delete this lecture!");
        }

        lectureRepository.delete(lecture);
    }
}
