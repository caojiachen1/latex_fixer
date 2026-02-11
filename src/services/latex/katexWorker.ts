type KatexResult = {
  html: string;
  error: boolean;
};

type WorkerResponse = KatexResult & { id: string };

type WorkerRequest = {
  id: string;
  latex: string;
  displayMode: boolean;
};

const worker = new Worker(new URL('../../workers/katexRenderer.worker.ts', import.meta.url), {
  type: 'module',
});

const pending = new Map<string, (value: KatexResult) => void>();
let requestId = 0;

worker.addEventListener('message', (event) => {
  const response = event.data as WorkerResponse;
  const resolve = pending.get(response.id);
  if (!resolve) {
    return;
  }
  resolve({ html: response.html, error: response.error });
  pending.delete(response.id);
});

worker.addEventListener('error', (event) => {
  console.error('KaTeX worker error', event.message);
});

export function renderKatexAsync(latex: string, displayMode: boolean = false): Promise<KatexResult> {
  const id = `${requestId++}`;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    const request: WorkerRequest = { id, latex, displayMode };
    worker.postMessage(request);
  });
}
