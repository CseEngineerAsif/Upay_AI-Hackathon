export interface PinApiResponse {
  valid?: boolean;
  success?: boolean;
  error?: string;
}

export async function readPinApiResponse(
  response: Response,
  operation: string
): Promise<PinApiResponse> {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(`${operation} returned an empty response (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(`${operation} returned an invalid JSON response (HTTP ${response.status}).`);
  }

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new Error(`${operation} returned an invalid response (HTTP ${response.status}).`);
  }

  const data = payload as Record<string, unknown>;
  return {
    valid: typeof data.valid === 'boolean' ? data.valid : undefined,
    success: typeof data.success === 'boolean' ? data.success : undefined,
    error: typeof data.error === 'string' ? data.error : undefined
  };
}
