import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

export default function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    apiRequest('/courses').then(setCourses);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white mb-8">Courses</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg flex flex-col transition-colors duration-200">
            <div className="flex-shrink-0">
              <img className="h-48 w-full object-cover" src={course.thumbnail} alt={course.title} />
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {course.category}
                </p>
                <Link to={`/courses/${course.id}`} className="block mt-2">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{course.title}</p>
                  <p className="mt-3 text-base text-gray-500 dark:text-gray-400">{course.description}</p>
                </Link>
              </div>
              <div className="mt-6 flex items-center">
                <Link
                  to={`/courses/${course.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
