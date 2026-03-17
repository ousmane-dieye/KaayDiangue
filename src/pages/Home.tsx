import { Link } from 'react-router-dom';
import { Play, Award, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            <span>Apprendre n'a jamais été aussi simple</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Apprenez en <span className="text-indigo-600 dark:text-indigo-400">Minutes</span>, pas en Heures
          </h1>
          
          <p className="text-xl text-slate-700 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            La plateforme de micro-apprentissage conçue pour l'ère moderne. 
            Vidéos courtes, quiz rapides et badges de réussite.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="btn-primary px-8 py-4 text-lg flex items-center group">
              Commencer maintenant
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-8 py-4 text-lg font-semibold text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Vidéos Courtes",
              desc: "Contenu vidéo condensé qui s'adapte à votre emploi du temps chargé.",
              icon: Play,
              color: "bg-blue-500"
            },
            {
              title: "Quiz Interactifs",
              desc: "Testez vos connaissances immédiatement pour renforcer l'apprentissage.",
              icon: Zap,
              color: "bg-yellow-500"
            },
            {
              title: "Gamification",
              desc: "Gagnez des points et des badges au fur et à mesure de votre progression.",
              icon: Award,
              color: "bg-indigo-500"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl glass hover:border-indigo-500/50 transition-all duration-300 group"
            >
              <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${feature.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-700 dark:text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] bg-indigo-600 p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Étudiants", value: "10k+" },
              { label: "Cours", value: "500+" },
              { label: "Quiz", value: "2k+" },
              { label: "Badges", value: "50k+" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-white font-display">{stat.value}</div>
                <div className="text-indigo-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
