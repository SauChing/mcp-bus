import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Layers, Bus, Compass, Eye, ShieldCheck, MapPin } from 'lucide-react';
import { TransitRoute, TransitStop, VehicleTelemetry } from '../types/transit';

interface NetworkTopologyMapProps {
  routes: TransitRoute[];
  stations: Record<string, TransitStop>;
  vehicles: VehicleTelemetry[];
  onSelectStation: (station: TransitStop) => void;
  onSelectVehicle: (vehicle: VehicleTelemetry) => void;
  selectedStationId?: string;
}

export const NetworkTopologyMap: React.FC<NetworkTopologyMapProps> = ({
  routes,
  stations,
  vehicles,
  onSelectStation,
  onSelectVehicle,
  selectedStationId,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [hoveredStation, setHoveredStation] = useState<TransitStop | null>(null);

  // SVG canvas coordinate mapping: bounds
  // We can convert the GPS lat/lng into an aesthetic Swiss schematic coordinate system
  const minLat = 37.735;
  const maxLat = 37.805;
  const minLng = -122.445;
  const maxLng = -122.385;

  const width = 880;
  const height = 580;
  const padding = 60;

  const projectCoord = (lat: number, lng: number) => {
    const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
    // Invert Y so north is at top
    const y = height - (padding + ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding));
    return { x, y };
  };

  const filteredRoutes = routes.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'bus') return r.mode === 'bus';
    if (activeFilter === 'metro') return r.mode === 'metro';
    if (activeFilter === 'rapid') return r.mode === 'rapid';
    return true;
  });

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative bg-[#faf8ff] border border-[#e2e8f0] rounded-lg overflow-hidden shadow-xs">
      {/* Top Map Header Controls */}
      <div className="p-4 bg-white border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-['Space_Grotesk'] text-lg md:text-xl font-bold text-[#131b2e]">
              Municipal Route Topology Map
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#f5fff7] text-[#006948] border border-[#85f8c4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
              TELEMATICS ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#6d7a72] mt-0.5 font-medium">
            Schematic network geometry inspired by Massimo Vignelli transit standards
          </p>
        </div>

        {/* Filter modes */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Corridors' },
            { id: 'bus', label: 'Trunk Buses' },
            { id: 'metro', label: 'Metro Rapid' },
            { id: 'rapid', label: 'Regional Express' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setActiveFilter(flt.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                activeFilter === flt.id
                  ? 'bg-[#131b2e] text-white border-[#131b2e]'
                  : 'bg-white text-[#3d4a42] border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full h-[520px] md:h-[580px] overflow-hidden bg-[#faf8ff] cursor-grab active:cursor-grabbing select-none">
        {/* Subtle grid background resembling transit blueprint paper */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #dae2fd 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Water / Bay Graphic Element (San Francisco Bay shoreline aesthetic) */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Bay Area Shoreline aesthetic polygon */}
          <path
            d="M 680 0 L 880 0 L 880 580 L 740 580 C 700 480, 710 320, 640 220 C 600 160, 620 80, 680 0 Z"
            fill="#eaedff"
            opacity="0.8"
          />
          <text
            x="770"
            y="260"
            fill="#0051d5"
            fontSize="11"
            fontFamily="Space Grotesk"
            fontWeight="bold"
            letterSpacing="0.2em"
            opacity="0.4"
            transform="rotate(90, 770, 260)"
          >
            BAY WATERS & MARITIME PIERS
          </text>

          {/* Draw Route Paths */}
          {filteredRoutes.map((route) => {
            const points = route.stops.map((stop) => projectCoord(stop.lat, stop.lng));
            if (points.length < 2) return null;

            // Generate clean path string
            const pathD = points.reduce((acc, p, i) => {
              return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
            }, '');

            return (
              <g key={route.id} className="route-group">
                {/* Outer shadow stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Core Colored Route Track (3px-6px solid track) */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={route.colorHex}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />

                {/* Line number badge on route path mid-point */}
                {points.length > 2 && (
                  <g transform={`translate(${(points[1].x + points[2].x) / 2}, ${(points[1].y + points[2].y) / 2})`}>
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="20"
                      rx="3"
                      fill={route.colorHex}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {route.number}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Stations / Interchange Nodes */}
          {Object.values(stations).map((station) => {
            const { x, y } = projectCoord(station.lat, station.lng);
            const isInterchange = station.transfers.length > 1;
            const isSelected = selectedStationId === station.id;

            return (
              <g
                key={station.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => onSelectStation(station)}
                onMouseEnter={() => setHoveredStation(station)}
                onMouseLeave={() => setHoveredStation(null)}
                className="cursor-pointer group"
              >
                {/* Interactive hit area */}
                <circle r="18" fill="transparent" />

                {isSelected ? (
                  /* Highlighted Selected Station */
                  <g>
                    <circle r="14" fill="#85f8c4" opacity="0.6" className="animate-pulse" />
                    <circle r="9" fill="#006948" stroke="#ffffff" strokeWidth="2.5" />
                    <circle r="3" fill="#ffffff" />
                  </g>
                ) : isInterchange ? (
                  /* Swiss Interchange Node: Concentric white circle with dark rim */
                  <g>
                    <circle r="8.5" fill="#ffffff" stroke="#131b2e" strokeWidth="2.5" />
                    <circle r="3.5" fill="#131b2e" />
                  </g>
                ) : (
                  /* Regular Stop: Solid circular node with white ring */
                  <circle r="5" fill="#ffffff" stroke="#3d4a42" strokeWidth="2" />
                )}

                {/* Station Label */}
                <text
                  x={x > width - 180 ? -12 : 12}
                  y="4"
                  textAnchor={x > width - 180 ? 'end' : 'start'}
                  fill="#131b2e"
                  fontSize="12"
                  fontFamily="Space Grotesk"
                  fontWeight={isInterchange || isSelected ? '700' : '600'}
                  className="pointer-events-none drop-shadow-xs"
                >
                  {station.name}
                </text>
              </g>
            );
          })}

          {/* Live Moving Vehicles with GPS Coordinates */}
          {vehicles.map((veh) => {
            const route = routes.find((r) => r.id === veh.routeId);
            if (!route) return null;

            const fromStop = route.stops[veh.currentStopIndex];
            const toStop = route.stops[Math.min(veh.currentStopIndex + 1, route.stops.length - 1)];
            if (!fromStop || !toStop) return null;

            const p1 = projectCoord(fromStop.lat, fromStop.lng);
            const p2 = projectCoord(toStop.lat, toStop.lng);

            // Interpolate position based on progressBetweenStops
            const vehX = p1.x + (p2.x - p1.x) * veh.progressBetweenStops;
            const vehY = p1.y + (p2.y - p1.y) * veh.progressBetweenStops;

            return (
              <g
                key={veh.id}
                transform={`translate(${vehX}, ${vehY})`}
                onClick={() => onSelectVehicle(veh)}
                className="cursor-pointer"
              >
                {/* Concentric live ping circle */}
                <circle r="14" fill="#006948" opacity="0.2" className="animate-pulse" />

                {/* Vehicle Marker */}
                <rect
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  rx="4"
                  fill="#131b2e"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="shadow-md"
                />

                {/* Inner vehicle glyph */}
                <circle r="3" fill="#85f8c4" />

                {/* Floating Vehicle Label */}
                <g transform="translate(0, -18)">
                  <rect
                    x="-26"
                    y="-9"
                    width="52"
                    height="16"
                    rx="2"
                    fill="#131b2e"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {veh.id.replace('BUS-', 'B').replace('LRV-', 'L').replace('EXP-', 'E')} · {veh.speedKmh}k
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hovered Station Tooltip Card */}
        {hoveredStation && (
          <div className="absolute top-4 left-4 z-20 bg-white border border-[#131b2e] rounded p-3 shadow-md max-w-xs pointer-events-none">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#6d7a72] block">
              {hoveredStation.zone} · {hoveredStation.code}
            </span>
            <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#131b2e]">
              {hoveredStation.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-[#3d4a42] font-semibold">Lines:</span>
              {hoveredStation.transfers.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#131b2e] text-white"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Map Interaction Controls: High-contrast square icons (40x40px), pure white surface with 1px solid #CBD5E1, dark glyphs */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-[40px] h-[40px] bg-white border border-[#cbd5e1] rounded hover:border-[#131b2e] flex items-center justify-center text-[#131b2e] shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-[40px] h-[40px] bg-white border border-[#cbd5e1] rounded hover:border-[#131b2e] flex items-center justify-center text-[#131b2e] shadow-sm transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Topology View"
            className="w-[40px] h-[40px] bg-white border border-[#cbd5e1] rounded hover:border-[#131b2e] flex items-center justify-center text-[#131b2e] shadow-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-[#e2e8f0] rounded p-3 text-xs shadow-xs hidden sm:block">
          <div className="font-['Space_Grotesk'] font-bold text-[#131b2e] mb-1.5 uppercase tracking-wider text-[10px]">
            Network Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-medium text-[#3d4a42]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#006948] rounded" />
              <span>Line 10 (Trunk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#0051d5] rounded" />
              <span>Line 49R (Metro)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#f59e0b] rounded" />
              <span>Line 22 (Crosstown)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#ba1a1a] rounded" />
              <span>Line E8 (Express)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
