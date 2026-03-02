import { Link } from 'react-router-dom';
import { Play, Award, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Learn in Minutes, Not Hours
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Micro-learning platform designed for the modern age. Watch short videos, take quick quizzes, and earn badges.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Get started
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Log in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Learn Faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to master a skill
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                    <Play className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Short Videos
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Bite-sized video content that fits into your busy schedule.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                    <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Interactive Quizzes
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Test your knowledge immediately after watching to reinforce learning.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                    <Award className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Gamification
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Earn points and badges as you progress through courses.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
