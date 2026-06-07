import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import QuizCard from '../components/QuizCard';
import { BookOpen, User, Play, Clock, HelpCircle, FileText, CheckCircle, Upload, Plus, Award, Calendar, Check, Send } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Core States
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [progressDetails, setProgressDetails] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Item States
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [activeTab, setActiveTab] = useState('lectures'); // lectures, quizzes, assignments, grading

  // Instructor Form States
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [lecTitle, setLecTitle] = useState('');
  const [lecDesc, setLecDesc] = useState('');
  const [lecDuration, setLecDuration] = useState('');
  const [lecOrder, setLecOrder] = useState('');
  const [lecVideoFile, setLecVideoFile] = useState(null);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  // Question Builder States
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  // Student Assignment Submission State
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  // Grading states for Instructor
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [id, user]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch course details
      const courseRes = await API.get(`/courses/${id}`);
      setCourse(courseRes.data);

      const isInstructorOrAdmin = user.role === 'ADMIN' || courseRes.data.instructor.id === user.id;

      let enrolled = false;
      // 2. Check enrollment if student
      if (user.role === 'STUDENT') {
        const enrollmentsRes = await API.get(`/enrollments/student/${user.id}`);
        enrolled = enrollmentsRes.data.some((e) => e.course.id === courseRes.data.id);
        setIsEnrolled(enrolled);

        if (enrolled) {
          // Fetch student progress
          const progressRes = await API.get(`/progress/course/${id}`);
          setProgressDetails(progressRes.data); // contains progress percentage and completedLectures list
        }
      } else {
        enrolled = isInstructorOrAdmin;
        setIsEnrolled(isInstructorOrAdmin);
      }

      // 3. Fetch lectures, quizzes, and assignments (if student is enrolled or is instructor/admin)
      if (isInstructorOrAdmin || (user.role === 'STUDENT' && enrolled)) {
        const lecturesRes = await API.get(`/lectures/course/${id}`);
        setLectures(lecturesRes.data);
        if (lecturesRes.data.length > 0 && !selectedLecture) {
          setSelectedLecture(lecturesRes.data[0]);
        }

        const quizzesRes = await API.get(`/quizzes/course/${id}`);
        setQuizzes(quizzesRes.data);

        const assignmentsRes = await API.get(`/assignments/course/${id}`);
        setAssignments(assignmentsRes.data);

        // If student, pull their assignment submissions
        if (user.role === 'STUDENT') {
          const subsRes = await API.get(`/submissions/student/${user.id}`);
          setSubmissions(subsRes.data.filter((s) => s.assignment.course.id === courseRes.data.id));

          const qSubsRes = await API.get(`/quizzes/course/${id}/submissions/my`);
          setQuizSubmissions(qSubsRes.data);
        }

        // If instructor, pull course-wide student submissions for grading
        if (isInstructorOrAdmin && user.role === 'INSTRUCTOR') {
          const subsRes = await API.get(`/submissions/course/${id}`);
          setSubmissions(subsRes.data);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await API.post('/enrollments', { courseId: id });
      setIsEnrolled(true);
      fetchCourseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    }
  };

  // Student: Automatically mark lecture as completed when video ends
  const handleLectureEnded = async () => {
    if (user.role !== 'STUDENT' || !selectedLecture) return;
    
    // Check if already completed
    const alreadyCompleted = progressDetails?.completedLectures?.some(
      (cl) => cl.lecture.id === selectedLecture.id
    );

    if (alreadyCompleted) return;

    try {
      await API.post(`/progress/lecture/${selectedLecture.id}/complete`);
      // Refresh progress metrics
      fetchCourseDetails();
    } catch (err) {
      console.error('Error marking lecture completed', err);
    }
  };

  // Student: Manual toggle for lecture completion
  const handleToggleLectureCompletion = async (lecId, currentStatus) => {
    try {
      if (currentStatus) {
        await API.delete(`/progress/lecture/${lecId}/complete`);
      } else {
        await API.post(`/progress/lecture/${lecId}/complete`);
      }
      fetchCourseDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Student: Submit Assignment
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignmentId) return;

    const formData = new FormData();
    formData.append('assignmentId', selectedAssignmentId);
    if (submissionFile) {
      formData.append('file', submissionFile);
    }
    formData.append('content', submissionContent);

    try {
      await API.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmissionContent('');
      setSubmissionFile(null);
      setSelectedAssignmentId(null);
      fetchCourseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.');
    }
  };

  // Instructor: Add Lecture
  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lecTitle) return;

    const formData = new FormData();
    formData.append('courseId', id);
    formData.append('title', lecTitle);
    formData.append('description', lecDesc);
    formData.append('duration', parseInt(lecDuration) || 0);
    formData.append('lectureOrder', parseInt(lecOrder) || 0);
    if (lecVideoFile) {
      formData.append('videoFile', lecVideoFile);
    }

    try {
      await API.post('/lectures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowLectureModal(false);
      setLecTitle('');
      setLecDesc('');
      setLecDuration('');
      setLecOrder('');
      setLecVideoFile(null);
      fetchCourseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload lecture.');
    }
  };

  // Instructor: Add Question to Temp Quiz List
  const handleAddQuestionToQuiz = () => {
    if (!qText || !qOptA || !qOptB) return;
    const newQ = {
      text: qText,
      optionA: qOptA,
      optionB: qOptB,
      optionC: qOptC,
      optionD: qOptD,
      correctAnswer: qCorrect,
    };
    setQuizQuestions([...quizQuestions, newQ]);
    // Reset Question Editor
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQCorrect('A');
  };

  // Instructor: Submit Created Quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    // Auto-add the question currently in the input fields if they forgot to click "Add Question"
    let finalQuestions = [...quizQuestions];
    if (qText && qOptA && qOptB) {
      finalQuestions.push({
        text: qText,
        optionA: qOptA,
        optionB: qOptB,
        optionC: qOptC,
        optionD: qOptD,
        correctAnswer: qCorrect,
      });
    }

    if (!quizTitle || finalQuestions.length === 0) return;

    try {
      await API.post(`/quizzes?courseId=${id}`, {
        title: quizTitle,
        duration: parseInt(quizDuration) || 10,
        totalMarks: finalQuestions.length,
        questions: finalQuestions,
      });

      setShowQuizModal(false);
      setQuizTitle('');
      setQuizDuration('');
      setQuizQuestions([]);
      fetchCourseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quiz.');
    }
  };

  // Instructor: Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignTitle || !assignDueDate) return;

    try {
      await API.post(`/assignments?courseId=${id}&title=${encodeURIComponent(assignTitle)}&description=${encodeURIComponent(assignDesc)}&dueDate=${encodeURIComponent(new Date(assignDueDate).toISOString())}`);
      setShowAssignmentModal(false);
      setAssignTitle('');
      setAssignDesc('');
      setAssignDueDate('');
      fetchCourseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    }
  };

  // Instructor: Submit Grade Evaluation
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmissionId || !gradingScore) return;

    try {
      await API.put(`/submissions/${selectedSubmissionId}/evaluate`, {
        grade: parseFloat(gradingScore),
        feedback: gradingFeedback,
      });
      setSelectedSubmissionId(null);
      setGradingScore('');
      setGradingFeedback('');
      fetchCourseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to evaluate submission.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-3"></div>
        <span>Loading Course Details...</span>
      </div>
    );
  }

  if (!course) return null;

  const isInstructor = user.role === 'INSTRUCTOR' && course.instructor.id === user.id;
  const isAllowedToViewContent = isEnrolled || isInstructor || user.role === 'ADMIN';

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Course Banner */}
      <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start justify-between relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="space-y-4 max-w-2xl">
          <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/20">
            {course.category}
          </span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white leading-tight">
            {course.title}
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-500" />
              <span>Created by <strong className="text-white">{course.instructor?.name}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{lectures.length} Lectures</span>
            </div>
          </div>
        </div>

        {/* Pricing / Enrollment status card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 w-full md:w-80 flex flex-col items-center shrink-0">
          {!isAllowedToViewContent ? (
            <div className="w-full text-center space-y-4">
              <div className="text-sm text-gray-400">Enroll to unlock full course material</div>
              <div className="text-3xl font-extrabold text-white">${course.price ? course.price.toFixed(2) : '0.00'}</div>
              <button
                onClick={handleEnroll}
                className="w-full h-11 rounded-xl gradient-btn text-white font-semibold flex items-center justify-center gap-2"
              >
                Enroll Now
              </button>
            </div>
          ) : (
            <div className="w-full text-center space-y-4">
              <div className="text-xs text-emerald-400 font-semibold tracking-wider uppercase bg-emerald-500/10 py-1.5 px-3 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Access Granted
              </div>
              
              {user.role === 'STUDENT' && progressDetails && (
                <div className="w-full text-left space-y-2 mt-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-400">
                    <span>Your Progress</span>
                    <span className="text-blue-400">{Math.round(progressDetails.progress?.completionPercentage || 0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressDetails.progress?.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isAllowedToViewContent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Selector */}
            <div className="flex border-b border-white/5 gap-6 text-sm">
              <button
                onClick={() => setActiveTab('lectures')}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === 'lectures' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Lectures ({lectures.length})
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === 'quizzes' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Quizzes ({quizzes.length})
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === 'assignments' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Assignments ({assignments.length})
              </button>
              {isInstructor && (
                <button
                  onClick={() => setActiveTab('grading')}
                  className={`pb-3 font-semibold transition-colors relative ${
                    activeTab === 'grading' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Grade Submissions ({submissions.length})
                </button>
              )}
            </div>

            {/* TAB CONTENT: LECTURES */}
            {activeTab === 'lectures' && (
              <div className="space-y-6">
                <VideoPlayer
                  videoUrl={selectedLecture?.videoUrl}
                  onCompleted={handleLectureEnded}
                />
                
                {selectedLecture && (
                  <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                    <h3 className="font-display font-bold text-white text-lg">{selectedLecture.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{selectedLecture.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: QUIZZES */}
            {activeTab === 'quizzes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    userSubmission={quizSubmissions.find((s) => s.quiz.id === quiz.id)}
                    onQuizSubmitted={() => {
                      // refresh progress statistics
                      fetchCourseDetails();
                    }}
                  />
                ))}
                {quizzes.length === 0 && (
                  <div className="col-span-full glass-card p-8 rounded-2xl text-center text-gray-500">
                    No quizzes published yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ASSIGNMENTS */}
            {activeTab === 'assignments' && (
              <div className="space-y-6 animate-fade-in">
                {assignments.map((assign) => {
                  const studentSub = submissions.find((s) => s.assignment.id === assign.id);

                  return (
                    <div key={assign.id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <h4 className="font-display font-bold text-white text-base">{assign.title}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-lg">{assign.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(assign.dueDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {studentSub ? (
                          <div className="glass px-4 py-3 rounded-xl border border-white/5 space-y-1">
                            <div className="text-[10px] font-bold uppercase text-emerald-400">Submitted</div>
                            {studentSub.grade != null ? (
                              <div className="text-xs text-gray-300">
                                Grade: <strong className="text-white text-sm">{studentSub.grade}</strong>
                                <p className="text-[10px] text-gray-400 mt-1 italic">Feedback: "{studentSub.feedback}"</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Awaiting evaluation</span>
                            )}
                          </div>
                        ) : user.role === 'STUDENT' ? (
                          <button
                            onClick={() => setSelectedAssignmentId(assign.id)}
                            className="px-4 h-9 rounded-xl gradient-btn text-white text-xs font-semibold"
                          >
                            Submit Assignment
                          </button>
                        ) : (
                          <div className="text-xs text-gray-500 font-semibold italic">Instructor View</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Assignment submission form */}
                {selectedAssignmentId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass max-w-lg w-full p-8 rounded-3xl shadow-2xl relative border border-white/10">
                      <h3 className="font-display font-bold text-xl text-white mb-2">Submit Assignment Work</h3>
                      <p className="text-gray-400 text-xs mb-4">You can write a short text response or attach a submission file.</p>

                      <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Text Submission</label>
                          <textarea
                            rows="4"
                            placeholder="Write your text submission details here..."
                            value={submissionContent}
                            onChange={(e) => setSubmissionContent(e.target.value)}
                            className="w-full p-4 rounded-xl glass-input text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Attachment File</label>
                          <input
                            type="file"
                            onChange={(e) => setSubmissionFile(e.target.files[0])}
                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20"
                          />
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                          <button
                            type="button"
                            onClick={() => setSelectedAssignmentId(null)}
                            className="px-4 h-10 rounded-xl hover:bg-white/5 text-gray-300 font-medium text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 h-10 rounded-xl gradient-btn text-white font-semibold text-xs flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {assignments.length === 0 && (
                  <div className="glass-card p-8 rounded-2xl text-center text-gray-500">
                    No assignments published.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: GRADING */}
            {activeTab === 'grading' && isInstructor && (
              <div className="space-y-6 animate-fade-in">
                {submissions.map((sub) => (
                  <div key={sub.id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{sub.student.name}</strong>
                        <span className="text-[10px] text-gray-500 font-mono">({sub.student.email})</span>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold">{sub.assignment.title}</p>
                      
                      {sub.content && (
                        <p className="text-xs bg-black/40 p-3 rounded-xl text-gray-400 mt-2 italic max-w-lg border border-white/5">
                          "{sub.content}"
                        </p>
                      )}

                      {sub.fileUrl && (
                        <a
                          href={`http://localhost:8080${sub.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Attachment File
                        </a>
                      )}
                    </div>

                    <div className="shrink-0">
                      {sub.grade != null ? (
                        <div className="glass px-4 py-3 rounded-xl border border-white/5 text-xs">
                          <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold block mb-1">Graded</span>
                          Grade: <strong className="text-emerald-400 text-sm">{sub.grade}</strong>
                          <p className="text-[10px] text-gray-400 mt-1 italic">"{sub.feedback}"</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSubmissionId(sub.id)}
                          className="px-4 h-9 rounded-xl gradient-btn text-white text-xs font-semibold"
                        >
                          Grade Submission
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Grading dialog */}
                {selectedSubmissionId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass max-w-md w-full p-8 rounded-3xl shadow-2xl relative border border-white/10">
                      <h3 className="font-display font-bold text-xl text-white mb-4">Grade Assignment Work</h3>

                      <form onSubmit={handleGradeSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Score / Grade</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            placeholder="e.g. 95"
                            value={gradingScore}
                            onChange={(e) => setGradingScore(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Feedback</label>
                          <textarea
                            rows="3"
                            placeholder="Write constructive student feedback..."
                            value={gradingFeedback}
                            onChange={(e) => setGradingFeedback(e.target.value)}
                            className="w-full p-4 rounded-xl glass-input text-xs"
                          />
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmissionId(null)}
                            className="px-4 h-10 rounded-xl hover:bg-white/5 text-gray-300 font-medium text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 h-10 rounded-xl gradient-btn text-white font-semibold text-xs"
                          >
                            Submit Grade
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {submissions.length === 0 && (
                  <div className="glass-card p-8 rounded-2xl text-center text-gray-500">
                    No assignment submissions received yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Playlist Area (1 col) */}
          <div className="space-y-6">
            {/* Lectures List Area */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-base">Course Lectures</h3>
                {isInstructor && (
                  <button
                    onClick={() => setShowLectureModal(true)}
                    className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center"
                    title="Add Lecture"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col max-h-[400px] overflow-y-auto divide-y divide-white/5">
                {lectures.map((lec) => {
                  const isSelected = selectedLecture?.id === lec.id;
                  
                  // Progress check for student
                  const isCompleted = progressDetails?.completedLectures?.some(
                    (cl) => cl.lecture.id === lec.id
                  );

                  return (
                    <div
                      key={lec.id}
                      className={`p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-500/5 text-blue-400' : 'hover:bg-white/[0.01]'
                      }`}
                      onClick={() => setSelectedLecture(lec)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <button
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                              : 'bg-slate-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold truncate text-white">{lec.title}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">{lec.duration ? `${Math.round(lec.duration / 60)} Mins` : 'N/A'}</div>
                        </div>
                      </div>

                      {user.role === 'STUDENT' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLectureCompletion(lec.id, isCompleted);
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isCompleted
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      )}
                    </div>
                  );
                })}

                {lectures.length === 0 && (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No lectures published for this course yet.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions / Creation panels for Instructors */}
            {isInstructor && (
              <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
                <h3 className="font-display font-bold text-white text-sm">Course Editor Actions</h3>
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="w-full h-10 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold text-xs flex items-center justify-center gap-2 border border-purple-500/20"
                >
                  <HelpCircle className="w-4 h-4" />
                  Publish Quiz
                </button>
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="w-full h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold text-xs flex items-center justify-center gap-2 border border-indigo-500/20"
                >
                  <FileText className="w-4 h-4" />
                  Publish Assignment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD LECTURE */}
      {showLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass max-w-lg w-full p-8 rounded-3xl shadow-2xl relative border border-white/10">
            <h2 className="font-display font-bold text-2xl text-white mb-4">Add Lecture to Syllabus</h2>
            
            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Lecture Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to JVM Architecture"
                  value={lecTitle}
                  onChange={(e) => setLecTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Description</label>
                <textarea
                  rows="3"
                  placeholder="Write a brief overview of lecture objectives..."
                  value={lecDesc}
                  onChange={(e) => setLecDesc(e.target.value)}
                  className="w-full p-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Duration (Seconds)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={lecDuration}
                    onChange={(e) => setLecDuration(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Syllabus Order</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={lecOrder}
                    onChange={(e) => setLecOrder(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Upload Video File (.mp4)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setLecVideoFile(e.target.files[0])}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowLectureModal(false)}
                  className="px-4 h-11 rounded-xl hover:bg-white/5 text-gray-300 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 h-11 rounded-xl gradient-btn text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  Upload Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE QUIZ WITH MCQs */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass max-w-2xl w-full p-8 rounded-3xl shadow-2xl relative border border-white/10 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-bold text-2xl text-white mb-2">Publish MCQ Quiz</h2>
            
            <form onSubmit={handleCreateQuiz} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Quiz Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Quiz"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Duration (Minutes)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Temp Question List preview */}
              {quizQuestions.length > 0 && (
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Added Questions ({quizQuestions.length})</div>
                  <ol className="list-decimal list-inside text-xs text-gray-300 space-y-1">
                    {quizQuestions.map((q, idx) => (
                      <li key={idx} className="truncate">
                        {q.text} <span className="text-purple-400 font-bold ml-1">({q.correctAnswer})</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Question Editor Area */}
              <div className="p-4 rounded-2xl border border-dashed border-white/10 bg-slate-900/10 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question Builder</div>
                <div>
                  <input
                    type="text"
                    placeholder="Write question text..."
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full h-10 px-4 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Option A"
                    value={qOptA}
                    onChange={(e) => setQOptA(e.target.value)}
                    className="w-full h-9 px-4 rounded-xl glass-input text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={qOptB}
                    onChange={(e) => setQOptB(e.target.value)}
                    className="w-full h-9 px-4 rounded-xl glass-input text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={qOptC}
                    onChange={(e) => setQOptC(e.target.value)}
                    className="w-full h-9 px-4 rounded-xl glass-input text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={qOptD}
                    onChange={(e) => setQOptD(e.target.value)}
                    className="w-full h-9 px-4 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-400 font-semibold">Correct Option:</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                    className="h-8 rounded-lg bg-slate-900 border border-white/10 text-xs px-2"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={handleAddQuestionToQuiz}
                    className="h-8 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-xs font-semibold px-4 border border-purple-500/20 ml-auto"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 h-11 rounded-xl hover:bg-white/5 text-gray-300 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quizQuestions.length === 0}
                  className="px-5 h-11 rounded-xl gradient-btn text-white font-semibold text-xs disabled:opacity-50"
                >
                  Publish Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass max-w-lg w-full p-8 rounded-3xl shadow-2xl relative border border-white/10">
            <h2 className="font-display font-bold text-2xl text-white mb-4">Publish Assignment task</h2>
            
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Report 1: JVM"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Instructions / Syllabus</label>
                <textarea
                  rows="4"
                  placeholder="Describe the assignment expectations and Grading guidelines..."
                  value={assignDesc}
                  onChange={(e) => setAssignDesc(e.target.value)}
                  className="w-full p-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Due Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 h-11 rounded-xl hover:bg-white/5 text-gray-300 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 h-11 rounded-xl gradient-btn text-white font-semibold text-xs"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
