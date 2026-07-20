import { connectToDatabase } from '@/lib/mongodb';

// Regenerate at most once per hour — content changes rarely
export const revalidate = 3600;

export async function GET() {
  let courses = [];
  let services = [];

  try {
    const { db } = await connectToDatabase();
    [courses, services] = await Promise.all([
      db.collection('courses').find({}, { projection: { title: 1, description: 1 } }).sort({ id: 1 }).toArray(),
      db.collection('services').find({}, { projection: { title: 1, shortDescription: 1 } }).sort({ id: 1 }).toArray(),
    ]);
  } catch (err) {
    console.error('[llms.txt] Failed to fetch from MongoDB, serving partial content:', err);
  }

  // Build dynamic list lines, falling back gracefully if DB is empty
  const trainingLines = courses.length > 0
    ? courses.map(c => `- ${c.title}${c.description ? ` - ${c.description}` : ''}`).join('\n')
    : '- Engineering simulation and CAD training courses';

  const consultancyLines = services.length > 0
    ? services.map(s => `- ${s.title}${s.shortDescription ? ` - ${s.shortDescription}` : ''}`).join('\n')
    : '- Engineering consultancy services';

  const content = [
    '# Simuflux Lab',
    '',
    'Simuflux Lab is a professional engineering training and consultancy based in Karachi, Pakistan. We bridge the gap between academic theory and industrial application through practical, hands-on training and advanced engineering simulation solutions.',
    '',
    '## Services',
    '',
    '### Engineering Training',
    trainingLines,
    '',
    '### Engineering Consultancy',
    consultancyLines,
    '',
    '## Key Pages',
    '',
    '- Home: https://simufluxlab.com - Overview of services and courses',
    '- About: https://simufluxlab.com/about - Company mission, values, and team information',
    '- Courses: https://simufluxlab.com/courses - Available training programs with curriculum details',
    '- Consultancy: https://simufluxlab.com/consultancy - Engineering service offerings',
    '- Contact: https://simufluxlab.com/contact - Get in touch for inquiries and registrations',
    '',
    '## Contact Information',
    '',
    '- Location: Karachi, Sindh, Pakistan',
    '- Email: info@simufluxlab.com',
    '- WhatsApp: Available for direct inquiries',
    '- Response Time: Within 24-48 hours for general inquiries, 15 minutes for enrollment confirmations',
    '',
    '## Target Audience',
    '',
    '- Engineering students seeking practical skills',
    '- Researchers working on innovative projects',
    '- Companies requiring engineering consultancy',
    '- Professionals looking to enhance technical capabilities',
    '- Industries needing design validation and optimization',
    '',
    '## Unique Value Proposition',
    '',
    '- Industry-oriented training with real-world case studies',
    '- Professional guidance from experienced mechanical engineers',
    '- Practical solutions tailored to engineering challenges',
    '- Online delivery accessible worldwide',
    '- Volume discounts for multi-course enrollments',
    '- Combo deals for bundled course packages',
    '',
    '## Technology Stack',
    '',
    '- Simulation: ANSYS Workbench (FEA, CFD)',
    '- CAD: Creo Parametric, SolidWorks',
    '- Analysis: Mesh convergence, parametric optimization',
    '- Delivery: Online video conferencing for live sessions',
    '',
  ].join('\n');

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
