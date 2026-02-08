const WORKER_URL = "https://r2-upload-worker.cirpmanhome.workers.dev/";

export async function invokeWorker(endpoint: string, data: any) {
  const response = await fetch(`${WORKER_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Worker request failed: ${response.statusText}`);
  }

  return response.json();
}