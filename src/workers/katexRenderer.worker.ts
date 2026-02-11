import katex from 'katex';

interface WorkerRequest {
  id: string;
  latex: string;
  displayMode: boolean;
}

interface WorkerResponse {
  id: string;
  html: string;
  error: boolean;
}

const cache = new Map<string, { html: string; error: boolean }>();
const CACHE_LIMIT = 800;

const renderFormula = (latex: string, displayMode: boolean) => {
  const key = `${displayMode ? '1' : '0'}:${latex}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  try {
    const html = katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
    });
    const result = { html, error: false };
    cache.set(key, result);
    if (cache.size > CACHE_LIMIT) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    return result;
  } catch {
    const result = { html: latex, error: true };
    cache.set(key, result);
    return result;
  }
};

self.addEventListener('message', (event) => {
  const request = event.data as WorkerRequest;
  if (!request || typeof request.latex !== 'string') {
    return;
  }

  const result = renderFormula(request.latex, request.displayMode);
  const response: WorkerResponse = {
    id: request.id,
    ...result,
  };
  self.postMessage(response);
});

export {};
