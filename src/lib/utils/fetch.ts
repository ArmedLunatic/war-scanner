/**
 * fetchWithRetry — HTTP fetch with exponential backoff and timeout.
 */
export async function fetchWithRetry(
  url: string,
  opts: RequestInit = {},
  maxRetries = 3,
  timeoutMs = 15000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(timer);

      // Retry on server errors and rate-limiting
      if (res.status === 429 || res.status >= 500) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await sleep(backoffMs);
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }

      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await sleep(backoffMs);
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
