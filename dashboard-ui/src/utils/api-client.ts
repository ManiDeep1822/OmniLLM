let discoveredPort: string | null = null;

export async function findServerPort(): Promise<string> {
  if (discoveredPort) return discoveredPort;

  for (const port of [3000, 3001, 3002, 3003, 3004, 3005]) {
    try {
      const res = await fetch(`http://localhost:${port}/api/health`);
      if (res.ok) {
        discoveredPort = String(port);
        console.log(`Discovered LLM Gateway on port ${port}`);
        return discoveredPort;
      }
    } catch {
      // Ignore and try next port
    }
  }

  // Fallback to 3000 but don't cache it if it wasn't valid
  return '3000';
}

export async function getApiUrl(endpoint: string): Promise<string> {
  const port = await findServerPort();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `http://localhost:${port}${cleanEndpoint}`;
}
