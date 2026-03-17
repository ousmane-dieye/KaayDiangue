import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, LogOut, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-200">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold font-display text-slate-900 dark:text-white">Kaay Diague</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/courses" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                Courses
              </Link>
              <Link to="/discovery" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                Discovery
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  {user.role === 'teacher' && (
                    <Link to="/teacher" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                      Teacher
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-slate-900 dark:text-white font-semibold">{user.username}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{user.points} pts</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Home
            </Link>
            <Link to="/courses" className="border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Courses
            </Link>
            <Link to="/discovery" className="border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Discovery
            </Link>
            {user && (
              <>
                {user.role === 'student' && (
                  <Link to="/dashboard" className="border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    Dashboard
                  </Link>
                )}
                {user.role === 'teacher' && (
                  <Link to="/teacher" className="border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    Teacher Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4 mb-4">
               <button
                onClick={toggleTheme}
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                {theme === 'light' ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 rounded-full bg-slate-100 dark:bg-gray-700 p-2 text-slate-500 dark:text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-slate-900 dark:text-white">{user.username}</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-gray-400">{user.points} points</div>
                </div>
                <button
                  onClick={logout}
                  className="ml-auto flex-shrink-0 bg-white dark:bg-gray-700 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-1 px-2">
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-700">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-700">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
