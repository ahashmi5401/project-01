'use client';

import React from 'react';

export default function DiscountGauge({ selectedCount, sortedTiers, activeTier, nextTier, coursesNeededForNext }) {
  // Calculate gauge positions
  const maxTier = sortedTiers[sortedTiers.length - 1];
  const maxCourses = maxTier ? maxTier.minCourses : 3;
  
  // Create tick marks from 1 to maxCourses
  const ticks = [];
  for (let i = 1; i <= maxCourses; i++) {
    const tierForTick = sortedTiers.find(t => t.minCourses === i);
    ticks.push({
      courses: i,
      discount: tierForTick ? tierForTick.discountPercent : 0,
      isNextTier: nextTier && nextTier.minCourses === i,
      isReached: selectedCount >= i,
    });
  }

  // Calculate marker position (0-100%)
  const markerPosition = Math.min((selectedCount / maxCourses) * 100, 100);

  return (
    <div className="space-y-md">
      {/* Gauge Track */}
      <div className="relative py-lg">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-hairline/60 -translate-y-1/2" />
        
        {/* Filled Segment */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-accent/60 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${markerPosition}%` }}
        />

        {/* Tick Marks */}
        <div className="relative flex justify-between">
          {ticks.map((tick) => {
            const position = (tick.courses / maxCourses) * 100;
            return (
              <div key={tick.courses} className="relative flex flex-col items-center" style={{ left: `${position}%` }}>
                {/* Tick Mark */}
                <div 
                  className={`w-0.5 h-3 transition-all duration-300 ${
                    tick.isReached 
                      ? 'bg-accent' 
                      : tick.isNextTier 
                      ? 'bg-accent animate-pulse' 
                      : 'bg-steelblue/40'
                  }`}
                />
                {/* Discount Label */}
                {tick.discount > 0 && (
                  <span className={`font-mono text-caption mt-sm uppercase tracking-wider transition-colors ${
                    tick.isReached || tick.isNextTier ? 'text-accent' : 'text-steelblue/60'
                  }`}>
                    {tick.discount}%
                  </span>
                )}
                {/* Course Count Label */}
                <span className={`font-mono text-caption uppercase tracking-wider ${
                  tick.isReached || tick.isNextTier ? 'text-offwhite' : 'text-steelblue/40'
                }`}>
                  {tick.courses}
                </span>
              </div>
            );
          })}
        </div>

        {/* Marker Needle */}
        <div 
          className="absolute top-1/2 w-3 h-3 bg-accent rounded-full shadow-elevation-sm -translate-y-1/2 transition-all duration-500 z-10"
          style={{ left: `${Math.max(0, Math.min(markerPosition, 100))}%` }}
        />
      </div>

      {/* Status Label */}
      <div className="text-center">
        {selectedCount === 0 ? (
          <span className="font-mono text-caption text-steelblue/60 uppercase tracking-wider">
            Select courses to unlock discounts
          </span>
        ) : activeTier && !nextTier ? (
          <span className="font-mono text-caption text-accent uppercase tracking-wider font-semibold">
            MAX DISCOUNT UNLOCKED
          </span>
        ) : nextTier ? (
          <span className="font-mono text-caption text-steelblue uppercase tracking-wider">
            {coursesNeededForNext} more course{coursesNeededForNext > 1 ? 's' : ''} for {nextTier.discountPercent}%
          </span>
        ) : (
          <span className="font-mono text-caption text-steelblue uppercase tracking-wider">
            {activeTier?.discountPercent || 0}% discount applied
          </span>
        )}
      </div>
    </div>
  );
}
