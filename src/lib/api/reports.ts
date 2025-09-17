import { supabase } from '$lib/supabaseClient';
import { formatReportForDB } from '$lib/utils/reportMapper';
import type { Report } from '$lib/types/report';

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

// Guest report localStorage utilities
export class GuestReportsAPI {
  private static STORAGE_KEY = 'guest_audit_report';
  private static TIMESTAMP_KEY = 'guest_audit_report_ts';

  static save(report: any): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(report));
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
      if (import.meta.env.DEV) {
        console.log('[GuestReportsAPI] Saved guest report to localStorage');
      }
      return true;
    } catch (e) {
      console.error('Failed to save guest report:', e);
      return false;
    }
  }

  static load(): any | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        if (import.meta.env.DEV) {
          console.log('[GuestReportsAPI] Loaded guest report from localStorage');
        }
        return JSON.parse(raw);
      }
      return null;
    } catch (e) {
      console.error('Failed to load guest report:', e);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
      if (import.meta.env.DEV) {
        console.log('[GuestReportsAPI] Cleared guest report cache');
      }
    } catch (e) {
      console.warn('Failed to clear guest report cache:', e);
    }
  }

  static hasReport(): boolean {
    try {
      return !!localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      return false;
    }
  }
}
