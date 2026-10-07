// Health check API handler compatible with Vercel Serverless and Express
export default function handler(req, res) {
  const ltaConfigured = Boolean(process.env.LTA_ACCOUNT_KEY && process.env.LTA_ACCOUNT_KEY !== 'YOUR_LTA_ACCOUNT_KEY');

  const healthData = {
    status: 'ok',
    service: 'PulseTransit LTA Integration API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    ltaConfigured: ltaConfigured,
    ltaApiStatus: ltaConfigured ? 'AccountKey active in environment' : 'Awaiting LTA_ACCOUNT_KEY configuration',
    supportedEndpoints: [
      '/api/health',
      '/api/bus-arrival?BusStopCode=04121',
      '/api/bus-arrival?BusStopCode=04121&ServiceNo=7'
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).json(healthData);
}
