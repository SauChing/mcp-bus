import React from 'react';
import { Bus, Locate, Search, X } from 'lucide-react';
import { TransitMode } from '../types/transit';

interface TactileSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedMode: TransitMode | 'all';
  onModeChange: (mode: TransitMode | 'all') => void;
  onLocateNearMe: () => void;
  placeholder?: string;
}

export const TactileSearch: React.FC<TactileSearchProps> = ({
  query,
  onQueryChange,
  selectedMode,
  onModeChange,
  onLocateNearMe,
  placeholder = 'Search by Station, Line (10, 49R), or Landmark...',
}) => {
  const modes: { id: TransitMode | 'all'; label: string }[] = [
    { id: 'all', label: 'All Services' },
    { id: 'bus', label: 'Bus Trunk' },
    { id: 'metro', label: 'Metro Rapid' },
    { id: 'rapid', label: 'Express' },
  ];

  return (
    <div className="space-y-3">
      {/* 52px Tactile Input Box */}
      <div className="relative flex items-center h-[52px] bg-white rounded border-[1.5px] border-[#cbd5e1] focus-within:border-[2px] focus-within:border-[#131b2e] focus-within:ring-0 transition-colors shadow-xs">
        {/* Left-aligned transit glyph */}
        <div className="pl-4 pr-3 text-[#3d4a42] flex items-center justify-center shrink-0">
          <Bus className="w-5 h-5 text-[#006948]" />
        </div>

        {/* Text Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-[#131b2e] placeholder-[#6d7a72] text-sm md:text-base font-['Public_Sans'] pr-2 font-medium"
        />

        {/* Clear query button if typed */}
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="p-1.5 mr-1 text-[#6d7a72] hover:text-[#131b2e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Right-aligned Geolocation Locator Button */}
        <button
          onClick={onLocateNearMe}
          title="Locate Nearest Transit Stop"
          className="h-[42px] px-3.5 mr-1 flex items-center gap-1.5 bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] rounded text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
        >
          <Locate className="w-4 h-4 text-[#006948]" />
          <span className="hidden sm:inline">Near Me</span>
        </button>
      </div>

      {/* Mode Filter Tabs (functional segmented buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {modes.map((m) => {
          const isActive = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#131b2e] text-white border-[#131b2e]'
                  : 'bg-white text-[#3d4a42] border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
