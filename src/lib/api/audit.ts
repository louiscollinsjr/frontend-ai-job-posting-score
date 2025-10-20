import { supabase } from '../supabaseClient';
import { env } from '$env/dynamic/public';

type RequestTarget = Parameters<typeof fetch>[0];
type RequestOptions = NonNullable<Parameters<typeof fetch>[1]>;

export interface AuditHighlight {
  text: string;
  suggestion: string;
}

export interface AuditResult {
  timestamp?: string;
  inputType?: string;
  inputData?: string;
  overallScore?: number;
  inclusivityScore?: number;
  clarityScore?: number;
  effectivenessScore?: number;
  inclusivityNotes?: string;
  clarityNotes?: string;
  effectivenessNotes?: string;
  recommendations?: string[];
  highlights?: AuditHighlight[];
  [key: string]: any; // TODO: refine type
}

type AnalyzeResult = any; // TODO: refine type
type OptimizationResult = any; // TODO: refine type

interface JobData {
  id?: string;
  json_ld?: Record<string, unknown> | null; // TODO: refine type
  improvedText?: string;
  original_text?: string;
  [key: string]: any; // TODO: refine type
}

export type InputType = 'text' | 'url' | 'file';

interface ErrorPayload {
  message?: string;
  error?: string;
  [key: string]: any; // TODO: refine type
}

/**
 * API utilities for the job posting audit functionality
 * Connects to backend services deployed on Fly.io
 */

// API base URL (configurable)
const API_BASE_URL = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

// Helper: fetch with timeout + abort to avoid hanging requests
/**
 * @param {RequestTarget} resource
 * @param {RequestOptions} [options]
 * @param {number} [timeoutMs=30000]
 */
async function fetchWithTimeout(
  resource: RequestTarget,
  options: RequestOptions = {},
  timeoutMs = 30000
): Promise<Response> {
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
 * @returns {Promise<AuditResult>} - The audit results
 */
export async function auditJobUrl(url: string): Promise<AuditResult> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Add auth token if available
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/audit-job-post`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, useV2Pipeline: true })
    }, 150000); // 150 second timeout for V2 pipeline (accounts for cold start + browser + LLM)
    if (response.status === 408) {
      const timeoutPayload = await response.json().catch(() => null);
      throw Object.assign(new Error('Request timed out. Please check if your report was generated.'), {
        code: 408,
        payload: timeoutPayload
      });
    }

    // Handle anti-bot response from backend
    if (response.status === 403) {
      let payload: ErrorPayload | null = null;
      try {
        payload = (await response.json()) as ErrorPayload;
      } catch {
        payload = null;
      }
      if (payload?.error === 'site_protected') {
        throw new Error('This site is protected by anti-bot. Please paste the job text or upload a file instead.');
      }
      throw new Error('Access denied by target site. Please paste the job text or upload a file.');
    }
    if (!response.ok) {
      let payload: ErrorPayload | null = null;
      try {
        payload = (await response.json()) as ErrorPayload;
      } catch {
        payload = null;
      }
      const msg = payload?.message ?? payload?.error ?? `API error: ${response.status}`;
      throw new Error(msg);
    }
    return (await response.json()) as AuditResult;
  } catch (error) {
    const err = error as unknown;
    console.error('Error auditing job URL:', err);
    if (err instanceof Error && (err as any).code === 408) {
      throw err;
    }
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    const message = err instanceof Error ? err.message : 'Failed to analyze job posting URL. Please try again.';
    throw new Error(aborted ? 'Request timed out. Please try again.' : message);
  }
}

/**
 * Submit job description text for audit
 * @param {string} text - The job description text to analyze
 * @returns {Promise<AuditResult>} - The audit results
 */
export async function auditJobText(text: string): Promise<AuditResult> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Add auth token if available
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/audit-job-post`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, useV2Pipeline: true })
    }, 150000); // 150 second timeout for V2 pipeline (accounts for cold start + LLM)
    if (response.status === 408) {
      const timeoutPayload = await response.json().catch(() => null);
      throw Object.assign(new Error('Request timed out. Please check if your report was generated.'), {
        code: 408,
        payload: timeoutPayload
      });
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return (await response.json()) as AuditResult;
  } catch (error) {
    const err = error as unknown;
    console.error('Error auditing job text:', err);
    if (err instanceof Error && (err as any).code === 408) {
      throw err;
    }
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    throw new Error(aborted ? 'Request timed out. Please try again.' : 'Failed to analyze job description. Please try again.');
  }
}

/**
 * Submit a job posting file (PDF/DOCX) for audit
 * @param {File} file - The file object containing the job posting to analyze
 * @returns {Promise<AuditResult>} - The audit results
 */
export async function auditJobFile(file: File): Promise<AuditResult> {
  try {
    // Create a FormData object for file upload
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/audit-job-file`, {
      method: 'POST',
      body: formData,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return (await response.json()) as AuditResult;
  } catch (error) {
    const err = error as unknown;
    console.error('Error auditing job file:', err);
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    throw new Error(aborted ? 'Request timed out. Please try again.' : 'Failed to analyze job posting file. Please try again.');
  }
}

/**
 * Export audit results as text or PDF
 * @param {AuditResult} results - The audit results to export
 * @param {string} format - The export format ('text' or 'pdf')
 */
export async function exportResults(results: AuditResult, format: 'text' | 'pdf'): Promise<boolean> {
  if (format === 'text') {
    // Generate text version
    let exportText = `# JobPostScore Job Posting Audit\n`;
    exportText += `Date: ${results?.timestamp ? new Date(results.timestamp).toLocaleString() : new Date().toLocaleString()}\n\n`;
    exportText += `## Overall Score: ${typeof results?.overallScore === 'number' ? results.overallScore : 'N/A'}%\n\n`;
    exportText += `### Category Scores\n`;
    exportText += `- Inclusivity: ${results?.inclusivityScore ?? 'N/A'}% - ${results?.inclusivityNotes ?? 'N/A'}\n`;
    exportText += `- Clarity: ${results?.clarityScore ?? 'N/A'}% - ${results?.clarityNotes ?? 'N/A'}\n`;
    exportText += `- Effectiveness: ${results?.effectivenessScore ?? 'N/A'}% - ${results?.effectivenessNotes ?? 'N/A'}\n\n`;
    
    exportText += `### Recommendations\n`;
    if (Array.isArray(results?.recommendations)) {
      results.recommendations.forEach((rec, index) => {
        exportText += `${index + 1}. ${rec}\n`;
      });
    }
    
    exportText += `\n### Highlighted Issues\n`;
    if (Array.isArray(results?.highlights)) {
      results.highlights.forEach((highlight, index) => {
        exportText += `${index + 1}. "${highlight.text}" - ${highlight.suggestion}\n`;
      });
    }
    
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
    // TODO: Implement PDF export functionality
    // For now, just log to console
    console.log('Export as PDF not fully implemented:', results);

    // Alert the user that PDF export is not implemented yet
    alert('PDF export will be available in a future update!');
    
    return false;
  }

  return false;
}

/**
 * Submit a job posting for analysis through the unified endpoint
 * @param {string} inputType - Type of input ('text', 'url', or 'file') 
 * @param {string|File} inputData - The actual input data
 * @returns {Promise<AnalyzeResult>} - Complete analysis results including score, JSON-LD, etc.
 */
export async function analyzeJob(inputType: InputType, inputData: string | File): Promise<AnalyzeResult> {
  try {
    // If input is a file, handle it differently
    if (inputType === 'file' && inputData instanceof File) {
      const formData = new FormData();
      formData.append('file', inputData);
      formData.append('inputType', 'file');

      const headers: Record<string, string> = {};
      const session = await supabase.auth.getSession();
      if (session?.data?.session?.access_token) {
        headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/analyze-job/file`, {
        method: 'POST',
        body: formData,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return (await response.json()) as AnalyzeResult;
    }
    
    // Handle text or URL inputs
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
    
    return (await response.json()) as AnalyzeResult;
  } catch (error) {
    const err = error as unknown;
    console.error('Error analyzing job:', err);
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    const message = err instanceof Error ? err.message : 'Failed to analyze job posting. Please try again.';
    throw new Error(aborted ? 'Request timed out. Please try again.' : `Failed to analyze job posting. ${message}`);
  }
}

/**
 * Optimize a job posting to improve its score and visibility.
 * @param {string} reportId - The ID of the report to optimize.
 * @returns {Promise<OptimizationResult>} - The optimization results, including the new version.
 */
export async function optimizeJob(reportId: string): Promise<OptimizationResult> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
      const errorPayload = (await response
        .json()
        .catch(() => ({}))) as ErrorPayload | Record<string, unknown>;
      const message = (errorPayload as ErrorPayload).message || `API error: ${response.status}`;
      throw new Error(message);
    }

    return (await response.json()) as OptimizationResult;
  } catch (error) {
    const err = error as unknown;
    console.error('Error optimizing job:', err);
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    const message = err instanceof Error ? err.message : 'Failed to optimize job posting. Please try again.';
    throw new Error(aborted ? 'Request timed out. Please try again.' : `Failed to optimize job posting. ${message}`);
  }
}

/**
 * Download job posting as a text file
 * @param {JobData} job - Job object containing text and metadata
 * @param {string} [fileType='txt'] - Type of file to download (txt, json, jsonld)
 */
export function downloadJobPosting(job: JobData, fileType: 'txt' | 'json' | 'jsonld' = 'txt'): void {
  try {
    let content: string;
    let filename: string;
    let mimeType: string;
    
    switch (fileType) {
      case 'jsonld':
        content = JSON.stringify(job?.json_ld ?? {}, null, 2);
        filename = `job-posting-jsonld-${job?.id ?? 'unknown'}.json`;
        mimeType = 'application/ld+json';
        break;
      case 'json':
        content = JSON.stringify(job ?? {}, null, 2);
        filename = `job-posting-data-${job?.id ?? 'unknown'}.json`;
        mimeType = 'application/json';
        break;
      case 'txt':
      default:
        content = job?.improvedText || job?.original_text || '';
        filename = job?.id ? `job-posting-${job.id}.txt` : 'job-posting.txt';
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
    const err = error as unknown;
    console.error('Error downloading job posting:', err);
    const message = err instanceof Error ? err.message : 'Unknown error.';
    throw new Error(`Failed to download job posting. ${message}`);
  }
}
