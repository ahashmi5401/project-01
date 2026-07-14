import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import mammoth from 'mammoth';

// Feature options for checkbox matching
const FEATURE_OPTIONS = [
  "Live Interactive Online Classes",
  "Recorded Tutorials",
  "Hands-on Practical Training",
  "Project-Based Learning",
  "Assignments & Practice Exercises",
  "Certificate of Completion"
];

// Fuzzy heading matching patterns
const HEADING_PATTERNS = {
  title: ['course title', 'title', 'course name'],
  description: ['course description', 'description', 'about this course'],
  points: ['highlights', 'course highlights', 'points', 'key points', 'what you will learn', 'what you\'ll learn', 'learning outcomes'],
  curriculum: ['outline', 'curriculum', 'topics', 'syllabus', 'course content'],
  features: ['features', 'course features', 'what\'s included', 'what is included', 'included'],
  duration: ['duration', 'weeks', 'classes per week', 'schedule', 'time'],
  instructor: ['trainer', 'instructor', 'faculty', 'about the trainer', 'trainer profile', 'about instructor'],
  targetAudience: ['suitable for', 'prerequisites', 'who is this for', 'target audience', 'audience', 'who should attend'],
  price: ['price', 'course price', 'cost', 'fee', 'pricing']
};

// Check if a line matches a heading pattern (case-insensitive)
function matchesHeading(line, patterns) {
  const lowerLine = line.toLowerCase().trim();
  return patterns.some(pattern => lowerLine.includes(pattern));
}

// Extract duration information from text
function extractDuration(text) {
  const duration = { totalDuration: '', classesPerWeek: 0, classDurationHours: 0 };
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Total Duration - handle "Label: Value" format
    if (lowerLine.includes('total duration') && !duration.totalDuration) {
      // Try "Label: Value" format first
      const colonMatch = line.match(/total duration\s*:\s*(.+)/i);
      if (colonMatch) {
        duration.totalDuration = colonMatch[1].trim();
      }
      // Try bullet point with example format: "Total Duration (e.g., "8 Weeks")"
      else {
        const exampleMatch = line.match(/total duration.*?["'](\d+\s*weeks?)["']/i);
        if (exampleMatch) {
          duration.totalDuration = exampleMatch[1].trim();
        }
        // Try to extract any number + weeks pattern
        else {
          const weeksMatch = line.match(/(\d+)\s*(weeks?)/i);
          if (weeksMatch) {
            duration.totalDuration = weeksMatch[0].trim();
          }
        }
      }
    }
    
    // Classes Per Week - handle "Label: Value" format
    if (lowerLine.includes('classes per week') && duration.classesPerWeek === 0) {
      // Try "Label: Value" format first
      const colonMatch = line.match(/classes per week\s*:\s*(\d+)/i);
      if (colonMatch) {
        duration.classesPerWeek = parseInt(colonMatch[1], 10);
      }
      // Try bullet point format: "- Classes Per Week (number)"
      else {
        const numberMatch = line.match(/classes per week.*?(\d+)/i);
        if (numberMatch) {
          duration.classesPerWeek = parseInt(numberMatch[1], 10);
        }
        // Fallback to any number in the line
        else {
          const anyNumber = line.match(/(\d+)/);
          if (anyNumber) {
            duration.classesPerWeek = parseInt(anyNumber[1], 10);
          }
        }
      }
    }
    
    // Class Duration Hours - handle "Label: Value" format
    if (lowerLine.includes('class duration hours') && duration.classDurationHours === 0) {
      // Try "Label: Value" format first
      const colonMatch = line.match(/class duration hours\s*:\s*(\d+)/i);
      if (colonMatch) {
        duration.classDurationHours = parseInt(colonMatch[1], 10);
      }
      // Try bullet point format: "- Class Duration Hours (number)"
      else {
        const numberMatch = line.match(/class duration hours.*?(\d+)/i);
        if (numberMatch) {
          duration.classDurationHours = parseInt(numberMatch[1], 10);
        }
        // Fallback to any number in the line
        else {
          const anyNumber = line.match(/(\d+)/);
          if (anyNumber) {
            duration.classDurationHours = parseInt(anyNumber[1], 10);
          }
        }
      }
    }
    // Fallback for other duration patterns (separate condition)
    if ((lowerLine.includes('class duration') || lowerLine.includes('duration hour')) && duration.classDurationHours === 0) {
      const match = line.match(/(\d+)\s*(hours?|hrs?)/i);
      if (match) {
        duration.classDurationHours = parseInt(match[1], 10);
      }
    }
  }
  
  return duration;
}

// Extract instructor information from text
function extractInstructor(text) {
  const instructor = { name: '', experienceYears: '', qualification: '', trainerSince: '', contact: '' };
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Handle "Label: Value" format first
    if (lowerLine.includes('trainer name') && !instructor.name) {
      const match = line.match(/trainer name\s*:\s*(.+)/i);
      if (match) instructor.name = match[1].trim();
    } else if (lowerLine.includes('experience years') && !instructor.experienceYears) {
      const match = line.match(/experience years\s*:\s*(.+)/i);
      if (match) instructor.experienceYears = match[1].trim();
    } else if (lowerLine.includes('qualification') && !instructor.qualification) {
      const match = line.match(/qualification\s*:\s*(.+)/i);
      if (match) instructor.qualification = match[1].trim();
    } else if (lowerLine.includes('trainer since') && !instructor.trainerSince) {
      const match = line.match(/trainer since\s*:\s*(.+)/i);
      if (match) instructor.trainerSince = match[1].trim();
    } else if (lowerLine.includes('contact information') && !instructor.contact) {
      const match = line.match(/contact information\s*:\s*(.+)/i);
      if (match) instructor.contact = match[1].trim();
    }
    // Handle bullet point format with example values
    else if (lowerLine.includes('trainer name') && !instructor.name) {
      const match = line.match(/trainer name.*?[:\s]+(.+)/i);
      if (match) instructor.name = match[1].trim();
    } else if (lowerLine.includes('experience years') && !instructor.experienceYears) {
      const match = line.match(/experience years.*?[:\s]+(.+)/i);
      if (match) instructor.experienceYears = match[1].trim();
    } else if (lowerLine.includes('qualification') && !instructor.qualification) {
      const match = line.match(/qualification.*?[:\s]+(.+)/i);
      if (match) instructor.qualification = match[1].trim();
    } else if (lowerLine.includes('trainer since') && !instructor.trainerSince) {
      const match = line.match(/trainer since.*?[:\s]+(.+)/i);
      if (match) instructor.trainerSince = match[1].trim();
    } else if (lowerLine.includes('contact information') && !instructor.contact) {
      const match = line.match(/contact information.*?[:\s]+(.+)/i);
      if (match) instructor.contact = match[1].trim();
    }
    // Fallback for simple keyword matches
    else if (lowerLine.includes('name') && !instructor.name && !lowerLine.includes('trainer')) {
      instructor.name = line.replace(/name:?\s*/i, '').trim();
    } else if (lowerLine.includes('experience') && !instructor.experienceYears) {
      instructor.experienceYears = line.replace(/experience:?\s*/i, '').trim();
    } else if (lowerLine.includes('qualification') && !instructor.qualification) {
      instructor.qualification = line.replace(/qualification:?\s*/i, '').trim();
    } else if (lowerLine.includes('since') && !instructor.trainerSince && !lowerLine.includes('trainer')) {
      instructor.trainerSince = line.replace(/since:?\s*/i, '').trim();
    } else if ((lowerLine.includes('contact') || lowerLine.includes('email') || lowerLine.includes('phone')) && !instructor.contact) {
      instructor.contact = line.replace(/contact:?\s*/i, '').trim();
    }
  }
  
  // If no structured data found, use the first few lines as best guess
  if (!instructor.name && lines.length > 0) {
    instructor.name = lines[0];
  }
  // Collect remaining lines for qualification if not already set
  if (!instructor.qualification && lines.length > 1) {
    // Skip lines that look like other fields
    const qualLines = lines.slice(1).filter(l => 
      !l.toLowerCase().includes('experience') &&
      !l.toLowerCase().includes('since') &&
      !l.toLowerCase().includes('contact')
    );
    instructor.qualification = qualLines.join('\n');
  }
  
  return instructor;
}

// Extract price from text
function extractPrice(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Handle "Price: 15000" or "Price: PKR 15,000" format
    if (lowerLine.includes('price') || lowerLine.includes('cost') || lowerLine.includes('fee')) {
      const match = line.match(/price\s*[:=]\s*(\d[\d,]*)/i) || 
                   line.match(/cost\s*[:=]\s*(\d[\d,]*)/i) ||
                   line.match(/fee\s*[:=]\s*(\d[\d,]*)/i) ||
                   line.match(/(\d[\d,]*)/);
      if (match) {
        // Remove commas and parse
        const cleanPrice = match[1].replace(/,/g, '');
        return parseInt(cleanPrice, 10);
      }
    }
  }
  
  return 0;
}

// Extract features from text (match against predefined options)
function extractFeatures(text) {
  const foundFeatures = [];
  const lowerText = text.toLowerCase();
  
  for (const feature of FEATURE_OPTIONS) {
    if (lowerText.includes(feature.toLowerCase())) {
      foundFeatures.push(feature);
    }
  }
  
  return foundFeatures;
}

// POST: Import course data from .docx file (Admin Protected)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json({ error: 'File must be a .docx document.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert DOCX to text using mammoth
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    // Parse the text into sections based on headings
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    const extractedData = {
      title: '',
      description: '',
      points: [],
      curriculum: [],
      duration: { totalDuration: '', classesPerWeek: 0, classDurationHours: 0 },
      features: [],
      targetAudience: '',
      instructor: { name: '', experienceYears: '', qualification: '', trainerSince: '', contact: '' },
      price: 0
    };
    
    const fieldStatus = {
      title: false,
      description: false,
      points: false,
      curriculum: false,
      duration: false,
      features: false,
      targetAudience: false,
      instructor: false,
      price: false
    };
    
    let currentSection = null;
    let currentSectionText = [];
    
    for (const line of lines) {
      // Check if this line is a heading
      let matchedSection = null;
      
      if (matchesHeading(line, HEADING_PATTERNS.title)) {
        matchedSection = 'title';
      } else if (matchesHeading(line, HEADING_PATTERNS.description)) {
        matchedSection = 'description';
      } else if (matchesHeading(line, HEADING_PATTERNS.points)) {
        matchedSection = 'points';
      } else if (matchesHeading(line, HEADING_PATTERNS.curriculum)) {
        matchedSection = 'curriculum';
      } else if (matchesHeading(line, HEADING_PATTERNS.features)) {
        matchedSection = 'features';
      } else if (matchesHeading(line, HEADING_PATTERNS.duration)) {
        matchedSection = 'duration';
      } else if (matchesHeading(line, HEADING_PATTERNS.instructor)) {
        matchedSection = 'instructor';
      } else if (matchesHeading(line, HEADING_PATTERNS.targetAudience)) {
        matchedSection = 'targetAudience';
      } else if (matchesHeading(line, HEADING_PATTERNS.price)) {
        matchedSection = 'price';
      }
      
      // If we found a new heading, process the previous section
      if (matchedSection && matchedSection !== currentSection) {
        if (currentSection && currentSectionText.length > 0) {
          const sectionText = currentSectionText.join('\n');
          
          switch (currentSection) {
            case 'title':
              extractedData.title = currentSectionText[0] || '';
              if (extractedData.title) fieldStatus.title = true;
              break;
            case 'description':
              extractedData.description = currentSectionText.join(' ').trim();
              if (extractedData.description) fieldStatus.description = true;
              break;
            case 'points':
              // Split by lines, filter out empty lines and instruction lines
              extractedData.points = currentSectionText
                .filter(l => l && !l.toLowerCase().includes('list each') && !l.toLowerCase().includes('example'))
                .map(l => l.replace(/^[-•*]\s*/, '').trim());
              if (extractedData.points.length > 0) fieldStatus.points = true;
              break;
            case 'curriculum':
              // Split by lines, filter out empty lines and instruction lines
              extractedData.curriculum = currentSectionText
                .filter(l => l && !l.toLowerCase().includes('list each') && !l.toLowerCase().includes('example'))
                .map(l => l.replace(/^[-•*]\s*/, '').trim());
              if (extractedData.curriculum.length > 0) fieldStatus.curriculum = true;
              break;
            case 'features':
              extractedData.features = extractFeatures(sectionText);
              if (extractedData.features.length > 0) fieldStatus.features = true;
              break;
            case 'duration':
              extractedData.duration = extractDuration(sectionText);
              if (extractedData.duration.totalDuration || extractedData.duration.classesPerWeek > 0) {
                fieldStatus.duration = true;
              }
              break;
            case 'instructor':
              extractedData.instructor = extractInstructor(sectionText);
              if (extractedData.instructor.name || extractedData.instructor.qualification) {
                fieldStatus.instructor = true;
              }
              break;
            case 'targetAudience':
              extractedData.targetAudience = sectionText
                .replace(/describe who this course is suitable for/i, '')
                .replace(/^[-•*]\s*/, '')
                .trim();
              if (extractedData.targetAudience) fieldStatus.targetAudience = true;
              break;
            case 'price':
              extractedData.price = extractPrice(sectionText);
              if (extractedData.price > 0) fieldStatus.price = true;
              break;
          }
        }
        
        currentSection = matchedSection;
        currentSectionText = [];
      } else if (currentSection) {
        // Add line to current section (skip if it looks like an instruction)
        const lowerLine = line.toLowerCase();
        if (!lowerLine.includes('provide the following') && 
            !lowerLine.includes('select from') &&
            !lowerLine.includes('example:')) {
          currentSectionText.push(line);
        }
      }
    }
    
    // Process the last section
    if (currentSection && currentSectionText.length > 0) {
      const sectionText = currentSectionText.join('\n');
      
      switch (currentSection) {
        case 'title':
          extractedData.title = currentSectionText[0] || '';
          if (extractedData.title) fieldStatus.title = true;
          break;
        case 'description':
          extractedData.description = currentSectionText.join(' ').trim();
          if (extractedData.description) fieldStatus.description = true;
          break;
        case 'points':
          extractedData.points = currentSectionText
            .filter(l => l && !l.toLowerCase().includes('list each') && !l.toLowerCase().includes('example'))
            .map(l => l.replace(/^[-•*]\s*/, '').trim());
          if (extractedData.points.length > 0) fieldStatus.points = true;
          break;
        case 'curriculum':
          extractedData.curriculum = currentSectionText
            .filter(l => l && !l.toLowerCase().includes('list each') && !l.toLowerCase().includes('example'))
            .map(l => l.replace(/^[-•*]\s*/, '').trim());
          if (extractedData.curriculum.length > 0) fieldStatus.curriculum = true;
          break;
        case 'features':
          extractedData.features = extractFeatures(sectionText);
          if (extractedData.features.length > 0) fieldStatus.features = true;
          break;
        case 'duration':
          extractedData.duration = extractDuration(sectionText);
          if (extractedData.duration.totalDuration || extractedData.duration.classesPerWeek > 0) {
            fieldStatus.duration = true;
          }
          break;
        case 'instructor':
          extractedData.instructor = extractInstructor(sectionText);
          if (extractedData.instructor.name || extractedData.instructor.qualification) {
            fieldStatus.instructor = true;
          }
          break;
        case 'targetAudience':
          extractedData.targetAudience = sectionText
            .replace(/describe who this course is suitable for/i, '')
            .replace(/^[-•*]\s*/, '')
            .trim();
          if (extractedData.targetAudience) fieldStatus.targetAudience = true;
          break;
        case 'price':
          extractedData.price = extractPrice(sectionText);
          if (extractedData.price > 0) fieldStatus.price = true;
          break;
      }
    }
    
    // Count how many fields were successfully filled
    const filledCount = Object.values(fieldStatus).filter(Boolean).length;
    const totalFields = Object.keys(fieldStatus).length;
    
    // If nothing was detected, return an error message
    if (filledCount === 0) {
      return NextResponse.json({ 
        error: 'Couldn\'t detect the expected format — please fill the form manually or check the template. Make sure to use "Label: Value" format for Duration and Trainer Profile sections.',
        extractedData,
        fieldStatus
      }, { status: 400 });
    }
    
    // Build list of fields that weren't filled with specific guidance
    const missingFields = Object.entries(fieldStatus)
      .filter(([_, filled]) => !filled)
      .map(([field]) => {
        // Add specific guidance for problematic fields
        if (field === 'duration') return 'Duration (use format: "Total Duration: 8 Weeks", "Classes Per Week: 3", "Class Duration Hours: 2")';
        if (field === 'instructor') return 'Trainer Profile (use format: "Trainer Name: John Doe", "Experience Years: 5", etc.)';
        return field;
      });
    
    // Check if critical fields are missing
    const criticalFields = ['title', 'description'];
    const missingCritical = criticalFields.filter(f => !fieldStatus[f]);
    
    if (missingCritical.length > 0) {
      return NextResponse.json({
        success: true,
        extractedData,
        fieldStatus,
        summary: `Import completed but missing critical fields: ${missingCritical.join(', ')}. Please ensure these are filled in the document using proper "Label: Value" format. Other fields to review: ${missingFields.filter(f => !criticalFields.includes(f.split(' ')[0])).join(', ') || 'none'}.`,
        warning: true
      });
    }
    
    return NextResponse.json({
      success: true,
      extractedData,
      fieldStatus,
      summary: `${filledCount} of ${totalFields} fields filled from your document. ${missingFields.length > 0 ? `Please review and manually complete: ${missingFields.join(', ')}.` : 'All fields are complete!'}`
    });
    
  } catch (error) {
    console.error('Document import error:', error);
    return NextResponse.json({ error: 'Failed to import document. Please ensure it\'s a valid .docx file.' }, { status: 500 });
  }
}
