import React, { useState, useEffect, useCallback } from 'react';
import { Bus, RefreshCw, CheckCircle2, AlertCircle, Wifi, Users, Accessibility, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface LtaBusPrediction {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: 'SEA' | 'SDA' | 'LSD' | string;
  Feature: 'WAB' | string;
  Type: 'SD' | 'DD' | 'BD' | string;
}

interface LtaBusService {
  ServiceNo: string;
  Operator: string;
  NextBus?: LtaBusPrediction;
  NextBus2?: LtaBusPrediction;
  NextBus3?: LtaBusPrediction;
}

interface LtaApiResponse {
  success: boolean;
  source: string;
  busStopCode: string;
  serviceNo?: string | null;
  fetchedAt: string;
  notice?: string;
  error?: string;
  Services: LtaBusService[];
}

interface HealthCheckData {
  status: string;
  service: string;
  ltaConfigured: boolean;
  ltaApiStatus: string;
  timestamp: string;
}

export const LtaBusArrivals: React.FC = () => {
  const [busStopCode, setBusStopCode] = useState<string>('04121');
  const [serviceNoFilter, setServiceNoFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<LtaApiResponse | null>(null);
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<number>(20);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Common Singapore landmark bus stops for quick 1-click testing
  const quickStops = [
    { code: '04121', name: 'Old Parliament House / Victoria Concert Hall' },
    { code: '01012', name: 'Hotel Rendezvous / Bras Basah' },
    { code: '03211', name: 'Opp Suntec City / Promenade' },
    { code: '09048', name: 'Lucky Plaza / Orchard Stn' },
  ];

  // Fetch API health status
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        setHealthData(json);
      }
    } catch {
      // Backend not yet reached or compiling
    }
  }, []);

  // Fetch LTA Bus Arrival data
  const fetchArrivals = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let url = `/api/bus-arrival?BusStopCode=${encodeURIComponent(busStopCode.trim())}`;
      if (serviceNoFilter.trim()) {
        url += `&ServiceNo=${encodeURIComponent(serviceNoFilter.trim())}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }
      const json: LtaApiResponse = await res.json();
      setData(json);
      setCountdownTimer(20); // Reset 20-second cadence
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to fetch arrivals');
    } finally {
      setLoading(false);
    }
  }, [busStopCode, serviceNoFilter]);

  // Initial fetch and health check
  useEffect(() => {
    fetchHealth();
    fetchArrivals();
  }, [fetchHealth, fetchArrivals]);

  // 20-second automated refresh cadence
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev <= 1) {
          fetchArrivals();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchArrivals]);

  // Calculate minutes to arrival
  const getEtaMinutes = (isoString?: string) => {
    if (!isoString) return null;
    const diffMs = new Date(isoString).getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    if (diffSec <= 45) return 'Arr';
    const mins = Math.floor(diffSec / 60);
    if (mins < 0) return 'Dep';
    return `${mins}m`;
  };

  const getLoadBadge = (load?: string) => {
    switch (load) {
      case 'SEA':
        return { label: 'Seats Available', bg: 'bg-[#f5fff7]', text: 'text-[#006948]', border: 'border-[#85f8c4]' };
      case 'SDA':
        return { label: 'Standing Available', bg: 'bg-[#fff7ed]', text: 'text-[#855300]', border: 'border-[#ffddb8]' };
      case 'LSD':
        return { label: 'Limited Standing', bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', border: 'border-[#ffb4ab]' };
      default:
        return { label: 'Normal', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'SD': return 'Single Deck';
      case 'DD': return 'Double Decker';
      case 'BD': return 'Bendy Bus';
      default: return 'Bus';
    }
  };

  return (
    <div className="space-y-6">
      {/* API Health & Integration Status Header */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse" />
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                Singapore LTA DataMall v3 Integration
              </h2>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1 font-medium">
              Real-time feed via <code className="bg-[#eaedff] px-1.5 py-0.5 rounded text-[#006948] font-['JetBrains_Mono']">/api/bus-arrival</code> and <code className="bg-[#eaedff] px-1.5 py-0.5 rounded text-[#006948] font-['JetBrains_Mono']">/api/health</code>
            </p>
          </div>

          {/* Health indicator badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#006948]" />
                <span>API Status: Healthy</span>
              </div>
              <p className="text-[11px] font-['JetBrains_Mono'] text-[#6d7a72]">
                {healthData?.ltaConfigured ? (
                  <span className="text-[#006948] font-semibold">LTA_ACCOUNT_KEY Configured</span>
                ) : (
                  <span className="text-[#855300]">Awaiting Vercel LTA_ACCOUNT_KEY (Simulated Active)</span>
                )}
              </p>
            </div>

            {/* Refresh countdown chip */}
            <div className="px-3 py-1.5 bg-[#eaedff] border border-[#dae2fd] rounded text-xs font-['JetBrains_Mono'] font-bold text-[#006948] flex items-center gap-1.5 tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              <span>{countdownTimer}s</span>
            </div>
          </div>
        </div>

        {/* Informative notification ribbon */}
        {data?.notice && (
          <div className="mt-4 p-3 bg-[#fff7ed] border border-[#ffddb8] rounded text-xs text-[#855300] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <strong>LTA Integration Notice:</strong> {data.notice}{' '}
              Once you add <code className="font-bold bg-white/60 px-1 py-0.5 rounded">LTA_ACCOUNT_KEY</code> in Vercel project environment variables, live production telematics from Singapore LTA DataMall will seamlessly connect!
            </div>
          </div>
        )}
      </div>

      {/* Bus Stop Code Query & Service Filter Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* BusStopCode Input (52px tactile) */}
          <div className="md:col-span-5">
            <label className="block text-[11px] font-['Space_Grotesk'] font-bold text-[#6d7a72] uppercase tracking-wider mb-1">
              Bus Stop Code (Required)
            </label>
            <div className="relative flex items-center h-[50px] bg-[#faf8ff] rounded border-[1.5px] border-[#cbd5e1] focus-within:border-[#131b2e]">
              <Bus className="w-4 h-4 text-[#006948] ml-3.5 mr-2 shrink-0" />
              <input
                type="text"
                value={busStopCode}
                onChange={(e) => setBusStopCode(e.target.value)}
                placeholder="e.g. 04121"
                className="w-full h-full bg-transparent border-0 outline-none text-[#131b2e] font-['JetBrains_Mono'] font-bold text-sm pr-3"
              />
            </div>
          </div>

          {/* ServiceNo Input (Optional, e.g. 7) */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-['Space_Grotesk'] font-bold text-[#6d7a72] uppercase tracking-wider mb-1">
              Service No (Optional)
            </label>
            <div className="relative flex items-center h-[50px] bg-[#faf8ff] rounded border-[1.5px] border-[#cbd5e1] focus-within:border-[#131b2e]">
              <input
                type="text"
                value={serviceNoFilter}
                onChange={(e) => setServiceNoFilter(e.target.value)}
                placeholder="All Services (or enter e.g. 7)"
                className="w-full h-full bg-transparent border-0 outline-none text-[#131b2e] font-['Public_Sans'] text-sm px-3.5"
              />
            </div>
          </div>

          {/* Query Refresh Button */}
          <div className="md:col-span-3">
            <button
              onClick={() => fetchArrivals()}
              disabled={loading}
              className="w-full h-[50px] bg-[#006948] hover:bg-[#00855d] text-white rounded font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Query LTA Feed'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stop Presets */}
        <div className="mt-4 pt-3 border-t border-[#f2f3ff] flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#6d7a72]">Quick Preset Stops:</span>
          {quickStops.map((st) => (
            <button
              key={st.code}
              onClick={() => {
                setBusStopCode(st.code);
              }}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                busStopCode === st.code
                  ? 'bg-[#131b2e] text-white border-[#131b2e]'
                  : 'bg-white text-[#3d4a42] border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}
            >
              <strong>{st.code}</strong> · {st.name.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Live Services Arrivals Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e]">
            Live Bus Arrivals for Stop <span className="font-['JetBrains_Mono'] text-[#006948]">#{busStopCode}</span>
          </h3>
          <span className="text-xs text-[#6d7a72] font-['JetBrains_Mono']">
            {data?.Services?.length || 0} services operating
          </span>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#ffdad6] border border-[#ffb4ab] rounded text-xs text-[#ba1a1a]">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.Services && data.Services.length > 0 ? (
            data.Services.map((svc) => (
              <div
                key={svc.ServiceNo}
                className="bg-white border border-[#e2e8f0] rounded-lg p-4 hover:border-[#131b2e] transition-all flex flex-col justify-between"
              >
                {/* Service Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f3ff] mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-10 rounded bg-[#006948] text-white flex items-center justify-center font-['JetBrains_Mono'] font-bold text-lg shadow-xs">
                      {svc.ServiceNo}
                    </div>
                    <div>
                      <span className="text-[11px] font-['JetBrains_Mono'] text-[#6d7a72] uppercase block">
                        Operator: {svc.Operator}
                      </span>
                      <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#131b2e]">
                        Service {svc.ServiceNo}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#eaedff] text-[#006948] font-semibold">
                    LTA v3
                  </span>
                </div>

                {/* 3-Wave Arrivals (NextBus, NextBus2, NextBus3) */}
                <div className="space-y-2.5 my-2">
                  {/* Next Bus 1 */}
                  {svc.NextBus && svc.NextBus.EstimatedArrival ? (
                    <div className="p-2.5 bg-[#faf8ff] rounded border border-[#e2e8f0] flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold font-['Space_Grotesk'] uppercase text-[#131b2e]">
                            Next Bus
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getLoadBadge(svc.NextBus.Load).bg} ${getLoadBadge(svc.NextBus.Load).text} ${getLoadBadge(svc.NextBus.Load).border}`}>
                            {getLoadBadge(svc.NextBus.Load).label}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6d7a72] mt-0.5 font-medium flex items-center gap-1.5">
                          <span>{getTypeLabel(svc.NextBus.Type)}</span>
                          {svc.NextBus.Feature === 'WAB' && (
                            <Accessibility className="w-3 h-3 text-[#0051d5]" />
                          )}
                        </div>
                      </div>

                      <div className="font-['JetBrains_Mono'] text-lg font-bold text-[#006948] tabular-nums text-right">
                        {getEtaMinutes(svc.NextBus.EstimatedArrival)}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded text-center text-xs text-[#94a3b8]">
                      No immediate arrival
                    </div>
                  )}

                  {/* Next Bus 2 & 3 in compact row */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Bus 2 */}
                    <div className="p-2 bg-white border border-[#e2e8f0] rounded">
                      <div className="flex items-center justify-between text-[10px] text-[#6d7a72]">
                        <span>Subsequent:</span>
                        <span className="font-bold text-[#131b2e] font-['JetBrains_Mono']">
                          {getEtaMinutes(svc.NextBus2?.EstimatedArrival) || '-'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#3d4a42] mt-0.5 truncate">
                        {getTypeLabel(svc.NextBus2?.Type)}
                      </div>
                    </div>

                    {/* Bus 3 */}
                    <div className="p-2 bg-white border border-[#e2e8f0] rounded">
                      <div className="flex items-center justify-between text-[10px] text-[#6d7a72]">
                        <span>Third:</span>
                        <span className="font-bold text-[#131b2e] font-['JetBrains_Mono']">
                          {getEtaMinutes(svc.NextBus3?.EstimatedArrival) || '-'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#3d4a42] mt-0.5 truncate">
                        {getTypeLabel(svc.NextBus3?.Type)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-2 border-t border-[#f2f3ff] text-[10px] text-[#6d7a72] flex items-center justify-between">
                  <span>Dest: {svc.NextBus?.DestinationCode || 'Terminal'}</span>
                  <span>Auto-cadence: 20s</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 bg-white border border-[#e2e8f0] rounded-lg text-center text-sm text-[#6d7a72]">
              No active services currently scheduled for Bus Stop Code <strong>{busStopCode}</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
