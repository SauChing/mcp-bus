import React, { useState } from 'react';
import { TransitRoute, VehicleTelemetry, TransitStop } from '../types/transit';
import { Activity, Gauge, Thermometer, DoorClosed, Clock, RefreshCw, ChevronRight, Accessibility, AlertCircle } from 'lucide-react';

interface StopProgressionProps {
  routes: TransitRoute[];
  selectedRouteId: string;
  onSelectRouteId: (id: string) => void;
  vehicles: VehicleTelemetry[];
  onSelectStop?: (stop: TransitStop) => void;
  onInspectVehicle?: (vehicle: VehicleTelemetry) => void;
  onSimulateVehicleStep?: (vehicleId: string) => void;
}

export const StopProgression: React.FC<StopProgressionProps> = ({
  routes,
  selectedRouteId,
  onSelectRouteId,
  vehicles,
  onSelectStop,
  onInspectVehicle,
  onSimulateVehicleStep,
}) => {
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Find vehicle currently running on this route
  const routeVehicles = vehicles.filter((v) => v.routeId === currentRoute.id);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    routeVehicles[0]?.id || ''
  );

  const activeVehicle =
    routeVehicles.find((v) => v.id === selectedVehicleId) || routeVehicles[0];

  const currentStopIndex = activeVehicle ? activeVehicle.currentStopIndex : 1;

  return (
    <div className="space-y-6">
      {/* Route & Vehicle Selector Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Route Selector Tabs */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6d7a72] block mb-2">
            Select Transit Corridor
          </span>
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => {
              const isSelected = route.id === currentRoute.id;
              return (
                <button
                  key={route.id}
                  onClick={() => {
                    onSelectRouteId(route.id);
                    const newVehicles = vehicles.filter((v) => v.routeId === route.id);
                    if (newVehicles.length > 0) setSelectedVehicleId(newVehicles[0].id);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-xs'
                      : 'bg-[#faf8ff] text-[#3d4a42] border-[#e2e8f0] hover:border-[#131b2e]'
                  }`}
                >
                  <span
                    className="w-5 h-5 flex items-center justify-center rounded text-white font-['JetBrains_Mono'] text-[11px] font-bold"
                    style={{ backgroundColor: route.colorHex }}
                  >
                    {route.number}
                  </span>
                  <span>{route.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active vehicle switcher if multiple on route */}
        {routeVehicles.length > 1 && (
          <div className="border-t md:border-t-0 pt-3 md:pt-0 border-[#f2f3ff] shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6d7a72] block mb-2">
              Track Specific Vehicle
            </span>
            <div className="flex gap-2">
              {routeVehicles.map((veh) => (
                <button
                  key={veh.id}
                  onClick={() => setSelectedVehicleId(veh.id)}
                  className={`px-3 py-1.5 text-xs font-['JetBrains_Mono'] font-bold rounded border transition-colors ${
                    activeVehicle?.id === veh.id
                      ? 'bg-[#006948] text-white border-[#006948]'
                      : 'bg-white text-[#131b2e] border-[#cbd5e1]'
                  }`}
                >
                  {veh.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vertical Route Progression Track (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-lg p-5 md:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f2f3ff] mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded text-white font-['JetBrains_Mono'] text-xs font-bold"
                  style={{ backgroundColor: currentRoute.colorHex }}
                >
                  LINE {currentRoute.number}
                </span>
                <h2 className="font-['Space_Grotesk'] text-lg md:text-xl font-bold text-[#131b2e]">
                  {currentRoute.direction}
                </h2>
              </div>
              <p className="text-xs text-[#6d7a72] mt-1 font-medium">
                {currentRoute.via} · Headway: every {currentRoute.frequencyMinutes} min
              </p>
            </div>

            {/* Manual Advance Simulation Button */}
            {activeVehicle && onSimulateVehicleStep && (
              <button
                onClick={() => onSimulateVehicleStep(activeVehicle.id)}
                title="Advance vehicle telemetry along route for real-time demo"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#eaedff] text-[#006948] hover:bg-[#dae2fd] rounded border border-[#cbd5e1] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Advance Vehicle</span>
              </button>
            )}
          </div>

          {/* Vertical Stop Progression List */}
          <div className="relative pl-6 md:pl-8">
            {/* Continuous 3px solid neutral track (#CBD5E1) */}
            <div
              className="absolute left-[31px] md:left-[39px] top-4 bottom-8 w-[3px] bg-[#cbd5e1]"
              aria-hidden="true"
            />

            <div className="space-y-8 relative">
              {currentRoute.stops.map((stop, idx) => {
                const isPassed = idx < currentStopIndex;
                const isCurrent = idx === currentStopIndex;
                const isUpcoming = idx > currentStopIndex;

                return (
                  <div
                    key={stop.id}
                    onClick={() => onSelectStop && onSelectStop(stop)}
                    className="group relative flex items-start gap-5 cursor-pointer"
                  >
                    {/* Node Visual: 8px hollow ring OR 14px emerald node with pulsing ping */}
                    <div className="relative flex items-center justify-center shrink-0 w-8 h-8 z-10">
                      {isCurrent ? (
                        /* The bus's current verified position: energized 14px emerald node with pulsing concentric ping indicator */
                        <div className="relative flex items-center justify-center">
                          {/* Concentric ping indicator */}
                          <span className="absolute w-8 h-8 rounded-full bg-[#85f8c4] animate-ping opacity-75" />
                          <span className="absolute w-6 h-6 rounded-full bg-[#00855d]/30" />
                          {/* 14px emerald node */}
                          <div className="w-[14px] h-[14px] rounded-full bg-[#006948] border-2 border-white shadow-sm" />
                        </div>
                      ) : isPassed ? (
                        /* Passed stops diminish to #94A3B8 (Slate 400) */
                        <div className="w-[10px] h-[10px] rounded-full bg-[#94a3b8] border-2 border-white" />
                      ) : (
                        /* Upcoming stops: hollow circular rings (8px diameter) */
                        <div className="w-[8px] h-[8px] rounded-full bg-white border-2 border-[#131b2e] group-hover:scale-125 transition-transform" />
                      )}
                    </div>

                    {/* Stop Details */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-['Space_Grotesk'] text-base font-bold transition-colors ${
                              isCurrent
                                ? 'text-[#006948] text-lg'
                                : isPassed
                                ? 'text-[#94a3b8]'
                                : 'text-[#131b2e] group-hover:text-[#006948]'
                            }`}
                          >
                            {stop.name}
                          </span>

                          {isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#006948] text-white tracking-wider">
                              VEHICLE HERE
                            </span>
                          )}
                        </div>

                        {/* Station Code and Bay */}
                        <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono']">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                              isPassed ? 'text-[#94a3b8] bg-slate-100' : 'text-[#3d4a42] bg-[#eaedff]'
                            }`}
                          >
                            {stop.code}
                          </span>
                        </div>
                      </div>

                      {/* Transfers and ETA metadata */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        {isCurrent && activeVehicle && (
                          <span className="text-[#006948] font-['JetBrains_Mono'] font-bold">
                            Departs in ~{Math.round(activeVehicle.nextStopEtaSeconds / 60)} min · Door {activeVehicle.doorStatus}
                          </span>
                        )}

                        {isUpcoming && (
                          <span className="text-[#6d7a72] font-['JetBrains_Mono']">
                            Est +{(idx - currentStopIndex) * 3} min
                          </span>
                        )}

                        {isPassed && (
                          <span className="text-[#94a3b8] text-[11px]">
                            Departed
                          </span>
                        )}

                        {/* Transfer chips */}
                        {stop.transfers.length > 1 && (
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-[10px] text-[#6d7a72] uppercase font-semibold">
                              Transfer:
                            </span>
                            {stop.transfers
                              .filter((t) => t !== currentRoute.number)
                              .map((t) => (
                                <span
                                  key={t}
                                  className="px-1.5 py-0.2 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-slate-200 text-[#131b2e]"
                                >
                                  {t}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Vehicle Telemetry Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {activeVehicle ? (
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
              {/* Header with Vehicle Identification */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f2f3ff] mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-white font-['JetBrains_Mono'] font-bold text-sm"
                    style={{ backgroundColor: currentRoute.colorHex }}
                  >
                    {currentRoute.number}
                  </div>
                  <div>
                    <span className="text-[11px] font-['JetBrains_Mono'] text-[#6d7a72] uppercase tracking-wider block">
                      Active Telemetry
                    </span>
                    <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e]">
                      {activeVehicle.id}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#f5fff7] text-[#006948] border border-[#85f8c4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
                    LIVE GPS
                  </span>
                  <p className="text-[10px] font-['JetBrains_Mono'] text-[#6d7a72] mt-0.5">
                    Ping: {activeVehicle.lastPingSecondsAgo}s ago
                  </p>
                </div>
              </div>

              {/* Real-time Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Speed Metric */}
                <div className="bg-[#faf8ff] border border-[#e2e8f0] rounded p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#6d7a72] mb-1 font-medium">
                    <Gauge className="w-3.5 h-3.5 text-[#006948]" />
                    <span>Telemetry Speed</span>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-2xl font-bold text-[#131b2e] tabular-nums">
                    {activeVehicle.speedKmh}{' '}
                    <span className="text-xs text-[#6d7a72] font-normal">km/h</span>
                  </div>
                </div>

                {/* Headway Delta */}
                <div className="bg-[#faf8ff] border border-[#e2e8f0] rounded p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#6d7a72] mb-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Headway Variance</span>
                  </div>
                  <div
                    className={`font-['JetBrains_Mono'] text-2xl font-bold tabular-nums ${
                      activeVehicle.headwayDeltaMinutes === 0
                        ? 'text-[#006948]'
                        : activeVehicle.headwayDeltaMinutes > 0
                        ? 'text-[#f59e0b]'
                        : 'text-[#0051d5]'
                    }`}
                  >
                    {activeVehicle.headwayDeltaMinutes === 0
                      ? '±0 min'
                      : activeVehicle.headwayDeltaMinutes > 0
                      ? `+${activeVehicle.headwayDeltaMinutes} min`
                      : `${activeVehicle.headwayDeltaMinutes} min`}
                  </div>
                </div>

                {/* Occupancy */}
                <div className="bg-[#faf8ff] border border-[#e2e8f0] rounded p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#6d7a72] mb-1 font-medium">
                    <Activity className="w-3.5 h-3.5 text-[#855300]" />
                    <span>Passenger Load</span>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-2xl font-bold text-[#131b2e] tabular-nums">
                    {activeVehicle.occupancyPercent}%
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        activeVehicle.occupancyPercent > 75
                          ? 'bg-[#ba1a1a]'
                          : activeVehicle.occupancyPercent > 50
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#006948]'
                      }`}
                      style={{ width: `${activeVehicle.occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* Door & HVAC */}
                <div className="bg-[#faf8ff] border border-[#e2e8f0] rounded p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#6d7a72] mb-1 font-medium">
                    <DoorClosed className="w-3.5 h-3.5 text-[#131b2e]" />
                    <span>Door System</span>
                  </div>
                  <div className="font-['Space_Grotesk'] text-base font-bold text-[#131b2e] uppercase mt-1">
                    {activeVehicle.doorStatus}
                  </div>
                  <span className="text-[11px] text-[#6d7a72] font-medium block mt-0.5">
                    HVAC: {activeVehicle.acStatus}
                  </span>
                </div>
              </div>

              {/* Step-free ramp badge & vehicle inspect trigger */}
              <div className="flex items-center justify-between pt-3 border-t border-[#f2f3ff] text-xs">
                <div className="flex items-center gap-1.5 text-[#3d4a42]">
                  <Accessibility className="w-4 h-4 text-[#0051d5]" />
                  <span>ADA Low-Floor Ramp Active</span>
                </div>

                {onInspectVehicle && (
                  <button
                    onClick={() => onInspectVehicle(activeVehicle)}
                    className="text-[#006948] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Full Diagnostics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 text-center text-sm text-[#6d7a72]">
              No vehicle actively sending telematics for this route.
            </div>
          )}

          {/* Quick Line Schedule Notice */}
          <div className="bg-[#eaedff] border border-[#dae2fd] rounded-lg p-4 text-xs text-[#131b2e]">
            <h4 className="font-['Space_Grotesk'] font-bold text-sm mb-1 text-[#006948]">
              Operating Headway Dispatch Notice
            </h4>
            <p className="text-[#3d4a42] leading-relaxed">
              Line {currentRoute.number} operates with automatic transit signal priority (TSP) at
              all primary arterial intersections. Vehicles broadcast location telemetry via municipal
              DSRC radio beacons every 2 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
