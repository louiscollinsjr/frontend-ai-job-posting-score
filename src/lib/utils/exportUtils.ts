import { Document, Paragraph, HeadingLevel, TextRun, AlignmentType, Packer } from 'docx';
import jsPDF from 'jspdf';
import { marked } from 'marked';

export type ExportFormat = 'docx' | 'pdf' | 'txt';

export interface ExportData {
  jobTitle?: string;
  companyName?: string;
  optimizedText: string;
  originalScore: number;
  optimizedScore: number;
  scoreImprovement: number;
  appliedImprovements?: Array<{
    category: string;
    description?: string;
    impactPoints?: number;
    [key: string]: any; // Allow for additional properties
  }>;
  workingWell?: string[];
  reportId?: string;
}

/**
 * Convert markdown text to plain text
 */
function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  
  // Remove markdown formatting
  return markdown
    // Headers
    .replace(/#{1,6}\s+/g, '')
    // Bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Lists
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '1. ')
    // Code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Extract job title from optimized text
 */
function extractJobTitle(text: string): string {
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.length > 10 && trimmed.length < 100) {
      // Likely a job title
      return trimmed.replace(/[#*]/g, '').trim();
    }
  }
  return 'Optimized Job Posting';
}

/**
 * Export as Word document (.docx)
 */
export async function exportAsDocx(data: ExportData): Promise<void> {
  const jobTitle = data.jobTitle || extractJobTitle(data.optimizedText);
  const plainText = markdownToPlainText(data.optimizedText);
  
  // Split text into paragraphs
  const paragraphs = plainText.split('\n\n').filter(p => p.trim());
  
  const children = [
    // Title
    new Paragraph({
      children: [new TextRun({ text: jobTitle, bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),

    // Score improvement section
    new Paragraph({
      children: [new TextRun({ text: 'Optimization Results', bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    }),

    new Paragraph({
      children: [
        new TextRun({ text: `Original Score: ${data.originalScore}/100\n` }),
        new TextRun({ text: `Optimized Score: ${data.optimizedScore}/100\n` }),
        new TextRun({ text: `Improvement: +${data.scoreImprovement} points`, color: '22c55e', bold: true })
      ],
      spacing: { after: 400 }
    }),

    // Optimized job posting section
    new Paragraph({
      children: [new TextRun({ text: 'Optimized Job Posting', bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    })
  ];

  // Add job posting content paragraphs
  paragraphs.forEach(paragraph => {
    children.push(new Paragraph({
      children: [new TextRun({ text: paragraph })],
      spacing: { after: 200 }
    }));
  });

  // Add improvements section if available
  if (data.appliedImprovements && data.appliedImprovements.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Applied Improvements', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    data.appliedImprovements.forEach((improvement, index) => {
      console.log(`[DEBUG] Export improvement ${index}:`, improvement);
      
      // Try multiple possible description fields
      const description = improvement.description || 
                         improvement.change || 
                         improvement.details || 
                         improvement.text ||
                         'No description available';
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. ${improvement.category}`, bold: true }),
            new TextRun({ text: `\n${description}` }),
            ...(improvement.impactPoints ? [new TextRun({ text: ` (+${improvement.impactPoints} points)`, color: '22c55e' })] : [])
          ],
          spacing: { after: 200 }
        })
      );
    });
  }

  // Add working well section if available
  if (data.workingWell && data.workingWell.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'What\'s Working Well', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    data.workingWell.forEach((item, index) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${index + 1}. ${item}` })],
          spacing: { after: 100 }
        })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_optimized.docx`;
  link.click();

  URL.revokeObjectURL(link.href);
}

/**
 * Export as PDF
 */
export async function exportAsPdf(data: ExportData): Promise<void> {
  const jobTitle = data.jobTitle || extractJobTitle(data.optimizedText);
  const plainText = markdownToPlainText(data.optimizedText);
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 6;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: string = '#000000') => {
    if (yPosition > pageHeight - margin - 20) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color);

    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin - 10) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    yPosition += 3; // Extra spacing after text block
  };

  // Title
  addText(jobTitle, 20, true);
  yPosition += 5;

  // Score improvement section
  addText('Optimization Results', 16, true);
  addText(`Original Score: ${data.originalScore}/100`);
  addText(`Optimized Score: ${data.optimizedScore}/100`);
  addText(`Improvement: +${data.scoreImprovement} points`, 11, true, '#22c55e');
  yPosition += 10;

  // Optimized job posting
  addText('Optimized Job Posting', 16, true);
  yPosition += 5;

  const paragraphs = plainText.split('\n\n').filter(p => p.trim());
  paragraphs.forEach(paragraph => {
    addText(paragraph);
    yPosition += 3;
  });

  // Applied improvements
  if (data.appliedImprovements && data.appliedImprovements.length > 0) {
    yPosition += 10;
    addText('Applied Improvements', 16, true);
    yPosition += 5;

    data.appliedImprovements.forEach((improvement, index) => {
      const impactText = improvement.impactPoints ? ` (+${improvement.impactPoints} points)` : '';
      
      // Try multiple possible description fields
      const description = improvement.description || 
                         improvement.change || 
                         improvement.details || 
                         improvement.text ||
                         'No description available';
      
      addText(`${index + 1}. ${improvement.category}${impactText}`, 11, true);
      addText(description);
      yPosition += 3;
    });
  }

  // What's working well
  if (data.workingWell && data.workingWell.length > 0) {
    yPosition += 10;
    addText('What\'s Working Well', 16, true);
    yPosition += 5;

    data.workingWell.forEach((item, index) => {
      addText(`${index + 1}. ${item}`);
    });
  }

  pdf.save(`${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_optimized.pdf`);
}

/**
 * Export as plain text
 */
export async function exportAsText(data: ExportData): Promise<void> {
  const jobTitle = data.jobTitle || extractJobTitle(data.optimizedText);
  const plainText = markdownToPlainText(data.optimizedText);
  
  let content = `${jobTitle}\n`;
  content += '='.repeat(jobTitle.length) + '\n\n';
  
  // Score improvement
  content += 'OPTIMIZATION RESULTS\n';
  content += '-------------------\n';
  content += `Original Score: ${data.originalScore}/100\n`;
  content += `Optimized Score: ${data.optimizedScore}/100\n`;
  content += `Improvement: +${data.scoreImprovement} points\n\n`;
  
  // Optimized job posting
  content += 'OPTIMIZED JOB POSTING\n';
  content += '--------------------\n\n';
  content += plainText + '\n\n';
  
  // Applied improvements
  if (data.appliedImprovements && data.appliedImprovements.length > 0) {
    content += 'APPLIED IMPROVEMENTS\n';
    content += '------------------\n\n';
    
    data.appliedImprovements.forEach((improvement, index) => {
      const impactText = improvement.impactPoints ? ` (+${improvement.impactPoints} points)` : '';
      
      // Try multiple possible description fields
      const description = improvement.description || 
                         improvement.change || 
                         improvement.details || 
                         improvement.text ||
                         'No description available';
      
      content += `${index + 1}. ${improvement.category}${impactText}\n`;
      content += `   ${description}\n\n`;
    });
  }
  
  // What's working well
  if (data.workingWell && data.workingWell.length > 0) {
    content += 'WHAT\'S WORKING WELL\n';
    content += '------------------\n\n';
    
    data.workingWell.forEach((item, index) => {
      content += `${index + 1}. ${item}\n`;
    });
  }
  
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_optimized.txt`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

/**
 * Main export function
 */
export async function exportReport(format: ExportFormat, data: ExportData): Promise<void> {
  try {
    switch (format) {
      case 'docx':
        await exportAsDocx(data);
        break;
      case 'pdf':
        await exportAsPdf(data);
        break;
      case 'txt':
        await exportAsText(data);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
