export function getScoreColorHex100(score: number, max = 100): string {
  const pct = score / max;
  if (pct >= 0.85) return '#16a34a'; // green-600
  if (pct >= 0.6) return '#ffe020'; // yellow-600
  if (pct >= 0.4) return '#ff6900'; // orange-500
  return '#dc2626'; // red-600
}

// Tailwind class helpers aligned with the same thresholds
export function getScoreBarClass100(score: number, max = 100): string {
  const pct = score / max;
  if (pct >= 0.85) return 'bg-green-600';
  if (pct >= 0.6) return 'bg-yellow-300';
  if (pct >= 0.4) return 'bg-orange-500';
  return 'bg-red-600';
}

export function getTextColorClass100(score: number, max = 100): string {
  const pct = score / max;
  if (pct >= 0.85) return 'text-green-600';
  if (pct >= 0.6) return 'text-yellow-600';
  if (pct >= 0.4) return 'text-orange-500';
  return 'text-red-600';
}
