import React from 'react';
import { Accessibility, Volume2, ArrowRight } from 'lucide-react';
import { LtaBusService } from '../types/transit';
import { LTA_OPERATORS } from '../data/singaporeLtaData';
import { transitAudio } from '../utils/audio';

interface LtaArrivalCardProps {
  service: LtaBusService;
  busStopCode: string;
}

export const LtaArrivalCard: React.FC<LtaArrivalCardProps> = ({ service, busStopCode }) => {
  const opInfo = LTA_OPERATORS[service.Operator] || {
    name: service.Operator,
    color: '#006948',
    badgeBg: '#006948',
  };

  const calculateMinutes = (isoString?: string) => {
    if (!isoString) return null;
    const diffMs = new Date(isoString).getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    if (diffSec <= 45) return { text: 'Arr', isArriving: true, mins: 0 };
    const mins = Math.floor(diffSec / 60);
    if (mins < 0) return { text: 'Departed', isArriving: false, mins: -1 };
    return { text: `${mins} min`, isArriving: false, mins };
  };

  const getLoadDetails = (load?: string) => {
    switch (load) {
      case 'SEA':
        return {
          label: 'Seats Available',
          short: 'Seats',
          textColor: 'text-[#006948]',
          bgColor: 'bg-[#f5fff7]',
          borderColor: 'border-[#85f8c4]',
          barColor: 'bg-[#006948]',
          percent: 35,
        };
      case 'SDA':
        return {
          label: 'Standing Available',
          short: 'Standing',
          textColor: 'text-[#855300]',
          bgColor: 'bg-[#fff7ed]',
          borderColor: 'border-[#ffddb8]',
          barColor: 'bg-[#f59e0b]',
          percent: 70,
        };
      case 'LSD':
        return {
          label: 'Limited Standing',
          short: 'Crowded',
          textColor: 'text-[#ba1a1a]',
          bgColor: 'bg-[#ffdad6]',
          borderColor: 'border-[#ffb4ab]',
          barColor: 'bg-[#ba1a1a]',
          percent: 92,
        };
      default:
        return {
          label: 'Normal Load',
          short: 'Normal',
          textColor: 'text-[#3d4a42]',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
          barColor: 'bg-slate-400',
          percent: 50,
        };
    }
  };

  const getTypeDescription = (type?: string) => {
    switch (type) {
      case 'SD': return 'Single Deck';
      case 'DD': return 'Double Deck (DD)';
      case 'BD': return 'Bendy Bus';
      default: return 'Standard';
    }
  };

  const next1 = calculateMinutes(service.NextBus?.EstimatedArrival);
  const next2 = calculateMinutes(service.NextBus2?.EstimatedArrival);
  const next3 = calculateMinutes(service.NextBus3?.EstimatedArrival);
  const load1 = getLoadDetails(service.NextBus?.Load);

  const handleAnnounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    const etaText = next1 ? (next1.isArriving ? 'is arriving now' : `in approximately ${next1.text}`) : 'shortly';
    const msg = `Service ${service.ServiceNo} towards stop ${service.NextBus?.DestinationCode || 'terminal'} ${etaText}.`;
    transitAudio.announce(msg);
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 transition-all hover:border-[#131b2e] hover:shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* ZONE 1 (LEFT): Route number badge, Operator, Destination */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {/* Enamel Service Badge */}
          <div
            className="w-14 h-12 flex flex-col items-center justify-center rounded text-white font-['JetBrains_Mono'] font-bold text-lg tracking-tight shrink-0 shadow-xs"
            style={{ backgroundColor: opInfo.badgeBg }}
          >
            <span>{service.ServiceNo}</span>
            <span className="text-[9px] font-['Public_Sans'] font-semibold uppercase tracking-wider opacity-90 -mt-1">
              {service.Operator}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-[#131b2e] truncate">
                Service {service.ServiceNo}
              </h3>
              <span className="text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[#eaedff] text-[#006948] font-bold">
                LTA v3
              </span>
            </div>
            <p className="font-['Public_Sans'] text-xs font-semibold text-[#6d7a72] mt-0.5 truncate">
              To Stop #{service.NextBus?.DestinationCode || 'Terminal'} · From #{service.NextBus?.OriginCode || 'Depot'}
            </p>
          </div>
        </div>

        {/* ZONE 2 (MIDDLE): Occupancy status, Deck Type, Accessibility */}
        <div className="flex sm:flex-col items-start sm:items-start justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f2f3ff] text-xs text-[#3d4a42] sm:px-4 sm:border-x sm:border-[#e2e8f0] shrink-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold border ${load1.bgColor} ${load1.textColor} ${load1.borderColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${load1.barColor}`} />
              {load1.label}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6d7a72] font-medium">
            <span>{getTypeDescription(service.NextBus?.Type)}</span>
            {service.NextBus?.Feature === 'WAB' && (
              <span title="Wheelchair Accessible Bus (WAB)" className="inline-flex items-center text-[#0051d5]">
                <Accessibility className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* ZONE 3 (RIGHT): Ticking countdown display and wave preview */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#f5fff7] text-[#006948] border border-[#85f8c4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
                LIVE
              </span>

              <span
                className={`font-['JetBrains_Mono'] text-xl md:text-2xl font-bold tabular-nums tracking-tight ${
                  next1?.isArriving ? 'text-[#006948]' : 'text-[#131b2e]'
                }`}
              >
                {next1 ? next1.text : 'No Svc'}
              </span>
            </div>

            {/* Subsequent Arrivals 2 and 3 */}
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-['JetBrains_Mono'] text-[#6d7a72] mt-0.5">
              <span>Next:</span>
              <span className="font-semibold text-[#131b2e] bg-[#eaedff] px-1.5 py-0.2 rounded">
                {next2 ? next2.text : '-'}
              </span>
              <span>·</span>
              <span className="font-semibold text-[#131b2e] bg-slate-100 px-1.5 py-0.2 rounded">
                {next3 ? next3.text : '-'}
              </span>
            </div>
          </div>

          {/* Audio Chime Trigger */}
          <button
            onClick={handleAnnounce}
            title="Announce departure chime"
            className="p-2 rounded bg-[#eaedff] hover:bg-[#dae2fd] text-[#006948] transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
