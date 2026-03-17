import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, BookOpen, Zap, ChevronLeft, ChevronRight, PlayCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const [videoWatched, setVideoWatched] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Reset state when lesson ID changes
    setLesson(null);
    setQuizzes([]);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizCompleted(false);
    setScore(0);
    setShowResult(false);
    setVideoWatched(false);
    setVideoError(false);

    apiRequest(`/lessons/${id}`).then(setLesson);
    apiRequest(`/quizzes/${id}`).then(setQuizzes);
  }, [id]);

  const handleVideoEnded = async () => {
    if (!videoWatched) {
      setVideoWatched(true);
      try {
        const res = await apiRequest('/progress', {
          method: 'POST',
          body: JSON.stringify({
            lessonId: id,
            videoWatched: true
          })
        });
        if (res.pointsAwarded > 0) {
          // Optional: Show toast or notification
          console.log(`Earned ${res.pointsAwarded} points!`);
          refreshUser();
        }
      } catch (err) {
        console.error('Failed to update progress', err);
      }
    }
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;

    const currentQuiz = quizzes[currentQuizIndex];
    // Wait, correct_option is an index. So just compare indices.
    const isAnswerCorrect = selectedOption === currentQuiz.correct_option;
    
    const newScore = isAnswerCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      setShowResult(true);
      submitProgress(newScore);
    }
  };

  const submitProgress = async (finalScore: number) => {
    const percentage = Math.round((finalScore / quizzes.length) * 100);
    try {
      await apiRequest('/progress', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: id,
          quizCompleted: true,
          score: percentage
        })
      });
      refreshUser();
    } catch (err) {
      console.error('Failed to submit progress', err);
    }
  };

  if (!lesson) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getYoutubeEmbedUrl(lesson.video_url);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <Link to={`/courses/${lesson.course_id}`} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour au cours
      </Link>

      {/* Video Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-800/30"
      >
        <div className="aspect-w-16 aspect-h-9 bg-black relative pt-[56.25%] group">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-slate-900 text-white p-12 text-center">
              <div className="max-w-md">
                <PlayCircle className="h-20 w-20 mx-auto mb-6 text-slate-700" />
                <p className="mb-8 text-xl font-bold text-slate-400">
                  {!lesson.video_url ? "Aucune vidéo disponible pour cette leçon." : "Impossible de lire la vidéo directement."}
                </p>
                {lesson.video_url && (
                  <a 
                    href={lesson.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center px-8 py-3"
                  >
                    Regarder sur YouTube
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="px-10 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{lesson.title}</h1>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mt-2">Module de formation</p>
          </div>
          {!videoWatched && (
            <button
              onClick={handleVideoEnded}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center px-8 py-3 shadow-emerald-500/20"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Marquer comme vu
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Key Concepts / Summary Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="glass p-8 rounded-[2rem] shadow-xl border border-indigo-100 dark:border-indigo-900/30 h-full">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-4">
                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Résumé</h3>
            </div>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm italic">
              {lesson.summary || "Aucun résumé disponible pour cette leçon."}
            </div>
          </div>
        </motion.div>

        {/* Quiz Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          {quizzes.length > 0 ? (
            <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-800/30 h-full">
              <div className="bg-white/50 dark:bg-gray-900/30 px-10 py-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">Quiz Interactif</h3>
                </div>
                {!showResult && (
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                    Question {currentQuizIndex + 1} / {quizzes.length}
                  </span>
                )}
              </div>
              
              <div className="p-10">
                <AnimatePresence mode="wait">
                  {!showResult ? (
                    <motion.div 
                      key={currentQuizIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{quizzes[currentQuizIndex].question}</h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {quizzes[currentQuizIndex].options.map((option: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            className={`group w-full text-left px-8 py-5 rounded-2xl border-2 transition-all duration-300 flex items-center ${
                              selectedOption === index
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-500/10'
                                : 'border-slate-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-gray-800/50 text-slate-700 dark:text-gray-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl border-2 mr-6 flex items-center justify-center transition-all duration-300 ${
                              selectedOption === index 
                                ? 'border-indigo-600 bg-indigo-600 text-white scale-110' 
                                : 'border-slate-200 dark:border-gray-700 group-hover:border-indigo-400'
                            }`}>
                              {selectedOption === index ? <CheckCircle size={16} /> : <span className="text-[10px] font-black">{String.fromCharCode(65 + index)}</span>}
                            </div>
                            <span className="text-lg font-medium">{option}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={handleQuizSubmit}
                          disabled={selectedOption === null}
                          className="btn-primary w-full sm:w-auto px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {currentQuizIndex < quizzes.length - 1 ? (
                            <>Suivant <ChevronRight className="ml-2 h-5 w-5" /></>
                          ) : 'Terminer le Quiz'}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-[2rem] bg-emerald-100 dark:bg-emerald-900/30 mb-8 rotate-12">
                        <Award className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Félicitations !</h3>
                      <p className="text-slate-500 dark:text-gray-400 mb-10 text-lg">Vous avez brillamment terminé ce module.</p>
                      
                      <div className="bg-white/50 dark:bg-gray-900/50 rounded-3xl p-8 max-w-xs mx-auto mb-10 border border-slate-100 dark:border-gray-800 shadow-xl">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Votre Score Final</div>
                        <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400">{score} <span className="text-2xl text-slate-300 dark:text-gray-700">/ {quizzes.length}</span></div>
                      </div>

                      <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary px-12 py-4"
                      >
                        Retour au Dashboard
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="glass rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center shadow-xl border border-white/20 dark:border-gray-800/30 h-full">
              <Zap className="h-16 w-16 text-slate-200 dark:text-gray-700 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pas de quiz pour cette leçon</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 max-w-xs">Passez à la leçon suivante ou revenez au cours.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
