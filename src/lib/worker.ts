const WORKER_URL = "https://r2-upload-worker.cirpmanhome.workers.dev/";

export const worker = {
  async post(endpoint: string, data: any): Promise<Response> {
    const url = `${WORKER_URL}${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker request to ${url} failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  },
};
