import React from 'react';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import RegistrationForm from '@/components/shared/RegistrationForm';

export const metadata = {
  title: "Course Enrollment | Simuflux",
  description: "Secure student seat registration and receipt submission.",
  robots: {
    index: false,
    follow: false,
  },
};

// Fetch courses and discount tiers helper to pass to form
async function getRegistrationData() {
  try {
    const { db } = await connectToDatabase();
    const coursesData = await db.collection('courses').find({}).toArray();
    const tiersData = await db.collection('discountTiers').find({}).sort({ minCourses: 1 }).toArray();
    const comboDealsData = await db.collection('comboDeals').find({}).sort({ createdAt: -1 }).toArray();

    // Filter out expired discounts and combo deals
    const now = new Date();
    const activeTiers = tiersData.filter(t =>
      !t.expiryDate || new Date(t.expiryDate) > now
    );
    const activeComboDeals = comboDealsData.filter(d =>
      !d.expiryDate || new Date(d.expiryDate) > now
    );

    const courses = coursesData.map(c => ({
      ...c,
      _id: c._id.toString(),
    }));

    const discountTiers = activeTiers.map(t => ({
      _id: t._id.toString(),
      minCourses: t.minCourses,
      discountPercent: t.discountPercent,
    }));

    const comboDeals = activeComboDeals.map(d => ({
      _id: d._id.toString(),
      courseIds: (d.courseIds || []).map(String),
      courseSlugs: d.courseSlugs || [],
      discountPercent: d.discountPercent,
      label: d.label,
    }));

    return { courses, discountTiers, comboDeals };
  } catch (error) {
    console.error('Failed to fetch registration data:', error);
    return { courses: [], discountTiers: [], comboDeals: [] };
  }
}

// Validate registration token — supports new array-based tokens and old single-course tokens
async function validateToken(token, courseSlug) {
  try {
    const { db } = await connectToDatabase();
    // Find by token only; slug membership is validated below
    const link = await db.collection('registrationLinks').findOne({ token });
    if (!link) return null;

    // Normalize courses array (support old schema too)
    const tokenCourses = link.courses
      ? link.courses
      : (link.courseSlug ? [{ courseSlug: link.courseSlug, negotiatedPrice: link.negotiatedPrice ?? null }] : []);

    // Check if the current page slug is included in the token's course list
    const matchesSlug = tokenCourses.some(c => (c.courseSlug || c.slug) === courseSlug);
    if (!matchesSlug) return null;

    return { ...link, _tokenCourses: tokenCourses };
  } catch (error) {
    console.error('Failed to validate token:', error);
    return null;
  }
}

export default async function RegisterCoursePage({ params, searchParams }) {
  const { courses, discountTiers, comboDeals } = await getRegistrationData();

  // Find the course matching the slug
  const matchedCourse = courses.find(
    c => c.slug === params.courseSlug
  );

  if (!matchedCourse) {
    notFound();
  }

  const token = searchParams.token;
  let tokenStatus = null;
  let isLocked = false;
  // priceOverridesMap: courseSlug -> negotiatedPrice (for all token courses)
  let priceOverridesMap = null;

  if (token) {
    const link = await validateToken(token, params.courseSlug);
    if (link) {
      tokenStatus = link.status;
      // Build priceOverridesMap from all token courses
      priceOverridesMap = {};
      for (const tc of (link._tokenCourses || [])) {
        const slug = tc.courseSlug || tc.slug;
        if (slug && tc.negotiatedPrice !== null && tc.negotiatedPrice !== undefined) {
          priceOverridesMap[slug] = tc.negotiatedPrice;
        }
      }
    }
  }

  // priceOverride for the current course (used for Price Inquiry gate check)
  const priceOverride = priceOverridesMap ? (priceOverridesMap[params.courseSlug] ?? null) : null;

  // Handle courses with no fixed price (price is null, requires Price Inquiry/Negotiation)
  if (matchedCourse.price === null) {
    const isValidToken = tokenStatus === 'pending' && priceOverride !== null;
    if (!isValidToken) {
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || '923463517689';
      const whatsappUrl = `https://wa.me/${adminPhone}?text=Hello%20Simuflux%2C%20I%20would%20like%20to%20register%20for%20the%20course%20%22${encodeURIComponent(matchedCourse.title)}%22%20and%20request%20a%20registration%20link.`;
      
      return (
        <section className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 relative overflow-hidden bg-navy text-offwhite">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <div className="border border-hairline bg-navy/60 p-xl sm:p-4xl relative text-offwhite font-sans shadow-elevation-sm rounded-lg text-center">
              <div className="w-20 h-20 border border-accent/50 flex items-center justify-center mx-auto rounded-lg shadow-elevation-sm mb-xl">
                <svg className="w-10 h-10 text-steelblue fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="font-sans font-bold text-h2 sm:text-h1 uppercase tracking-tight mb-lg">
                Registration Link Required
              </h2>
              <p className="font-sans text-body text-steelblue leading-relaxed max-w-md mx-auto mb-xl">
                The course <strong>{matchedCourse.title}</strong> requires price inquiry and manual enrollment. Please contact our support on WhatsApp to obtain a valid registration link.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-[#d04e1b] px-xl py-sm border border-transparent transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </section>
      );
    }
    
    // For price inquiry courses, if token is valid, lock the course input so user cannot deselect it
    isLocked = true;
  }

  // Build locked slugs list from the token (all token courses are pre-selected and locked)
  const lockedSlugs = priceOverridesMap ? Object.keys(priceOverridesMap).filter(s => priceOverridesMap[s] !== null && priceOverridesMap[s] !== undefined) : (isLocked && matchedCourse ? [matchedCourse.slug] : []);
  // If token is pending, lock all courses that are part of the token
  const allTokenSlugs = priceOverridesMap && tokenStatus === 'pending'
    ? (Object.keys(priceOverridesMap).length > 0 ? Object.keys(priceOverridesMap) : (matchedCourse ? [matchedCourse.slug] : []))
    : (isLocked && matchedCourse ? [matchedCourse.slug] : []);

  // Show closed state if token is used
  if (tokenStatus === 'used') {
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || '923463517689';
    const whatsappUrl = `https://wa.me/${adminPhone}`;

    return (
      <section className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 relative overflow-hidden bg-navy text-offwhite">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="border border-hairline bg-navy/60 p-xl sm:p-4xl relative text-offwhite font-sans shadow-elevation-sm rounded-lg text-center">
            <div className="w-20 h-20 border border-accent/50 flex items-center justify-center mx-auto rounded-lg shadow-elevation-sm mb-xl">
              <svg className="w-10 h-10 text-steelblue fill-none stroke-current" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="font-sans font-bold text-h2 sm:text-h1 uppercase tracking-tight mb-lg">
              Link Already Used
            </h2>
            <p className="font-sans text-body text-steelblue leading-relaxed max-w-md mx-auto mb-xl">
              This registration link has already been used. If you believe this is a mistake, please contact us on WhatsApp.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-[#d04e1b] px-xl py-sm border border-transparent transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Show normal registration form (either with valid pending token or without token)
  return (
    <section className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 relative overflow-hidden bg-navy text-offwhite">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <RegistrationForm
          courses={courses}
          discountTiers={discountTiers}
          comboDeals={comboDeals}
          initialCourse={matchedCourse.title}
          isLocked={isLocked}
          token={token}
          priceOverridesMap={priceOverridesMap || {}}
          lockedSlugs={allTokenSlugs}
        />
      </div>
    </section>
  );
}
