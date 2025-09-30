/**
 * Analysis step definitions and timing utilities
 * Provides user-friendly progress updates during job posting analysis
 * Supports both professional and playful messaging modes
 */

export type MessageMode = 'professional' | 'playful';

export interface AnalysisStep {
  id: string;
  label: string;
  estimatedDuration: number; // milliseconds
}

interface StepDefinition {
  id: string;
  professionalLabel: string;
  playfulLabel: string;
  estimatedDuration: number;
}

// Step definitions with both professional and playful labels
const URL_STEP_DEFINITIONS: StepDefinition[] = [
  { 
    id: 'launching', 
    professionalLabel: 'Preparing analysis...', 
    playfulLabel: 'Warming up the engines...', 
    estimatedDuration: 3000 
  },
  { 
    id: 'navigating', 
    professionalLabel: 'Reviewing job details...', 
    playfulLabel: 'Fetching your job post...', 
    estimatedDuration: 5000 
  },
  { 
    id: 'extracting', 
    professionalLabel: 'Evaluating content...', 
    playfulLabel: 'Gathering the details...', 
    estimatedDuration: 4000 
  },
  { 
    id: 'analyzing', 
    professionalLabel: 'Assessing structure...', 
    playfulLabel: 'Giving it a close read...', 
    estimatedDuration: 8000 
  },
  { 
    id: 'scoring', 
    professionalLabel: 'Generating insights...', 
    playfulLabel: 'Crunching the numbers...', 
    estimatedDuration: 10000 
  },
  { 
    id: 'finalizing', 
    professionalLabel: 'Finalizing report...', 
    playfulLabel: 'Polishing your report...', 
    estimatedDuration: 3000 
  }
];

const TEXT_STEP_DEFINITIONS: StepDefinition[] = [
  { 
    id: 'processing', 
    professionalLabel: 'Preparing text...', 
    playfulLabel: 'Dusting off the text...', 
    estimatedDuration: 2000 
  },
  { 
    id: 'analyzing', 
    professionalLabel: 'Assessing structure...', 
    playfulLabel: 'Reading between the lines...', 
    estimatedDuration: 8000 
  },
  { 
    id: 'scoring', 
    professionalLabel: 'Generating insights...', 
    playfulLabel: 'Running the score machine...', 
    estimatedDuration: 10000 
  },
  { 
    id: 'finalizing', 
    professionalLabel: 'Finalizing report...', 
    playfulLabel: 'Wrapping it up with a bow...', 
    estimatedDuration: 3000 
  }
];

const FILE_STEP_DEFINITIONS: StepDefinition[] = [
  { 
    id: 'uploading', 
    professionalLabel: 'Preparing file...', 
    playfulLabel: 'Catching your file...', 
    estimatedDuration: 2000 
  },
  { 
    id: 'extracting', 
    professionalLabel: 'Evaluating content...', 
    playfulLabel: 'Unpacking the contents...', 
    estimatedDuration: 3000 
  },
  { 
    id: 'analyzing', 
    professionalLabel: 'Assessing structure...', 
    playfulLabel: 'Taking a closer look...', 
    estimatedDuration: 8000 
  },
  { 
    id: 'scoring', 
    professionalLabel: 'Generating insights...', 
    playfulLabel: 'Doing the math...', 
    estimatedDuration: 10000 
  },
  { 
    id: 'finalizing', 
    professionalLabel: 'Finalizing report...', 
    playfulLabel: 'Finishing touches...', 
    estimatedDuration: 3000 
  }
];

/**
 * Convert step definitions to analysis steps based on message mode
 */
function toAnalysisSteps(definitions: StepDefinition[], mode: MessageMode): AnalysisStep[] {
  return definitions.map(def => ({
    id: def.id,
    label: mode === 'playful' ? def.playfulLabel : def.professionalLabel,
    estimatedDuration: def.estimatedDuration
  }));
}

// Export step arrays with default playful mode
export const URL_ANALYSIS_STEPS: AnalysisStep[] = toAnalysisSteps(URL_STEP_DEFINITIONS, 'playful');
export const TEXT_ANALYSIS_STEPS: AnalysisStep[] = toAnalysisSteps(TEXT_STEP_DEFINITIONS, 'playful');
export const FILE_ANALYSIS_STEPS: AnalysisStep[] = toAnalysisSteps(FILE_STEP_DEFINITIONS, 'playful');

/**
 * Progress manager for analysis steps
 * Automatically advances through steps based on estimated durations
 */
export class AnalysisProgressManager {
  private steps: AnalysisStep[];
  private currentStepIndex: number = 0;
  private timeoutId: number | null = null;
  private onStepChange: (step: AnalysisStep, index: number, total: number) => void;
  private isCompleted: boolean = false;

  constructor(
    steps: AnalysisStep[],
    onStepChange: (step: AnalysisStep, index: number, total: number) => void
  ) {
    this.steps = steps;
    this.onStepChange = onStepChange;
  }

  /**
   * Start the progress simulation
   */
  start() {
    this.currentStepIndex = 0;
    this.isCompleted = false;
    this.advanceToNextStep();
  }

  /**
   * Advance to the next step
   */
  private advanceToNextStep() {
    if (this.isCompleted || this.currentStepIndex >= this.steps.length) {
      return;
    }

    const currentStep = this.steps[this.currentStepIndex];
    this.onStepChange(currentStep, this.currentStepIndex, this.steps.length);

    // Schedule next step
    this.timeoutId = window.setTimeout(() => {
      this.currentStepIndex++;
      this.advanceToNextStep();
    }, currentStep.estimatedDuration);
  }

  /**
   * Skip to a specific step by ID
   */
  skipToStep(stepId: string) {
    const stepIndex = this.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1 && stepIndex > this.currentStepIndex) {
      this.clearTimeout();
      this.currentStepIndex = stepIndex;
      this.advanceToNextStep();
    }
  }

  /**
   * Complete the progress (stop advancing)
   */
  complete() {
    this.isCompleted = true;
    this.clearTimeout();
  }

  /**
   * Reset the progress manager
   */
  reset() {
    this.complete();
    this.currentStepIndex = 0;
    this.isCompleted = false;
  }

  /**
   * Clear any pending timeout
   */
  private clearTimeout() {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Get current progress percentage
   */
  getProgressPercentage(): number {
    return Math.round((this.currentStepIndex / this.steps.length) * 100);
  }
}

/**
 * Get the appropriate steps for the input type with optional mode override
 */
export function getStepsForInputType(
  inputType: 'url' | 'text' | 'file',
  mode: MessageMode = 'playful'
): AnalysisStep[] {
  const definitions = inputType === 'url' 
    ? URL_STEP_DEFINITIONS 
    : inputType === 'file' 
    ? FILE_STEP_DEFINITIONS 
    : TEXT_STEP_DEFINITIONS;
  
  return toAnalysisSteps(definitions, mode);
}

/**
 * Calculate total estimated duration for a set of steps
 */
export function getTotalEstimatedDuration(steps: AnalysisStep[]): number {
  return steps.reduce((total, step) => total + step.estimatedDuration, 0);
}
