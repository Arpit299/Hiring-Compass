import { motion } from 'framer-motion';
import { Target, Calendar, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import type { ImprovementPlan } from '../types/analysis';

interface ImprovementPlanProps {
  plan: ImprovementPlan;
}

export default function ImprovementPlanComponent({ plan }: ImprovementPlanProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
            <p className="text-gray-300 text-sm mb-2">{plan.duration}</p>
            <p className="text-gray-400 text-sm">{plan.overview}</p>
          </div>
        </div>
      </motion.div>

      {/* Focus Areas */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Focus Areas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plan.focusAreas.map((area, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-colors"
            >
              <p className="text-blue-300 font-medium text-sm">{area}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Breakdown */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold">Weekly Breakdown</h3>
        </div>
        <div className="space-y-4">
          {plan.weeks.map((week) => (
            <motion.div
              key={week.week}
              variants={itemVariants}
              className="glass-panel p-6 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
            >
              {/* Week Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-green-500/20">
                <div>
                  <h4 className="text-lg font-bold text-green-300">
                    Week {week.week}: {week.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  {week.timeCommitment}
                </div>
              </div>

              {/* Goals */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-300 mb-3">Goals</h5>
                <ul className="space-y-2">
                  {week.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-3">Resources</h5>
                <ul className="space-y-2">
                  {week.resources.map((resource, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Success Metrics */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Success Metrics</h3>
        </div>
        <div className="glass-panel p-6 rounded-lg border border-purple-500/20">
          <ul className="space-y-3">
            {plan.successMetrics.map((metric, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-200">
                <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-2" />
                <span>{metric}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        variants={itemVariants}
        className="text-center p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
      >
        <p className="text-gray-300 text-sm">
          Start your improvement journey today. Consistency and dedication over these 30 days will significantly boost your candidacy for the role.
        </p>
      </motion.div>
    </motion.div>
  );
}
