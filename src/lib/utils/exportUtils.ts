import { Document, Paragraph, HeadingLevel, TextRun, AlignmentType, Packer } from 'docx';
import jsPDF from 'jspdf';

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
 * Strip HTML tags and convert to plain text (for DOCX and TXT exports)
 */
function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get text content (this automatically strips all HTML tags)
  let text = temp.textContent || temp.innerText || '';
  
  // Clean up extra whitespace
  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
  
  return text;
}

/**
 * Parse HTML and extract formatted content for PDF
 */
interface ParsedContent {
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isListItem?: boolean;
  isHeader?: boolean;
  headerLevel?: number;
}

function parseHtmlForPdf(html: string): ParsedContent[] {
  if (!html) return [];
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  const result: ParsedContent[] = [];
  
  // Helper to collect inline text with formatting
  function collectInlineText(node: Node, parentBold = false, parentItalic = false): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // For inline elements, just get text content
      if (['b', 'strong', 'i', 'em', 'span', 'a'].includes(tagName)) {
        return element.textContent || '';
      }
      
      // For br, add space
      if (tagName === 'br') {
        return ' ';
      }
      
      // For other elements, recurse through children
      let text = '';
      Array.from(element.childNodes).forEach(child => {
        text += collectInlineText(child, parentBold, parentItalic);
      });
      return text;
    }
    return '';
  }
  
  function processNode(node: Node, parentBold = false, parentItalic = false): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // Check for formatting tags
      const htmlElement = element as HTMLElement;
      const isBold = parentBold || tagName === 'b' || tagName === 'strong' || (tagName === 'span' && htmlElement.style?.fontWeight === 'bold');
      const isItalic = parentItalic || tagName === 'i' || tagName === 'em';
      
      // Handle block-level elements
      if (tagName === 'p' || tagName === 'div') {
        // Collect all inline text from this paragraph
        const paragraphText = collectInlineText(element, isBold, isItalic)
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (paragraphText) {
          result.push({
            text: paragraphText,
            isBold,
            isItalic
          });
          result.push({ text: '\n\n' });
        }
      } else if (tagName === 'li') {
        // Get the full text content of the list item
        const listItemText = collectInlineText(element, isBold, isItalic)
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (listItemText) {
          result.push({ 
            text: '• ' + listItemText, 
            isBold, 
            isItalic, 
            isListItem: true 
          });
          result.push({ text: '\n' });
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        Array.from(element.childNodes).forEach(child => processNode(child, isBold, isItalic));
        result.push({ text: '\n' });
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const level = parseInt(tagName[1]);
        const text = collectInlineText(element, true, isItalic)
          .replace(/\s+/g, ' ')
          .trim();
        
        if (text) {
          result.push({
            text,
            isHeader: true,
            headerLevel: level,
            isBold: true
          });
          result.push({ text: '\n\n' });
        }
      } else if (tagName === 'br') {
        result.push({ text: '\n' });
      } else {
        // For other block elements, process children
        Array.from(element.childNodes).forEach(child => processNode(child, isBold, isItalic));
      }
    }
  }
  
  Array.from(temp.childNodes).forEach(node => processNode(node));
  
  return result;
}

/**
 * Convert markdown text to plain text
 */
function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  
  // First strip any HTML tags
  let text = stripHtmlTags(markdown);
  
  // Then remove markdown formatting
  return text
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
 * Export as Word document (.docx) with HTML formatting preserved
 */
export async function exportAsDocx(data: ExportData): Promise<void> {
  const jobTitle = data.jobTitle || extractJobTitle(data.optimizedText);
  const parsedContent = parseHtmlForPdf(data.optimizedText);
  
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

  // Add formatted job posting content
  let currentParagraphRuns: TextRun[] = [];
  
  parsedContent.forEach((item, index) => {
    // Skip pure whitespace
    if (!item.text.trim() && item.text !== '\n' && item.text !== '\n\n') return;
    
    // Handle list items as separate paragraphs
    if (item.isListItem) {
      // Flush current paragraph if it has content
      if (currentParagraphRuns.length > 0) {
        children.push(new Paragraph({
          children: currentParagraphRuns,
          spacing: { after: 200 }
        }));
        currentParagraphRuns = [];
      }
      
      // Add list item as its own paragraph with indentation
      children.push(new Paragraph({
        children: [new TextRun({ text: item.text, bold: item.isBold, italics: item.isItalic })],
        spacing: { after: 100 },
        indent: { left: 360 } // Indent list items (360 twips = 0.25 inch)
      }));
      return;
    }
    
    // Handle paragraph breaks
    if (item.text === '\n\n' || item.isHeader) {
      // Flush current paragraph if it has content
      if (currentParagraphRuns.length > 0) {
        children.push(new Paragraph({
          children: currentParagraphRuns,
          spacing: { after: 200 }
        }));
        currentParagraphRuns = [];
      }
      
      // Add header as its own paragraph
      if (item.isHeader) {
        const headingLevel = item.headerLevel === 1 ? HeadingLevel.HEADING_1 :
                            item.headerLevel === 2 ? HeadingLevel.HEADING_2 :
                            item.headerLevel === 3 ? HeadingLevel.HEADING_3 :
                            HeadingLevel.HEADING_4;
        
        children.push(new Paragraph({
          children: [new TextRun({ text: item.text, bold: true })],
          heading: headingLevel,
          spacing: { before: 200, after: 200 }
        }));
      }
      return;
    }
    
    // Handle single line breaks
    if (item.text === '\n') {
      // Flush current paragraph and start new one
      if (currentParagraphRuns.length > 0) {
        children.push(new Paragraph({
          children: currentParagraphRuns,
          spacing: { after: 100 }
        }));
        currentParagraphRuns = [];
      }
      return;
    }
    
    // Add formatted text run
    currentParagraphRuns.push(new TextRun({
      text: item.text,
      bold: item.isBold,
      italics: item.isItalic
    }));
  });
  
  // Flush any remaining content
  if (currentParagraphRuns.length > 0) {
    children.push(new Paragraph({
      children: currentParagraphRuns,
      spacing: { after: 200 }
    }));
  }

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
  const blob = new Blob([buffer as unknown as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_optimized.docx`;
  link.click();

  URL.revokeObjectURL(link.href);
}

/**
 * Export as PDF with HTML formatting preserved
 */
export async function exportAsPdf(data: ExportData): Promise<void> {
  const jobTitle = data.jobTitle || extractJobTitle(data.optimizedText);
  const parsedContent = parseHtmlForPdf(data.optimizedText);
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 6;
  let yPosition = margin;

  // Helper function to add formatted text with word wrapping
  const addFormattedText = (content: ParsedContent[], defaultFontSize: number = 11) => {
    content.forEach(item => {
      // Skip empty text
      if (!item.text.trim() && item.text !== '\n' && item.text !== '\n\n') return;
      
      // Handle line breaks
      if (item.text === '\n') {
        yPosition += lineHeight;
        return;
      }
      if (item.text === '\n\n') {
        yPosition += lineHeight * 1.5;
        return;
      }
      
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Set font size based on header level
      let fontSize = defaultFontSize;
      if (item.isHeader) {
        fontSize = item.headerLevel === 1 ? 16 : item.headerLevel === 2 ? 14 : 12;
      }
      
      pdf.setFontSize(fontSize);
      
      // Set font style (bold/italic)
      let fontStyle = 'normal';
      if (item.isBold && item.isItalic) fontStyle = 'bolditalic';
      else if (item.isBold) fontStyle = 'bold';
      else if (item.isItalic) fontStyle = 'italic';
      
      pdf.setFont('helvetica', fontStyle);
      pdf.setTextColor('#000000');
      
      // Handle list items with hanging indent
      if (item.isListItem) {
        const bulletIndent = margin + 5;
        // Calculate text indent based on bullet width (• + space ≈ 8 units at 11pt)
        const bulletWidth = pdf.getTextWidth('• ');
        const textIndent = bulletIndent + bulletWidth;
        const textWidth = pageWidth - textIndent - margin;
        
        // Split text to fit width
        const lines = pdf.splitTextToSize(item.text, textWidth);
        lines.forEach((line: string, lineIndex: number) => {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage();
            yPosition = margin;
          }
          // First line starts at bullet indent, subsequent lines align under text
          const xPosition = lineIndex === 0 ? bulletIndent : textIndent;
          pdf.text(line, xPosition, yPosition);
          yPosition += lineHeight;
        });
      } else {
        // Regular text - no special indentation
        const textWidth = pageWidth - 2 * margin;
        const lines = pdf.splitTextToSize(item.text, textWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      }
    });
  };

  // Helper function for simple text (headers, scores, etc.)
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

    yPosition += 3;
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

  // Optimized job posting with formatting
  addText('Optimized Job Posting', 16, true);
  yPosition += 5;

  // Add formatted content
  addFormattedText(parsedContent);

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
