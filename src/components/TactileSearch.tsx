import React from 'react';
import { Bus, Locate, Search, X } from 'lucide-react';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeLtaData';

interface TactileSearchProps {
  busStopCode: string;
  onBusStopCodeChange: (code: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (svc: string) => void;
  onQuickSelect: (code: string) => void;
}

export const TactileSearch: React.FC<TactileSearchProps> = ({
  busStopCode,
  onBusStopCodeChange,
  serviceFilter,
  onServiceFilterChange,
  onQuickSelect,
}) => {
  const quickStops = [
    { code: '04121', label: '04121 Old Parliament Hse' },
    { code: '01012', label: '01012 Hotel Rendezvous' },
    { code: '03211', label: '03211 Opp Suntec City' },
    { code: '09048', label: '09048 Lucky Plaza' },
    { code: '84009', label: '84009 Bedok Int' },
    { code: '28009', label: '28009 Jurong East Int' },
  ];

  return (
    <div className="space-y-3">
      {/* 52px Tactile Search Input */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Bus Stop Code Input */}
        <div className="sm:col-span-7 relative flex items-center h-[52px] bg-white rounded border-[1.5px] border-[#cbd5e1] focus-within:border-[2px] focus-within:border-[#131b2e] transition-colors shadow-xs">
          <div className="pl-4 pr-2 text-[#006948] flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={busStopCode}
            onChange={(e) => onBusStopCodeChange(e.target.value)}
            placeholder="Singapore Bus Stop Code (e.g. 04121)"
            className="w-full h-full bg-transparent border-0 outline-none text-[#131b2e] font-['JetBrains_Mono'] font-bold text-sm md:text-base pr-2"
          />
          {busStopCode && (
            <button
              onClick={() => onBusStopCodeChange('')}
              className="p-1.5 mr-1 text-[#6d7a72] hover:text-[#131b2e]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Optional Service Filter */}
        <div className="sm:col-span-5 relative flex items-center h-[52px] bg-white rounded border-[1.5px] border-[#cbd5e1] focus-within:border-[2px] focus-within:border-[#131b2e] transition-colors shadow-xs">
          <div className="pl-3.5 pr-2 text-[#6d7a72] text-xs font-bold uppercase shrink-0">
            Svc:
          </div>
          <input
            type="text"
            value={serviceFilter}
            onChange={(e) => onServiceFilterChange(e.target.value)}
            placeholder="All (or e.g. 7)"
            className="w-full h-full bg-transparent border-0 outline-none text-[#131b2e] font-['Public_Sans'] font-medium text-xs md:text-sm pr-2"
          />
          {serviceFilter && (
            <button
              onClick={() => onServiceFilterChange('')}
              className="p-1.5 mr-1 text-[#6d7a72] hover:text-[#131b2e]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Preset Singapore Stop Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-[#6d7a72] whitespace-nowrap mr-1">
          Popular:
        </span>
        {quickStops.map((st) => {
          const isActive = busStopCode === st.code;
          return (
            <button
              key={st.code}
              onClick={() => onQuickSelect(st.code)}
              className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#131b2e] text-white border-[#131b2e]'
                  : 'bg-white text-[#3d4a42] border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
