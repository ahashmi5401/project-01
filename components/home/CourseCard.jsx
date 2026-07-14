'use client';

import Link from 'next/link';

export default function CourseCard({
  image,
  courseNumber,
  category,
  title,
  description,
  duration,
  price,
  slug,
  discountPercent = 0
}) {
  const finalPrice = discountPercent > 0
    ? Math.round(price * (1 - discountPercent / 100))
    : price;

  const durationText = typeof duration === 'object' && duration !== null
    ? duration.totalDuration
    : duration;

  return (
    <Link
      href={`/courses/${slug}`}
      className="group relative bg-[#0B1220] rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 w-[290px] sm:w-[360px] flex-shrink-0"
    >
      {/* Course Image - 16:9 ratio */}
      <div className="relative w-full aspect-video overflow-hidden bg-navy/50">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="w-full h-full flex items-center justify-center">
                  <svg class="w-16 h-16 text-steelblue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                  </svg>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-steelblue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
            </svg>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Category Badge */}
        {category && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-mono font-medium text-orange-500 bg-orange-500/10 rounded border border-orange-500/20">
              {category}
            </span>
          </div>
        )}

        {/* Course Number */}
        <div className="mb-2">
          <span className="font-mono text-xs font-bold text-orange-500">
            {courseNumber}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-lg text-white mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="font-sans text-sm text-gray-400 line-clamp-2 mb-3">
          {description}
        </p>

        {/* Duration */}
        {durationText && (
          <div className="flex items-center gap-1 mb-3">
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-xs text-gray-500">
              {durationText}
            </span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            {discountPercent > 0 && (
              <span className="font-mono text-xs text-gray-500 line-through block">
                PKR {price.toLocaleString()}
              </span>
            )}
            <span className="font-mono text-base font-bold text-orange-500">
              PKR {finalPrice.toLocaleString()}
            </span>
          </div>
          <button className="px-4 py-2 bg-orange-500 text-white font-mono text-xs font-medium rounded hover:bg-orange-600 transition-all duration-300">
            Enroll →
          </button>
        </div>
      </div>
    </Link>
  );
}
