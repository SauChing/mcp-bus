// LTA DataMall v3 Bus Arrival API Proxy
// https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121

export default async function handler(req, res) {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, x-account-key');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=20');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const busStopCode = (req.query.BusStopCode || req.query.busStopCode || '04121').toString().trim();
  const serviceNo = (req.query.ServiceNo || req.query.serviceNo || '').toString().trim();

  // Allow key from process.env.LTA_ACCOUNT_KEY or incoming header
  const accountKey = process.env.LTA_ACCOUNT_KEY || req.headers['accountkey'] || req.headers['x-account-key'];

  const isRealKeyConfigured = Boolean(
    accountKey &&
    accountKey !== 'YOUR_LTA_ACCOUNT_KEY' &&
    accountKey !== 'MY_LTA_ACCOUNT_KEY' &&
    accountKey.trim().length > 5
  );

  if (isRealKeyConfigured) {
    try {
      let ltaUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
      if (serviceNo) {
        ltaUrl += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
      }

      const ltaResponse = await fetch(ltaUrl, {
        method: 'GET',
        headers: {
          AccountKey: accountKey.trim(),
          accept: 'application/json',
        },
      });

      if (ltaResponse.ok) {
        const data = await ltaResponse.json();
        return res.status(200).json({
          success: true,
          source: 'lta-datamall-v3',
          busStopCode,
          serviceNo: serviceNo || null,
          fetchedAt: new Date().toISOString(),
          Services: data.Services || [],
        });
      } else {
        const errorText = await ltaResponse.text();
        console.warn(`[LTA API Error] status ${ltaResponse.status}: ${errorText}`);
        // Fall back gracefully with error info
        return res.status(200).json({
          success: false,
          source: 'simulated-fallback',
          error: `LTA DataMall returned status ${ltaResponse.status}`,
          busStopCode,
          serviceNo: serviceNo || null,
          Services: generateMockLtaArrivals(busStopCode, serviceNo),
        });
      }
    } catch (err) {
      console.error('[LTA API Exception]', err);
      return res.status(200).json({
        success: false,
        source: 'simulated-fallback',
        error: err.message,
        busStopCode,
        serviceNo: serviceNo || null,
        Services: generateMockLtaArrivals(busStopCode, serviceNo),
      });
    }
  }

  // If LTA_ACCOUNT_KEY is not configured yet in Vercel environment variables,
  // return realistic Singapore LTA DataMall structure for BusStopCode 04121 (Old Parliament House)
  return res.status(200).json({
    success: true,
    source: 'simulated-demo',
    notice: 'Awaiting LTA_ACCOUNT_KEY in Vercel environment variables. Serving realistic LTA DataMall v3 mock.',
    busStopCode,
    serviceNo: serviceNo || null,
    fetchedAt: new Date().toISOString(),
    Services: generateMockLtaArrivals(busStopCode, serviceNo),
  });
}

function generateMockLtaArrivals(busStopCode, targetServiceNo) {
  const now = Date.now();

  const mockServices = [
    {
      ServiceNo: '7',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '01012',
        DestinationCode: '16009',
        EstimatedArrival: new Date(now + 130 * 1000).toISOString(), // ~2 min
        Latitude: '1.2954',
        Longitude: '103.8532',
        VisitNumber: '1',
        Load: 'SEA', // Seats Available
        Feature: 'WAB', // Wheelchair Accessible
        Type: 'SD', // Single Deck
      },
      NextBus2: {
        OriginCode: '01012',
        DestinationCode: '16009',
        EstimatedArrival: new Date(now + 490 * 1000).toISOString(), // ~8 min
        Latitude: '1.2912',
        Longitude: '103.8501',
        VisitNumber: '1',
        Load: 'SDA', // Standing Available
        Feature: 'WAB',
        Type: 'DD', // Double Deck
      },
      NextBus3: {
        OriginCode: '01012',
        DestinationCode: '16009',
        EstimatedArrival: new Date(now + 960 * 1000).toISOString(), // ~16 min
        Latitude: '1.2880',
        Longitude: '103.8450',
        VisitNumber: '1',
        Load: 'LSD', // Limited Standing
        Feature: 'WAB',
        Type: 'DD',
      },
    },
    {
      ServiceNo: '14',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '84009',
        DestinationCode: '17009',
        EstimatedArrival: new Date(now + 260 * 1000).toISOString(), // ~4 min
        Latitude: '1.2930',
        Longitude: '103.8510',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'DD',
      },
      NextBus2: {
        OriginCode: '84009',
        DestinationCode: '17009',
        EstimatedArrival: new Date(now + 680 * 1000).toISOString(), // ~11 min
        Latitude: '1.2890',
        Longitude: '103.8480',
        VisitNumber: '1',
        Load: 'SDA',
        Feature: 'WAB',
        Type: 'SD',
      },
      NextBus3: {
        OriginCode: '84009',
        DestinationCode: '17009',
        EstimatedArrival: new Date(now + 1200 * 1000).toISOString(),
        Latitude: '1.2850',
        Longitude: '103.8420',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'DD',
      },
    },
    {
      ServiceNo: '16',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '84009',
        DestinationCode: '10009',
        EstimatedArrival: new Date(now + 60 * 1000).toISOString(), // ~1 min
        Latitude: '1.2910',
        Longitude: '103.8525',
        VisitNumber: '1',
        Load: 'SDA',
        Feature: 'WAB',
        Type: 'SD',
      },
      NextBus2: {
        OriginCode: '84009',
        DestinationCode: '10009',
        EstimatedArrival: new Date(now + 420 * 1000).toISOString(), // ~7 min
        Latitude: '1.2870',
        Longitude: '103.8490',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'SD',
      },
      NextBus3: {
        OriginCode: '84009',
        DestinationCode: '10009',
        EstimatedArrival: new Date(now + 890 * 1000).toISOString(),
        Latitude: '1.2830',
        Longitude: '103.8440',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'SD',
      },
    },
    {
      ServiceNo: '36',
      Operator: 'GAS',
      NextBus: {
        OriginCode: '95009',
        DestinationCode: '95009',
        EstimatedArrival: new Date(now + 380 * 1000).toISOString(), // ~6 min
        Latitude: '1.2945',
        Longitude: '103.8540',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'SD',
      },
      NextBus2: {
        OriginCode: '95009',
        DestinationCode: '95009',
        EstimatedArrival: new Date(now + 840 * 1000).toISOString(), // ~14 min
        Latitude: '1.2900',
        Longitude: '103.8500',
        VisitNumber: '1',
        Load: 'SDA',
        Feature: 'WAB',
        Type: 'DD',
      },
      NextBus3: {
        OriginCode: '95009',
        DestinationCode: '95009',
        EstimatedArrival: new Date(now + 1350 * 1000).toISOString(),
        Latitude: '1.2860',
        Longitude: '103.8450',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'SD',
      },
    },
    {
      ServiceNo: '197',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '28009',
        DestinationCode: '22009',
        EstimatedArrival: new Date(now + 520 * 1000).toISOString(), // ~8 min
        Latitude: '1.2920',
        Longitude: '103.8515',
        VisitNumber: '1',
        Load: 'LSD', // Crowded
        Feature: 'WAB',
        Type: 'DD',
      },
      NextBus2: {
        OriginCode: '28009',
        DestinationCode: '22009',
        EstimatedArrival: new Date(now + 1040 * 1000).toISOString(), // ~17 min
        Latitude: '1.2880',
        Longitude: '103.8470',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'DD',
      },
      NextBus3: {
        OriginCode: '28009',
        DestinationCode: '22009',
        EstimatedArrival: new Date(now + 1580 * 1000).toISOString(),
        Latitude: '1.2840',
        Longitude: '103.8410',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'SD',
      },
    },
  ];

  if (targetServiceNo) {
    return mockServices.filter((s) => s.ServiceNo.toLowerCase() === targetServiceNo.toLowerCase());
  }

  return mockServices;
}
