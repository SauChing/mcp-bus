import React from 'react';
import { X, Gauge, Activity, Clock, ShieldCheck, Thermometer, Radio, Bus, MapPin, Zap } from 'lucide-react';
import { VehicleTelemetry, TransitRoute } from '../types/transit';

interface VehicleTelemetryModalProps {
  vehicle: VehicleTelemetry | null;
  route?: TransitRoute;
  onClose: () => void;
  onAdvanceProgress?: (vehicleId: string) => void;
}

export const VehicleTelemetryModal: React.FC<VehicleTelemetryModalProps> = ({
  vehicle,
  route,
  onClose,
  onAdvanceProgress,
}) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#131b2e] rounded-lg shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="p-4 bg-[#eaedff] border-b border-[#dae2fd] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded flex items-center justify-center text-white font-['JetBrains_Mono'] font-bold text-base shadow-xs"
              style={{ backgroundColor: route?.colorHex || '#006948' }}
            >
              {route?.number || 'BUS'}
            </div>
            <div>
              <span className="text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider text-[#6d7a72] block">
                Live AVL Telemetry Beacon
              </span>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e]">
                Vehicle {vehicle.id}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6d7a72] hover:text-[#131b2e] rounded hover:bg-[#dae2fd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Status strip */}
          <div className="flex items-center justify-between text-xs bg-[#faf8ff] p-3 rounded border border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse" />
              <span className="font-semibold text-[#131b2e]">Active in Revenue Service</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[#6d7a72]">
              Ping: {vehicle.lastPingSecondsAgo}s ago
            </span>
          </div>

          {/* Grid of Diagnostics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 border border-[#e2e8f0] rounded">
              <div className="flex items-center gap-1.5 text-[#6d7a72] mb-1">
                <Gauge className="w-4 h-4 text-[#006948]" />
                <span className="font-semibold">Instantaneous Speed</span>
              </div>
              <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#131b2e]">
                {vehicle.speedKmh} km/h
              </div>
            </div>

            <div className="p-3 border border-[#e2e8f0] rounded">
              <div className="flex items-center gap-1.5 text-[#6d7a72] mb-1">
                <Activity className="w-4 h-4 text-[#855300]" />
                <span className="font-semibold">Passenger Load</span>
              </div>
              <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#131b2e]">
                {vehicle.occupancyPercent}%
              </div>
            </div>

            <div className="p-3 border border-[#e2e8f0] rounded">
              <div className="flex items-center gap-1.5 text-[#6d7a72] mb-1">
                <Clock className="w-4 h-4 text-[#0051d5]" />
                <span className="font-semibold">Schedule Variance</span>
              </div>
              <div
                className={`font-['JetBrains_Mono'] text-xl font-bold ${
                  vehicle.headwayDeltaMinutes === 0
                    ? 'text-[#006948]'
                    : vehicle.headwayDeltaMinutes > 0
                    ? 'text-[#f59e0b]'
                    : 'text-[#0051d5]'
                }`}
              >
                {vehicle.headwayDeltaMinutes === 0
                  ? 'On Time'
                  : `+${vehicle.headwayDeltaMinutes} min`}
              </div>
            </div>

            <div className="p-3 border border-[#e2e8f0] rounded">
              <div className="flex items-center gap-1.5 text-[#6d7a72] mb-1">
                <Thermometer className="w-4 h-4 text-[#131b2e]" />
                <span className="font-semibold">Cabin Climate</span>
              </div>
              <div className="font-['Space_Grotesk'] text-base font-bold text-[#131b2e] uppercase mt-0.5">
                {vehicle.acStatus}
              </div>
            </div>
          </div>

          {/* Progress between stops */}
          <div className="p-3 bg-[#f2f3ff] rounded border border-[#dae2fd] text-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-semibold text-[#131b2e]">
                Inter-Stop Route Segment Progress
              </span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#006948]">
                {Math.round(vehicle.progressBetweenStops * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#cbd5e1] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#006948] h-full transition-all duration-300"
                style={{ width: `${vehicle.progressBetweenStops * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#6d7a72] mt-1 font-['JetBrains_Mono']">
              <span>Current Stop #{vehicle.currentStopIndex + 1}</span>
              <span>Next ETA: ~{vehicle.nextStopEtaSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#faf8ff] border-t border-[#e2e8f0] flex items-center justify-between">
          {onAdvanceProgress && (
            <button
              onClick={() => onAdvanceProgress(vehicle.id)}
              className="px-3 py-1.5 bg-[#eaedff] text-[#006948] hover:bg-[#dae2fd] rounded text-xs font-semibold border border-[#cbd5e1] transition-colors"
            >
              Simulate Progress +10%
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#131b2e] text-white hover:bg-[#283044] rounded text-xs font-semibold transition-colors ml-auto"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
