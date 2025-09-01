/**
 * Text Diffing Service
 * Provides functionality to generate structured diffs between original and improved text
 */

export class DiffService {
  /**
   * Generate a diff between original and improved text
   * @param {string} originalText - The original text
   * @param {string} improvedText - The improved text
   * @returns {Array} Array of diff objects with type and value
   */
  static generateDiff(originalText, improvedText) {
    if (!originalText || !improvedText) {
      return [{ type: 'equal', value: improvedText || originalText || '' }];
    }

    // Simple word-level diffing algorithm
    const originalWords = originalText.split(/(\s+)/);
    const improvedWords = improvedText.split(/(\s+)/);
    
    return this._computeDiff(originalWords, improvedWords);
  }

  /**
   * Compute diff using dynamic programming approach
   * @private
   */
  static _computeDiff(original, improved) {
    const m = original.length;
    const n = improved.length;
    
    // Create DP table
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Fill DP table - Longest Common Subsequence
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (original[i - 1] === improved[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to build diff
    const result = [];
    let i = m, j = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && original[i - 1] === improved[j - 1]) {
        result.unshift({ type: 'equal', value: original[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'addition', value: improved[j - 1] });
        j--;
      } else if (i > 0) {
        result.unshift({ type: 'deletion', value: original[i - 1] });
        i--;
      }
    }
    
    return this._mergeContinuousChanges(result);
  }

  /**
   * Merge continuous changes of the same type for better UX
   * @private
   */
  static _mergeContinuousChanges(diff) {
    if (!diff.length) return diff;
    
    const merged = [];
    let current = { ...diff[0] };
    
    for (let i = 1; i < diff.length; i++) {
      const next = diff[i];
      
      if (current.type === next.type) {
        current.value += next.value;
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    
    merged.push(current);
    return merged;
  }

  /**
   * Apply a specific change to the text
   * @param {Array} diff - The current diff array
   * @param {number} changeIndex - Index of the change to apply
   * @param {string} action - 'accept' or 'reject'
   * @returns {string} The updated text
   */
  static applyChange(diff, changeIndex, action) {
    const updatedDiff = [...diff];
    const change = updatedDiff[changeIndex];
    
    if (!change) return this._diffToText(updatedDiff);
    
    if (action === 'accept') {
      if (change.type === 'addition') {
        // Accept addition - convert to equal
        updatedDiff[changeIndex] = { type: 'equal', value: change.value };
      } else if (change.type === 'deletion') {
        // Accept deletion - remove from text
        updatedDiff.splice(changeIndex, 1);
      }
    } else if (action === 'reject') {
      if (change.type === 'addition') {
        // Reject addition - remove from text
        updatedDiff.splice(changeIndex, 1);
      } else if (change.type === 'deletion') {
        // Reject deletion - convert to equal (restore)
        updatedDiff[changeIndex] = { type: 'equal', value: change.value };
      }
    }
    
    return this._diffToText(updatedDiff);
  }

  /**
   * Convert diff array back to text
   * @private
   */
  static _diffToText(diff) {
    return diff
      .filter(item => item.type !== 'deletion')
      .map(item => item.value)
      .join('');
  }

  /**
   * Get statistics about the diff
   * @param {Array} diff - The diff array
   * @returns {Object} Statistics about additions, deletions, and unchanged text
   */
  static getDiffStats(diff) {
    const stats = {
      additions: 0,
      deletions: 0,
      unchanged: 0,
      totalChanges: 0
    };

    diff.forEach(item => {
      const wordCount = item.value.trim().split(/\s+/).length;
      
      if (item.type === 'addition') {
        stats.additions += wordCount;
        stats.totalChanges++;
      } else if (item.type === 'deletion') {
        stats.deletions += wordCount;
        stats.totalChanges++;
      } else {
        stats.unchanged += wordCount;
      }
    });

    return stats;
  }
}
