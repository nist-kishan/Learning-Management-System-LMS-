import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../services/api';
import CourseCard from '../components/CourseCard';
import { BookOpen, User, DollarSign, Plus, Settings, Users, GraduationCap, Play, Search, Folder, CheckCircle, ShieldAlert, Award, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Instructor Course Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('');

  // Fetch initial data based on role
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user.role === 'STUDENT') {
        // Fetch all courses
        const coursesRes = await API.get('/courses');
        setCourses(coursesRes.data);

        // Fetch enrolled courses for progress
        const enrollmentsRes = await API.get(`/enrollments/student/${user.id}`);
        setEnrolledCourses(enrollmentsRes.data);
      } else if (user.role === 'INSTRUCTOR') {
        // Fetch instructor's created courses
        const coursesRes = await API.get('/courses/instructor');
        setCourses(coursesRes.data);
      } else if (user.role === 'ADMIN') {
        // Fetch admin statistics
        const statsRes = await API.get('/admin/stats');
        setAdminStats(statsRes.data);

        // Fetch all users
        const usersRes = await API.get('/admin/users');
        setAdminUsers(usersRes.data);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data. Is the backend running?');
      setLoading(false);
    }
  };

  // Student: Enroll in a Course
  const handleEnroll = async (courseId) => {
    try {
      await API.post('/enrollments', { courseId });
      // Refresh data
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    }
  };

  // Instructor: Create a Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle || !courseCategory) return;

    try {
      await API.post('/courses', {
        title: courseTitle,
        description: courseDesc,
        category: courseCategory,
        price: parseFloat(coursePrice) || 0.0,
        thumbnail: courseThumbnail,
      });

      setShowCreateModal(false);
      // Reset Form
      setCourseTitle('');
      setCourseDesc('');
      setCourseCategory('');
      setCoursePrice('');
      setCourseThumbnail('');
      // Refresh
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course.');
    }
  };

  // Admin: Block/Unblock user
  const handleToggleUserActive = async (userId) => {
    try {
      await API.post(`/admin/users/${userId}/toggle-active`);
      // Update local state instantly
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
      );
    } catch (err) {
      alert('Failed to toggle user status.');
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
        <span>Loading AuraLMS Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass max-w-lg mx-auto p-6 rounded-2xl border border-rose-500/20 text-center my-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-display font-bold text-white text-lg mb-2">Connection Error</h3>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-5 h-10 rounded-xl gradient-btn text-white text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  // STUDENT DASHBOARD
  if (user.role === 'STUDENT') {
    const isEnrolled = (courseId) => enrolledCourses.some((e) => e.course.id === courseId);
    
    // Calculates overall student statistics
    const completedCourses = enrolledCourses.filter((e) => e.completionPercentage >= 100).length;
    const enrolledCount = enrolledCourses.length;

    // Filter enrolled courses by search query
    const filteredEnrolled = enrolledCourses.filter((e) =>
      e.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.course.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Hello, <span className="gradient-text">{user.name}</span>!
            </h1>
            <p className="text-gray-400 text-sm mt-1">Ready to expand your skillset today?</p>
          </div>

          {/* Search bar */}
          {enrolledCount > 0 && (
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search my courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 pl-10 rounded-xl glass-input text-sm"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Enrolled Courses</div>
              <div className="text-2xl font-bold text-white mt-1">{enrolledCount}</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Completed Courses</div>
              <div className="text-2xl font-bold text-white mt-1">{completedCourses}</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Active Learning</div>
              <div className="text-2xl font-bold text-white mt-1">
                {enrolledCount > 0 ? `${Math.round(enrolledCourses.reduce((acc, c) => acc + (c.completionPercentage || 0), 0) / enrolledCount)}% avg` : '0%'}
              </div>
            </div>
          </div>
        </div>

        {/* My Enrollments */}
        {enrolledCount > 0 ? (
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-400" />
              Continue Learning
            </h2>
            {filteredEnrolled.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredEnrolled.map((enrollment) => (
                  <CourseCard
                    key={enrollment.id}
                    course={enrollment.course}
                    isEnrolled={true}
                    progress={enrollment.completionPercentage}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center text-gray-500 border border-dashed border-white/10">
                <Search className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-sm font-semibold">No matching enrolled courses found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center text-gray-500 border border-dashed border-white/10 max-w-xl mx-auto my-6">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="font-display font-bold text-white text-lg mb-1">Welcome to AuraLMS!</h3>
            <p className="text-xs text-gray-600 mb-6">
              You are not enrolled in any courses yet. Go to the "My Courses" menu to explore available courses and enroll.
            </p>
            <Link
              to="/my-courses"
              className="inline-flex items-center h-10 px-5 rounded-xl gradient-btn text-white text-xs font-semibold"
            >
              Browse Course Catalog
            </Link>
          </div>
        )}
      </div>
    );
  }

  // INSTRUCTOR DASHBOARD
  if (user.role === 'INSTRUCTOR') {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Instructor <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your courses, lectures, and students</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 rounded-xl gradient-btn text-white px-5 text-sm font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Your Courses</div>
              <div className="text-2xl font-bold text-white mt-1">{courses.length}</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Earnings Projection</div>
              <div className="text-2xl font-bold text-white mt-1">
                ${courses.reduce((acc, c) => acc + (c.price || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Active Status</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">Active Instructor</div>
            </div>
          </div>
        </div>

        {/* Created Courses */}
        <div>
          <h2 className="font-display font-bold text-xl text-white mb-4">Your Published Courses</h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="relative group">
                  <CourseCard course={course} />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white text-xs font-semibold backdrop-blur-md transition-all duration-200"
                    >
                      Manage Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-gray-500 border border-dashed border-white/10">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-sm font-semibold">You haven't created any courses yet</p>
              <p className="text-xs text-gray-600 mt-1">Click the "Create Course" button above to upload your first course</p>
            </div>
          )}
        </div>

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <div className="glass max-w-lg w-full p-8 rounded-3xl shadow-2xl relative border border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="font-display font-bold text-2xl text-white mb-4">Create New Course</h2>
              
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full-Stack Web Development"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Write a brief overview of the course syllabus and expectations..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full p-4 rounded-xl glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineering"
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Free"
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Thumbnail Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={courseThumbnail}
                    onChange={(e) => setCourseThumbnail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 h-11 rounded-xl hover:bg-white/5 text-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-11 rounded-xl gradient-btn text-white font-semibold"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ADMIN DASHBOARD
  if (user.role === 'ADMIN') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Admin <span className="gradient-text">Console</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Global platform monitoring and user moderation</p>
        </div>

        {/* Admin Stats Grid */}
        {adminStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Users</span>
              </div>
              <div className="text-2xl font-bold text-white">{adminStats.totalUsers}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Students</span>
              </div>
              <div className="text-2xl font-bold text-white">{adminStats.totalStudents}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Instructors</span>
              </div>
              <div className="text-2xl font-bold text-white">{adminStats.totalInstructors}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <Folder className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Courses</span>
              </div>
              <div className="text-2xl font-bold text-white">{adminStats.totalCourses}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/5 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Enrollments</span>
              </div>
              <div className="text-2xl font-bold text-white">{adminStats.totalEnrollments}</div>
            </div>
          </div>
        )}

        {/* Users Moderation List */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Platform Registered Users</h2>
            <div className="text-xs text-gray-400">Total: {adminUsers.length}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors text-sm text-gray-300">
                    <td className="p-4 pl-6 font-mono text-xs text-gray-500">{u.id}</td>
                    <td className="p-4 font-semibold text-white">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : u.role === 'INSTRUCTOR'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        u.active ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {u.active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {u.role !== 'ADMIN' ? (
                        <button
                          onClick={() => handleToggleUserActive(u.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                            u.active
                              ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white'
                              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white'
                          }`}
                        >
                          {u.active ? 'Block' : 'Unblock'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-600 font-semibold italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
