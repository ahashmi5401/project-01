import { connectToDatabase } from '@/lib/mongodb';

// TODO: Replace with SimuFlux's real domain name once finalized
const BASE_URL = 'https://simuflux.com';

export default async function sitemap() {
  const staticRoutes = ['', '/about', '/consultancy', '/courses', '/contact'];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const { db } = await connectToDatabase();
    const services = await db.collection('services')
      .find({}, { projection: { slug: 1 } })
      .toArray();

    const dynamicEntries = services.map((service) => ({
      url: `${BASE_URL}/consultancy/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticEntries, ...dynamicEntries];
  } catch (error) {
    console.error('Error generating sitemap dynamically from database, falling back:', error);
    return staticEntries;
  }
}
