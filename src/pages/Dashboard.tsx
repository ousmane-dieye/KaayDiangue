import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { Trophy, Medal, Star, Award, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [teacherLeaderboard, setTeacherLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Fetch independently to avoid one failure blocking others
          const badgesRes = await apiRequest('/my-badges').catch(e => { console.error(e); return []; });
          const studentRes = await apiRequest('/leaderboard').catch(e => { console.error(e); return []; });
          const teacherRes = await apiRequest('/teacher-leaderboard').catch(e => { console.error(e); return []; });
          
          setBadges(badgesRes || []);
          setLeaderboard(studentRes || []);
          setTeacherLeaderboard(teacherRes || []);
        } catch (error) {
          console.error('Error in dashboard fetchData:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  if (!user || isLoading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-24"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Tableau de Bord</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">Ravi de vous revoir, <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user.username}</span> !</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center shadow-lg border border-slate-200/50 dark:border-gray-800/30">
            <TrendingUp className="h-5 w-5 text-emerald-500 mr-3" />
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Points Totaux</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{user.points}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Badges Card */}
        <motion.div 
          variants={itemVariants}
          className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-800/30 lg:col-span-3"
        >
          <div className="px-10 py-8 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-indigo-500 mr-3" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mes Badges</h3>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {badges.length} obtenus
            </span>
          </div>
          <div className="p-10">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {badges.length === 0 ? (
                <div className="w-full py-12 text-center bg-slate-50/50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
                  <Award className="h-12 w-12 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium italic">Aucun badge pour le moment. Terminez des leçons pour en gagner !</p>
                </div>
              ) : (
                badges.map((badge) => (
                  <motion.div 
                    key={badge.id} 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="flex flex-col items-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-3xl min-w-[160px] shadow-xl border border-white/50 dark:border-gray-700/30 text-center"
                  >
                    <div className="text-5xl mb-4 drop-shadow-lg">{badge.icon}</div>
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{badge.name}</span>
                    <span className="mt-2 text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{new Date(badge.awarded_at).toLocaleDateString()}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Teacher Leaderboard */}
        <motion.div 
          variants={itemVariants}
          className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-800/30"
        >
          <div className="px-10 py-8 border-b border-slate-100 dark:border-gray-800">
            <div className="flex items-center mb-1">
              <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Classement Enseignants</h3>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Basé sur l'impact et la qualité des cours</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            {teacherLeaderboard.length === 0 ? (
              <div className="px-10 py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400 italic">Aucun enseignant classé pour le moment.</p>
              </div>
            ) : (
              teacherLeaderboard.map((entry, index) => (
                <div key={entry.username} className="px-10 py-6 flex items-center justify-between hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400 scale-110 shadow-lg shadow-yellow-500/20' : 
                      index === 1 ? 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400' :
                      index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' :
                      'bg-slate-50 text-slate-400 dark:bg-gray-900/50'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-6">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{entry.username}</p>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{entry.course_count} cours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">{entry.total_views}</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vues</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        <Star className="h-3 w-3 text-yellow-400 mr-1 fill-yellow-400" />
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {entry.avg_rating ? Number(entry.avg_rating).toFixed(1) : '—'}
                        </span>
                      </div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Note</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Student Leaderboard */}
        <motion.div 
          variants={itemVariants}
          className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-800/30"
        >
          <div className="px-10 py-8 border-b border-slate-100 dark:border-gray-800">
            <div className="flex items-center mb-1">
              <Medal className="h-6 w-6 text-indigo-500 mr-3" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Classement Étudiants</h3>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Basé sur les points d'apprentissage</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            {leaderboard.length === 0 ? (
              <div className="px-10 py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400 italic">Aucun étudiant classé pour le moment.</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={entry.username} className="px-10 py-6 flex items-center justify-between hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                      index === 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 scale-110 shadow-lg shadow-indigo-500/20' : 
                      index === 1 ? 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400' :
                      index === 2 ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300' :
                      'bg-slate-50 text-slate-400 dark:bg-gray-900/50'
                    }`}>
                      {index + 1}
                    </div>
                    <p className="ml-6 text-lg font-bold text-slate-900 dark:text-white">{entry.username}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{entry.points} <span className="text-xs uppercase tracking-widest ml-1">pts</span></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
