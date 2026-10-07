import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Terminal, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { ApiHealthResponse } from '../types/transit';

export const ApiHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testStopCode, setTestStopCode] = useState<string>('04121');
  const [testServiceNo, setTestServiceNo] = useState<string>('7');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runApiTest = async () => {
    setTestLoading(true);
    try {
      let url = `/api/bus-arrival?BusStopCode=${encodeURIComponent(testStopCode.trim())}`;
      if (testServiceNo.trim()) {
        url += `&ServiceNo=${encodeURIComponent(testServiceNo.trim())}`;
      }
      const startTime = performance.now();
      const res = await fetch(url);
      const json = await res.json();
      const endTime = performance.now();
      setTestResult({
        status: res.status,
        latencyMs: Math.round(endTime - startTime),
        url,
        data: json,
      });
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    runApiTest();
  }, []);

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText('LTA_ACCOUNT_KEY=your_key_here');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Health Overview Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse" />
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#131b2e]">
                LTA DataMall Telematics API Monitor
              </h2>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1 font-medium">
              Diagnostic console for monitoring <code className="bg-[#eaedff] px-1.5 py-0.5 rounded text-[#006948] font-['JetBrains_Mono']">/api/health</code> and serverless proxy routes
            </p>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="px-3.5 py-2 bg-[#faf8ff] border border-[#cbd5e1] hover:border-[#131b2e] rounded text-xs font-semibold text-[#131b2e] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#006948] ${loading ? 'animate-spin' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        {/* Health status grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="p-3 bg-[#faf8ff] border border-[#e2e8f0] rounded">
            <span className="text-[11px] text-[#6d7a72] uppercase font-bold block mb-1">
              Endpoint Status
            </span>
            <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] font-bold text-sm text-[#006948]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{health?.status === 'ok' ? 'HEALTHY (HTTP 200)' : 'CHECKING...'}</span>
            </div>
          </div>

          <div className="p-3 bg-[#faf8ff] border border-[#e2e8f0] rounded">
            <span className="text-[11px] text-[#6d7a72] uppercase font-bold block mb-1">
              LTA_ACCOUNT_KEY State
            </span>
            <div className="font-['JetBrains_Mono'] font-bold text-sm">
              {health?.ltaConfigured ? (
                <span className="text-[#006948] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Active in Env
                </span>
              ) : (
                <span className="text-[#855300] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#f59e0b]" /> Awaiting Vercel Key
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#faf8ff] border border-[#e2e8f0] rounded">
            <span className="text-[11px] text-[#6d7a72] uppercase font-bold block mb-1">
              Serverless Runtime
            </span>
            <div className="font-['JetBrains_Mono'] font-bold text-sm text-[#131b2e]">
              Node.js · {health?.environment || 'Production'}
            </div>
          </div>
        </div>
      </div>

      {/* Vercel Environment Variable Instructions Card */}
      <div className="bg-[#fff7ed] border border-[#ffddb8] rounded-lg p-5">
        <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#855300] flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>Configuring LTA_ACCOUNT_KEY in Vercel</span>
        </h3>
        <p className="text-xs text-[#855300] mt-1.5 leading-relaxed">
          In your <strong>Vercel Dashboard</strong> → <strong>Project Settings</strong> → <strong>Environment Variables</strong>:
        </p>

        <div className="mt-3 flex items-center gap-2 max-w-md">
          <code className="flex-1 bg-white px-3 py-2 border border-[#ffddb8] rounded text-xs font-['JetBrains_Mono'] font-bold text-[#131b2e]">
            LTA_ACCOUNT_KEY = [your key from the email]
          </code>
          <button
            onClick={copyEnvSnippet}
            className="px-3 py-2 bg-white border border-[#ffddb8] hover:border-[#855300] text-xs font-semibold rounded text-[#855300] flex items-center gap-1 shrink-0 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#006948]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#855300] mt-2">
          Until the key is set, the endpoint automatically returns realistic Singapore LTA DataMall v3 mock data so the app remains fully functional.
        </p>
      </div>

      {/* Interactive API Tester & Live JSON Inspector */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
        <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#131b2e] mb-3">
          Interactive LTA DataMall v3 API Tester
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-[#6d7a72] uppercase mb-1">
              BusStopCode
            </label>
            <input
              type="text"
              value={testStopCode}
              onChange={(e) => setTestStopCode(e.target.value)}
              placeholder="04121"
              className="w-full h-10 px-3 bg-[#faf8ff] border border-[#cbd5e1] rounded font-['JetBrains_Mono'] text-xs font-bold text-[#131b2e] outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-[#6d7a72] uppercase mb-1">
              ServiceNo (Optional)
            </label>
            <input
              type="text"
              value={testServiceNo}
              onChange={(e) => setTestServiceNo(e.target.value)}
              placeholder="7"
              className="w-full h-10 px-3 bg-[#faf8ff] border border-[#cbd5e1] rounded font-['JetBrains_Mono'] text-xs text-[#131b2e] outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              onClick={runApiTest}
              disabled={testLoading}
              className="w-full h-10 bg-[#006948] hover:bg-[#00855d] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
              <span>Send Request</span>
            </button>
          </div>
        </div>

        {/* Live response box */}
        {testResult && (
          <div className="mt-4 border border-[#e2e8f0] rounded overflow-hidden">
            <div className="px-3 py-2 bg-[#131b2e] text-white text-[11px] font-['JetBrains_Mono'] flex items-center justify-between">
              <span>GET {testResult.url}</span>
              <span className="text-[#85f8c4]">
                HTTP {testResult.status} · {testResult.latencyMs}ms
              </span>
            </div>
            <pre className="p-3 bg-[#faf8ff] text-xs font-['JetBrains_Mono'] overflow-x-auto text-[#131b2e] max-h-72">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
