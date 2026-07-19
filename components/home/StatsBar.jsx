import React from 'react';

function GradCapIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="6" height="18" rx="1" />
      <rect x="9" y="8" width="6" height="13" rx="1" />
      <rect x="16" y="13" width="6" height="8" rx="1" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

const stats = [
  { value: '500+', label: 'Students Trained',   Icon: GradCapIcon  },
  { value: '80+',  label: 'Projects Delivered', Icon: BarChartIcon },
  { value: '5',    label: 'Core Disciplines',   Icon: CogIcon      },
];

export default function StatsBar() {
  return (
    <section
      className="relative z-10 border-y border-hairline"
      style={{ backgroundColor: '#091e35' }}
      aria-label="Key Statistics"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3">
        {stats.map(({ value, label, Icon }, i) => {
          const num    = value.replace(/\D/g, '');
          const suffix = value.replace(/[0-9]/g, '');
          return (
            <div
              key={i}
              className={
                i > 0
                  ? 'border-t border-hairline sm:border-t-0 sm:border-l sm:border-hairline'
                  : ''
              }
            >
              <div className="group relative flex flex-col items-center justify-center text-center py-10 px-6">

                {/* Top accent bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-0.5 bg-accent opacity-60 transition-all duration-400 group-hover:w-14 group-hover:opacity-100" />

                {/* Icon */}
                <div
                  className="relative flex items-center justify-center mb-5"
                  style={{ color: '#E8622C', width: '44px', height: '44px' }}
                >
                  {/* Ring around icon */}
                  <div
                    className="absolute rounded-full transition-all duration-400"
                    style={{
                      width: '62px',
                      height: '62px',
                      border: '1px solid rgba(232,98,44,0.22)',
                    }}
                  />
                  <Icon />
                </div>

                {/* Number */}
                <div
                  className="font-mono font-bold leading-none tracking-tight mb-2"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    color: '#F4F8FB',
                  }}
                >
                  {num}
                  <span style={{ color: '#E8622C' }}>{suffix}</span>
                </div>

                {/* Label */}
                <div
                  className="font-mono uppercase tracking-widest"
                  style={{ fontSize: '0.65rem', color: '#9DB4CB' }}
                >
                  {label}
                </div>

                {/* Corner ticks */}
                <div
                  className="absolute top-2.5 left-2.5"
                  style={{ width:'10px', height:'10px', borderTop:'1px solid rgba(232,98,44,0.3)', borderLeft:'1px solid rgba(232,98,44,0.3)' }}
                />
                <div
                  className="absolute bottom-2.5 right-2.5"
                  style={{ width:'10px', height:'10px', borderBottom:'1px solid rgba(232,98,44,0.3)', borderRight:'1px solid rgba(232,98,44,0.3)' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
