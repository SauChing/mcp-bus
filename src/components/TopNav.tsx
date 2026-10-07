import React from 'react';
import { Volume2, VolumeX, Locate, RefreshCw } from 'lucide-react';

interface TopNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  systemTime: string;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onNearMeClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  systemTime,
  isAudioEnabled,
  onToggleAudio,
  onNearMeClick,
}) => {
  const navItems = [
    { id: 'arrivals', label: 'Arrivals Board' },
    { id: 'lta', label: 'LTA Singapore' },
    { id: 'progression', label: 'Stop Progression' },
    { id: 'topology', label: 'Network Topology' },
    { id: 'kiosk', label: 'Station Kiosk' },
    { id: 'planner', label: 'Trip Planner' },
    { id: 'bulletins', label: 'Service Bulletins' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf8ff] border-b border-[#e2e8f0] px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('arrivals')}
          className="text-left font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[#131b2e] hover:text-[#006948] transition-colors whitespace-nowrap shrink-0"
        >
          PulseTransit System
        </button>

        {/* Zone 2: Navigation Links (clean single-line text links with subtle hover underlines) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-[#3d4a42]">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`pb-1 whitespace-nowrap transition-colors relative ${
                  isActive
                    ? 'text-[#006948] border-b-2 border-[#006948]'
                    : 'text-[#3d4a42] hover:text-[#131b2e]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary actions & Real-time clock */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Real-time Telemetry Clock */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eaedff] border border-[#dae2fd] rounded text-xs font-['JetBrains_Mono'] font-semibold text-[#131b2e] tabular-nums">
            <span className="inline-block w-2 h-2 rounded-full bg-[#006948] animate-pulse" />
            <span>{systemTime}</span>
          </div>

          {/* Near Me Geo Trigger */}
          <button
            onClick={onNearMeClick}
            title="Locate nearest station"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#131b2e] bg-white border border-[#cbd5e1] hover:border-[#131b2e] rounded transition-colors whitespace-nowrap shadow-xs"
          >
            <Locate className="w-3.5 h-3.5 text-[#006948]" />
            <span className="hidden sm:inline">Near Me</span>
          </button>

          {/* Audio Chime Announcer Toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioEnabled ? 'Mute departure chimes' : 'Enable audio departure chimes'}
            className={`p-2 rounded border transition-colors ${
              isAudioEnabled
                ? 'bg-[#006948] text-white border-[#006948]'
                : 'bg-white text-[#3d4a42] border-[#cbd5e1] hover:text-[#131b2e]'
            }`}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Tab Scroller */}
      <div className="lg:hidden flex items-center gap-4 overflow-x-auto pt-2.5 pb-1 -mx-4 px-4 scrollbar-none border-t border-[#f2f3ff] mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`text-xs font-semibold whitespace-nowrap pb-1 transition-colors ${
              currentTab === item.id
                ? 'text-[#006948] border-b-2 border-[#006948]'
                : 'text-[#3d4a42] hover:text-[#131b2e]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
