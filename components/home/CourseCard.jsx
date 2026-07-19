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
    <div className="group relative bg-navy border border-white/10 rounded-xl overflow-hidden transition-all duration-300 w-[280px] sm:w-[320px] lg:w-[360px] flex-shrink-0 min-h-[380px] sm:min-h-[400px] pb-md flex flex-col">
      {/* Course Image - 16:9 ratio - clickable to details */}
      <Link href={`/courses/${slug}`} className="block relative w-full aspect-video overflow-hidden bg-navy border-b border-white/10">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300"
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
      </Link>

      {/* Card Content */}
      <div className="p-lg flex flex-col flex-grow">
        {/* Category Badge */}
        {category && (
          <div className="mb-sm">
            <span className="inline-flex items-center px-sm py-xs text-caption font-sans font-medium text-accent bg-accent/10 rounded border border-accent/30">
              {category}
            </span>
          </div>
        )}

        {/* Course Number */}
        <div className="mb-sm">
          <span className="font-sans text-label font-bold text-accent">
            {courseNumber}
          </span>
        </div>

        {/* Title - clickable to details */}
        <Link href={`/courses/${slug}`} className="block">
          <h3 className="font-sans font-semibold text-h4 text-offwhite mb-sm line-clamp-2 leading-tight group-hover:text-accent transition-colors">
            {title}
          </h3>
        </Link>

        {/* Description */}
        <p className="font-sans text-caption sm:text-small text-steelblue/70 line-clamp-1 mb-sm leading-relaxed">
          {description}
        </p>

        {/* Duration */}
        {durationText && (
          <div className="flex items-center gap-sm mb-sm">
            <svg className="w-4 h-4 text-steelblue/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-sans text-caption text-steelblue/60">
              {durationText}
            </span>
          </div>
        )}

        {/* Price & Enroll CTA */}
        <div className="flex items-center justify-between pt-sm border-t border-white/10 mt-auto gap-sm">
          <div>
            {discountPercent > 0 && (
              <span className="font-sans text-caption text-steelblue/50 line-through block">
                PKR {price.toLocaleString()}
              </span>
            )}
            <span className="font-sans text-body font-bold text-accent">
              PKR {finalPrice.toLocaleString()}
            </span>
          </div>
        {/* Description Button */}
          <Link
            href={`/courses/${slug}`}
            className="px-md py-sm bg-accent text-offwhite font-sans text-label uppercase font-medium rounded-md hover:bg-[#d04e1b] transition-all duration-300 font-semibold text-sm"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
