import React from 'react';
import { GraduationCap, FolderKanban, Layers } from 'lucide-react';

export default function StatsBar() {
  const stats = [
    {
      value: "500+",
      label: "Students Trained",
      icon: GraduationCap,
      todo: true
    },
    {
      value: "80+",
      label: "Projects Delivered",
      icon: FolderKanban,
      todo: true
    },
    {
      value: "5",
      label: "Core Disciplines",
      icon: Layers,
      todo: false
    }
  ];

  return (
    <section className="bg-navy border-b border-hairline py-3xl sm:py-4xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md sm:gap-lg">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative min-h-[180px] sm:min-h-[200px] bg-navy border border-white/10 rounded-xl p-lg sm:p-xl flex flex-col items-center justify-center text-center gap-2 transition-colors duration-300 hover:border-white/20"
              >
                <div className="h-7 sm:h-8 flex items-center justify-center mb-1">
                  {Icon && (
                    <Icon
                      className="w-6 h-6 sm:w-7 sm:h-7 text-accent"
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                <div className="font-sans text-h2 sm:text-h1 lg:text-display font-bold text-accent leading-none tracking-tight">
                  {stat.value}
                </div>

                <div className="font-sans text-caption sm:text-label uppercase tracking-wider text-steelblue">
                  {stat.label}
                </div>

                {stat.todo && (
                  <span className="text-caption font-sans text-steelblue/30 mt-1 select-none uppercase tracking-wider block">
                    Verify stats
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}