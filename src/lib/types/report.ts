// src/lib/types/report.ts

// The interface for frontend code (API/results payload). Note: uses snake_case to match backend payload
export type Report = {
    id?: string; // Supabase will auto-generate if serial or UUID
    userId: string;
    job_title: string;
    job_body: string;
    feedback: string;
    total_score: number;
    categories: Record<string, any>; // or a more specific type if you want
    recommendations: string[];
    red_flags: string[];
    savedAt: string; // ISO date string
    source: string; // e.g. 'guest_conversion'
    original_report: any; // jsonb type in Supabase (can store any valid JSON)
};

// The interface for Supabase database operations
// Matches the actual column names in the database (snake_case)
export type SupabaseReport = {
    id?: string;
    userid: string;
    job_title: string;
    job_body: string;
    feedback: string;
    total_score: number;
    categories: Record<string, any>;
    recommendations: string[];
    red_flags: string[];
    savedat: string; // existing column name without underscore
    source: string;
    original_report: any; // jsonb type in Supabase
};