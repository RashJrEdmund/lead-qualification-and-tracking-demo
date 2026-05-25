/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChatWidget } from './components/ChatWidget';
import { Dashboard } from './components/Dashboard';
import { SetupInstructions } from './components/SetupInstructions';
import { WebLead } from './types';
import { MessageSquare, Users2, Settings, FileSpreadsheet, Bot, HelpCircle, HardDriveDownload } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'setup'>('chat');
  const [leads, setLeads] = useState<WebLead[]>([]);
  const [sheetsConfigured, setSheetsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  // Synchronize configs and lead inventories on initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [leadsRes, configRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/sheets-config')
        ]);

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(leadsData);
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          setSheetsConfigured(configData.isConfigured);
        }
      } catch (err) {
        console.error("Failed to load initial dataset:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLeadQualified = (newLead: WebLead) => {
    // If we already have the lead matching this email/company, update it, else prepend
    setLeads(prev => {
      const existsIdx = prev.findIndex(l => l.id === newLead.id);
      if (existsIdx > -1) {
        const updated = [...prev];
        updated[existsIdx] = newLead;
        return updated;
      }
      return [newLead, ...prev];
    });
  };

  const handleDeleteLead = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this lead from local records?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation banner */}
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo element */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg">
              <Bot className="w-5.5 h-5.5 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-slate-100">
                Auden CRM Lead Pilot
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                AI Agent & Sheets Pipeline
              </p>
            </div>
          </div>

          {/* Navigation Control toggles */}
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
                <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                  activeTab === 'dashboard' ? 'bg-slate-900 text-emerald-400' : 'bg-slate-800 text-slate-300'
                }`}>
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

      {/* Main app viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-sm font-mono">Retrieving system diagnostics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'chat' && (
              <ChatWidget 
                onLeadQualified={handleLeadQualified} 
                sheetsConfigured={sheetsConfigured} 
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard 
                leads={leads} 
                onDeleteLead={handleDeleteLead}
                sheetsConfigured={sheetsConfigured}
              />
            )}

            {activeTab === 'setup' && (
              <SetupInstructions />
            )}
          </div>
        )}
      </main>

      {/* Elegant minimalist footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Auden SDR • Powered by Gemini 3.5-flash</span>
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> {sheetsConfigured ? 'Sheets Connected' : 'Google Sheets Auth Offline'}
          </span>
        </div>
      </footer>
    </div>
  );
}
