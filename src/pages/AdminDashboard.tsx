import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { Users, BookOpen, Trash2, Edit, Save, X, Video, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', video_url: '', summary: '' });

  useEffect(() => {
    apiRequest('/admin/users').then(setUsers);
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
      
      const updatedCourse = await apiRequest(`/courses/${selectedCourse.id}`);
      setSelectedCourse(updatedCourse);
      setEditingLesson(null);
    } catch (err) {
      console.error('Failed to save lesson', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    try {
      await apiRequest(`/admin/courses/${courseId}`, { method: 'DELETE' });
      setCourses(courses.filter(c => c.id !== courseId));
      if (selectedCourse?.id === courseId) setSelectedCourse(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) return;
    try {
      await apiRequest(`/admin/lessons/${lessonId}`, { method: 'DELETE' });
      const updatedCourse = await apiRequest(`/courses/${selectedCourse.id}`);
      setSelectedCourse(updatedCourse);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCertification = async (courseId: number) => {
    try {
      await apiRequest(`/admin/courses/${courseId}/certify`, { 
        method: 'POST',
        body: JSON.stringify({ is_certified: courses.find(c => c.id === courseId).is_certified === 1 ? 0 : 1 })
      });
      setCourses(courses.map(c => c.id === courseId ? { ...c, is_certified: c.is_certified === 1 ? 0 : 1 } : c));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse({ ...selectedCourse, is_certified: selectedCourse.is_certified === 1 ? 0 : 1 });
      }
    } catch (err) {
      console.error('Failed to toggle certification', err);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <ShieldCheck className="h-8 w-8 mr-3 text-indigo-600" />
            Administration
          </h1>
          <p className="mt-2 text-slate-600 dark:text-gray-400">Gérez les utilisateurs, les cours et les certifications.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Users Management */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-3xl overflow-hidden shadow-xl border border-white/20 dark:border-gray-800/30"
        >
          <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              Utilisateurs
            </h3>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
              {users.length} au total
            </span>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <ul className="divide-y divide-slate-100 dark:divide-gray-800">
              {users.map((user) => (
                <li key={user.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">{user.points} pts</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select 
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className="text-xs font-bold rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 focus:ring-indigo-500 py-1.5"
                      >
                        <option value="student">Étudiant</option>
                        <option value="teacher">Enseignant</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Courses Management */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-3xl overflow-hidden shadow-xl border border-white/20 dark:border-gray-800/30"
        >
          <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
              Cours
            </h3>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
              {courses.length} au total
            </span>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <ul className="divide-y divide-slate-100 dark:divide-gray-800">
              {courses.map((course) => (
                <li key={course.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center">
                          {course.title}
                          {course.is_certified === 1 && <CheckCircle className="h-3 w-3 ml-2 text-emerald-500" />}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 truncate">Par {course.author_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => toggleCertification(course.id)}
                        className={`p-2 rounded-xl transition-all ${course.is_certified === 1 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                        title={course.is_certified === 1 ? "Retirer la certification" : "Certifier ce cours"}
                      >
                        <Award className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleSelectCourse(course.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCourse?.id === course.id ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                      >
                        Leçons
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {selectedCourse && selectedCourse.id === course.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pl-4 border-l-2 border-indigo-100 dark:border-gray-700 space-y-3"
                    >
                      {selectedCourse.lessons.map((lesson: any) => (
                        <div key={lesson.id} className="bg-white/50 dark:bg-gray-900/30 p-4 rounded-2xl border border-slate-100 dark:border-gray-800">
                          {editingLesson === lesson.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Titre</label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                  className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">URL Vidéo</label>
                                <input
                                  type="text"
                                  value={editForm.video_url}
                                  onChange={(e) => setEditForm({...editForm, video_url: e.target.value})}
                                  className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-indigo-500"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={() => saveLesson(lesson.id)}
                                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 overflow-hidden">
                                <Video className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <div className="truncate">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{lesson.title}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{lesson.video_url}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => startEditing(lesson)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
