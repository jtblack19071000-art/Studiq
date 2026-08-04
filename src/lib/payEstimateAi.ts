export class PayEstimateAiError extends Error {}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === 'string') return body.error;
  } catch {
    // fall through to generic message
  }
  return `Request failed with status ${response.status}.`;
}

export interface PayEstimate {
  estimatedHourlyRate: number;
  rangeLow: number;
  rangeHigh: number;
  reasoning: string;
}

export async function estimateHourlyPay(input: {
  jobTitle: string;
  employer?: string;
  location?: string;
}): Promise<PayEstimate> {
  const response = await fetch('/api/estimate-pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new PayEstimateAiError(await parseErrorResponse(response));
  }
  return response.json();
}
