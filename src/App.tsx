/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopNav } from './components/TopNav';
import { LtaArrivalCard } from './components/LtaArrivalCard';
import { TactileSearch } from './components/TactileSearch';
import { BusStopDirectory } from './components/BusStopDirectory';
import { StationKioskBoard } from './components/StationKioskBoard';
import { ApiHealthMonitor } from './components/ApiHealthMonitor';
import { SINGAPORE_BUS_STOPS, SingaporeBusStop } from './data/singaporeLtaData';
import { LtaApiResponse, LtaBusService } from './types/transit';
import { transitAudio } from './utils/audio';
import {
  MapPin,
  Clock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Radio,
  ExternalLink,
  ChevronRight,
  Accessibility,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('arrivals');
  const [busStopCode, setBusStopCode] = useState<string>('04121');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Live LTA API Data
  const [data, setData] = useState<LtaApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<number>(20);
  const [systemTime, setSystemTime] = useState<string>('14:30:00');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SGT Singapore Real-Time Clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      try {
        const now = new Date();
        const sgtTime = new Intl.DateTimeFormat('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
        setSystemTime(sgtTime);
      } catch {
        const now = new Date();
        setSystemTime(
          now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Fetch Singapore LTA Bus Arrival from /api/bus-arrival
  const fetchLtaArrivals = useCallback(async (stopCode: string, svcFilter: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let url = `/api/bus-arrival?BusStopCode=${encodeURIComponent(stopCode.trim())}`;
      if (svcFilter.trim()) {
        url += `&ServiceNo=${encodeURIComponent(svcFilter.trim())}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }
      const json: LtaApiResponse = await res.json();
      setData(json);
      setCountdownTimer(20); // Reset 20-second cadence
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to fetch LTA bus arrivals');
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetch when stopCode or serviceFilter changes
  useEffect(() => {
    if (busStopCode.trim()) {
      fetchLtaArrivals(busStopCode, serviceFilter);
    }
  }, [busStopCode, serviceFilter, fetchLtaArrivals]);

  // Automated 20-second cadence matching LTA DataMall refresh cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev <= 1) {
          if (busStopCode.trim()) {
            fetchLtaArrivals(busStopCode, serviceFilter);
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [busStopCode, serviceFilter, fetchLtaArrivals]);

  const currentStopInfo: SingaporeBusStop = useMemo(() => {
    return (
      SINGAPORE_BUS_STOPS.find((s) => s.code === busStopCode) || {
        code: busStopCode,
        name: `Bus Stop #${busStopCode}`,
        road: 'Singapore Road Network',
        zone: 'Republic of Singapore',
        popularServices: [],
      }
    );
  }, [busStopCode]);

  // Quick Civic Center Preset (04121 Old Parliament House)
  const handleNearMeCivic = () => {
    setBusStopCode('04121');
    setServiceFilter('');
    setToastMessage('Targeted Bus Stop #04121: Old Parliament Hse (Civic District)');
    if (isAudioEnabled) {
      transitAudio.playChime();
    }
    setTimeout(() => setToastMessage(null), 3500);
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
        onNearMeClick={handleNearMeCivic}
      />

      {/* Real-time Notification Banner */}
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
        {/* VIEW 1: Live LTA Bus Arrivals Board */}
        {activeTab === 'arrivals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT RAIL (4 Columns): Search, Bus Stop Card, LTA Telematics Info */}
            <div className="lg:col-span-4 space-y-5">
              {/* Tactile Search Component (52px height) */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-4">
                <TactileSearch
                  busStopCode={busStopCode}
                  onBusStopCodeChange={setBusStopCode}
                  serviceFilter={serviceFilter}
                  onServiceFilterChange={setServiceFilter}
                  onQuickSelect={(code) => {
                    setBusStopCode(code);
                    setServiceFilter('');
                  }}
                />
              </div>

              {/* Focused Singapore Bus Stop Card */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f3ff] mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#006948]" />
                    <span className="text-xs font-['Space_Grotesk'] font-bold text-[#6d7a72] uppercase tracking-wider">
                      Singapore Stop Interlock
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-['JetBrains_Mono'] font-bold bg-[#eaedff] text-[#006948]">
                    #{currentStopInfo.code}
                  </span>
                </div>

                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                  {currentStopInfo.name}
                </h2>
                <p className="text-xs text-[#6d7a72] mt-1 font-medium">
                  {currentStopInfo.road} · {currentStopInfo.zone}
                </p>

                {/* Popular Calling Services */}
                {currentStopInfo.popularServices.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#f2f3ff]">
                    <span className="text-[11px] font-semibold text-[#6d7a72] block mb-2">
                      Key Services at this Stop:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentStopInfo.popularServices.map((svc) => (
                        <button
                          key={svc}
                          onClick={() => setServiceFilter(svc)}
                          className={`px-2 py-1 rounded text-xs font-['JetBrains_Mono'] font-bold border transition-colors ${
                            serviceFilter === svc
                              ? 'bg-[#131b2e] text-white border-[#131b2e]'
                              : 'bg-slate-100 text-[#131b2e] border-slate-200 hover:border-[#131b2e]'
                          }`}
                        >
                          {svc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* LTA DataMall 20-second Cadence Chip */}
                <div className="mt-4 pt-3 border-t border-[#f2f3ff] flex items-center justify-between text-xs text-[#6d7a72]">
                  <div className="flex items-center gap-1.5 font-['JetBrains_Mono']">
                    <RefreshCw className={`w-3.5 h-3.5 text-[#006948] ${loading ? 'animate-spin' : ''}`} />
                    <span>Cadence: 20s ({countdownTimer}s remaining)</span>
                  </div>
                  <button
                    onClick={() => fetchLtaArrivals(busStopCode, serviceFilter)}
                    disabled={loading}
                    className="text-[#006948] font-semibold hover:underline"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* LTA Telematics Indicators Legend */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 text-xs">
                <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#131b2e] uppercase tracking-wider mb-3">
                  LTA DataMall Telematics Standards
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
                    <span className="font-semibold text-[#3d4a42]">SEA (Seats Available)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5fff7] text-[#006948] border border-[#85f8c4]">
                      Transit Emerald
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
                    <span className="font-semibold text-[#3d4a42]">SDA (Standing Available)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fff7ed] text-[#855300] border border-[#ffddb8]">
                      Signal Amber
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
                    <span className="font-semibold text-[#3d4a42]">LSD (Limited Standing)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
                      Signal Crimson
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#6d7a72]">
                    <span>WAB: Wheelchair Accessible</span>
                    <span>DD: Double Deck</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT MAIN PANEL (8 Columns): Live Singapore Arrivals */}
            <div className="lg:col-span-8 space-y-4">
              {/* Departure Board Header */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                      Live Arrivals for Stop #{busStopCode}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#f5fff7] text-[#006948] border border-[#85f8c4]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
                      LTA v3
                    </span>
                  </div>
                  <p className="text-xs text-[#6d7a72] mt-0.5 font-medium">
                    {data?.Services?.length || 0} services arriving at {currentStopInfo.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('kiosk')}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#eaedff] text-[#006948] hover:bg-[#dae2fd] rounded border border-[#cbd5e1] transition-colors whitespace-nowrap"
                  >
                    Open Kiosk Mode →
                  </button>
                </div>
              </div>

              {/* LTA Status Notice if simulated */}
              {data?.notice && (
                <div className="p-3 bg-[#fff7ed] border border-[#ffddb8] rounded-lg text-xs text-[#855300] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                  <div>
                    <strong>Singapore LTA Status:</strong> {data.notice}{' '}
                    <button
                      onClick={() => setActiveTab('api')}
                      className="underline font-bold"
                    >
                      View API Monitor
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-4 bg-[#ffdad6] border border-[#ffb4ab] rounded text-xs text-[#ba1a1a]">
                  {errorMsg}
                </div>
              )}

              {/* Arrivals Feed */}
              {data?.Services && data.Services.length > 0 ? (
                <div className="space-y-3">
                  {data.Services.map((svc) => (
                    <LtaArrivalCard
                      key={svc.ServiceNo}
                      service={svc}
                      busStopCode={busStopCode}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 text-center">
                  <p className="font-['Space_Grotesk'] text-lg font-bold text-[#131b2e]">
                    No bus services found for Stop #{busStopCode}
                  </p>
                  <p className="text-xs text-[#6d7a72] mt-1">
                    Please verify the 5-digit bus stop code, or clear the service filter.
                  </p>
                  <button
                    onClick={() => {
                      setBusStopCode('04121');
                      setServiceFilter('');
                    }}
                    className="mt-4 px-4 py-2 text-xs font-semibold bg-[#131b2e] text-white rounded hover:bg-[#283044]"
                  >
                    Reset to Stop #04121
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Bus Stop Directory */}
        {activeTab === 'directory' && (
          <BusStopDirectory
            selectedCode={busStopCode}
            onSelectBusStop={(code) => {
              setBusStopCode(code);
              setServiceFilter('');
              setActiveTab('arrivals');
            }}
          />
        )}

        {/* VIEW 3: Terminal Kiosk Display Mode */}
        {activeTab === 'kiosk' && (
          <StationKioskBoard
            currentStopCode={busStopCode}
            onSelectStopCode={setBusStopCode}
            systemTime={systemTime}
          />
        )}

        {/* VIEW 4: API Health Monitor */}
        {activeTab === 'api' && <ApiHealthMonitor />}
      </main>

      {/* Municipal LTA Footer */}
      <footer className="mt-auto border-t border-[#e2e8f0] bg-white py-6 px-4 md:px-8 text-xs text-[#6d7a72]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-['Space_Grotesk'] font-bold text-[#131b2e]">
              PulseTransit · Singapore LTA DataMall
            </span>
            <span>·</span>
            <span>Land Transport Authority DataMall v3 Protocol</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button
              onClick={() => setActiveTab('arrivals')}
              className="hover:text-[#131b2e] transition-colors"
            >
              Live Arrivals
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className="hover:text-[#131b2e] transition-colors"
            >
              Stop Directory
            </button>
            <button
              onClick={() => setActiveTab('kiosk')}
              className="hover:text-[#131b2e] transition-colors"
            >
              Kiosk Board
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className="hover:text-[#131b2e] transition-colors"
            >
              API Monitor
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
