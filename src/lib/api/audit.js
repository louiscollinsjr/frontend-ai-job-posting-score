import { supabase } from '../supabaseClient';
import { env } from '$env/dynamic/public';

/**
 * API utilities for the job posting audit functionality
 * Connects to backend services deployed on Fly.io
 */

// API base URL (configurable)
const API_BASE_URL = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

// Helper: fetch with timeout + abort to avoid hanging requests
async function fetchWithTimeout(resource, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(resource, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Submit a job posting for audit via URL
 * @param {string} url - The URL of the job posting to analyze 
 * @returns {Promise<object>} - The audit results
 */
export async function auditJobUrl(url) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    // Add auth token if available
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/audit-job-post`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, useV2Pipeline: true })
    });
    // Handle anti-bot response from backend
    if (response.status === 403) {
      let payload;
      try { payload = await response.json(); } catch {}
      if (payload?.error === 'site_protected') {
        throw new Error('This site is protected by anti-bot. Please paste the job text or upload a file instead.');
      }
      throw new Error('Access denied by target site. Please paste the job text or upload a file.');
    }
    if (!response.ok) {
      let payload;
      try { payload = await response.json(); } catch {}
      const msg = payload?.message || payload?.error || `API error: ${response.status}`;
      throw new Error(msg);
    }
    return await response.json();
  } catch (error) {
    console.error('Error auditing job URL:', error);
    const aborted = error?.name === 'AbortError';
    throw new Error(aborted ? 'Request timed out. Please try again.' : (error?.message || 'Failed to analyze job posting URL. Please try again.'));
  }
}

/**
 * Submit job description text for audit
 * @param {string} text - The job description text to analyze
 * @returns {Promise<object>} - The audit results
 */
export async function auditJobText(text) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    // Add auth token if available
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/audit-job-post`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, useV2Pipeline: true })
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error auditing job text:', error);
    const aborted = error?.name === 'AbortError';
    throw new Error(aborted ? 'Request timed out. Please try again.' : 'Failed to analyze job description. Please try again.');
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
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/audit-job-file`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error auditing job file:', error);
    const aborted = error?.name === 'AbortError';
    throw new Error(aborted ? 'Request timed out. Please try again.' : 'Failed to analyze job posting file. Please try again.');
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
    let exportText = `# JobPostScore Job Posting Audit\n`;
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
    a.download = 'JobPostScore-audit.txt';
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

/**
 * Submit a job posting for analysis through the unified endpoint
 * @param {string} inputType - Type of input ('text', 'url', or 'file') 
 * @param {string|File} inputData - The actual input data
 * @returns {Promise<object>} - Complete analysis results including score, JSON-LD, etc.
 */
export async function analyzeJob(inputType, inputData) {
  try {
    // If input is a file, handle it differently
    if (inputType === 'file' && inputData instanceof File) {
      const formData = new FormData();
      formData.append('file', inputData);
      formData.append('inputType', 'file');
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/analyze-job/file`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Handle text or URL inputs
    const headers = { 'Content-Type': 'application/json' };
    // Add auth token if available
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/analyze-job`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputType, inputData })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing job:', error);
    const aborted = error?.name === 'AbortError';
    throw new Error(aborted ? 'Request timed out. Please try again.' : `Failed to analyze job posting. ${error.message}`);
  }
}

/**
 * Optimize a job posting to improve its score and visibility.
 * @param {string} reportId - The ID of the report to optimize.
 * @returns {Promise<object>} - The optimization results, including the new version.
 */
export async function optimizeJob(reportId) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/v1/optimize-job`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ report_id: reportId })
    }, 120000); // 2 minute timeout for LLM optimization

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload.message || `API error: ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error('Error optimizing job:', error);
    const aborted = error?.name === 'AbortError';
    throw new Error(aborted ? 'Request timed out. Please try again.' : `Failed to optimize job posting. ${error.message}`);
  }
}

/**
 * Download job posting as a text file
 * @param {object} job - Job object containing text and metadata
 * @param {string} fileType - Type of file to download (txt, json, jsonld)
 */
export function downloadJobPosting(job, fileType = 'txt') {
  try {
    let content, filename, mimeType;
    
    switch (fileType) {
      case 'jsonld':
        content = JSON.stringify(job.json_ld, null, 2);
        filename = `job-posting-jsonld-${job.id}.json`;
        mimeType = 'application/ld+json';
        break;
      case 'json':
        content = JSON.stringify(job, null, 2);
        filename = `job-posting-data-${job.id}.json`;
        mimeType = 'application/json';
        break;
      case 'txt':
      default:
        content = job.improvedText || job.original_text;
        filename = `job-posting-${job.id}.txt`;
        mimeType = 'text/plain';
        break;
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading job posting:', error);
    throw new Error(`Failed to download job posting. ${error.message}`);
  }
}
