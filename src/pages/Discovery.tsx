import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Eye, Award, CheckCircle, RefreshCw } from 'lucide-react';
import StarRating from '../components/StarRating';

export default function Discovery() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchRandomCourses = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newCourses = await apiRequest('/courses/random?limit=6');
      if (newCourses.length === 0) {
        setHasMore(false);
      } else {
        // Filter out duplicates just in case
        setCourses(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNew = newCourses.filter((c: any) => !existingIds.has(c.id));
          return [...prev, ...uniqueNew];
        });
      }
    } catch (err) {
      console.error('Failed to fetch random courses', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchRandomCourses();
  }, []);

  const lastCourseElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchRandomCourses();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchRandomCourses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl mb-4">
          Découverte Infinie
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Laissez le hasard vous guider vers votre prochaine compétence. Scrollez pour découvrir de nouveaux horizons.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => {
          const isLastElement = courses.length === index + 1;
          return (
            <div 
              key={`${course.id}-${index}`}
              ref={isLastElement ? lastCourseElementRef : null}
              className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col border border-slate-100 dark:border-gray-700 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img 
                  className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                  src={course.thumbnail} 
                  alt={course.title} 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <Link 
                    to={`/courses/${course.id}`}
                    className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    Découvrir maintenant
                  </Link>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg">
                    {course.category}
                  </span>
                </div>
                {course.is_certified === 1 && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="text-emerald-500 fill-white" size={24} />
                  </div>
                )}
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <StarRating rating={course.avg_rating || 0} size={14} readonly />
                    <span className="text-xs font-medium text-slate-500 dark:text-gray-400">{course.views} vues</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm leading-relaxed">
                    {course.description}
                  </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-400">
                    <Award size={16} className="mr-2 text-indigo-500" />
                    {course.author_name}
                  </div>
                  <Link to={`/courses/${course.id}`} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {!hasMore && (
        <div className="text-center py-12 text-slate-500 dark:text-gray-400 italic">
          Vous avez exploré tous nos trésors !
        </div>
      )}
    </div>
  );
}
