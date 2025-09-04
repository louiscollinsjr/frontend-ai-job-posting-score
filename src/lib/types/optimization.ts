// Shared optimization-related types

export type AppliedImprovement = {
  category: string;
  description: string;
  impactPoints?: number;
  applied?: boolean;
  impact?: string;
  scoreContribution?: string;
};

export type PotentialImprovement = {
  category: string;
  description: string;
  potentialPoints?: number;
};

export type OptimizationData = {
  originalText: string;
  optimizedText: string;
  originalScore: number;
  optimizedScore: number;
  scoreImprovement: number;
  workingWell: string[];
  appliedImprovements: AppliedImprovement[];
  potentialImprovements: PotentialImprovement[];
};

// Shape we might receive directly from DB/API before mapping
export type RawOptimizationData = {
  change_log?: string | AppliedImprovement[];
  unaddressed_items?: string | PotentialImprovement[];
  workingWell?: string[];
  original_text_snapshot?: string;
  optimized_text?: string;
  original_score?: number;
  optimized_score?: number;
} & Record<string, unknown>;
