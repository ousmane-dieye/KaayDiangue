import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { Users, BookOpen, Trash2, Edit, Save, X, Video } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', video_url: '', summary: '' });

  useEffect(() => {
    apiRequest('/leaderboard').then(setUsers);
    apiRequest('/courses').then(setCourses);
  }, []);

  const handleSelectCourse = async (courseId: number) => {
    try {
      const courseDetails = await apiRequest(`/courses/${courseId}`);
      setSelectedCourse(courseDetails);
      setEditingLesson(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (lesson: any) => {
    setEditingLesson(lesson.id);
    setEditForm({
      title: lesson.title,
      video_url: lesson.video_url,
      summary: lesson.summary || ''
    });
  };

  const cancelEditing = () => {
    setEditingLesson(null);
    setEditForm({ title: '', video_url: '', summary: '' });
  };

  const saveLesson = async (lessonId: number) => {
    try {
      await apiRequest(`/lessons/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      
      // Refresh course details
      const updatedCourse = await apiRequest(`/courses/${selectedCourse.id}`);
      setSelectedCourse(updatedCourse);
      setEditingLesson(null);
    } catch (err) {
      console.error('Failed to save lesson', err);
      alert('Failed to save changes');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users Management */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200 h-fit">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Users
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <li key={user.username} className="px-4 py-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{user.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Courses Management */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Courses
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((course) => (
                <li key={course.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</span>
                    <button 
                      onClick={() => handleSelectCourse(course.id)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                    >
                      Manage Lessons
                    </button>
                  </div>
                  
                  {selectedCourse && selectedCourse.id === course.id && (
                    <div className="mt-4 pl-4 border-l-2 border-indigo-100 dark:border-gray-700">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lessons</h4>
                      <ul className="space-y-3">
                        {selectedCourse.lessons.map((lesson: any) => (
                          <li key={lesson.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            {editingLesson === lesson.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Title</label>
                                  <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white px-3 py-2"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Video URL</label>
                                  <input
                                    type="text"
                                    value={editForm.video_url}
                                    onChange={(e) => setEditForm({...editForm, video_url: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white px-3 py-2"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={cancelEditing}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                  >
                                    <X className="h-3 w-3 mr-1" /> Cancel
                                  </button>
                                  <button
                                    onClick={() => saveLesson(lesson.id)}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <Save className="h-3 w-3 mr-1" /> Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 overflow-hidden">
                                  <Video className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <div className="truncate">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lesson.video_url}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => startEditing(lesson)}
                                  className="ml-2 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
