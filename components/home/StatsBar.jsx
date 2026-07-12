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
    <section className="bg-navy border-b border-hairline py-10 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-hairline">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center justify-center text-center p-4 first:pt-0 last:pb-0 md:py-4"
          >
            <div className="font-mono text-4xl sm:text-5xl font-bold text-accent mb-2 tracking-tight">
              {stat.value}
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-steelblue">
              {stat.label}
            </div>
            {stat.todo && (
              <span className="text-[8px] font-mono text-steelblue/30 mt-2 select-none uppercase tracking-wider block">
                {/* TODO: replace with client's real metrics once provided */}
                Verify stats
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
