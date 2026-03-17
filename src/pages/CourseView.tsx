import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Play, CheckCircle, Video, FileQuestion, Eye, Award, Star, ChevronLeft, BookOpen } from 'lucide-react';
import StarRating from '../components/StarRating';
import { motion } from 'motion/react';

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRating, setIsRating] = useState(false);

  const fetchCourse = () => {
    apiRequest(`/courses/${id}`)
      .then(setCourse)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleRate = async (rating: number) => {
    try {
      setIsRating(true);
      await apiRequest(`/courses/${id}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating })
      });
      fetchCourse();
    } catch (err) {
      console.error('Failed to rate', err);
    } finally {
      setIsRating(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-24">
        <h3 className="text-2xl font-bold text-red-600">Erreur lors du chargement du cours</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{error}</p>
        <Link to="/courses" className="mt-8 btn-primary inline-flex items-center">
          <ChevronLeft className="mr-2 h-5 w-5" /> Retour aux Cours
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalLessons = course.lessons?.length || 0;
  const completedLessons = course.lessons?.filter((l: any) => l.completed)?.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Course Header & Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-800/30"
      >
        <div className="relative h-80 sm:h-96 w-full overflow-hidden">
          <img 
            src={course.thumbnail || `https://picsum.photos/seed/${course.id}/1200/600`} 
            alt={course.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 sm:p-12">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-[0.2em]">
                {course.category}
              </span>
              {course.is_certified === 1 && (
                <span className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-[0.2em] flex items-center">
                  <CheckCircle size={12} className="mr-1.5" />
                  Certifié
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-medium">
              <div className="flex items-center">
                <Eye size={18} className="mr-2 text-indigo-400" />
                {course.views} vues
              </div>
              <div className="flex items-center">
                <Award size={18} className="mr-2 text-indigo-400" />
                Par {course.author_name}
              </div>
              <div className="flex items-center">
                <Star size={18} className="mr-2 text-yellow-400 fill-yellow-400" />
                {course.avg_rating ? course.avg_rating.toFixed(1) : 'Pas encore de note'} ({course.rating_count} avis)
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">À propos de ce cours</h2>
                <p className="text-slate-700 dark:text-slate-400 leading-relaxed text-lg">{course.description}</p>
              </div>

              <div className="bg-white/50 dark:bg-gray-900/30 rounded-3xl p-8 border border-slate-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Votre évaluation</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <StarRating 
                    rating={course.user_rating || 0} 
                    onRate={handleRate} 
                    readonly={isRating}
                    size={32}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {course.user_rating ? 'Merci pour votre note !' : 'Comment évaluez-vous ce cours ?'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] p-8 border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Votre Progression</h3>
                <div className="space-y-6">
                  <div className="flex justify-between text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    <span>Complété</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-4 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
                    ></motion.div>
                  </div>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest">
                    {completedLessons} sur {totalLessons} leçons terminées
                  </p>
                </div>
              </div>
              <Link 
                to={`/lessons/${course.lessons?.[0]?.id}`}
                className="mt-10 block w-full text-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1 active:scale-95"
              >
                {completedLessons > 0 ? 'Continuer' : 'Commencer'}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lessons List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-800/30"
      >
        <div className="px-10 py-8 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Programme du cours</h3>
          <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-gray-800 text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest">
            {totalLessons} leçons
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-gray-800">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson: any, index: number) => (
              <Link 
                key={lesson.id} 
                to={`/lessons/${lesson.id}`} 
                className="group flex items-center p-8 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-all"
              >
                <div className="flex-shrink-0 mr-8">
                  <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                    lesson.completed 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rotate-12' 
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 group-hover:-rotate-12'
                  }`}>
                    {lesson.completed ? <CheckCircle size={32} /> : <span className="text-xl font-black">{index + 1}</span>}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xl font-bold truncate transition-colors ${
                    lesson.completed ? 'text-slate-400 dark:text-gray-500' : 'text-slate-900 dark:text-white group-hover:text-indigo-600'
                  }`}>
                    {lesson.title}
                  </h4>
                  <div className="mt-2 flex items-center space-x-6 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center">
                      <Video size={14} className="mr-2 text-indigo-500" />
                      Vidéo
                    </span>
                    <span className="flex items-center">
                      <FileQuestion size={14} className="mr-2 text-indigo-500" />
                      Quiz
                    </span>
                  </div>
                </div>
                <div className="ml-6">
                  <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    lesson.completed 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30'
                  }`}>
                    {lesson.completed ? 'Terminé' : 'Suivre'}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-20 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-200 dark:text-gray-700" />
              <p className="text-slate-600 dark:text-slate-400 italic">Aucune leçon disponible pour le moment.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
