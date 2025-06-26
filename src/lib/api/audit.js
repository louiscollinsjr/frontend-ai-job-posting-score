/**
 * API utilities for the job posting audit functionality
 * In a real implementation, this would connect to backend services
 */

/**
 * Submit a job posting for audit via URL
 * @param {string} url - The URL of the job posting to analyze 
 * @returns {Promise<object>} - The audit results
 */
export async function auditJobUrl(url) {
  try {
    const response = await fetch('https://ai-audit-api.fly.dev/api/audit-job-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error auditing job URL:', error);
    throw new Error('Failed to analyze job posting URL. Please try again.');
  }
}

/**
 * Submit job description text for audit
 * @param {string} text - The job description text to analyze
 * @returns {Promise<object>} - The audit results
 */
export async function auditJobText(text) {
  try {
    const response = await fetch('https://ai-audit-api.fly.dev/api/audit-job-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error auditing job text:', error);
    throw new Error('Failed to analyze job description. Please try again.');
  }
}

/**
 * Submit a job posting file (PDF/DOCX) for audit
 * @param {File} file - The file object containing the job posting to analyze
 * @returns {Promise<object>} - The audit results
 */
export async function auditJobFile(file) {
  try {
    // Create a FormData object for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // In a production environment, this would send the file to the backend
    // For now, we'll use the mock data for demonstration purposes
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use the generateMockResults function to create demo data
    // In production, we'd make an actual API call like this:
    // const response = await fetch('https://ai-audit-api.fly.dev/api/audit-job-file', {
    //   method: 'POST',
    //   body: formData
    // });
    // return await response.json();
    
    return generateMockResults('file', file.name);
  } catch (error) {
    console.error('Error auditing job file:', error);
    throw new Error('Failed to analyze job posting file. Please try again.');
  }
}

/**
 * Generate mock results for demonstration purposes
 * This function would be replaced with actual API responses
 * @param {string} type - The type of input ('url' or 'text')
 * @param {string} data - The input data
 * @returns {object} - Mock audit results
 */
function generateMockResults(type, data) {
  // Generate random scores between 60 and 95
  const inclusivityScore = Math.floor(Math.random() * 36) + 60;
  const clarityScore = Math.floor(Math.random() * 36) + 60;
  const effectivenessScore = Math.floor(Math.random() * 36) + 60;
  const overallScore = Math.floor((inclusivityScore + clarityScore + effectivenessScore) / 3);
  
  return {
    timestamp: new Date().toISOString(),
    inputType: type,
    inputData: data.substring(0, 100) + (data.length > 100 ? '...' : ''),
    overallScore,
    inclusivityScore,
    clarityScore,
    effectivenessScore,
    inclusivityNotes: 'Analysis found some gender-coded language that could be made more inclusive.',
    clarityNotes: 'Job requirements could be more clearly defined with specific examples.',
    effectivenessNotes: 'Adding more specific details about company culture would improve candidate attraction.',
    recommendations: [
      'Replace "he/she" with "they" or restructure sentences to avoid gendered pronouns.',
      'Specify required years of experience more clearly.',
      'Add more specific details about day-to-day responsibilities.',
      'Include information about work environment and team culture.',
      'Consider adding salary range for increased transparency.'
    ],
    highlights: [
      {
        text: 'Strong background required',
        suggestion: 'Specify what "strong background" means with clear, measurable criteria.'
      },
      {
        text: 'Looking for a rockstar developer',
        suggestion: 'Replace "rockstar" with more inclusive and specific language about skills needed.'
      },
      {
        text: 'Must be a team player',
        suggestion: 'Describe specifically how collaboration happens in your team.'
      }
    ]
  };
}

/**
 * Export audit results as text or PDF
 * @param {object} results - The audit results to export
 * @param {string} format - The export format ('text' or 'pdf')
 */
export async function exportResults(results, format) {
  if (format === 'text') {
    // Generate text version
    let exportText = `# ReachScore Job Posting Audit\n`;
    exportText += `Date: ${new Date(results.timestamp).toLocaleString()}\n\n`;
    exportText += `## Overall Score: ${results.overallScore}%\n\n`;
    exportText += `### Category Scores\n`;
    exportText += `- Inclusivity: ${results.inclusivityScore}% - ${results.inclusivityNotes}\n`;
    exportText += `- Clarity: ${results.clarityScore}% - ${results.clarityNotes}\n`;
    exportText += `- Effectiveness: ${results.effectivenessScore}% - ${results.effectivenessNotes}\n\n`;
    
    exportText += `### Recommendations\n`;
    results.recommendations.forEach((rec, index) => {
      exportText += `${index + 1}. ${rec}\n`;
    });
    
    exportText += `\n### Highlighted Issues\n`;
    results.highlights.forEach((highlight, index) => {
      exportText += `${index + 1}. "${highlight.text}" - ${highlight.suggestion}\n`;
    });
    
    // In a full implementation, this would trigger a download
    // For now, just log to console
    console.log('Export as text:', exportText);
    
    // Download text file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reachscore-audit.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } else if (format === 'pdf') {
    // In a real implementation, this would generate a PDF
    // For now, just log to console
    console.log('Export as PDF not fully implemented:', results);
    
    // Alert the user that PDF export is not implemented yet
    alert('PDF export will be available in a future update!');
    
    return false;
  }
}
