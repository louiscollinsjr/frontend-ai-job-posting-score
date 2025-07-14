export async function analyzeJob(inputType: string, inputData: any) {
  const response = await fetch('/api/analyze-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputType, inputData })
  });
  if (!response.ok) throw new Error('Failed to analyze job');
  return response.json();
}

export async function rewriteJob(jobId: string) {
  const response = await fetch(`/api/rewrite-job/${jobId}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to rewrite job');
  return response.json();
}
