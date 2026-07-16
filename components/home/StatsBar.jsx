import React from 'react';

export default function StatsBar() {
  const stats = [
    {
      value: "500+",
      label: "Students Trained",
      todo: "TODO: confirm real number with client"
    },
    {
      value: "80+",
      label: "Projects Delivered",
      todo: "TODO: confirm real number with client"
    },
    {
      value: "5",
      label: "Core Disciplines",
      todo: null
    }
  ];

  return (
    <section className="bg-navy border-b border-hairline pt-2xl sm:pt-3xl pb-3xl sm:pb-4xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md sm:gap-lg">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative h-[160px] sm:h-[180px] bg-navy border border-white/10 rounded-xl p-lg sm:p-xl flex flex-col items-center justify-center text-center transition-all duration-300"
            >
              <div className="font-sans text-h2 sm:text-h1 lg:text-display font-bold text-accent mb-md tracking-tight">
                {stat.value}
              </div>
              <div className="font-sans text-caption sm:text-label uppercase tracking-wider text-steelblue">
                {stat.label}
              </div>
              {stat.todo && (
                <span className="text-caption font-sans text-steelblue/30 mt-sm select-none uppercase tracking-wider block">
                  {/* TODO: replace with client's real metrics once provided */}
                  Verify stats
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
