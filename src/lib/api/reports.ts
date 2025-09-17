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

  // Enhanced history management
  private static saveToHistory(guestReport: GuestReport): void {
    try {
      let history = this.getHistory();
      
      // Remove existing report with same ID
      history = history.filter(h => h.id !== guestReport.id);
      
      // Add new report to beginning
      history.unshift({
        id: guestReport.id,
        timestamp: guestReport.timestamp,
        job_title: guestReport.job_title,
        company_name: guestReport.company_name,
        overallScore: guestReport.overallScore,
        shortUrl: guestReport.shortUrl
      });
      
      // Keep only recent reports
      history = history.slice(0, this.MAX_GUEST_REPORTS);
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('[GuestReportsAPI] Failed to save to history:', error);
    }
  }

  static getHistory(): GuestReportSummary[] {
    if (!browser) return [];
    
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      console.log('[GuestReportsAPI] Loading history from localStorage:', stored);
      
      if (!stored) return [];
      
      const history: GuestReportSummary[] = JSON.parse(stored);
      console.log('[GuestReportsAPI] Parsed history:', history);
      
      // Filter out expired reports (7 days for history)
      const validHistory = history.filter(report => {
        const isExpired = Date.now() - report.timestamp > 7 * 24 * 60 * 60 * 1000;
        return !isExpired;
      });
      
      // Update storage if we filtered anything
      if (validHistory.length !== history.length) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(validHistory));
        console.log('[GuestReportsAPI] Updated history after filtering expired reports');
      }
      
      console.log('[GuestReportsAPI] Returning history:', validHistory);
      return validHistory;
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
