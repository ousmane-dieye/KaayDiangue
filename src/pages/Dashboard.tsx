import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { Trophy, Medal, Star } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      apiRequest('/my-badges').then(setBadges);
      apiRequest('/leaderboard').then(setLeaderboard);
    }
  }, [user]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back, {user.username}!</p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Points</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{user.points}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg col-span-1 sm:col-span-2 transition-colors duration-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">My Badges</h3>
            <div className="mt-5 flex space-x-4 overflow-x-auto">
              {badges.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No badges yet. Complete lessons to earn them!</p>
              ) : (
                badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[100px]">
                    <span className="text-4xl">{badge.icon}</span>
                    <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{badge.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(badge.awarded_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            Leaderboard
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((entry, index) => (
              <li key={entry.username} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <p className="ml-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{entry.username}</p>
                </div>
                <div className="flex items-center">
                  <Medal className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{entry.points} pts</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
