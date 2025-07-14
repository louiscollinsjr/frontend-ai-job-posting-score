// src/lib/types/report.ts

// The interface using camelCase for frontend code
export type Report = {
    id?: string; // Supabase will auto-generate if serial or UUID
    userId: string;
    jobTitle: string;
    jobBody: string;
    feedback: string;
    totalScore: number;
    categories: Record<string, any>; // or a more specific type if you want
    recommendations: string[];
    redFlags: string[];
    savedAt: string; // ISO date string
    source: string; // e.g. 'guest_conversion'
    originalReport: any; // jsonb type in Supabase (can store any valid JSON)
};

// The interface using lowercase for Supabase database operations
// This matches the actual column names in the database
export type SupabaseReport = {
    id?: string;
    userid: string;
    jobtitle: string;
    jobbody: string;
    feedback: string;
    totalscore: number;
    categories: Record<string, any>;
    recommendations: string[];
    redflags: string[];
    savedat: string;
    source: string;
    originalreport: any; // jsonb type in Supabase
};