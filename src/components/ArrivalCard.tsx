import React from 'react';
import { Users, Accessibility, Zap, ChevronRight, AlertTriangle } from 'lucide-react';
import { LiveDeparture } from '../types/transit';

interface ArrivalCardProps {
  departure: LiveDeparture;
  onSelect: (departure: LiveDeparture) => void;
  onTrackProgression?: (routeId: string, vehicleId: string) => void;
}

export const ArrivalCard: React.FC<ArrivalCardProps> = ({
  departure,
  onSelect,
  onTrackProgression,
}) => {
  // Format countdown seconds into readable transit display
  const formatCountdown = (seconds: number) => {
    if (seconds <= 45) return 'NOW';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getOccupancyLabel = (percent: number) => {
    if (percent < 50) return { label: 'Seats available', color: 'text-[#006948]' };
    if (percent < 80) return { label: 'Standing room', color: 'text-[#855300]' };
    return { label: 'Crowded', color: 'text-[#ba1a1a]' };
  };

  const occupancyInfo = getOccupancyLabel(departure.occupancyPercent);

  return (
    <div
      onClick={() => onSelect(departure)}
      className="group relative bg-white border border-[#e2e8f0] rounded-lg p-4 transition-all hover:border-[#131b2e] hover:shadow-sm cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* ZONE 1 (LEFT): Bold route badge with direction sub-label */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {/* Route Number Badge: Compact rectangle with 0.25rem corners */}
          <div
            className="w-14 h-12 flex flex-col items-center justify-center rounded text-white font-['JetBrains_Mono'] font-bold text-lg tracking-tight shrink-0 shadow-xs"
            style={{ backgroundColor: departure.routeColorHex }}
          >
            <span>{departure.routeNumber}</span>
            <span className="text-[9px] font-['Public_Sans'] font-medium uppercase tracking-wider opacity-90 -mt-1">
              {departure.platform}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-[#131b2e] truncate">
                {departure.destination}
              </h3>
            </div>
            
            <p className="font-['Public_Sans'] text-xs font-semibold tracking-wider text-[#3d4a42] uppercase truncate mt-0.5">
              {departure.direction} · {departure.via}
            </p>
          </div>
        </div>

        {/* ZONE 2 (MIDDLE): Real-time occupancy status & scheduled departure */}
        <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f2f3ff] text-xs text-[#3d4a42] sm:px-4 sm:border-x sm:border-[#e2e8f0] shrink-0">
          {/* Occupancy Indicator */}
          <div className="flex items-center gap-1.5 font-medium">
            <Users className={`w-3.5 h-3.5 ${occupancyInfo.color}`} />
            <span className="text-[#131b2e] font-['JetBrains_Mono'] font-semibold tabular-nums">
              {departure.occupancyPercent}%
            </span>
            <span className="hidden xl:inline text-[#6d7a72]">({occupancyInfo.label})</span>
          </div>

          {/* Scheduled Departure and Vehicle Features */}
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6d7a72]">
            <span>Sched {departure.scheduledTime}</span>
            {departure.accessible && (
              <span title="Step-free accessible">
                <Accessibility className="w-3 h-3 text-[#0051d5]" />
              </span>
            )}
            {departure.electric && (
              <span title="100% Zero-Emission Electric">
                <Zap className="w-3 h-3 text-[#006948]" />
              </span>
            )}
          </div>
        </div>

        {/* ZONE 3 (RIGHT): Ticking countdown display in label-mono-lg */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-right">
            {/* Countdown Badge */}
            <div className="flex items-center justify-end gap-2">
              {departure.isDelayed ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#fff7ed] text-[#855300] border border-[#ffddb8]">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  +{departure.delayMinutes}M DELAY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#f5fff7] text-[#006948] border border-[#85f8c4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
                  LIVE
                </span>
              )}

              <span
                className={`font-['JetBrains_Mono'] text-xl md:text-2xl font-bold tabular-nums tracking-tight ${
                  departure.isDelayed ? 'text-[#f59e0b]' : 'text-[#006948]'
                }`}
              >
                {formatCountdown(departure.countdownSeconds)}
              </span>
            </div>

            {/* Baseline comparison if delayed */}
            {departure.isDelayed ? (
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#6d7a72] mt-0.5">
                <span className="line-through">{departure.scheduledTime}</span>
                <span className="text-[#855300] font-semibold ml-1.5">
                  Est {/* simulated delayed time */}
                  {(() => {
                    const [h, m] = departure.scheduledTime.split(':').map(Number);
                    const totalM = h * 60 + m + departure.delayMinutes;
                    const newH = Math.floor(totalM / 60) % 24;
                    const newM = totalM % 60;
                    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
                  })()}
                </span>
              </div>
            ) : (
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#6d7a72] mt-0.5">
                On Schedule · Track {departure.vehicleId}
              </div>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#131b2e] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Quick Track Action Button on mobile/hover */}
      {onTrackProgression && (
        <div className="mt-3 pt-2 border-t border-[#f2f3ff] flex items-center justify-between text-xs text-[#6d7a72]">
          <span className="font-['JetBrains_Mono'] text-[11px]">
            Vehicle <strong className="text-[#131b2e] font-semibold">{departure.vehicleId}</strong>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrackProgression(departure.routeId, departure.vehicleId);
            }}
            className="text-[#006948] font-semibold hover:underline"
          >
            Track Route Progress →
          </button>
        </div>
      )}
    </div>
  );
};
