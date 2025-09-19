import { supabase } from '$lib/supabaseClient';
import { formatReportForDB } from '$lib/utils/reportMapper';
import type { Report } from '$lib/types/report';
import { browser } from '$app/environment';

export class ReportsAPI {
  // Load report by ID with optimization data
  static async loadById(reportId: string): Promise<Report | null> {
    if (!reportId || typeof reportId !== 'string') {
      throw new Error('Invalid report ID provided');
    }

    // Load base report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      throw new Error(`Report not found: ${reportError?.message || 'Unknown error'}`);
    }

    // Load optimization data (handle gracefully if table doesn't exist)
    let latestOptimization = null;
    try {
      const { data, error } = await supabase
        .from('optimizations')
        .select('*')
        .eq('report_id', reportId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        latestOptimization = data[0];
        if (import.meta.env.DEV) {
          console.log('[ReportsAPI] Found optimization data:', latestOptimization);
        }
      } else if (import.meta.env.DEV && error) {
        console.warn('Could not query optimizations table:', error.message);
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('optimizations table may not exist or have RLS issues:', msg);
      }
    }

    // Enhance report with optimization data
    const enhancedReport: Report = {
      ...report,
      hasRewrite: !!(latestOptimization || report.improved_text),
      latestImprovedText: latestOptimization?.optimized_text || report.improved_text,
      rewriteVersion: latestOptimization?.version_number || (report.improved_text ? 1 : 0),
      lastRewriteDate: latestOptimization?.created_at || report.savedat,
      optimizationData: latestOptimization || null
    };

    if (import.meta.env.DEV) {
      console.log('Successfully loaded report:', enhancedReport.id);
      if (enhancedReport.hasRewrite) {
        console.log('Report has rewrite version:', enhancedReport.rewriteVersion);
      }
    }

    return enhancedReport;
  }

  // Save report to database
  static async save(report: any, userId: string | null): Promise<Report> {
    const formattedReport = formatReportForDB(report, userId);
    
    const { data, error } = await supabase
      .from('reports')
      .insert([formattedReport])
      .select('id, json_ld, job_title, job_body, feedback, total_score')
      .single();
    
    if (error) throw error;
    
    if (import.meta.env.DEV) {
      console.log('Report saved successfully with ID:', data.id);
    }
    
    return data;
  }
}

export interface GuestReport {
  id: string;
  timestamp: number;
  data: any;
  job_title?: string;
  company_name?: string;
  url?: string;
  overallScore?: number;
  shortUrl?: string;
}

export interface GuestReportSummary {
  id: string;
  timestamp: number;
  job_title?: string;
  company_name?: string;
  overallScore?: number;
  shortUrl?: string;
}

// Enhanced guest report localStorage utilities
export class GuestReportsAPI {
  private static STORAGE_KEY = 'jobpostscore_guest_report';
  private static HISTORY_KEY = 'jobpostscore_guest_history';
  private static MAX_GUEST_REPORTS = 5;

  static save(report: any): boolean {
    if (!browser) {
      console.warn('[GuestReportsAPI] Not in browser environment');
      return false;
    }
    
    try {
      console.log('[GuestReportsAPI] Attempting to save report:', report);
      
      const guestReport: GuestReport = {
        id: report.id || report.report_id || Date.now().toString(),
        timestamp: Date.now(),
        data: report,
        job_title: report.job_title,
        company_name: report.company_name,
        url: report.job_url,
        overallScore: report.overallScore || report.total_score,
        shortUrl: this.generateShortUrl(report.id || report.report_id)
      };

      console.log('[GuestReportsAPI] Prepared guest report:', guestReport);

      // Save as current report
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(guestReport));
      console.log('[GuestReportsAPI] Saved to localStorage with key:', this.STORAGE_KEY);
      
      // Add to history
      this.saveToHistory(guestReport);
      
      console.log('[GuestReportsAPI] Saved guest report successfully:', guestReport.id);
      return true;
    } catch (e) {
      console.error('Failed to save guest report:', e);
      return false;
    }
  }

  static load(): any | null {
    if (!browser) return null;
    
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      console.log('[GuestReportsAPI] Loading from localStorage, raw:', raw);
      
      if (raw) {
        const guestReport: GuestReport = JSON.parse(raw);
        console.log('[GuestReportsAPI] Parsed guest report:', guestReport);
        
        // Check if report is expired (24 hours for current report)
        const isExpired = Date.now() - guestReport.timestamp > 24 * 60 * 60 * 1000;
        if (isExpired) {
          console.log('[GuestReportsAPI] Report expired, clearing');
          this.clear();
          return null;
        }
        
        console.log('[GuestReportsAPI] Loaded guest report:', guestReport.id);
        return guestReport.data;
      }
      console.log('[GuestReportsAPI] No report found in localStorage');
      return null;
    } catch (e) {
      console.error('Failed to load guest report:', e);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      if (import.meta.env.DEV) {
        console.log('[GuestReportsAPI] Cleared current guest report');
      }
    } catch (e) {
      console.warn('Failed to clear guest report:', e);
    }
  }

  static hasReport(): boolean {
    try {
      const report = this.load();
      return !!report;
    } catch (e) {
      return false;
    }
  }

  // Enhanced history management - now saves full report data
  private static saveToHistory(guestReport: GuestReport): void {
    try {
      let history = this.getFullHistory();
      
      // Remove existing report with same ID
      history = history.filter(h => h.id !== guestReport.id);
      
      // Add new report to beginning (save the full guest report with data)
      history.unshift(guestReport);
      
      // Keep only recent reports
      history = history.slice(0, this.MAX_GUEST_REPORTS);
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('[GuestReportsAPI] Failed to save to history:', error);
    }
  }

  // Get full history with report data (internal method)
  private static getFullHistory(): GuestReport[] {
    if (!browser) return [];
    
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      
      // Handle backward compatibility - check if we have old format (summaries) or new format (full reports)
      if (parsed.length === 0) return [];
      
      // Check the first item to determine format
      const firstItem = parsed[0];
      const isOldFormat = !firstItem.data; // Old format doesn't have 'data' property
      
      if (isOldFormat) {
        console.log('[GuestReportsAPI] Found old format history, converting to new format placeholders');
        // For old format, convert to new format but mark as incomplete
        // This allows the UI to show that reports exist, but they can't be viewed
        const summaries = parsed as GuestReportSummary[];
        const convertedReports: GuestReport[] = summaries.map(summary => ({
          id: summary.id,
          timestamp: summary.timestamp,
          data: null, // Mark as incomplete - no full data available
          job_title: summary.job_title,
          company_name: summary.company_name,
          overallScore: summary.overallScore,
          shortUrl: summary.shortUrl || '/results'
        }));
        
        return convertedReports;
      }
      
      // New format - proceed as normal
      const history: GuestReport[] = parsed;
      
      // Filter out expired reports (7 days for history)
      const validHistory = history.filter(report => {
        const isExpired = Date.now() - report.timestamp > 7 * 24 * 60 * 60 * 1000;
        return !isExpired;
      });
      
      // Update storage if we filtered anything
      if (validHistory.length !== history.length) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(validHistory));
      }
      
      return validHistory;
    } catch (error) {
      console.error('[GuestReportsAPI] Failed to load full history:', error);
      return [];
    }
  }

  static getHistory(): GuestReportSummary[] {
    if (!browser) return [];
    
    try {
      const fullHistory = this.getFullHistory();
      console.log('[GuestReportsAPI] Loading history from localStorage, full reports count:', fullHistory.length);
      
      // Convert full reports to summaries for display
      const summaries: GuestReportSummary[] = fullHistory.map(report => ({
        id: report.id,
        timestamp: report.timestamp,
        job_title: report.job_title,
        company_name: report.company_name,
        overallScore: report.overallScore,
        shortUrl: report.shortUrl
      }));
      
      console.log('[GuestReportsAPI] Returning history summaries:', summaries);
      return summaries;
    } catch (error) {
      console.error('[GuestReportsAPI] Failed to load history:', error);
      return [];
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      if (import.meta.env.DEV) {
        console.log('[GuestReportsAPI] Cleared all guest data');
      }
    } catch (error) {
      console.error('[GuestReportsAPI] Failed to clear all data:', error);
    }
  }

  // Load a specific report from history and set as current report
  static loadReportFromHistory(reportId: string): any | null {
    if (!browser) return null;
    
    try {
      console.log('[GuestReportsAPI] Looking for report in history:', reportId);
      
      // First try to find in current localStorage under the main storage key
      const currentRaw = localStorage.getItem(this.STORAGE_KEY);
      if (currentRaw) {
        const currentReport: GuestReport = JSON.parse(currentRaw);
        if (currentReport.id === reportId) {
          console.log('[GuestReportsAPI] Found report as current:', reportId);
          return currentReport.data;
        }
      }
      
      // Check full history for the report data
      const fullHistory = this.getFullHistory();
      const fullReport = fullHistory.find(r => r.id === reportId);
      
      if (fullReport) {
        console.log('[GuestReportsAPI] Found report in full history:', reportId);
        
        // Check if this is old format data (data is null)
        if (fullReport.data === null) {
          console.log('[GuestReportsAPI] Report is in old format - creating minimal report from summary');
          // Create a minimal report structure from the summary data we have
          const minimalReport = {
            id: fullReport.id,
            job_title: fullReport.job_title || 'Untitled Position',
            company_name: fullReport.company_name || '',
            total_score: fullReport.overallScore || 0,
            overallScore: fullReport.overallScore || 0,
            timestamp: fullReport.timestamp,
            isOldFormat: true, // Flag to indicate this is reconstructed from old data
            // Add minimal structure that the results page expects
            feedback: {
              overall: {
                score: fullReport.overallScore || 0,
                feedback: "This is a cached report from an earlier session. Generate a new analysis for detailed feedback."
              }
            }
          };
          
          this.setCurrentReport(minimalReport, fullReport.id);
          return minimalReport;
        }
        
        // Set it as the current report so it loads on the results page
        this.setCurrentReport(fullReport.data, fullReport.id);
        return fullReport.data;
      }
      
      console.log('[GuestReportsAPI] Report not found in history:', reportId);
      return null;
    } catch (error) {
      console.error('[GuestReportsAPI] Failed to load report from history:', error);
      return null;
    }
  }

  // Set a specific report as the current report (useful for viewing from history)
  static setCurrentReport(reportData: any, id: string): boolean {
    if (!browser) return false;
    
    try {
      const guestReport: GuestReport = {
        id: id,
        timestamp: Date.now(),
        data: reportData,
        job_title: reportData.job_title,
        company_name: reportData.company_name,
        url: reportData.job_url,
        overallScore: reportData.overallScore || reportData.total_score,
        shortUrl: this.generateShortUrl(id)
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(guestReport));
      console.log('[GuestReportsAPI] Set report as current:', id);
      return true;
    } catch (error) {
      console.error('[GuestReportsAPI] Failed to set current report:', error);
      return false;
    }
  }

  // Utility methods
  private static generateShortUrl(_reportId: string): string {
    // For guest users we should navigate to the generic results page.
    // The results page will load the cached report from localStorage.
    return `/results`;
  }

  static getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  static getReportAge(): number | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      
      const guestReport: GuestReport = JSON.parse(raw);
      return Math.floor((Date.now() - guestReport.timestamp) / (1000 * 60));
    } catch (e) {
      return null;
    }
  }
}
