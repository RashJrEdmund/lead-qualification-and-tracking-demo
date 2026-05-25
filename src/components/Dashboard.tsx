/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WebLead, Lead } from '../types';
import { 
  Trash2, FileSpreadsheet, CheckCircle, AlertTriangle, Search, Filter, 
  HelpCircle, Sparkles, BarChart2, TrendingUp, Users, Award, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  leads: WebLead[];
  onDeleteLead: (id: string) => void;
  sheetsConfigured: boolean;
}

export function Dashboard({ leads, onDeleteLead, sheetsConfigured }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedLead, setSelectedLead] = useState<WebLead | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.interest.toLowerCase().includes(searchTerm.toLowerCase());

    const score = lead.score || 0;
    if (scoreFilter === 'high') return matchesSearch && score >= 80;
    if (scoreFilter === 'medium') return matchesSearch && score >= 40 && score < 80;
    if (scoreFilter === 'low') return matchesSearch && score < 40;
    return matchesSearch;
  });

  const avgScore = leads.length 
    ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length) 
    : 0;

  const syncedCount = leads.filter(l => l.synced).length;

  return (
    <div className="space-y-6 text-left">
      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI: Total */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">Leads Collected</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100 mt-0.5">{leads.length}</h3>
          </div>
        </div>

        {/* KPI: Avg Quality */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">Avg Quality Score</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100 mt-0.5">{avgScore} / 100</h3>
          </div>
        </div>

        {/* KPI: Synced */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">Synchronized Row</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100 mt-0.5">{syncedCount} Leads</h3>
          </div>
        </div>

        {/* KPI: Configuration Status */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            sheetsConfigured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }`}>
            {sheetsConfigured ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">Sheets API Status</p>
            <h3 className="font-display text-xs sm:text-sm font-bold text-slate-100 mt-1">
              {sheetsConfigured ? 'Connected (Service)' : 'Pending Secret config'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads, interest or company..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 text-xs flex items-center gap-1 shrink-0 px-2">
              <Filter className="w-3.5 h-3.5" /> Filter Quality:
            </span>
            <button
              onClick={() => setScoreFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 border ${
                scoreFilter === 'all' 
                  ? 'bg-slate-800 text-slate-100 border-slate-700' 
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setScoreFilter('high')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 border ${
                scoreFilter === 'high' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              High (80+)
            </button>
            <button
              onClick={() => setScoreFilter('medium')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 border ${
                scoreFilter === 'medium' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Med (40-79)
            </button>
          </div>
        </div>

        {/* Data List container */}
        {filteredLeads.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-55" />
            <p className="text-sm">No leads discovered yet matching selected query filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300 text-left border-collapse table-auto">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="p-3 pl-4">Score</th>
                  <th className="p-3">Company & Contact</th>
                  <th className="p-3">Core Need / Interest</th>
                  <th className="p-3">Project Scope</th>
                  <th className="p-3">Sync State</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    {/* Quality Column */}
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 40 ? 'bg-amber-500' : 'bg-slate-500'
                        }`} />
                        <span className="font-display font-bold text-slate-100">{lead.score}</span>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="p-3">
                      <div>
                        <p className="text-slate-100 font-semibold">{lead.company}</p>
                        <p className="text-slate-400 mt-0.5">{lead.name} • {lead.email}</p>
                      </div>
                    </td>

                    {/* Core Need Interest */}
                    <td className="p-3 max-w-xs truncate font-medium">
                      {lead.interest}
                    </td>

                    {/* Timeline & Budget */}
                    <td className="p-3">
                      <div>
                        <p className="text-slate-200">Budget: {lead.budget || 'N/A'}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Timeline: {lead.timeline || 'N/A'}</p>
                      </div>
                    </td>

                    {/* Sync Indicator */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      {lead.synced ? (
                        <div className="inline-flex items-center gap-1 py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Synced
                        </div>
                      ) : (
                        <div 
                          className="inline-flex items-center gap-1 py-0.5 px-2 bg-slate-800 border border-slate-700/80 text-slate-400 rounded-full font-semibold group relative cursor-help"
                          title={lead.syncError || "Local store offline fallback"}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Stored Local
                        </div>
                      )}
                    </td>

                    {/* Delete panel */}
                    <td className="p-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1 px-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer"
                        title="Remove Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected lead detail modal overlay */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 border border-slate-800"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">Lead Details</span>
                  <h4 className="font-display font-bold text-lg text-slate-100 mt-1">{selectedLead.company}</h4>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="text-emerald-400 font-semibold font-display">{selectedLead.score} Score</span>
                </div>
              </div>

              <section className="space-y-2 text-xs">
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400 font-semibold">Contact Name:</span>
                  <span className="col-span-2 text-slate-100">{selectedLead.name}</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400 font-semibold">Email:</span>
                  <span className="col-span-2 text-slate-100 font-mono">{selectedLead.email}</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400 font-semibold">Core Intent:</span>
                  <span className="col-span-2 text-slate-100 font-semibold">{selectedLead.interest}</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400 font-semibold">Project Budget:</span>
                  <span className="col-span-2 text-slate-100">{selectedLead.budget || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400 font-semibold">Timeline Goal:</span>
                  <span className="col-span-2 text-slate-100">{selectedLead.timeline || 'N/A'}</span>
                </div>
                {selectedLead.createdAt && (
                  <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/50">
                    <span className="text-slate-400 font-semibold">Discovered:</span>
                    <span className="col-span-2 text-slate-100">{new Date(selectedLead.createdAt).toLocaleString()}</span>
                  </div>
                )}
              </section>

              {selectedLead.conversationSummary && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl leading-relaxed text-xs">
                  <strong className="text-slate-400 font-semibold block mb-1">Executive Summary Insight (AI):</strong>
                  <p className="text-slate-300 italic">{selectedLead.conversationSummary}</p>
                </div>
              )}

              {selectedLead.syncError && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
                  <strong>Sync Warning:</strong> {selectedLead.syncError}
                </div>
              )}

              <div className="flex gap-4 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Close Insights
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
