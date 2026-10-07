import React, { useState } from 'react';
import { Volume2, Maximize2, Minimize2, Radio, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { LiveDeparture, TransitStop } from '../types/transit';
import { transitAudio } from '../utils/audio';

interface StationKioskBoardProps {
  currentStation: TransitStop;
  stations: Record<string, TransitStop>;
  onSelectStation: (st: TransitStop) => void;
  departures: LiveDeparture[];
  systemTime: string;
}

export const StationKioskBoard: React.FC<StationKioskBoardProps> = ({
  currentStation,
  stations,
  onSelectStation,
  departures,
  systemTime,
}) => {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [announcingId, setAnnouncingId] = useState<string | null>(null);

  const handleAnnounce = (dep: LiveDeparture) => {
    setAnnouncingId(dep.id);
    const mins = Math.max(1, Math.round(dep.countdownSeconds / 60));
    const text = `Attention passengers. Line ${dep.routeNumber} towards ${dep.destination} departs from ${dep.platform} in approximately ${mins} minutes.`;
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
                MUNICIPAL TERMINAL DISPLAY · {currentStation.code}
              </span>
              <span className="text-xs text-[#6d7a72] font-semibold">{currentStation.zone}</span>
            </div>
            <h1
              className={`font-['Space_Grotesk'] font-bold tracking-tight mt-1 ${
                isFullScreen ? 'text-3xl md:text-4xl text-white' : 'text-2xl text-[#131b2e]'
              }`}
            >
              {currentStation.name}
            </h1>
          </div>

          {/* Right Controls: Station Selector + Full-Screen Toggle + Digital Clock */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Station dropdown */}
            <select
              value={currentStation.id}
              onChange={(e) => {
                const s = stations[e.target.value];
                if (s) onSelectStation(s);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded border outline-none ${
                isFullScreen
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-[#faf8ff] text-[#131b2e] border-[#cbd5e1]'
              }`}
            >
              {Object.values(stations).map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>

            {/* Split-Flap High Contrast Clock */}
            <div
              className={`px-4 py-2 rounded font-['JetBrains_Mono'] text-lg md:text-xl font-bold tracking-widest tabular-nums flex items-center gap-2 ${
                isFullScreen
                  ? 'bg-black text-[#85f8c4] border border-[#006948]'
                  : 'bg-[#131b2e] text-[#85f8c4]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#006948]" />
              <span>{systemTime}</span>
            </div>

            {/* Fullscreen Button */}
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

        {/* Available Platforms / Bays Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#e2e8f0]/40 text-xs">
          <span className={`${isFullScreen ? 'text-slate-400' : 'text-[#6d7a72]'} font-semibold`}>
            Active Gates:
          </span>
          {currentStation.platforms.map((plat) => (
            <span
              key={plat}
              className={`px-2 py-0.5 rounded font-['JetBrains_Mono'] text-[11px] font-bold ${
                isFullScreen ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-[#131b2e]'
              }`}
            >
              {plat}
            </span>
          ))}
        </div>
      </div>

      {/* Modular Departure Table (Swiss High-Density Grid) */}
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
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4 hidden md:table-cell">Via / Corridor</th>
                <th className="py-3 px-4">Bay / Track</th>
                <th className="py-3 px-4">Scheduled</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Departure ETA</th>
                <th className="py-3 px-4 text-center">Announcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/60">
              {departures.map((dep) => {
                const isAnnouncing = announcingId === dep.id;
                const minutesLeft = Math.floor(dep.countdownSeconds / 60);

                return (
                  <tr
                    key={dep.id}
                    className={`transition-colors font-medium text-xs md:text-sm ${
                      isFullScreen
                        ? 'hover:bg-white/5 border-white/10 text-slate-100'
                        : 'hover:bg-[#faf8ff] text-[#131b2e]'
                    }`}
                  >
                    {/* Line Badge */}
                    <td className="py-3 px-4">
                      <span
                        className="inline-block px-2.5 py-1 rounded text-white font-['JetBrains_Mono'] font-bold text-xs shadow-xs"
                        style={{ backgroundColor: dep.routeColorHex }}
                      >
                        {dep.routeNumber}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-4 font-['Space_Grotesk'] font-bold text-base">
                      {dep.destination}
                    </td>

                    {/* Via Corridor */}
                    <td className="py-3 px-4 hidden md:table-cell text-xs opacity-75 font-['Public_Sans']">
                      {dep.via}
                    </td>

                    {/* Bay / Track */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-['JetBrains_Mono'] font-bold ${
                          isFullScreen
                            ? 'bg-slate-800 text-[#85f8c4]'
                            : 'bg-[#eaedff] text-[#006948]'
                        }`}
                      >
                        {dep.platform}
                      </span>
                    </td>

                    {/* Scheduled */}
                    <td className="py-3 px-4 font-['JetBrains_Mono'] tabular-nums text-xs opacity-80">
                      {dep.scheduledTime}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {dep.isDelayed ? (
                        <span className="inline-flex items-center gap-1 text-[#f59e0b] font-['JetBrains_Mono'] font-bold text-xs">
                          +{dep.delayMinutes}m DELAY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[#006948] font-['JetBrains_Mono'] font-bold text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
                          ON TIME
                        </span>
                      )}
                    </td>

                    {/* Countdown Display */}
                    <td className="py-3 px-4 text-right font-['JetBrains_Mono'] font-bold text-base md:text-lg tabular-nums">
                      <span className={dep.isDelayed ? 'text-[#f59e0b]' : 'text-[#006948]'}>
                        {dep.countdownSeconds <= 45 ? 'NOW' : `${minutesLeft} min`}
                      </span>
                    </td>

                    {/* Announcement Audio Trigger */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleAnnounce(dep)}
                        title="Broadcast civic voice chime announcement for this departure"
                        className={`p-1.5 rounded transition-colors ${
                          isAnnouncing
                            ? 'bg-[#006948] text-white animate-bounce'
                            : isFullScreen
                            ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
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

      {/* Footer Info Ribbon */}
      <div
        className={`flex flex-col sm:flex-row items-center justify-between text-xs py-3 px-4 rounded ${
          isFullScreen
            ? 'bg-slate-900/80 text-slate-400 border border-white/10'
            : 'bg-[#f2f3ff] text-[#3d4a42] border border-[#e2e8f0]'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#006948]" />
          <span>Municipal Telematics Protocol v4.2 · Real-time AVL data synchronized</span>
        </div>
        <div className="font-['JetBrains_Mono'] text-[11px] mt-1 sm:mt-0">
          Audio Announcements: Bilingual Municipal TTS Standard
        </div>
      </div>
    </div>
  );
};
