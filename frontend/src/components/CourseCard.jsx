import { Link } from 'react-router-dom';
import { BookOpen, User, DollarSign, Bookmark } from 'lucide-react';

const CourseCard = ({ course, progress, isEnrolled, onEnroll }) => {
  const defaultThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group h-full">
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-800">
        <img
          src={course.thumbnail || defaultThumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/5 text-gray-300">
          {course.category}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-400 text-xs line-clamp-2 mb-4">
          {course.description || 'No description provided for this course.'}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 mt-auto">
          <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <span>{course.instructor?.name || 'Instructor'}</span>
        </div>

        {/* Enrollments & Progress */}
        {isEnrolled ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-400">
              <span>Learning Progress</span>
              <span className="text-blue-400">{Math.round(progress || 0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress || 0}%` }}
              ></div>
            </div>
            <Link
              to={`/courses/${course.id}`}
              className="w-full h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold flex items-center justify-center text-sm transition-all duration-200 mt-2"
            >
              Continue Learning
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
            <div className="flex items-center text-white font-bold">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{course.price && course.price > 0 ? course.price.toFixed(2) : 'Free'}</span>
            </div>
            
            {onEnroll ? (
              <button
                onClick={() => onEnroll(course.id)}
                className="px-4 h-9 rounded-xl gradient-btn text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Enroll
              </button>
            ) : (
              <Link
                to={`/courses/${course.id}`}
                className="px-4 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center"
              >
                View Details
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
