import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, BookOpen, Zap } from 'lucide-react';
import ReactPlayer from 'react-player';

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

  const handleVideoError = () => {
    console.error('Video playback error');
    setVideoError(true);
  };

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

  if (!lesson) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Video Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg overflow-hidden rounded-2xl transition-colors duration-200">
        <div className="aspect-w-16 aspect-h-9 bg-black relative pt-[56.25%]">
          {videoError ? (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 text-white p-6 text-center">
              <div>
                <p className="mb-4 text-lg font-medium">Unable to play video directly.</p>
                <a 
                  href={lesson.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          ) : (
            <ReactPlayer
              url={lesson.video_url}
              className="absolute top-0 left-0"
              width="100%"
              height="100%"
              controls
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            />
          )}
        </div>
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
        </div>
      </div>

      {/* Key Concepts / Summary Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm transition-colors duration-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">Résumé & Notions Clés</h3>
            <div className="mt-2 text-indigo-800 dark:text-indigo-200 leading-relaxed">
              {lesson.summary}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Section */}
      {quizzes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-100 dark:border-gray-600 flex items-center">
            <Zap className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Interactif</h3>
          </div>
          
          <div className="p-6">
            {!showResult ? (
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <span>Question {currentQuizIndex + 1} sur {quizzes.length}</span>
                  <span>Score: {score}</span>
                </div>
                
                <h4 className="text-xl font-medium text-gray-900 dark:text-white">{quizzes[currentQuizIndex].question}</h4>
                
                <div className="space-y-3">
                  {quizzes[currentQuizIndex].options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center ${
                        selectedOption === index
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm'
                          : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                        selectedOption === index ? 'border-indigo-600 dark:border-indigo-400' : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {selectedOption === index && <div className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                      </div>
                      {option}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedOption === null}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {currentQuizIndex < quizzes.length - 1 ? 'Question Suivante' : 'Terminer le Quiz'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Félicitations !</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Vous avez terminé le quiz de ce module.</p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 max-w-sm mx-auto mb-8">
                  <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Votre Score</div>
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{score} / {quizzes.length}</div>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Retour au Tableau de Bord
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
