import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, Shield, Flag, Globe, Server } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { FeatureFlags } from '@/utils/featureFlags';

interface StatusItem {
  label: string;
  value: string;
  ok: boolean;
}

export const HealthCheckPage: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'unreachable'>('checking');
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkSupabase = async () => {
      const start = performance.now();
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        const elapsed = Math.round(performance.now() - start);
        setDbLatency(elapsed);
        setSupabaseStatus(error ? 'unreachable' : 'connected');
      } catch {
        setSupabaseStatus('unreachable');
      }
    };
    checkSupabase();
  }, []);

  const flags: StatusItem[] = [
    { label: 'AI Generation', value: String(FeatureFlags.AI_GENERATION), ok: true },
    { label: 'AI Chat', value: String(FeatureFlags.AI_CHAT), ok: true },
    { label: 'Demo Mode', value: String(FeatureFlags.DEMO_MODE), ok: true },
  ];

  const env: StatusItem[] = [
    { label: 'App Version', value: import.meta.env.VITE_APP_VERSION || '0.0.0', ok: true },
    { label: 'Build Mode', value: import.meta.env.MODE, ok: true },
    {
      label: 'Supabase URL',
      value: (import.meta.env.VITE_SUPABASE_URL as string)?.replace(/https?:\/\//, '').slice(0, 20) + '…',
      ok: !!import.meta.env.VITE_SUPABASE_URL,
    },
    { label: 'API URL', value: import.meta.env.VITE_API_URL || 'Not configured', ok: true },
  ];

  const routes = [
    { path: '/', label: 'Landing', access: 'Public' },
    { path: '/login', label: 'Login', access: 'Public' },
    { path: '/dashboard', label: 'Learner Dashboard', access: 'Authenticated' },
    { path: '/module/:id', label: 'Module', access: 'Authenticated' },
    { path: '/topic/:id', label: 'Topic / Stage', access: 'Authenticated' },
    { path: '/topic/:id/assessment', label: 'Assessment', access: 'Authenticated' },
    { path: '/facilitator', label: 'Facilitator Dashboard', access: 'Facilitator+' },
    { path: '/module-lead', label: 'Module Lead Dashboard', access: 'Module Lead+' },
    { path: '/admin/health', label: 'Health Check', access: 'Admin only' },
    { path: '/resume', label: 'Resume Session', access: 'Public' },
    { path: '/privacy', label: 'Privacy Policy', access: 'Public' },
    { path: '/access-denied', label: 'Access Denied', access: 'Public' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Activity className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-extrabold text-slate-900">System Health Check</h1>
      </div>
      <p className="text-sm text-slate-500">
        Admin-only diagnostic page. Shows current system status, feature flags, and route structure.
      </p>

      {/* Supabase Connection */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Server className="w-5 h-5 text-slate-500" />
          Supabase Connection
        </h2>
        <div className="flex items-center gap-3">
          {supabaseStatus === 'checking' && (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              Checking…
            </div>
          )}
          {supabaseStatus === 'connected' && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Connected {dbLatency !== null && <span className="text-xs text-slate-400">({dbLatency}ms)</span>}
            </div>
          )}
          {supabaseStatus === 'unreachable' && (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Unreachable
            </div>
          )}
        </div>
      </section>

      {/* Feature Flags */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Flag className="w-5 h-5 text-slate-500" />
          Feature Flags
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {flags.map((f) => (
            <div key={f.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
              <span className="text-sm font-medium text-slate-700">{f.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.value === 'true' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                {f.value === 'true' ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Environment */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Globe className="w-5 h-5 text-slate-500" />
          Environment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {env.map((e) => (
            <div key={e.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
              <span className="text-sm font-medium text-slate-700">{e.label}</span>
              <span className="text-sm text-slate-600 font-mono">{e.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Route Map */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-500" />
          Route Map
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="pb-2 pr-4">Path</th>
                <th className="pb-2 pr-4">Page</th>
                <th className="pb-2">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routes.map((r) => (
                <tr key={r.path}>
                  <td className="py-2 pr-4 font-mono text-slate-700">{r.path}</td>
                  <td className="py-2 pr-4 text-slate-600">{r.label}</td>
                  <td className="py-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.access === 'Public' ? 'bg-slate-100 text-slate-600' :
                      r.access === 'Authenticated' ? 'bg-blue-50 text-blue-700' :
                      r.access.includes('Facilitator') ? 'bg-indigo-50 text-indigo-700' :
                      r.access.includes('Module Lead') ? 'bg-teal-50 text-teal-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {r.access}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
