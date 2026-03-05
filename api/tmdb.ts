import { ENV } from './environments';

export default async function handler(req: any, res: any) {

  // Only allow GET requests (TMDB reads)
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { endpoint, ...queryParams } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  // Build TMDB URL
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) params.append(key, value as string);
  }
  params.append('api_key', ENV.TMDB_API_KEY);

  const url = `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Cache responses for 5 minutes (CDN/browser)
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (error: any) {
    console.error('TMDb Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from TMDb', details: error.message });
  }
}
