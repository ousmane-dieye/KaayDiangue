import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Eye, Award, CheckCircle } from 'lucide-react';
import StarRating from '../components/StarRating';

export default function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    apiRequest('/courses').then(setCourses);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Découvrez nos cours
          </h1>
          <p className="mt-3 text-xl text-slate-600 dark:text-slate-400">
            Apprenez de nouvelles compétences avec nos micro-leçons.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                src={course.thumbnail} 
                alt={course.title} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-900/90 text-indigo-600 dark:text-indigo-400 backdrop-blur-sm shadow-sm">
                  {course.category}
                </span>
              </div>
              {course.is_certified === 1 && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg animate-pulse">
                    <CheckCircle size={14} />
                    <span>CERTIFIÉ</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={course.avg_rating || 0} size={16} readonly />
                  <span className="text-xs text-slate-500 dark:text-gray-500">
                    ({course.rating_count || 0} avis)
                  </span>
                </div>
                <Link to={`/courses/${course.id}`} className="block group-hover:text-indigo-600 transition-colors">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {course.description}
                  </p>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <Eye size={16} className="mr-1.5" />
                    {course.views || 0}
                  </div>
                  <div className="flex items-center">
                    <Award size={16} className="mr-1.5" />
                    {course.author_name}
                  </div>
                </div>
                <Link
                  to={`/courses/${course.id}`}
                  className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                  Voir plus
                  <CheckCircle size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
