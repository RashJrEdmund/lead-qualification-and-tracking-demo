/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChatWidget } from './components/ChatWidget';
import { Dashboard } from './components/Dashboard';
import { SetupInstructions } from './components/SetupInstructions';
import { WebLead } from './types';
import { MessageSquare, Users2, Settings, FileSpreadsheet, Bot } from 'lucide-react';
import { deleteLead, getAllLeads } from './services/leadStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'setup'>('chat');
  const [leads, setLeads] = useState<WebLead[]>([]);

  useEffect(() => {
    setLeads(getAllLeads());
  }, []);

  const handleLeadQualified = (newLead: WebLead) => {
    setLeads((prev) => {
      const existsIdx = prev.findIndex((l) => l.id === newLead.id);
      if (existsIdx > -1) {
        const updated = [...prev];
        updated[existsIdx] = newLead;
        return updated;
      }
      return [newLead, ...prev];
    });
  };

  const handleDeleteLead = (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this lead from session storage?',
    );
    if (!confirmDelete) return;

    if (deleteLead(id)) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg">
              <Bot className="w-5.5 h-5.5 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-slate-100">
                Auden CRM Lead Pilot
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                Client-side demo · Gemini + session storage
              </p>
            </div>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all ${
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              SDR Assistant
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              Qualified Leads
              {leads.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                    activeTab === 'dashboard' ? 'bg-slate-900 text-emerald-400' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {leads.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all ${
                activeTab === 'setup'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Setup Guide
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative">
        <div className="space-y-6">
          {activeTab === 'chat' && <ChatWidget onLeadQualified={handleLeadQualified} />}

          {activeTab === 'dashboard' && (
            <Dashboard leads={leads} onDeleteLead={handleDeleteLead} sheetsConfigured={false} />
          )}

          {activeTab === 'setup' && <SetupInstructions />}
        </div>
      </main>

      <footer className="py-6 border-t border-slate-900 text-center text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Auden SDR · Powered by Gemini 3.5-flash (browser)</span>
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Demo · session storage only
          </span>
        </div>
      </footer>
    </div>
  );
}
