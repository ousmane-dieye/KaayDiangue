import { useEffect, useState, FormEvent } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Plus, BookOpen, Video, FileQuestion, Trash2, Edit, Save, X, ChevronRight, ChevronDown, Presentation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isAddingQuiz, setIsAddingQuiz] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<number | null>(null);

  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: '', thumbnail: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', video_url: '', summary: '' });
  const [quizForm, setQuizForm] = useState({ 
    question: '', 
    options: ['', '', '', ''], 
    correct_option: 0,
    type: 'multiple_choice' 
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const allCourses = await apiRequest('/courses');
      const myCourses = user?.role === 'admin' 
        ? allCourses 
        : allCourses.filter((c: any) => c.created_by === user?.id);
      setCourses(myCourses);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const handleSelectCourse = async (courseId: number) => {
    try {
      const courseDetails = await apiRequest(`/courses/${courseId}`);
      const lessonsWithQuizzes = await Promise.all(courseDetails.lessons.map(async (lesson: any) => {
        const quizzes = await apiRequest(`/quizzes/${lesson.id}`);
        return { ...lesson, quizzes };
      }));
      setSelectedCourse({ ...courseDetails, lessons: lessonsWithQuizzes });
      setIsAddingLesson(false);
      setIsAddingQuiz(null);
      setEditingLesson(null);
      setIsEditingCourse(false);
      setIsCreatingCourse(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingCourse && selectedCourse) {
        await apiRequest(`/courses/${selectedCourse.id}`, {
          method: 'PUT',
          body: JSON.stringify(courseForm)
        });
      } else {
        await apiRequest('/courses', {
          method: 'POST',
          body: JSON.stringify(courseForm)
        });
      }
      setIsCreatingCourse(false);
      setIsEditingCourse(false);
      setCourseForm({ title: '', description: '', category: '', thumbnail: '' });
      fetchCourses();
      if (selectedCourse) handleSelectCourse(selectedCourse.id);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingCourse = () => {
    if (!selectedCourse) return;
    setCourseForm({
      title: selectedCourse.title,
      description: selectedCourse.description || '',
      category: selectedCourse.category || '',
      thumbnail: selectedCourse.thumbnail || ''
    });
    setIsEditingCourse(true);
    setIsCreatingCourse(true);
  };

  const handleAddLesson = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await apiRequest(`/lessons/${editingLesson}`, {
          method: 'PUT',
          body: JSON.stringify(lessonForm)
        });
      } else {
        await apiRequest('/lessons', {
          method: 'POST',
          body: JSON.stringify({ ...lessonForm, course_id: selectedCourse.id })
        });
      }
      setIsAddingLesson(false);
      setEditingLesson(null);
      setLessonForm({ title: '', video_url: '', summary: '' });
      handleSelectCourse(selectedCourse.id);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingLesson = (lesson: any) => {
    setEditingLesson(lesson.id);
    setLessonForm({
      title: lesson.title,
      video_url: lesson.video_url,
      summary: lesson.summary || ''
    });
    setIsAddingLesson(true);
  };

  const handleAddQuiz = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/quizzes', {
        method: 'POST',
        body: JSON.stringify({ ...quizForm, lesson_id: isAddingQuiz })
      });
      setIsAddingQuiz(null);
      setQuizForm({ 
        question: '', 
        options: ['', '', '', ''], 
        correct_option: 0,
        type: 'multiple_choice'
      });
      handleSelectCourse(selectedCourse.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;
    try {
      await apiRequest(`/admin/quizzes/${quizId}`, { method: 'DELETE' });
      handleSelectCourse(selectedCourse.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    try {
      await apiRequest(`/admin/courses/${id}`, { method: 'DELETE' });
      fetchCourses();
      if (selectedCourse?.id === id) setSelectedCourse(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) return;
    try {
      await apiRequest(`/admin/lessons/${id}`, { method: 'DELETE' });
      handleSelectCourse(selectedCourse.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <Presentation className="h-8 w-8 mr-3 text-indigo-600" />
            Espace Enseignant
          </h1>
          <p className="mt-1 text-slate-600 dark:text-gray-400">Gérez vos cours, vidéos et quiz pour vos étudiants.</p>
        </div>
        <button
          onClick={() => { setIsCreatingCourse(true); setIsEditingCourse(false); setSelectedCourse(null); setCourseForm({ title: '', description: '', category: '', thumbnail: '' }); }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Nouveau Cours
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Course List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center px-2">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-500" /> Mes Cours
          </h2>
          <div className="glass rounded-3xl overflow-hidden shadow-xl border border-white/20 dark:border-gray-800/30">
            <ul className="divide-y divide-slate-100 dark:divide-gray-800">
              {courses.length === 0 ? (
                <li className="px-6 py-12 text-center text-slate-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Aucun cours pour le moment.</p>
                </li>
              ) : (
                courses.map((course) => (
                  <li 
                    key={course.id} 
                    className={`px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all ${selectedCourse?.id === course.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' : ''}`}
                    onClick={() => handleSelectCourse(course.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate pr-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{course.title}</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">{course.category}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isCreatingCourse ? (
              <motion.div 
                key="create-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-800/30"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isEditingCourse ? 'Modifier le Cours' : 'Créer un Nouveau Cours'}
                  </h2>
                  <button onClick={() => { setIsCreatingCourse(false); setIsEditingCourse(false); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateCourse} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Titre du Cours</label>
                    <input
                      type="text"
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                      className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-indigo-500"
                      placeholder="Ex: Introduction à React"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Description / Résumé</label>
                    <textarea
                      required
                      rows={4}
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                      className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-indigo-500"
                      placeholder="Décrivez brièvement ce que les étudiants vont apprendre..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Catégorie</label>
                      <input
                        type="text"
                        required
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                        className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-indigo-500"
                        placeholder="Ex: Développement Web"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">URL Miniature (Optionnel)</label>
                      <input
                        type="text"
                        value={courseForm.thumbnail}
                        onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})}
                        className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-indigo-500"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="btn-primary px-8 py-3">
                      {isEditingCourse ? 'Enregistrer les Modifications' : 'Créer le Cours'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : selectedCourse ? (
              <motion.div 
                key="course-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-800/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedCourse.title}</h2>
                        <button 
                          onClick={startEditingCourse}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                          title="Modifier les infos du cours"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">{selectedCourse.description}</p>
                    </div>
                    <button
                      onClick={() => { setIsAddingLesson(true); setEditingLesson(null); setLessonForm({ title: '', video_url: '', summary: '' }); }}
                      className="btn-primary flex items-center whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Ajouter une Leçon
                    </button>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                      <Video className="h-5 w-5 mr-2 text-indigo-500" />
                      Contenu du Cours
                    </h3>
                    <div className="space-y-4">
                      {selectedCourse.lessons.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-gray-800">
                          <p className="text-sm text-slate-500 dark:text-gray-400 italic">Aucune leçon dans ce cours pour le moment.</p>
                        </div>
                      ) : (
                        selectedCourse.lessons.map((lesson: any) => (
                          <div key={lesson.id} className="bg-white/50 dark:bg-gray-900/30 rounded-3xl border border-slate-100 dark:border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-gray-800">
                              <div className="flex items-center">
                                <Video className="h-5 w-5 text-indigo-500 mr-3" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{lesson.title}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => startEditingLesson(lesson)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                  title="Modifier la leçon"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => setIsAddingQuiz(isAddingQuiz === lesson.id ? null : lesson.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${isAddingQuiz === lesson.id ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'}`}
                                >
                                  {isAddingQuiz === lesson.id ? 'Annuler Quiz' : '+ Quiz'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="p-6">
                              <div className="mb-6">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Résumé de la vidéo</h4>
                                <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                                  {lesson.summary || "Aucun résumé fourni."}
                                </p>
                              </div>

                              {lesson.quizzes && lesson.quizzes.length > 0 && (
                                <div className="mt-6">
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Questions du Quiz ({lesson.quizzes.length})</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {lesson.quizzes.map((q: any) => (
                                      <div key={q.id} className="flex items-center justify-between bg-slate-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-slate-100 dark:border-gray-700">
                                        <span className="text-xs text-slate-700 dark:text-gray-300 truncate mr-2">{q.question}</span>
                                        <button onClick={() => handleDeleteQuiz(q.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {isAddingQuiz === lesson.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-6 border-t border-slate-100 dark:border-gray-800 bg-indigo-50/30 dark:bg-indigo-900/10"
                              >
                                <h4 className="text-sm font-bold mb-6 text-indigo-900 dark:text-indigo-300 flex items-center">
                                  <FileQuestion className="h-4 w-4 mr-2" />
                                  Ajouter une Question au Quiz
                                </h4>
                                <form onSubmit={handleAddQuiz} className="space-y-6">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type de Question</label>
                                      <select
                                        value={quizForm.type}
                                        onChange={(e) => {
                                          const type = e.target.value;
                                          setQuizForm({
                                            ...quizForm,
                                            type,
                                            options: type === 'true_false' ? ['Vrai', 'Faux', '', ''] : ['', '', '', ''],
                                            correct_option: 0
                                          });
                                        }}
                                        className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-indigo-500"
                                      >
                                        <option value="multiple_choice">Choix Multiple</option>
                                        <option value="true_false">Vrai / Faux</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question</label>
                                    <input
                                      type="text"
                                      required
                                      value={quizForm.question}
                                      onChange={(e) => setQuizForm({...quizForm, question: e.target.value})}
                                      className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-indigo-500"
                                      placeholder="Quelle est la capitale de la France ?"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {quizForm.type === 'multiple_choice' ? (
                                      quizForm.options.map((opt, idx) => (
                                        <div key={idx} className="relative">
                                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Option {idx + 1}</label>
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="radio"
                                              name="correct"
                                              checked={quizForm.correct_option === idx}
                                              onChange={() => setQuizForm({...quizForm, correct_option: idx})}
                                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                            />
                                            <input
                                              type="text"
                                              required
                                              value={opt}
                                              onChange={(e) => {
                                                const newOpts = [...quizForm.options];
                                                newOpts[idx] = e.target.value;
                                                setQuizForm({...quizForm, options: newOpts});
                                              }}
                                              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-indigo-500"
                                              placeholder={`Option ${idx + 1}`}
                                            />
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setQuizForm({...quizForm, correct_option: 0})}
                                          className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${quizForm.correct_option === 0 ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-gray-800 text-slate-500'}`}
                                        >
                                          Vrai
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setQuizForm({...quizForm, correct_option: 1})}
                                          className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${quizForm.correct_option === 1 ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-gray-800 text-slate-500'}`}
                                        >
                                          Faux
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex justify-end">
                                    <button type="submit" className="btn-primary px-6 py-2 text-sm">Enregistrer la Question</button>
                                  </div>
                                </form>
                              </motion.div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {isAddingLesson && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-800/30"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {editingLesson ? 'Modifier la Leçon' : 'Ajouter une Nouvelle Leçon'}
                      </h2>
                      <button onClick={() => { setIsAddingLesson(false); setEditingLesson(null); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <form onSubmit={handleAddLesson} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Titre de la Leçon</label>
                        <input
                          type="text"
                          required
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                          className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-indigo-500"
                          placeholder="Ex: Les bases de JSX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">URL de la Vidéo (YouTube/Vimeo)</label>
                        <input
                          type="text"
                          required
                          value={lessonForm.video_url}
                          onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})}
                          className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-indigo-500"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Résumé / Notes Clés</label>
                        <textarea
                          rows={6}
                          required
                          placeholder="Expliquez ici les points importants abordés dans cette vidéo..."
                          value={lessonForm.summary}
                          onChange={(e) => setLessonForm({...lessonForm, summary: e.target.value})}
                          className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex justify-end pt-4">
                        <button type="submit" className="btn-primary px-8 py-3">
                          {editingLesson ? 'Enregistrer les Modifications' : 'Ajouter la Leçon'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-xl border border-white/20 dark:border-gray-800/30"
              >
                <div className="h-20 w-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
                  <BookOpen className="h-10 w-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sélectionnez un cours pour le gérer</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 max-w-xs">Ou créez un nouveau cours pour commencer à partager vos connaissances.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
