import React, { useState, useEffect } from 'react';
import { Volume2, Maximize2, Minimize2, Clock, ShieldCheck, Bus, RefreshCw } from 'lucide-react';
import { SINGAPORE_BUS_STOPS, SingaporeBusStop, LTA_OPERATORS } from '../data/singaporeLtaData';
import { LtaBusService, LtaApiResponse } from '../types/transit';
import { transitAudio } from '../utils/audio';

interface StationKioskBoardProps {
  currentStopCode: string;
  onSelectStopCode: (code: string) => void;
  systemTime: string;
}

export const StationKioskBoard: React.FC<StationKioskBoardProps> = ({
  currentStopCode,
  onSelectStopCode,
  systemTime,
}) => {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [services, setServices] = useState<LtaBusService[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [announcingId, setAnnouncingId] = useState<string | null>(null);

  const currentStop =
    SINGAPORE_BUS_STOPS.find((s) => s.code === currentStopCode) || SINGAPORE_BUS_STOPS[0];

  const fetchKioskData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bus-arrival?BusStopCode=${encodeURIComponent(currentStop.code)}`);
      if (res.ok) {
        const json: LtaApiResponse = await res.json();
        setServices(json.Services || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKioskData();
    const interval = setInterval(fetchKioskData, 20000);
    return () => clearInterval(interval);
  }, [currentStop.code]);

  const calculateMinutes = (isoString?: string) => {
    if (!isoString) return '-';
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
        return { label: 'Seats', color: 'text-[#006948] bg-[#f5fff7] border-[#85f8c4]' };
      case 'SDA':
        return { label: 'Standing', color: 'text-[#855300] bg-[#fff7ed] border-[#ffddb8]' };
      case 'LSD':
        return { label: 'Crowded', color: 'text-[#ba1a1a] bg-[#ffdad6] border-[#ffb4ab]' };
      default:
        return { label: 'Normal', color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  const handleAnnounce = (svc: LtaBusService) => {
    setAnnouncingId(svc.ServiceNo);
    const eta = calculateMinutes(svc.NextBus?.EstimatedArrival);
    const dest = svc.NextBus?.DestinationCode || 'terminal';
    const text = `Attention passengers at bus stop ${currentStop.code}. Service ${svc.ServiceNo} towards destination ${dest} arriving ${eta === 'Arr' ? 'now' : `in ${eta}`}.`;
    transitAudio.announce(text);
    setTimeout(() => setAnnouncingId(null), 3000);
  };

  return (
    <div
      className={`transition-all ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-[#131b2e] text-white p-6 md:p-10 flex flex-col justify-between overflow-y-auto'
          : 'space-y-6'
      }`}
    >
      {/* Kiosk Terminal Header */}
      <div
        className={`${
          isFullScreen
            ? 'border-b-2 border-white/20 pb-6'
            : 'bg-white border border-[#e2e8f0] rounded-lg p-5'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded ${
                  isFullScreen ? 'bg-[#006948] text-white' : 'bg-[#eaedff] text-[#006948]'
                }`}
              >
                SINGAPORE LTA MUNICIPAL PASSENGER DISPLAY · #{currentStop.code}
              </span>
              <span className="text-xs text-[#6d7a72] font-semibold">{currentStop.zone}</span>
            </div>
            <h1
              className={`font-['Space_Grotesk'] font-bold tracking-tight mt-1 ${
                isFullScreen ? 'text-3xl md:text-4xl text-white' : 'text-2xl text-[#131b2e]'
              }`}
            >
              {currentStop.name}
            </h1>
            <p className="text-xs text-[#6d7a72] mt-0.5">{currentStop.road}</p>
          </div>

          {/* Right Controls: Stop Selector, SGT Clock, Fullscreen */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={currentStop.code}
              onChange={(e) => onSelectStopCode(e.target.value)}
              className={`px-3 py-2 text-xs font-semibold rounded border outline-none ${
                isFullScreen
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-[#faf8ff] text-[#131b2e] border-[#cbd5e1]'
              }`}
            >
              {SINGAPORE_BUS_STOPS.map((st) => (
                <option key={st.code} value={st.code}>
                  #{st.code} · {st.name.split('/')[0]}
                </option>
              ))}
            </select>

            <div
              className={`px-4 py-2 rounded font-['JetBrains_Mono'] text-lg md:text-xl font-bold tracking-widest tabular-nums flex items-center gap-2 ${
                isFullScreen
                  ? 'bg-black text-[#85f8c4] border border-[#006948]'
                  : 'bg-[#131b2e] text-[#85f8c4]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#006948]" />
              <span>{systemTime} SGT</span>
            </div>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'Exit Full Screen' : 'Kiosk Full Screen Display Mode'}
              className={`p-2.5 rounded border transition-colors ${
                isFullScreen
                  ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-[#131b2e] border-[#cbd5e1] hover:bg-[#eaedff]'
              }`}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* High-Contrast Departure Table */}
      <div
        className={`${
          isFullScreen
            ? 'bg-black/40 border border-white/10 rounded-lg flex-1 overflow-hidden'
            : 'bg-white border border-[#e2e8f0] rounded-lg overflow-hidden'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`text-[11px] font-['Space_Grotesk'] uppercase tracking-wider font-bold border-b ${
                  isFullScreen
                    ? 'bg-slate-900/90 text-slate-300 border-white/10'
                    : 'bg-[#eaedff] text-[#3d4a42] border-[#dae2fd]'
                }`}
              >
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Occupancy Load</th>
                <th className="py-3 px-4">Deck Type</th>
                <th className="py-3 px-4 text-center">Next Bus</th>
                <th className="py-3 px-4 text-center">Subsequent</th>
                <th className="py-3 px-4 text-center">Third</th>
                <th className="py-3 px-4 text-center">Broadcast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/60">
              {services.map((svc) => {
                const op = LTA_OPERATORS[svc.Operator] || { name: svc.Operator, badgeBg: '#006948' };
                const isAnnouncing = announcingId === svc.ServiceNo;
                const load = getLoadBadge(svc.NextBus?.Load);

                return (
                  <tr
                    key={svc.ServiceNo}
                    className={`transition-colors font-medium text-xs md:text-sm ${
                      isFullScreen
                        ? 'hover:bg-white/5 border-white/10 text-slate-100'
                        : 'hover:bg-[#faf8ff] text-[#131b2e]'
                    }`}
                  >
                    {/* Service Badge */}
                    <td className="py-3 px-4">
                      <span
                        className="inline-block px-3 py-1 rounded text-white font-['JetBrains_Mono'] font-bold text-sm shadow-xs"
                        style={{ backgroundColor: op.badgeBg }}
                      >
                        {svc.ServiceNo}
                      </span>
                    </td>

                    {/* Operator */}
                    <td className="py-3 px-4 font-['Space_Grotesk'] font-bold text-xs opacity-80">
                      {svc.Operator}
                    </td>

                    {/* Destination Stop */}
                    <td className="py-3 px-4 font-['JetBrains_Mono'] text-xs">
                      #{svc.NextBus?.DestinationCode || 'Terminal'}
                    </td>

                    {/* Occupancy Load */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${load.color}`}>
                        {load.label}
                      </span>
                    </td>

                    {/* Deck Type */}
                    <td className="py-3 px-4 text-xs font-['Public_Sans'] opacity-80">
                      {svc.NextBus?.Type === 'DD' ? 'Double Deck' : svc.NextBus?.Type === 'BD' ? 'Bendy' : 'Single Deck'}
                    </td>

                    {/* Next Bus */}
                    <td className="py-3 px-4 text-center font-['JetBrains_Mono'] font-bold text-base md:text-lg tabular-nums text-[#006948]">
                      {calculateMinutes(svc.NextBus?.EstimatedArrival)}
                    </td>

                    {/* Subsequent Bus 2 */}
                    <td className="py-3 px-4 text-center font-['JetBrains_Mono'] font-bold text-xs md:text-sm tabular-nums opacity-75">
                      {calculateMinutes(svc.NextBus2?.EstimatedArrival)}
                    </td>

                    {/* Third Bus 3 */}
                    <td className="py-3 px-4 text-center font-['JetBrains_Mono'] text-xs tabular-nums opacity-60">
                      {calculateMinutes(svc.NextBus3?.EstimatedArrival)}
                    </td>

                    {/* Announcement Trigger */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleAnnounce(svc)}
                        title="Broadcast audio announcement"
                        className={`p-1.5 rounded transition-colors ${
                          isAnnouncing
                            ? 'bg-[#006948] text-white animate-bounce'
                            : isFullScreen
                            ? 'bg-slate-800 text-slate-300 hover:text-white'
                            : 'bg-[#eaedff] text-[#006948] hover:bg-[#dae2fd]'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div
        className={`flex items-center justify-between text-xs py-3 px-4 rounded ${
          isFullScreen
            ? 'bg-slate-900/80 text-slate-400 border border-white/10'
            : 'bg-[#f2f3ff] text-[#3d4a42] border border-[#e2e8f0]'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#006948]" />
          <span>Singapore Land Transport Authority (LTA) DataMall v3 Protocol</span>
        </div>
        <div className="font-['JetBrains_Mono'] text-[11px]">
          Refreshes every 20 seconds · GTFS-RT Telematics
        </div>
      </div>
    </div>
  );
};
