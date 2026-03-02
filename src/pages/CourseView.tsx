import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Play, CheckCircle, Video, FileQuestion, Circle } from 'lucide-react';

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest(`/courses/${id}`)
      .then(setCourse)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600">Error loading course</h3>
        <p className="mt-2 text-gray-500">{error}</p>
        <Link to="/courses" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
          Back to Courses
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate progress
  const totalLessons = course.lessons?.length || 0;
  const completedLessons = course.lessons?.filter((l: any) => l.completed)?.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Course Header & Progress */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">{course.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
            </div>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {course.category}
            </span>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              <span>Course Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Curriculum</h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson: any) => (
              <li key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Link to={`/lessons/${lesson.id}`} className="block px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0 mr-4">
                        {lesson.completed ? (
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Play className="h-5 w-5 text-gray-500 dark:text-gray-400 ml-1" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{lesson.title}</p>
                        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                          <span className="flex items-center">
                            {lesson.video_watched ? (
                              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1" />
                            ) : (
                              <Video className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
                            )}
                            Video
                          </span>
                          <span className="flex items-center">
                            {lesson.quiz_completed ? (
                              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1" />
                            ) : (
                              <FileQuestion className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
                            )}
                            Quiz
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lesson.completed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {lesson.completed ? 'Completed' : 'Start'}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 italic">
              No lessons available for this course yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
