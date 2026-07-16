import React from 'react';
import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import ScopeList from "@/components/home/ScopeList";
import CoursesPreview from "@/components/home/CoursesPreview";
import DiscountPromo from "@/components/home/DiscountPromo";
import { connectToDatabase } from '@/lib/mongodb';

// Force every request to be server-rendered live from MongoDB (no static caching)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "SimuFlux Design Lab — CFD, FEA & CAD Training and Consultancy in Karachi",
  description: "SimuFlux Design Lab provides professional engineering training and consultancy in Karachi, Pakistan. Validate designs with CFD, FEA, and CAD modeling.",
};

async function getHomeData() {
  try {
    const { db } = await connectToDatabase();
    
    const servicesData = await db.collection('services')
      .find({})
      .sort({ id: 1 })
      .toArray();

    const coursesData = await db.collection('courses')
      .find({})
      .sort({ id: 1 })
      .toArray();

    const discountTiersData = await db.collection('discountTiers')
      .find({})
      .sort({ minCourses: 1 })
      .toArray();

    const comboDealsData = await db.collection('comboDeals')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Filter out expired discounts and combo deals
    const now = new Date();
    const activeDiscountTiers = discountTiersData.filter(tier => 
      !tier.expiryDate || new Date(tier.expiryDate) > now
    );
    const activeComboDeals = comboDealsData.filter(deal =>
      !deal.expiryDate || new Date(deal.expiryDate) > now
    );

    // Serialize ObjectIds for Client Components
    const services = servicesData.map(s => ({
      ...s,
      _id: s._id.toString(),
      createdAt: s.createdAt ? s.createdAt.toISOString() : null,
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
    }));

    const courses = coursesData.map(c => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt ? c.createdAt.toISOString() : null,
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
    }));

    const discountTiers = activeDiscountTiers.map(t => ({
      ...t,
      _id: t._id.toString(),
      createdAt: t.createdAt ? t.createdAt.toISOString() : null,
      updatedAt: t.updatedAt ? t.updatedAt.toISOString() : null,
    }));

    const comboDeals = activeComboDeals.map(d => ({
      ...d,
      _id: d._id.toString(),
      courseIds: (d.courseIds || []).map(String),
      createdAt: d.createdAt ? d.createdAt.toISOString() : null,
      updatedAt: d.updatedAt ? d.updatedAt.toISOString() : null,
    }));

    return { services, courses, discountTiers, comboDeals };
  } catch (error) {
    console.error('Failed to fetch home page data from database:', error);
    return { services: [], courses: [], discountTiers: [], comboDeals: [] };
  }
}

export default async function Home() {
  const { services, courses, discountTiers, comboDeals } = await getHomeData();

  // LocalBusiness JSON-LD for Local SEO
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "SimuFlux Design Lab",
    "image": "https://simufluxlab.com/images/logo.png", // fallback placeholder
    "@id": "https://simufluxlab.com/#local-business",
    "url": "https://simufluxlab.com",
    "telephone": "+92-XXX-XXXXXXX", // TODO: Replace with client's actual phone number
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Karachi, Sindh, Pakistan", // TODO: Replace with exact office address if available
      "addressLocality": "Karachi",
      "addressRegion": "Sindh",
      "postalCode": "75210", // placeholder
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 24.8607, // Karachi coordinates
      "longitude": 67.0011
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61591794389878"
    ],
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Karachi"
      },
      {
        "@type": "Country",
        "name": "Pakistan"
      }
    ]
  };

  return (
    <>
      {/* Inject LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      
      <Hero />
      <StatsBar />
      <ScopeList services={services} />
      <CoursesPreview courses={courses} />
      <DiscountPromo discountTiers={discountTiers} comboDeals={comboDeals} />
    </>
  );
}
