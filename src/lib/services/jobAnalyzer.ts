/**
 * Job Post Analyzer Service
 * Provides client-side analysis of job posting text for readability, inclusivity, and SEO
 */

import { env } from '$env/dynamic/public';

type Recommendation = string;

type UnknownRecord = Record<string, unknown>;

interface ReadabilityAnalysis {
  score: number;
  gradeLevel: number;
  fleschScore: number;
  avgWordsPerSentence: number;
  feedback: string[];
}

interface InclusivityIssue {
  type: string;
  term: string;
  suggestion: string;
  count: number;
}

interface InclusivityAnalysis {
  score: number;
  issuesFound: InclusivityIssue[];
  recommendations: Recommendation[];
}

interface SeoAnalysis {
  score: number;
  keywords: string[];
  missingKeywords: string[];
  feedback: string[];
}

interface StructureAnalysis {
  score: number;
  feedback: string[];
}

interface AnalysisMetadata {
  wordCount: number;
  characterCount: number;
  analysisDate: string;
  source?: string;
  details?: UnknownRecord;
}

interface AnalysisCategories {
  readability: ReadabilityAnalysis;
  inclusivity: InclusivityAnalysis;
  seo: SeoAnalysis;
  structure: StructureAnalysis;
}

interface AnalysisResult {
  overallScore: number;
  categories: AnalysisCategories;
  recommendations: Recommendation[];
  keywords: string[];
  metadata: AnalysisMetadata;
}

interface BackendReadabilityData {
  score?: number;
  feedback?: string[];
  gradeLevel?: number;
  fleschScore?: number;
  avgWordsPerSentence?: number;
  details?: UnknownRecord;
}

interface BackendInclusivityData {
  score?: number;
  recommendations?: string[];
  issuesFound?: unknown;
  details?: UnknownRecord;
}

interface BackendSeoData {
  score?: number;
  feedback?: string[];
  keywords?: string[];
  missingKeywords?: string[];
  details?: UnknownRecord;
}

interface BackendStructureData {
  score?: number;
  feedback?: string[];
  details?: UnknownRecord;
}

interface BackendAnalysisResponse {
  overallScore?: number;
  readability?: BackendReadabilityData;
  inclusivity?: BackendInclusivityData;
  seo?: BackendSeoData;
  structure?: BackendStructureData;
  metadata?: Partial<AnalysisMetadata>;
  details?: UnknownRecord;
}

interface ComparisonCategory {
  score: number;
  details?: UnknownRecord;
}

interface ComparisonAnalysis {
  overallScore: number;
  readability: ComparisonCategory;
  inclusivity: ComparisonCategory;
  seo: ComparisonCategory;
  structure: ComparisonCategory;
  wordCount: number;
  details?: UnknownRecord;
}

interface ComparisonResult {
  overallScoreChange: number;
  readabilityChange: number;
  inclusivityChange: number;
  seoChange: number;
  structureChange: number;
  wordCountChange: number;
}

export class JobPostAnalyzer {
  private readonly apiBaseUrl: string;
  private static readonly REQUEST_TIMEOUT_MS = 45000;

  constructor() {
    const configuredBase = env.PUBLIC_API_BASE_URL?.trim();
    this.apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : 'https://ai-audit-api.fly.dev';
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try different possible auth token keys
    const tokenKeys: string[] = ['supabase.auth.token'];
    const supabaseUrl = env.PUBLIC_SUPABASE_URL?.trim();
    const projectRef = supabaseUrl?.replace(/^https?:\/\//, '').split('.')[0];
    if (projectRef) {
      tokenKeys.unshift(`sb-${projectRef}-auth-token`);
    }

    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const parsed = JSON.parse(token) as unknown;
          if (typeof parsed === 'object' && parsed !== null && 'access_token' in parsed) {
            const accessToken = (parsed as { access_token?: unknown }).access_token;
            if (typeof accessToken === 'string') {
              return accessToken;
            }
          }
          if (typeof parsed === 'string') {
            return parsed;
          }
        } catch (parseError) {
          console.warn(`Failed to parse auth token for key "${key}"`, parseError);
          if (token.trim()) {
            return token;
          }
          continue;
        }
      }
    }
    return null;
  }

  /**
   * Analyze job posting text using backend API
   * @param {string} text - The job posting text to analyze
   * @returns {Promise<Object>} Analysis results with score and recommendations
   */
  async analyzeJobPost(text: string): Promise<AnalysisResult> {
    if (!text || typeof text !== 'string') {
      return this._getEmptyAnalysis();
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return this._getEmptyAnalysis();
    }

    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), JobPostAnalyzer.REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${this.apiBaseUrl}/v1/analyze-text`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: trimmedText }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Unable to analyze job posting at this time.');
        }

        const rawData = await response.json();
        if (!this._isValidBackendResponse(rawData)) {
          throw new Error('Received unexpected response from analysis service.');
        }

        const data = rawData as BackendAnalysisResponse;
        
        // Transform backend response to match expected frontend format
        return this._transformBackendResponse(data);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Failed to analyze job post via API:', error);
      // Fallback to client-side analysis
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn('Analysis request aborted due to timeout. Falling back to client analysis.');
      }
      return this._clientSideAnalysis(trimmedText);
    }
  }

  /**
   * Transform backend analysis response to frontend format
   */
  private _transformBackendResponse(data: BackendAnalysisResponse): AnalysisResult {
    const categories: AnalysisCategories = {
      readability: {
        score: data.readability?.score ?? 0,
        gradeLevel: data.readability?.gradeLevel ?? 0,
        fleschScore: data.readability?.fleschScore ?? 0,
        avgWordsPerSentence: data.readability?.avgWordsPerSentence ?? 0,
        feedback: data.readability?.feedback ?? []
      },
      inclusivity: {
        score: data.inclusivity?.score ?? 0,
        issuesFound: this._sanitizeIssuesFound(data.inclusivity?.issuesFound),
        recommendations: data.inclusivity?.recommendations ?? []
      },
      seo: {
        score: data.seo?.score ?? 0,
        feedback: data.seo?.feedback ?? [],
        keywords: data.seo?.keywords ?? [],
        missingKeywords: data.seo?.missingKeywords ?? []
      },
      structure: {
        score: data.structure?.score ?? 0,
        feedback: data.structure?.feedback ?? []
      }
    };

    const allRecommendations: Recommendation[] = [
      ...(categories.readability.feedback || []),
      ...(categories.inclusivity.recommendations || []),
      ...(categories.seo.feedback || []),
      ...(categories.structure.feedback || [])
    ].filter(rec => rec && rec.length > 0);

    return {
      overallScore: data.overallScore || 0,
      categories,
      recommendations: allRecommendations,
      keywords: categories.seo.keywords,
      metadata: this._normalizeMetadata(data.metadata),
    };
  }

  private _normalizeMetadata(metadata?: Partial<AnalysisMetadata>): AnalysisMetadata {
    if (!metadata || typeof metadata !== 'object') {
      return this._emptyMetadata();
    }

    const wordCount = typeof metadata.wordCount === 'number' && metadata.wordCount >= 0 ? metadata.wordCount : 0;
    const characterCount = typeof metadata.characterCount === 'number' && metadata.characterCount >= 0 ? metadata.characterCount : 0;
    const analysisDate = typeof metadata.analysisDate === 'string' && metadata.analysisDate ? metadata.analysisDate : new Date().toISOString();

    const normalized: AnalysisMetadata = {
      wordCount,
      characterCount,
      analysisDate
    };

    if (metadata.source && typeof metadata.source === 'string') {
      normalized.source = metadata.source;
    }

    if (metadata.details && typeof metadata.details === 'object') {
      normalized.details = metadata.details as UnknownRecord;
    }

    return normalized;
  }

  private _emptyMetadata(): AnalysisMetadata {
    return {
      wordCount: 0,
      characterCount: 0,
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Fallback client-side analysis when backend fails
   */
  private _clientSideAnalysis(text: string): AnalysisResult {
    const readability = this._analyzeReadability(text);
    const inclusivity = this._analyzeInclusivity(text);
    const seo = this._analyzeSEO(text);
    const structure = this._analyzeStructure(text);

    // Calculate overall score
    const overallScore = Math.round(
      (readability.score * 0.25) + 
      (inclusivity.score * 0.35) + 
      (seo.score * 0.25) + 
      (structure.score * 0.15)
    );

    // Collect all recommendations
    const allRecommendations: Recommendation[] = [
      ...readability.feedback,
      ...inclusivity.recommendations,
      ...seo.feedback,
      ...structure.feedback
    ].filter(rec => rec && rec.length > 0);

    return {
      overallScore,
      categories: {
        readability,
        inclusivity,
        seo,
        structure
      },
      recommendations: allRecommendations,
      keywords: seo.keywords || [],
      metadata: {
        wordCount: this._countWords(text),
        characterCount: text.length,
        analysisDate: new Date().toISOString()
      }
    };
  }

  /**
   * Analyze readability of the text
   * @private
   */
  private _analyzeReadability(text: string): ReadabilityAnalysis {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const words = text.trim().split(/\s+/).filter(Boolean);
    const sentenceCount = sentences.length || 1;
    const wordCount = words.length || 1;
    const syllables = JobPostAnalyzer._countSyllables(text);
    
    // Simplified Flesch Reading Ease calculation
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = wordCount > 0 ? syllables / wordCount : 0;
    
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    const gradeLevel = Math.max(1, Math.min(16, Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59)));
    
    let score = 85;
    const feedback: string[] = [];
    
    if (avgWordsPerSentence > 25) {
      score -= 15;
      feedback.push('Consider breaking down long sentences for better readability');
    }
    
    if (gradeLevel > 12) {
      score -= 10;
      feedback.push('Text complexity is quite high - consider simplifying language');
    }
    
    if (wordCount < 100) {
      score -= 20;
      feedback.push('Job posting seems too brief - add more detail about role and requirements');
    }

    return {
      score: Math.max(0, score),
      gradeLevel,
      fleschScore: Math.round(fleschScore),
      avgWordsPerSentence: Math.round(avgWordsPerSentence),
      feedback: feedback.length ? feedback : ['Good readability and clarity']
    };
  }

  /**
   * Analyze inclusivity and bias in the text
   * @private
   */
  private _analyzeInclusivity(text: string): InclusivityAnalysis {
    const lowerText = text.toLowerCase();
    let score = 90;
    const issuesFound: InclusivityIssue[] = [];
    const recommendations: Recommendation[] = [];

    // Check for gendered language
    const genderedTerms = [
      { term: /\bhe\b/g, suggestion: 'they' },
      { term: /\bhis\b/g, suggestion: 'their' },
      { term: /\bhim\b/g, suggestion: 'them' },
      { term: /\bguys?\b/g, suggestion: 'team members' },
      { term: /\bmanpower\b/g, suggestion: 'workforce' }
    ];

    genderedTerms.forEach(({ term, suggestion }) => {
      const matches = [...text.matchAll(term)];
      if (matches.length > 0) {
        score -= 10;
        issuesFound.push({
          type: 'gendered_language',
          term: matches[0][0] ?? '',
          suggestion,
          count: matches.length
        });
        recommendations.push(`Replace "${matches[0][0] ?? ''}" with "${suggestion}" for more inclusive language`);
      }
    });

    // Check for potentially excluding language
    const excludingTerms = [
      'ninja', 'rockstar', 'guru', 'wizard', 'superstar'
    ];

    excludingTerms.forEach(term => {
      if (lowerText.includes(term)) {
        score -= 5;
        recommendations.push(`Consider replacing "${term}" with more professional descriptors`);
      }
    });

    // Check for aggressive language
    const aggressiveTerms = [
      'aggressive', 'dominate', 'crush', 'destroy', 'kill it'
    ];

    aggressiveTerms.forEach(term => {
      if (lowerText.includes(term)) {
        score -= 8;
        recommendations.push(`Replace aggressive language like "${term}" with collaborative terms`);
      }
    });

    return {
      score: Math.max(0, score),
      issuesFound,
      recommendations: recommendations.length ? recommendations : ['Good inclusive language usage']
    };
  }

  /**
   * Analyze SEO effectiveness
   * @private
   */
  private _analyzeSEO(text: string): SeoAnalysis {
    const words = (text.toLowerCase().match(/\b[\w'/-]+\b/g) ?? []);
    const wordSet = new Set(words);
    let score = 75;
    const feedback: string[] = [];
    const keywords: string[] = [];
    const missingKeywords: string[] = [];

    // Common job-related keywords to look for
    const importantKeywords = [
      'remote', 'hybrid', 'benefits', 'salary', 'experience', 
      'skills', 'team', 'growth', 'opportunity', 'company'
    ];

    // Check keyword presence
    importantKeywords.forEach(keyword => {
      if (wordSet.has(keyword)) {
        keywords.push(keyword);
        score += 2;
      } else {
        missingKeywords.push(keyword);
      }
    });

    // Check for location mention
    if (!/(remote|hybrid|office|location|city|state)/i.test(text)) {
      score -= 10;
      feedback.push('Consider mentioning work location or remote options');
    }

    // Check for company benefits
    if (!/(benefit|insurance|401k|pto|vacation|flexible)/i.test(text)) {
      score -= 5;
      feedback.push('Mention key benefits to attract candidates');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      keywords: keywords.slice(0, 8), // Top 8 found keywords
      missingKeywords: missingKeywords.slice(0, 5), // Top 5 missing
      feedback: feedback.length ? feedback : ['Good SEO optimization']
    };
  }

  /**
   * Analyze job posting structure
   * @private
   */
  private _analyzeStructure(text: string): StructureAnalysis {
    let score = 80;
    const feedback: string[] = [];

    // Check for common sections
    const sections = {
      'job description': /(job description|about the role|role overview)/i,
      'requirements': /(requirements|qualifications|you should have)/i,
      'responsibilities': /(responsibilities|you will|duties|what you'll do)/i,
      'benefits': /(benefits|perks|what we offer|compensation)/i,
      'company info': /(about us|company|our team|who we are)/i
    };

    Object.entries(sections).forEach(([section, regex]) => {
      if (!regex.test(text)) {
        score -= 10;
        feedback.push(`Consider adding a ${section} section`);
      }
    });

    // Check for bullet points or structure
    if (!/(^|\n)\s*(?:[-\*•]|\d+[.)]|[a-z]\))/i.test(text)) {
      score -= 15;
      feedback.push('Use bullet points or numbered lists to improve readability');
    }

    return {
      score: Math.max(0, score),
      feedback: feedback.length ? feedback : ['Well-structured job posting']
    };
  }

  /**
   * Count syllables in text (simplified algorithm)
   * @private
   */
  private static _countSyllables(text: string): number {
    if (typeof text !== 'string' || !text.trim()) {
      return 0;
    }

    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;

    words.forEach(word => {
      // Remove punctuation
      const sanitizedWord = word.replace(/[^a-z]/g, '');
      if (sanitizedWord.length === 0) return;

      // Count vowel groups
      const vowelGroups = sanitizedWord.match(/[aeiouy]+/g);
      let syllables = vowelGroups ? vowelGroups.length : 1;

      // Adjust for silent e
      if (sanitizedWord.endsWith('e')) syllables--;
      
      // Minimum of 1 syllable per word
      syllables = Math.max(1, syllables);
      
      totalSyllables += syllables;
    });

    return totalSyllables;
  }

  /**
   * Get empty analysis structure
   * @private
   */
  private _getEmptyAnalysis(): AnalysisResult {
    return {
      overallScore: 0,
      categories: {
        readability: {
          score: 0,
          gradeLevel: 0,
          fleschScore: 0,
          avgWordsPerSentence: 0,
          feedback: []
        },
        inclusivity: {
          score: 0,
          issuesFound: [],
          recommendations: []
        },
        seo: {
          score: 0,
          feedback: [],
          keywords: [],
          missingKeywords: []
        },
        structure: {
          score: 0,
          feedback: []
        }
      },
      recommendations: [],
      keywords: [],
      metadata: {
        wordCount: 0,
        characterCount: 0,
        analysisDate: new Date().toISOString()
      }
    };
  }

  /**
   * Compare two analyses and highlight improvements
   * @param {Object} beforeAnalysis - Analysis before changes
   * @param {Object} afterAnalysis - Analysis after changes
   * @returns {Object} Comparison results
   */
  static compareAnalyses(beforeAnalysis: ComparisonAnalysis, afterAnalysis: ComparisonAnalysis): ComparisonResult {
    if (!beforeAnalysis || !afterAnalysis) {
      throw new Error('Both analyses are required for comparison.');
    }

    return {
      overallScoreChange: afterAnalysis.overallScore - beforeAnalysis.overallScore,
      readabilityChange: afterAnalysis.readability.score - beforeAnalysis.readability.score,
      inclusivityChange: afterAnalysis.inclusivity.score - beforeAnalysis.inclusivity.score,
      seoChange: afterAnalysis.seo.score - beforeAnalysis.seo.score,
      structureChange: afterAnalysis.structure.score - beforeAnalysis.structure.score,
      wordCountChange: afterAnalysis.wordCount - beforeAnalysis.wordCount
    };
  }

  private _countWords(text: string): number {
    const matches = text.trim().match(/\b[\w'-]+\b/g);
    return matches ? matches.length : 0;
  }

  private _sanitizeIssuesFound(issues: unknown): InclusivityIssue[] {
    if (!Array.isArray(issues)) {
      return [];
    }

    return issues
      .map(issue => {
        if (typeof issue !== 'object' || issue === null) {
          return null;
        }

        const typedIssue = issue as Partial<InclusivityIssue> & UnknownRecord;
        const type = typeof typedIssue.type === 'string' ? typedIssue.type : 'unknown';
        const term = typeof typedIssue.term === 'string' ? typedIssue.term : '';
        const suggestion = typeof typedIssue.suggestion === 'string' ? typedIssue.suggestion : '';
        const count = typeof typedIssue.count === 'number' && Number.isFinite(typedIssue.count) ? typedIssue.count : 0;

        if (!term) {
          return null;
        }

        return {
          type,
          term,
          suggestion,
          count
        } satisfies InclusivityIssue;
      })
      .filter((issue): issue is InclusivityIssue => Boolean(issue));
  }

  private _isValidBackendResponse(response: unknown): response is BackendAnalysisResponse {
    if (typeof response !== 'object' || response === null) {
      return false;
    }

    const candidate = response as BackendAnalysisResponse;
    const hasValidOverall = candidate.overallScore === undefined || typeof candidate.overallScore === 'number';
    const hasValidMetadata = candidate.metadata === undefined || typeof candidate.metadata === 'object';
    return hasValidOverall && hasValidMetadata;
  }
}
