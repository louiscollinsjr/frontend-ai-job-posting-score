// src/lib/types/report.ts

// Frontend-facing report shape used in the UI and components.
// Note: This type intentionally mixes casing styles.
// - snake_case fields mirror the backend response keys (e.g., job_title, total_score)
// - camelCase fields like userId and savedAt are frontend-only conveniences
export type Report = {
    id?: string; // Supabase will auto-generate if serial or UUID
    userId?: string;
    job_title?: string;
    job_body?: string;
    feedback?: string;
    total_score?: number;
    categories?: Record<string, any>; // or a more specific type if you want
    recommendations?: string[];
    red_flags?: string[];
    savedAt?: string; // ISO date string
    source?: string; // e.g. 'guest_conversion'
    original_report?: any; // jsonb type in Supabase (can store any valid JSON)
    // Some records may include a backend-emitted report_id separate from id
    report_id?: string;
    // Optional fields used when an optimization has been applied
    improved_text?: string;
    // UI convenience fields (enhanced on the client after loading)
    hasRewrite?: boolean;
    rewriteVersion?: number;
    lastRewriteDate?: string;
    latestImprovedText?: string;
    // Some APIs may return JSON-LD alongside the report
    json_ld?: any;
};

// Database shape for Supabase operations. Field names match DB columns.
// Note: `savedat` is a legacy column name (no underscore) in the database.
export type SupabaseReport = {
    id?: string;
    userid?: string | null;
    job_title?: string;
    job_body?: string;
    feedback?: string;
    total_score?: number;
    categories?: Record<string, any>;
    recommendations?: string[];
    red_flags?: string[];
    savedat?: string; // existing column name without underscore
    source?: string;
    original_report?: any; // jsonb type in Supabase
};