// src/lib/utils/reportMapper.ts

export function formatReportForDB(report: any, userId: string | null): any {
  const safeParse = (maybeJson: any, fallback: any) => {
    try {
      if (typeof maybeJson === 'string') return JSON.parse(maybeJson);
      if (maybeJson == null) return fallback;
      return maybeJson;
    } catch {
      return fallback;
    }
  };

  // Ensure jsonb/object types
  const parsedCategories = safeParse(report?.categories, {});
  const categories = parsedCategories && typeof parsedCategories === 'object' && !Array.isArray(parsedCategories)
    ? parsedCategories
    : {};

  const parsedRecommendations = safeParse(report?.recommendations, []);
  const recommendations = Array.isArray(parsedRecommendations) ? parsedRecommendations : [];

  const parsedRedFlags = safeParse(report?.red_flags, []);
  const red_flags = Array.isArray(parsedRedFlags) ? parsedRedFlags : [];

  // Ensure jsonb column gets an object, not a string
  const original_report = safeParse(report?.original_report ?? report, {});

  // Ensure all required fields are present and match DB schema
  return {
    userid: userId,
    job_title: report?.job_title || 'Untitled Job',
    job_body: report?.job_body || report?.content || '',
    feedback: report?.feedback || '',
    total_score: report?.total_score || 0,
    categories,
    recommendations,
    red_flags,
    savedat: new Date().toISOString(),
    source: report?.source || 'web_app',
    original_text: report?.job_body || report?.content || '',
    original_report
  };
}
