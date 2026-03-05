import { ENV } from './environments';

export default async function handler(req: any, res: any) {
  // Allow CORS if necessary
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { endpoint, ...queryParams } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const apiKey = ENV.TMDB_API_KEY;

  // Construct query string from remaining parameters
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) params.append(key, value as string);
  }
  params.append('api_key', apiKey);

  const url = `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('TMDb Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from TMDb', details: error.message });
  }
}
