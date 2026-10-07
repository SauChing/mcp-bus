import React, { useState } from 'react';
import { ArrowRight, ArrowDownUp, Clock, Navigation, CheckCircle2, Footprints, Bus, AlertCircle } from 'lucide-react';
import { TransitStop, TripItinerary } from '../types/transit';
import { SAMPLE_ITINERARIES } from '../data/transitData';

interface TripPlannerProps {
  stations: Record<string, TransitStop>;
  onTrackRoute?: (routeNumber: string) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({ stations, onTrackRoute }) => {
  const stationList = Object.values(stations);
  const [originId, setOriginId] = useState<string>('ST_101');
  const [destId, setDestId] = useState<string>('ST_105');
  const [departureOption, setDepartureOption] = useState<'leave_now' | 'arrive_by'>('leave_now');

  const handleSwap = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  const originStation = stations[originId] || stationList[0];
  const destStation = stations[destId] || stationList[1];

  return (
    <div className="space-y-6">
      {/* Planner Card Header */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 md:p-6">
        <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e] mb-4">
          Tactile Trip Planner & Connection Engine
        </h2>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin selector */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-['Space_Grotesk'] font-bold text-[#6d7a72] uppercase tracking-wider mb-1">
              Origin Boarding Stop
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full h-[50px] px-3.5 bg-[#faf8ff] border-[1.5px] border-[#cbd5e1] focus:border-[#131b2e] rounded text-sm font-semibold text-[#131b2e] outline-none"
            >
              {stationList.map((st) => (
                <option key={st.id} value={st.id} disabled={st.id === destId}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={handleSwap}
              title="Reverse Origin & Destination"
              className="p-3 bg-white border border-[#cbd5e1] hover:border-[#131b2e] rounded text-[#131b2e] shadow-xs hover:bg-[#eaedff] transition-colors"
            >
              <ArrowDownUp className="w-4 h-4 text-[#006948]" />
            </button>
          </div>

          {/* Destination selector */}
          <div className="md:col-span-5">
            <label className="block text-[11px] font-['Space_Grotesk'] font-bold text-[#6d7a72] uppercase tracking-wider mb-1">
              Destination Stop
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full h-[50px] px-3.5 bg-[#faf8ff] border-[1.5px] border-[#cbd5e1] focus:border-[#131b2e] rounded text-sm font-semibold text-[#131b2e] outline-none"
            >
              {stationList.map((st) => (
                <option key={st.id} value={st.id} disabled={st.id === originId}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recommended Routes Grid */}
      <div className="space-y-4">
        <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#131b2e]">
          Optimal Transit Options ({originStation.name} → {destStation.name})
        </h3>

        {SAMPLE_ITINERARIES.map((itin, index) => (
          <div
            key={itin.id}
            className="bg-white border border-[#e2e8f0] rounded-lg p-5 hover:border-[#131b2e] transition-all"
          >
            {/* Header with Duration & Departure */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#f2f3ff] gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded flex items-center justify-center bg-[#eaedff] text-[#006948] font-['Space_Grotesk'] font-bold text-sm">
                  #{index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                      {itin.totalDurationMin} min total
                    </span>
                    <span className="text-xs text-[#6d7a72]">
                      ({itin.walkDurationMin} min walking)
                    </span>
                  </div>
                  <p className="text-xs font-['JetBrains_Mono'] text-[#006948] font-semibold">
                    Departs {itin.departureTime} · Arrives {itin.arrivalTime}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#131b2e] bg-[#eaedff] px-2.5 py-1 rounded">
                  {itin.fare}
                </span>
              </div>
            </div>

            {/* Step-by-Step Route Legs */}
            <div className="mt-4 space-y-4">
              {itin.legs.map((leg, legIdx) => (
                <div key={legIdx} className="flex items-start gap-3.5 text-xs">
                  <div className="mt-0.5 shrink-0">
                    {leg.mode === 'walk' ? (
                      <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[#6d7a72]">
                        <Footprints className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-white font-['JetBrains_Mono'] font-bold"
                        style={{ backgroundColor: leg.routeColorHex || '#006948' }}
                      >
                        {leg.routeNumber}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#131b2e] text-sm">
                      {leg.instruction}
                    </p>
                    <div className="flex items-center gap-2 text-[#6d7a72] mt-0.5">
                      <span>{leg.fromStop}</span>
                      <ArrowRight className="w-3 h-3 text-[#cbd5e1]" />
                      <span>{leg.toStop}</span>
                      <span>·</span>
                      <span className="font-['JetBrains_Mono'] font-medium">
                        {leg.durationMin} min {leg.stopsCount ? `(${leg.stopsCount} stops)` : ''}
                      </span>
                    </div>
                  </div>

                  {leg.routeNumber && onTrackRoute && (
                    <button
                      onClick={() => onTrackRoute(leg.routeNumber!)}
                      className="text-[#006948] font-semibold text-xs hover:underline shrink-0"
                    >
                      Track Line →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
