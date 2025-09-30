# Messaging Configuration

This directory contains configuration for application messaging tone and style.

## Message Modes

The application supports two message modes for progress updates and user-facing text:

### **Playful Mode** (Default)
Lighthearted, friendly, and engaging messaging that creates a warm user experience.

**Example steps:**
- "Warming up the engines..."
- "Fetching your job post..."
- "Crunching the numbers..."
- "Wrapping it up with a bow..."

**Best for:**
- Beta testers
- General users
- Freemium plans
- Casual/startup environments

### **Professional Mode**
Formal, enterprise-appropriate messaging that conveys competence and reliability.

**Example steps:**
- "Preparing analysis..."
- "Reviewing job details..."
- "Generating insights..."
- "Finalizing report..."

**Best for:**
- Enterprise customers
- Corporate environments
- Professional services
- B2B contexts

## How to Toggle Modes

### Option 1: Global Application-Wide Change

Edit `/src/lib/config/messaging.ts`:

```typescript
export const MESSAGE_MODE: MessageMode = 'professional'; // or 'playful'
```

### Option 2: Dynamic Based on User Context

Use the `getMessageMode()` function to determine mode based on user properties:

```typescript
import { getMessageMode } from '$lib/config/messaging';

// In your component
const mode = getMessageMode({
  plan: user.plan, // 'free' | 'pro' | 'enterprise'
  domain: user.email.split('@')[1],
  preference: user.settings?.messageMode
});

const steps = getStepsForInputType('url', mode);
```

### Option 3: User Preference Setting

Allow users to choose their preferred mode in settings:

```typescript
// In user settings component
<select bind:value={userPreference}>
  <option value="playful">Friendly & Playful</option>
  <option value="professional">Professional</option>
</select>
```

## Customization

### Adding Enterprise Domains

Edit the `isEnterpriseDomain()` function in `messaging.ts`:

```typescript
const enterpriseDomains = [
  'acmecorp.com',
  'bigcompany.io',
  'enterprise-client.com'
];
```

### Adding New Message Modes

1. Update the `MessageMode` type in `/src/lib/utils/analysisSteps.ts`
2. Add new label properties to `StepDefinition` interface
3. Update the `toAnalysisSteps()` function to handle the new mode
4. Update `messaging.ts` to support the new mode

## Implementation Details

- **Default Mode**: Playful (set in `MESSAGE_MODE` constant)
- **Enterprise Override**: Automatically switches to professional for enterprise plans
- **User Preference**: Takes priority over all other settings
- **Domain Detection**: Checks email domain against enterprise list

## Testing Different Modes

To test both modes during development:

```typescript
// Temporarily override in component
const steps = getStepsForInputType('url', 'professional');
```

Or use environment variables:

```typescript
const mode = import.meta.env.DEV ? 'playful' : 'professional';
```
