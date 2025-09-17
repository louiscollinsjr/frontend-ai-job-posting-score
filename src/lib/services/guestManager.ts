import { GuestReportsAPI } from '$lib/api/reports';
import { resultsPageStore } from '$lib/stores/resultsPage';
import { browser } from '$app/environment';

export class GuestManager {
  private static promptTimeout: ReturnType<typeof setTimeout> | null = null;

  // Handle guest save prompting with delay
  static schedulePrompt(delayMs: number = 6000) {
    this.clearPrompt();
    
    this.promptTimeout = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.log('[GuestManager] Showing save dialog after timeout');
      }
      resultsPageStore.showSaveDialog();
    }, delayMs);
  }

  static clearPrompt() {
    if (this.promptTimeout) {
      clearTimeout(this.promptTimeout);
      this.promptTimeout = null;
    }
  }

  // Handle guest-to-authenticated migration
  static handleGuestLogin() {
    // Clear guest cache when user logs in from guest session
    GuestReportsAPI.clearAll();
    if (import.meta.env.DEV) {
      console.log('[GuestManager] Cleared all guest cache after login');
    }
  }

  // Check if arriving from guest login flow
  static isFromGuestLogin(): boolean {
    if (!browser) return false;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('from') === 'guest-login';
    } catch (e) {
      return false;
    }
  }

  // Auto-load guest report if available
  static loadGuestReport(): any | null {
    return GuestReportsAPI.load();
  }

  // Check if we should show the default demo data
  static shouldShowDefaultData(): boolean {
    if (!browser) return false;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('from') === 'default';
    } catch (e) {
      return false;
    }
  }

  // Save report and show success feedback
  static saveReportWithFeedback(report: any): boolean {
    const success = GuestReportsAPI.save(report);
    if (success && import.meta.env.DEV) {
      console.log('[GuestManager] Report saved with success feedback');
    }
    return success;
  }

  // Get guest report history for dashboard
  static getReportHistory() {
    return GuestReportsAPI.getHistory();
  }

  // Check if guest has any cached reports
  static hasAnyReports(): boolean {
    const current = GuestReportsAPI.hasReport();
    const history = GuestReportsAPI.getHistory();
    return current || history.length > 0;
  }

  // Get shareable URL for a report
  static getShareableUrl(reportId: string): string {
    if (!browser) return '';
    const baseUrl = window.location.origin;
    // For guest users, always link to the generic results page.
    // The results page will load the cached report from localStorage.
    return `${baseUrl}/results`;
  }

  // Cleanup all guest-related timeouts and state
  static cleanup() {
    this.clearPrompt();
  }
}
