// TODO: Replace with SimuFlux's real domain name once finalized
const BASE_URL = 'https://simuflux.com';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
