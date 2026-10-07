/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ROUTES,
  STATIONS,
  INITIAL_VEHICLES,
  INITIAL_DEPARTURES,
  SERVICE_BULLETINS,
} from './data/transitData';
import {
  LiveDeparture,
  TransitStop,
  TransitRoute,
  VehicleTelemetry,
  TransitMode,
} from './types/transit';
import { TopNav } from './components/TopNav';
import { ArrivalCard } from './components/ArrivalCard';
import { TactileSearch } from './components/TactileSearch';
import { StopProgression } from './components/StopProgression';
import { NetworkTopologyMap } from './components/NetworkTopologyMap';
import { StationKioskBoard } from './components/StationKioskBoard';
import { TripPlanner } from './components/TripPlanner';
import { ServiceBulletins } from './components/ServiceBulletins';
import { VehicleTelemetryModal } from './components/VehicleTelemetryModal';
import { transitAudio } from './utils/audio';
import {
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Radio,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('arrivals');
  const [currentStation, setCurrentStation] = useState<TransitStop>(STATIONS.ST_101);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('R_10');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTelemetry | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<TransitMode | 'all'>('all');

  // Live state
  const [departures, setDepartures] = useState<LiveDeparture[]>(INITIAL_DEPARTURES);
  const [vehicles, setVehicles] = useState<VehicleTelemetry[]>(INITIAL_VEHICLES);
  const [systemTime, setSystemTime] = useState<string>('14:30:00');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Clock & Telemetry Simulation Engine
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Format clock
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setSystemTime(timeStr);

      // 2. Decrement countdown seconds for live departures
      setDepartures((prev) =>
        prev.map((dep) => {
          if (dep.countdownSeconds <= 1) {
            // Reset to next schedule headway
            const newHeadway = 360 + Math.floor(Math.random() * 240); // 6-10 min
            return {
              ...dep,
              countdownSeconds: newHeadway,
              isDelayed: Math.random() > 0.75,
              delayMinutes: Math.floor(Math.random() * 4) + 1,
            };
          }
          return {
            ...dep,
            countdownSeconds: dep.countdownSeconds - 1,
          };
        })
      );

      // 3. Slowly advance vehicle simulation along paths
      setVehicles((prev) =>
        prev.map((veh) => {
          let newProg = veh.progressBetweenStops + 0.008;
          let newStopIdx = veh.currentStopIndex;
          const route = ROUTES.find((r) => r.id === veh.routeId);
          const maxStops = route ? route.stops.length : 4;

          if (newProg >= 1.0) {
            newProg = 0.0;
            newStopIdx = (newStopIdx + 1) % maxStops;
          }

          // Fluctuate speed slightly
          const speedDelta = Math.floor(Math.random() * 5) - 2;
          const newSpeed = Math.min(65, Math.max(12, veh.speedKmh + speedDelta));

          return {
            ...veh,
            progressBetweenStops: newProg,
            currentStopIndex: newStopIdx,
            speedKmh: newSpeed,
            lastPingSecondsAgo: (veh.lastPingSecondsAgo % 5) + 1,
            nextStopEtaSeconds: Math.max(15, Math.round((1 - newProg) * 180)),
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filtered departures based on selected station, search query, and mode
  const filteredDepartures = useMemo(() => {
    return departures.filter((dep) => {
      // Match mode if specified
      if (selectedMode !== 'all') {
        const route = ROUTES.find((r) => r.id === dep.routeId);
        if (route && route.mode !== selectedMode) return false;
      }

      // Match search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLine = dep.routeNumber.toLowerCase().includes(q);
        const matchesDest = dep.destination.toLowerCase().includes(q);
        const matchesVia = dep.via.toLowerCase().includes(q);
        const matchesStop = currentStation.name.toLowerCase().includes(q);
        if (!matchesLine && !matchesDest && !matchesVia && !matchesStop) return false;
      }

      return true;
    });
  }, [departures, selectedMode, searchQuery, currentStation]);

  // "Near Me" GPS locator handler
  const handleLocateNearMe = () => {
    // Pick the primary interchange
    setCurrentStation(STATIONS.ST_101);
    setToastMessage('GPS synchronized: Union Central Interchange identified (120m away)');
    if (isAudioEnabled) {
      transitAudio.playChime();
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Step simulation for a specific vehicle
  const handleSimulateVehicleStep = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const route = ROUTES.find((r) => r.id === v.routeId);
          const maxStops = route ? route.stops.length : 4;
          const nextStop = (v.currentStopIndex + 1) % maxStops;
          return {
            ...v,
            currentStopIndex: nextStop,
            progressBetweenStops: 0.1,
            nextStopEtaSeconds: 120,
          };
        }
        return v;
      })
    );
    setToastMessage(`Vehicle ${vehicleId} telemetry advanced to next scheduled waypoint`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTrackProgression = (routeId: string, vehicleId: string) => {
    setSelectedRouteId(routeId);
    const targetVeh = vehicles.find((v) => v.id === vehicleId) || null;
    setSelectedVehicle(targetVeh);
    setActiveTab('progression');
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col font-['Public_Sans']">
      {/* 3-Zone Top Navigation Bar */}
      <TopNav
        currentTab={activeTab}
        onTabChange={setActiveTab}
        systemTime={systemTime}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onNearMeClick={handleLocateNearMe}
      />

      {/* Real-time Municipal Toast Banner */}
      {toastMessage && (
        <div className="bg-[#eaedff] border-b border-[#dae2fd] text-[#131b2e] px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="max-w-[1440px] mx-auto w-full flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#006948] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6">
        {/* VIEW 1: Core Arrivals Board (12-Column Desktop Layout) */}
        {activeTab === 'arrivals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT RAIL (4 Columns): Search, Station Selector, Quick Filters */}
            <div className="lg:col-span-4 space-y-5">
              {/* Tactile Search Component (52px height) */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-4">
                <TactileSearch
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  selectedMode={selectedMode}
                  onModeChange={setSelectedMode}
                  onLocateNearMe={handleLocateNearMe}
                />
              </div>

              {/* Station Wayfinding Hub Card */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f3ff] mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#006948]" />
                    <span className="text-xs font-['Space_Grotesk'] font-bold text-[#6d7a72] uppercase tracking-wider">
                      Selected Station Node
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-['JetBrains_Mono'] font-bold bg-[#eaedff] text-[#006948]">
                    {currentStation.code}
                  </span>
                </div>

                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                  {currentStation.name}
                </h2>
                <p className="text-xs text-[#6d7a72] mt-1 font-medium">
                  {currentStation.zone} · {currentStation.platforms.length} Active Boarding Bays
                </p>

                {/* Switch Station Selector */}
                <div className="mt-4">
                  <label className="block text-[11px] font-['Space_Grotesk'] font-bold text-[#6d7a72] uppercase tracking-wider mb-1.5">
                    Browse Other Municipal Stations
                  </label>
                  <select
                    value={currentStation.id}
                    onChange={(e) => {
                      const s = STATIONS[e.target.value];
                      if (s) setCurrentStation(s);
                    }}
                    className="w-full h-10 px-3 bg-[#faf8ff] border border-[#cbd5e1] focus:border-[#131b2e] rounded text-xs font-semibold text-[#131b2e] outline-none"
                  >
                    {Object.values(STATIONS).map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Station Platforms */}
                <div className="mt-4 pt-3 border-t border-[#f2f3ff]">
                  <span className="text-[11px] font-semibold text-[#6d7a72] block mb-2">
                    Boarding Bays at this Stop:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentStation.platforms.map((plat) => (
                      <span
                        key={plat}
                        className="px-2 py-1 bg-[#eaedff] text-[#131b2e] rounded text-xs font-['JetBrains_Mono'] font-bold"
                      >
                        {plat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Station Facility Badges */}
                <div className="mt-4 pt-3 border-t border-[#f2f3ff] flex items-center justify-between text-[11px] text-[#6d7a72]">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#006948]" /> Wheelchair Ramp
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#006948]" /> Weather Canopy
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#006948]" /> Telematics LED
                  </span>
                </div>
              </div>

              {/* High-Level Transit Corridor Quick Links */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
                <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#131b2e] uppercase tracking-wider mb-3">
                  Major Trunk Lines
                </h3>
                <div className="space-y-2">
                  {ROUTES.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => {
                        setSelectedRouteId(route.id);
                        setActiveTab('progression');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded border border-[#e2e8f0] hover:border-[#131b2e] hover:bg-[#faf8ff] transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-white font-['JetBrains_Mono'] font-bold text-xs"
                          style={{ backgroundColor: route.colorHex }}
                        >
                          {route.number}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#131b2e]">{route.name}</div>
                          <div className="text-[10px] text-[#6d7a72]">Every {route.frequencyMinutes}m</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#cbd5e1]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT MAIN PANEL (8 Columns): Live Arrivals Board */}
            <div className="lg:col-span-8 space-y-4">
              {/* Departure Board Header */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                      Live Departures & Real-Time Headways
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#f5fff7] text-[#006948] border border-[#85f8c4]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
                      AUTO-TICKING
                    </span>
                  </div>
                  <p className="text-xs text-[#6d7a72] mt-0.5 font-medium">
                    Showing next departures for {currentStation.name} · Synchronized with municipal AVL radio
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('kiosk')}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#eaedff] text-[#006948] hover:bg-[#dae2fd] rounded border border-[#cbd5e1] transition-colors whitespace-nowrap"
                  >
                    Open Terminal Kiosk Mode →
                  </button>
                </div>
              </div>

              {/* Arrivals Feed */}
              {filteredDepartures.length > 0 ? (
                <div className="space-y-3">
                  {filteredDepartures.map((dep) => (
                    <ArrivalCard
                      key={dep.id}
                      departure={dep}
                      onSelect={(d) => {
                        const v = vehicles.find((veh) => veh.id === d.vehicleId) || null;
                        setSelectedVehicle(v);
                      }}
                      onTrackProgression={handleTrackProgression}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 text-center">
                  <p className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e]">
                    No departures match your filter
                  </p>
                  <p className="text-xs text-[#6d7a72] mt-1">
                    Try clearing your search query or selecting "All Services".
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMode('all');
                    }}
                    className="mt-4 px-4 py-2 text-xs font-semibold bg-[#131b2e] text-white rounded hover:bg-[#283044]"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Municipal Service Advisory Callout */}
              <div className="bg-[#fff7ed] border border-[#ffddb8] rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-['Space_Grotesk'] font-bold text-[#855300] block text-sm">
                    Active Advisory: Fillmore Street Utility Detour (Line 22)
                  </span>
                  <p className="text-[#855300] mt-0.5">
                    Line 22 rerouted via Webster St between Geary & Pine. Expect 4-6m additional headway.{' '}
                    <button
                      onClick={() => setActiveTab('bulletins')}
                      className="underline font-semibold"
                    >
                      View full bulletin
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Stop Progression & Telemetry Track */}
        {activeTab === 'progression' && (
          <StopProgression
            routes={ROUTES}
            selectedRouteId={selectedRouteId}
            onSelectRouteId={setSelectedRouteId}
            vehicles={vehicles}
            onSelectStop={(st) => setCurrentStation(st)}
            onInspectVehicle={(v) => setSelectedVehicle(v)}
            onSimulateVehicleStep={handleSimulateVehicleStep}
          />
        )}

        {/* VIEW 3: Network Topology & Vignelli Schematic Map */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <NetworkTopologyMap
              routes={ROUTES}
              stations={STATIONS}
              vehicles={vehicles}
              selectedStationId={currentStation.id}
              onSelectStation={(st) => {
                setCurrentStation(st);
                setToastMessage(`Station ${st.name} selected on schematic network map`);
                setTimeout(() => setToastMessage(null), 3000);
              }}
              onSelectVehicle={(v) => setSelectedVehicle(v)}
            />

            {/* Topology Station Quick Inspect Bar */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider text-[#6d7a72] block">
                  Focused Station Interlock
                </span>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e]">
                  {currentStation.name} ({currentStation.code})
                </h3>
                <p className="text-xs text-[#6d7a72]">
                  Transfers: Lines {currentStation.transfers.join(', ')} · GPS Coordinates: {currentStation.lat.toFixed(4)}, {currentStation.lng.toFixed(4)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('arrivals')}
                  className="px-4 py-2 bg-[#006948] text-white rounded text-xs font-semibold hover:bg-[#00855d] transition-colors"
                >
                  View Station Departures →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Station Kiosk Mode */}
        {activeTab === 'kiosk' && (
          <StationKioskBoard
            currentStation={currentStation}
            stations={STATIONS}
            onSelectStation={setCurrentStation}
            departures={departures}
            systemTime={systemTime}
          />
        )}

        {/* VIEW 5: Trip Planner */}
        {activeTab === 'planner' && (
          <TripPlanner
            stations={STATIONS}
            onTrackRoute={(routeNum) => {
              const r = ROUTES.find((route) => route.number === routeNum);
              if (r) {
                setSelectedRouteId(r.id);
                setActiveTab('progression');
              }
            }}
          />
        )}

        {/* VIEW 6: Service Bulletins */}
        {activeTab === 'bulletins' && (
          <ServiceBulletins bulletins={SERVICE_BULLETINS} />
        )}
      </main>

      {/* Vehicle Diagnostics Modal */}
      <VehicleTelemetryModal
        vehicle={selectedVehicle}
        route={ROUTES.find((r) => r.id === selectedVehicle?.routeId)}
        onClose={() => setSelectedVehicle(null)}
        onAdvanceProgress={(vId) => handleSimulateVehicleStep(vId)}
      />

      {/* Civic Municipal Footer */}
      <footer className="mt-auto border-t border-[#e2e8f0] bg-white py-6 px-4 md:px-8 text-xs text-[#6d7a72]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-['Space_Grotesk'] font-bold text-[#131b2e]">
              PulseTransit System
            </span>
            <span>·</span>
            <span>Municipal AVL Telematics Standard GTFS-RT v2.4</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button
              onClick={() => setActiveTab('arrivals')}
              className="hover:text-[#131b2e] transition-colors"
            >
              Departures
            </button>
            <button
              onClick={() => setActiveTab('topology')}
              className="hover:text-[#131b2e] transition-colors"
            >
              Network Map
            </button>
            <button
              onClick={() => setActiveTab('kiosk')}
              className="hover:text-[#131b2e] transition-colors"
            >
              Station Kiosk
            </button>
            <button
              onClick={() => setActiveTab('bulletins')}
              className="hover:text-[#131b2e] transition-colors"
            >
              Advisories
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
