import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceBulletin } from '../types/transit';

interface ServiceBulletinsProps {
  bulletins: ServiceBulletin[];
}

export const ServiceBulletins: React.FC<ServiceBulletinsProps> = ({ bulletins }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(bulletins[0]?.id || null);

  const filtered = bulletins.filter((b) => {
    if (filterSeverity === 'all') return true;
    return b.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#f59e0b]" />
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                Municipal Service Advisories & Detours
              </h2>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1 font-medium">
              Official real-time telematics bulletins published by Central Transit Dispatch
            </p>
          </div>

          {/* Filter Pills / Segmented Controls */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'moderate', label: 'Detours' },
              { id: 'minor', label: 'Advisories' },
            ].map((flt) => (
              <button
                key={flt.id}
                onClick={() => setFilterSeverity(flt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                  filterSeverity === flt.id
                    ? 'bg-[#131b2e] text-white border-[#131b2e]'
                    : 'bg-white text-[#3d4a42] border-[#e2e8f0] hover:border-[#cbd5e1]'
                }`}
              >
                {flt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulletins List */}
      <div className="space-y-4">
        {filtered.map((b) => {
          const isExpanded = expandedId === b.id;
          const isModerate = b.severity === 'moderate';

          return (
            <div
              key={b.id}
              className={`bg-white border rounded-lg overflow-hidden transition-all ${
                isModerate
                  ? 'border-[#ffddb8] hover:border-[#f59e0b]'
                  : 'border-[#e2e8f0] hover:border-[#131b2e]'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : b.id)}
                className="p-5 cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2 rounded mt-0.5 shrink-0 ${
                      isModerate ? 'bg-[#fff7ed] text-[#855300]' : 'bg-[#eaedff] text-[#0051d5]'
                    }`}
                  >
                    {isModerate ? (
                      <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                    ) : (
                      <Info className="w-5 h-5 text-[#0051d5]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider text-[#6d7a72]">
                        {b.id} · {b.effectivePeriod}
                      </span>
                    </div>

                    <h3 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-[#131b2e] mt-0.5">
                      {b.title}
                    </h3>

                    <p className="text-xs md:text-sm text-[#3d4a42] mt-1 font-medium">
                      {b.summary}
                    </p>
                  </div>
                </div>

                <button className="p-1 text-[#6d7a72] hover:text-[#131b2e]">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[#f2f3ff] bg-[#faf8ff] text-xs">
                  <h4 className="font-['Space_Grotesk'] font-bold text-[#131b2e] mb-1">
                    Operational Routing Directive
                  </h4>
                  <p className="text-[#3d4a42] leading-relaxed mb-3 font-normal">
                    {b.detail}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#dae2fd]">
                    <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] text-[#6d7a72]">
                      <span>Affected Stations:</span>
                      {b.affectedStops.map((st) => (
                        <span key={st} className="px-1.5 py-0.5 bg-white border border-[#cbd5e1] rounded font-semibold text-[#131b2e]">
                          {st}
                        </span>
                      ))}
                    </div>

                    <span className="text-[11px] font-semibold text-[#006948]">
                      Verified by Municipal Transit Authority
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
