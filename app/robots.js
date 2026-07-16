// TODO: Replace with SimuFlux's real domain name once finalized
const BASE_URL = 'https://simufluxlab.com';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/login', '/signup', '/api'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
