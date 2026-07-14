import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

// GET: Download course document template (Admin Protected)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Course Document Template",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Course Title Section
          new Paragraph({
            text: "Course Title",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Provide the course title",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Example: Mastering ANSYS Structural"
          }),
          new Paragraph({ text: "" }),

          // Course Description Section
          new Paragraph({
            text: "Course Description",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Provide a brief description of the course",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Example: Learn structural simulation using ANSYS Mechanical from basics to advanced topics including nonlinear analysis, thermal analysis, and modal analysis."
          }),
          new Paragraph({ text: "" }),

          // Course Highlights Section
          new Paragraph({
            text: "Course Highlights",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "List each highlight on its own line",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Example:",
            spacing: { after: 100 }
          }),
          new Paragraph({ text: "- Hands-on practical sessions" }),
          new Paragraph({ text: "- Industry-relevant projects" }),
          new Paragraph({ text: "- Expert instructor guidance" }),
          new Paragraph({ text: "" }),

          // Course Outline Section
          new Paragraph({
            text: "Course Outline",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "List each topic on its own line",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Example:",
            spacing: { after: 100 }
          }),
          new Paragraph({ text: "- Design Modeler / Geometry Preparation" }),
          new Paragraph({ text: "- Meshing" }),
          new Paragraph({ text: "- Material Modeling" }),
          new Paragraph({ text: "" }),
          
          // Course Features Section
          new Paragraph({
            text: "Course Features",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Select from the following options:",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({ text: "- Live Interactive Online Classes" }),
          new Paragraph({ text: "- Recorded Tutorials" }),
          new Paragraph({ text: "- Hands-on Practical Training" }),
          new Paragraph({ text: "- Project-Based Learning" }),
          new Paragraph({ text: "- Assignments & Practice Exercises" }),
          new Paragraph({ text: "- Certificate of Completion" }),
          new Paragraph({ text: "" }),
          
          // Duration Section
          new Paragraph({
            text: "Duration",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Provide the following information in Label: Value format:",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({ text: "Total Duration: 8 Weeks" }),
          new Paragraph({ text: "Classes Per Week: 3" }),
          new Paragraph({ text: "Class Duration Hours: 2" }),
          new Paragraph({ text: "" }),
          
          // Trainer Profile Section
          new Paragraph({
            text: "Trainer Profile",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Provide the following information in Label: Value format:",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({ text: "Trainer Name: John Doe" }),
          new Paragraph({ text: "Experience Years: 5" }),
          new Paragraph({ text: "Qualification: B.E. Mechanical" }),
          new Paragraph({ text: "Trainer Since: 2018" }),
          new Paragraph({ text: "Contact Information: trainer@example.com" }),
          new Paragraph({ text: "" }),
          
          // Target Audience Section
          new Paragraph({
            text: "Target Audience / Prerequisites",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Describe who this course is suitable for",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Example: Suitable for Beginners & Professionals – No prior experience required"
          }),
          new Paragraph({ text: "" }),

          // Price Section
          new Paragraph({
            text: "Course Price",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Provide the course price in PKR",
                italics: true,
                color: "666666"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Price: 15000"
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="course-template.docx"',
      },
    });
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json({ error: 'Failed to generate template.' }, { status: 500 });
  }
}
