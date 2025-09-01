/**
 * Job Post Analyzer Service
 * Provides client-side analysis of job posting text for readability, inclusivity, and SEO
 */

import { env } from '$env/dynamic/public';

export class JobPostAnalyzer {
  constructor() {
    this.apiBaseUrl = env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    if (typeof window === 'undefined') return null;
    
    // Try different possible auth token keys
    const tokenKeys = [
      'sb-zincimrcpvxtugvhimny-auth-token',
      'supabase.auth.token'
    ];
    
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const parsed = JSON.parse(token);
          return parsed.access_token || parsed;
        } catch {
          return token;
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
  async analyzeJobPost(text) {
    if (!text || typeof text !== 'string') {
      return this._getEmptyAnalysis();
    }

    try {
      const token = this.getAuthToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/v1/analyze-text`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform backend response to match expected frontend format
      return this._transformBackendResponse(data);
    } catch (error) {
      console.error('Failed to analyze job post via API:', error);
      // Fallback to client-side analysis
      return this._clientSideAnalysis(text);
    }
  }

  /**
   * Transform backend analysis response to frontend format
   */
  _transformBackendResponse(data) {
    const categories = {
      readability: {
        score: data.readability?.score || 0,
        feedback: data.readability?.feedback || []
      },
      inclusivity: {
        score: data.inclusivity?.score || 0,
        recommendations: data.inclusivity?.recommendations || []
      },
      seo: {
        score: data.seo?.score || 0,
        feedback: data.seo?.feedback || [],
        keywords: data.seo?.keywords || []
      },
      structure: {
        score: data.structure?.score || 0,
        feedback: data.structure?.feedback || []
      }
    };

    const allRecommendations = [
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
      metadata: data.metadata || {
        wordCount: 0,
        characterCount: 0,
        analysisDate: new Date().toISOString()
      }
    };
  }

  /**
   * Fallback client-side analysis when backend fails
   */
  _clientSideAnalysis(text) {
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
    const allRecommendations = [
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
        wordCount: text.trim().split(/\s+/).length,
        characterCount: text.length,
        analysisDate: new Date().toISOString()
      }
    };
  }

  /**
   * Analyze readability of the text
   * @private
   */
  _analyzeReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/);
    const syllables = this._countSyllables(text);
    
    // Simplified Flesch Reading Ease calculation
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    const gradeLevel = Math.max(1, Math.min(16, Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59)));
    
    let score = 85;
    const feedback = [];
    
    if (avgWordsPerSentence > 25) {
      score -= 15;
      feedback.push('Consider breaking down long sentences for better readability');
    }
    
    if (gradeLevel > 12) {
      score -= 10;
      feedback.push('Text complexity is quite high - consider simplifying language');
    }
    
    if (words.length < 100) {
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
  _analyzeInclusivity(text) {
    const lowerText = text.toLowerCase();
    let score = 90;
    const issuesFound = [];
    const recommendations = [];

    // Check for gendered language
    const genderedTerms = [
      { term: /\bhe\b/g, suggestion: 'they' },
      { term: /\bhis\b/g, suggestion: 'their' },
      { term: /\bhim\b/g, suggestion: 'them' },
      { term: /\bguys?\b/g, suggestion: 'team members' },
      { term: /\bmanpower\b/g, suggestion: 'workforce' }
    ];

    genderedTerms.forEach(({ term, suggestion }) => {
      const matches = text.match(term);
      if (matches) {
        score -= 10;
        issuesFound.push({
          type: 'gendered_language',
          term: matches[0],
          suggestion,
          count: matches.length
        });
        recommendations.push(`Replace "${matches[0]}" with "${suggestion}" for more inclusive language`);
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
  _analyzeSEO(text) {
    const words = text.toLowerCase().split(/\s+/);
    let score = 75;
    const feedback = [];
    const keywords = [];
    const missingKeywords = [];

    // Common job-related keywords to look for
    const importantKeywords = [
      'remote', 'hybrid', 'benefits', 'salary', 'experience', 
      'skills', 'team', 'growth', 'opportunity', 'company'
    ];

    // Check keyword presence
    importantKeywords.forEach(keyword => {
      if (words.includes(keyword)) {
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
  _analyzeStructure(text) {
    let score = 80;
    const feedback = [];

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
    if (!/[•\-\*]|\d+\./.test(text)) {
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
  static _countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;

    words.forEach(word => {
      // Remove punctuation
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;

      // Count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g);
      let syllables = vowelGroups ? vowelGroups.length : 1;

      // Adjust for silent e
      if (word.endsWith('e')) syllables--;
      
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
  _getEmptyAnalysis() {
    return {
      overallScore: 0,
      categories: {
        readability: { score: 0, feedback: [] },
        inclusivity: { score: 0, recommendations: [] },
        seo: { score: 0, feedback: [], keywords: [] },
        structure: { score: 0, feedback: [] }
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
  static compareAnalyses(beforeAnalysis, afterAnalysis) {
    return {
      overallScoreChange: afterAnalysis.overallScore - beforeAnalysis.overallScore,
      readabilityChange: afterAnalysis.readability.score - beforeAnalysis.readability.score,
      inclusivityChange: afterAnalysis.inclusivity.score - beforeAnalysis.inclusivity.score,
      seoChange: afterAnalysis.seo.score - beforeAnalysis.seo.score,
      structureChange: afterAnalysis.structure.score - beforeAnalysis.structure.score,
      wordCountChange: afterAnalysis.wordCount - beforeAnalysis.wordCount
    };
  }
}
