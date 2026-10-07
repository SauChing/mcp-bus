import React, { useState } from 'react';
import { Search, MapPin, Bus, ArrowRight } from 'lucide-react';
import { SINGAPORE_BUS_STOPS, SingaporeBusStop } from '../data/singaporeLtaData';

interface BusStopDirectoryProps {
  onSelectBusStop: (code: string) => void;
  selectedCode: string;
}

export const BusStopDirectory: React.FC<BusStopDirectoryProps> = ({
  onSelectBusStop,
  selectedCode,
}) => {
  const [filterQuery, setFilterQuery] = useState<string>('');

  const filteredStops = SINGAPORE_BUS_STOPS.filter((stop) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      stop.code.includes(q) ||
      stop.name.toLowerCase().includes(q) ||
      stop.road.toLowerCase().includes(q) ||
      stop.zone.toLowerCase().includes(q) ||
      stop.popularServices.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
              Singapore LTA Bus Stop Directory
            </h2>
            <p className="text-xs text-[#6d7a72] mt-1 font-medium">
              Browse major bus interchanges, arterial hubs, and MRT transit stops across Singapore
            </p>
          </div>

          {/* Search within Directory */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7a72]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by stop code, road, or service..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-[#faf8ff] border border-[#cbd5e1] rounded outline-none focus:border-[#131b2e]"
            />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStops.map((stop) => {
          const isSelected = stop.code === selectedCode;
          return (
            <div
              key={stop.code}
              onClick={() => onSelectBusStop(stop.code)}
              className={`p-4 bg-white rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#006948] ring-1 ring-[#006948] shadow-xs'
                  : 'border-[#e2e8f0] hover:border-[#131b2e]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff] mb-2.5">
                  <span className="px-2 py-0.5 rounded font-['JetBrains_Mono'] text-xs font-bold bg-[#eaedff] text-[#006948]">
                    #{stop.code}
                  </span>
                  <span className="text-[11px] text-[#6d7a72] font-semibold">{stop.zone}</span>
                </div>

                <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#131b2e]">
                  {stop.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#6d7a72] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#006948] shrink-0" />
                  <span className="truncate">{stop.road}</span>
                </div>
              </div>

              {/* Popular Services */}
              <div className="mt-4 pt-3 border-t border-[#f2f3ff]">
                <span className="text-[10px] uppercase font-bold text-[#6d7a72] block mb-1.5">
                  Calling Services:
                </span>
                <div className="flex flex-wrap gap-1">
                  {stop.popularServices.map((svc) => (
                    <span
                      key={svc}
                      className="px-1.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-slate-100 text-[#131b2e]"
                    >
                      {svc}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-[#006948] font-semibold">
                  <span>View Live Arrivals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
