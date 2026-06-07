import { useState, useEffect } from 'react';
import API from '../services/api';
import { Award, Timer, CheckCircle, HelpCircle, Check, X, AlertCircle } from 'lucide-react';

const QuizCard = ({ quiz, userSubmission, onQuizSubmitted }) => {
  const [isAttempting, setIsAttempting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // maps questionId -> selectedOption
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [result, setResult] = useState(userSubmission);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize result with prop when it loads or changes
  useEffect(() => {
    if (userSubmission) {
      setResult(userSubmission);
    }
  }, [userSubmission]);

  // Initialize timer
  useEffect(() => {
    let timerId;
    if (isAttempting && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            handleSubmitQuiz(true); // Auto-submit when time is up!
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isAttempting, timeLeft]);

  const startQuiz = () => {
    setIsAttempting(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setError(null);
    // duration is in minutes, convert to seconds
    setTimeLeft((quiz.duration || 10) * 60);
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleSubmitQuiz = async (auto = false) => {
    setLoading(true);
    setError(null);

    const payload = {
      quizId: quiz.id,
      answers: answers,
    };

    try {
      const res = await API.post('/quizzes/submit', payload);
      setResult(res.data);
      setIsAttempting(false);
      setLoading(false);
      if (onQuizSubmitted) {
        onQuizSubmitted(res.data);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit quiz.');
      if (auto) {
        setIsAttempting(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      {!isAttempting && !result ? (
        // Start Quiz View
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-base leading-tight">{quiz.title}</h4>
              <p className="text-xs text-gray-400">Quiz • {quiz.questions?.length || 0} Questions</p>
            </div>
          </div>

          <div className="flex gap-4 mb-5 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-blue-400" />
              <span>{quiz.duration || 10} Mins</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>{quiz.totalMarks || 10} Marks</span>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full h-10 rounded-xl gradient-btn text-white text-sm font-semibold mt-auto"
          >
            Start Quiz
          </button>
        </div>
      ) : isAttempting ? (
        // Attempting Quiz View
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
            <div className="text-xs font-semibold text-gray-400">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold font-mono">
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-white leading-relaxed mb-4">
              {quiz.questions[currentQuestionIndex].text}
            </h5>

            {/* Options list */}
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optionKey = `option${opt}`;
                const optionText = quiz.questions[currentQuestionIndex][optionKey];
                const isSelected = answers[quiz.questions[currentQuestionIndex].id] === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(quiz.questions[currentQuestionIndex].id, opt)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all duration-150 flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-white font-medium shadow-md shadow-blue-500/5'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <span>
                      <strong className="mr-2 text-gray-300 font-bold">{opt}.</strong>
                      {optionText}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between border-t border-white/5 pt-4">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 h-10 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 disabled:opacity-50 text-xs font-semibold"
            >
              Previous
            </button>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={loading}
                className="px-5 h-10 rounded-xl gradient-btn text-white text-xs font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      ) : (
        // Results View
        <div className="flex flex-col items-center py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
            <CheckCircle className="w-6 h-6" />
          </div>
          
          <h4 className="font-display font-bold text-white text-lg mb-1">{quiz.title} Completed!</h4>
          <p className="text-xs text-gray-400 mb-4 font-semibold text-emerald-400 uppercase tracking-wider">Attempted Successfully</p>

          <div className="glass px-6 py-4 rounded-2xl border border-white/5 flex gap-6 mb-2">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Score</div>
              <div className="text-lg font-bold text-white">
                {result.score} <span className="text-xs text-gray-500">/ {quiz.totalMarks}</span>
              </div>
            </div>
            <div className="w-px bg-white/5"></div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Percentage</div>
              <div className="text-lg font-bold text-emerald-400">
                {result.percentage != null
                  ? Math.round(result.percentage)
                  : Math.round(((result.score || 0) / (quiz.totalMarks || 1)) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-3 left-3 right-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-[10px]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
