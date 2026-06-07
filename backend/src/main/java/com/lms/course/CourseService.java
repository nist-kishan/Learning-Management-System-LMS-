package com.lms.course;

import com.lms.user.Role;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses(String query) {
        if (query != null && !query.trim().isEmpty()) {
            return courseRepository.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query);
        }
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Course not found with id: " + id));
    }

    public List<Course> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public Course createCourse(Course course, User instructor) {
        if (instructor.getRole() != Role.INSTRUCTOR && instructor.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Only instructors and admins can create courses!");
        }
        course.setInstructor(instructor);
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course courseDetails, User currentUser) {
        Course course = getCourseById(id);

        // Access control: only the instructor who created it, or admin
        if (!course.getInstructor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to update this course!");
        }

        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setCategory(courseDetails.getCategory());
        course.setPrice(courseDetails.getPrice());
        course.setThumbnail(courseDetails.getThumbnail());

        return courseRepository.save(course);
    }

    public void deleteCourse(Long id, User currentUser) {
        Course course = getCourseById(id);

        // Access control
        if (!course.getInstructor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Error: Unauthorized to delete this course!");
        }

        courseRepository.delete(course);
    }
}
