/**
 * Messaging configuration for the application
 * Controls the tone and style of user-facing messages
 */

import type { MessageMode } from '$lib/utils/analysisSteps';

/**
 * Global message mode configuration
 * 
 * - 'playful': Lighthearted, friendly messaging (default for beta/general users)
 * - 'professional': Formal, enterprise-appropriate messaging (for enterprise customers)
 * 
 * To toggle modes:
 * 1. Change this constant for global application-wide changes
 * 2. Or detect user type/plan and set dynamically based on their account
 * 3. Or allow user preference in settings
 */
export const MESSAGE_MODE: MessageMode = 'playful';

/**
 * Determine message mode based on user context
 * This function can be enhanced to check user plan, domain, or preferences
 * 
 * Example usage:
 * ```typescript
 * const mode = getMessageMode(user);
 * const steps = getStepsForInputType('url', mode);
 * ```
 */
export function getMessageMode(userContext?: {
  plan?: 'free' | 'pro' | 'enterprise';
  domain?: string;
  preference?: MessageMode;
}): MessageMode {
  // User preference takes priority
  if (userContext?.preference) {
    return userContext.preference;
  }
  
  // Enterprise users get professional mode by default
  if (userContext?.plan === 'enterprise') {
    return 'professional';
  }
  
  // Enterprise domains get professional mode
  if (userContext?.domain && isEnterpriseDomain(userContext.domain)) {
    return 'professional';
  }
  
  // Default to global setting
  return MESSAGE_MODE;
}

/**
 * Check if a domain is considered enterprise
 * Add your enterprise customer domains here
 */
function isEnterpriseDomain(domain: string): boolean {
  const enterpriseDomains = [
    // Add enterprise customer domains here
    // 'acmecorp.com',
    // 'bigcompany.io',
  ];
  
  return enterpriseDomains.some(d => domain.endsWith(d));
}
