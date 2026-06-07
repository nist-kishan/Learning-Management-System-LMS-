package com.lms.course;

import com.lms.auth.dto.MessageResponse;
import com.lms.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(courseService.getAllCourses(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(courseService.getCourseById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<Course>> getMyCourses(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course course, @AuthenticationPrincipal User currentUser) {
        try {
            Course newCourse = courseService.createCourse(course, currentUser);
            return ResponseEntity.ok(newCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Course course, @AuthenticationPrincipal User currentUser) {
        try {
            Course updatedCourse = courseService.updateCourse(id, course, currentUser);
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            courseService.deleteCourse(id, currentUser);
            return ResponseEntity.ok(new MessageResponse("Course deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
