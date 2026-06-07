import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../services/api';
import CourseCard from '../components/CourseCard';
import { BookOpen, GraduationCap, ArrowLeft, Search, Sparkles } from 'lucide-react';

const MyCourses = () => {
  const { user } = useSelector((state) => state.auth);
  
  // States
  const [courses, setCourses] = useState([]); // holds catalog for student, created for instructor
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user.role === 'STUDENT') {
        // Fetch all courses
        const coursesRes = await API.get('/courses');
        
        // Fetch enrolled courses
        const enrollmentsRes = await API.get(`/enrollments/student/${user.id}`);
        const enrolledIds = enrollmentsRes.data.map((e) => e.course.id);
        
        // Filter out already enrolled courses to get remaining catalog courses
        const remaining = coursesRes.data.filter((c) => !enrolledIds.includes(c.id));
        setCourses(remaining);
      } else if (user.role === 'INSTRUCTOR') {
        const res = await API.get('/courses/instructor');
        setCourses(res.data);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch courses. Please try again.');
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await API.post('/enrollments', { courseId });
      // Refresh the remaining catalog courses
      fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    }
  };

  // Filter courses by search query
  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-3"></div>
        <span>Loading AuraLMS Catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              {user.role === 'INSTRUCTOR' ? 'My Published Courses' : 'Course Catalog'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {user.role === 'INSTRUCTOR'
                ? 'Courses you are currently teaching on the platform'
                : 'Browse and enroll in new courses to begin learning'}
            </p>
          </div>
        </div>

        {/* Search bar */}
        {courses.length > 0 && (
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search catalog by category, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 pl-10 rounded-xl glass-input text-sm"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {courses.length > 0 ? (
        filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user.role === 'STUDENT'
              ? filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={false}
                    onEnroll={handleEnroll}
                  />
                ))
              : filteredCourses.map((course) => (
                  <div key={course.id} className="relative group">
                    <CourseCard course={course} />
                    <div className="absolute top-3 left-3">
                      <Link
                        to={`/courses/${course.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white text-xs font-semibold backdrop-blur-md transition-all duration-200"
                      >
                        Manage Syllabus
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center text-gray-500 border border-dashed border-white/10">
            <Search className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <p className="text-sm font-semibold">No matching courses found in catalog</p>
            <p className="text-xs text-gray-600 mt-1">Try another keyword</p>
          </div>
        )
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-500 border border-dashed border-white/10 max-w-xl mx-auto my-12">
          {user.role === 'INSTRUCTOR' ? (
            <>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="font-display font-bold text-white text-lg mb-1">No Courses Created</h3>
              <p className="text-xs text-gray-600 mb-6">
                You haven't uploaded any courses yet. Share your knowledge with the world!
              </p>
              <Link
                to="/"
                className="inline-flex items-center h-10 px-5 rounded-xl gradient-btn text-white text-xs font-semibold"
              >
                Create First Course
              </Link>
            </>
          ) : (
            <>
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-pulse" />
              <h3 className="font-display font-bold text-white text-lg mb-1">You're All Caught Up!</h3>
              <p className="text-xs text-gray-600 mb-6">
                You have enrolled in all available courses on the platform. Go to your Dashboard to continue learning.
              </p>
              <Link
                to="/"
                className="inline-flex items-center h-10 px-5 rounded-xl gradient-btn text-white text-xs font-semibold"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
