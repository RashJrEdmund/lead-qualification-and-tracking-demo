/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, CheckCircle, Database, HelpCircle, CheckCircle2, ShieldCheck, HelpCircle as HelpIcon, Sparkles } from 'lucide-react';
import { Message, Lead, WebLead } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { generateChatResponse, extractStructuredLead } from '../services/ai';
import { saveLead } from '../services/leadStorage';
import { validateLead } from '../utils/validation';

interface ChatWidgetProps {
  onLeadQualified: (lead: WebLead) => void;
}

export function ChatWidget({ onLeadQualified }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_1',
      role: 'assistant',
      content: "Hello! I am Auden, your growth assistant at Apex Digital Solutions. Looking to build custom software or scale your systems? Tell me a bit about your project or business goals, and let's get started!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ status: 'idle' | 'syncing' | 'synced' | 'failed'; message: string }>({
    status: 'idle',
    message: ''
  });

  // Extracted lead in progress from API responses
  const [liveLead, setLiveLead] = useState<Partial<Lead>>({
    name: undefined,
    email: undefined,
    company: undefined,
    interest: undefined,
    budget: undefined,
    timeline: undefined,
    score: 0,
    conversationSummary: ''
  });

  const [leadExtractionComplete, setLeadExtractionComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsgText = inputMsg.trim();
    setInputMsg('');

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const history = updatedMessages.map((msg) => ({ role: msg.role, content: msg.content }));
      const assistantText = await generateChatResponse(history);
      const extractedLead = await extractStructuredLead([
        ...history,
        { role: 'assistant' as const, content: assistantText },
      ]);

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const ext: Partial<Lead> = {
        name: extractedLead.name ?? undefined,
        email: extractedLead.email ?? undefined,
        company: extractedLead.company ?? undefined,
        interest: extractedLead.interest ?? undefined,
        budget: extractedLead.budget ?? undefined,
        timeline: extractedLead.timeline ?? undefined,
        score: extractedLead.score,
        conversationSummary: extractedLead.conversationSummary,
      };
      setLiveLead(ext);

      if (extractedLead.isComplete && !leadExtractionComplete) {
        setLeadExtractionComplete(true);
        await triggerLeadSubmission(ext);
      }
    } catch (err: unknown) {
      console.error(err);
      const detail =
        err instanceof Error ? err.message : 'Unknown error';
      const isConfigError =
        detail.includes('API key') || detail.includes('VITE_GEMINI');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: isConfigError
            ? detail
            : `Sorry, something went wrong talking to Gemini: ${detail}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerLeadSubmission = async (leadToSubmit: Partial<Lead>) => {
    setSyncStatus({ status: 'syncing', message: 'Lead qualified! Saving to session storage...' });

    try {
      const validationErrors = validateLead(leadToSubmit);
      if (validationErrors.length > 0) {
        setSyncStatus({
          status: 'failed',
          message: validationErrors.map((e) => e.message).join(' '),
        });
        return;
      }

      const savedLead = saveLead({
        name: leadToSubmit.name!,
        email: leadToSubmit.email!,
        company: leadToSubmit.company!,
        interest: leadToSubmit.interest!,
        budget: leadToSubmit.budget || 'N/A',
        timeline: leadToSubmit.timeline || 'N/A',
        score: leadToSubmit.score || 50,
        conversationSummary:
          leadToSubmit.conversationSummary || 'Qualified via organic chatbot conversation.',
        synced: false,
      });

      setSyncStatus({
        status: 'synced',
        message: 'Saved to session storage. Refresh the tab to reset demo data.',
      });
      onLeadQualified(savedLead);
    } catch (err: unknown) {
      console.error(err);
      setSyncStatus({ status: 'failed', message: 'Could not save lead to session storage.' });
    }
  };

  const resetSession = () => {
    setMessages([
      {
        id: 'msg_1',
        role: 'assistant',
        content: "Hello! I am Auden, your growth assistant at Apex Digital Solutions. Looking to build custom software or scale your systems? Tell me a bit about your project or business goals, and let's get started!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLiveLead({
      name: undefined,
      email: undefined,
      company: undefined,
      interest: undefined,
      budget: undefined,
      timeline: undefined,
      score: 0,
      conversationSummary: ''
    });
    setLeadExtractionComplete(false);
    setSyncStatus({ status: 'idle', message: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 leading-normal text-left">
      {/* Dynamic Chat stream */}
      <div className="lg:col-span-7 flex flex-col bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden h-[620px]">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sm:px-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <h3 className="font-display font-medium text-slate-100 text-sm md:text-base">Auden — SDR Assistant</h3>
              <p className="text-xs text-slate-400">Apex Digital Solutions</p>
            </div>
          </div>
          <button
            onClick={resetSession}
            title="Reset Session"
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messaging Logs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border font-semibold text-xs ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-slate-950 rounded-tr-none font-medium text-left'
                      : 'bg-slate-900 border border-slate-800/80 text-slate-300 rounded-tl-none text-left'
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-slate-500 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex gap-3 max-w-[85%] animate-pulse">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-200">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-2xl rounded-tl-none">
                <div className="flex gap-1.5 items-center justify-center py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dot-pulse-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dot-pulse-2" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dot-pulse-3" />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/60 border-t border-slate-800 flex gap-3">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={leadExtractionComplete || isTyping}
            placeholder={
              leadExtractionComplete 
                ? "Session complete. Thank you!" 
                : "Type message to speak with SDR..."
            }
            className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={leadExtractionComplete || isTyping || !inputMsg.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:hover:bg-emerald-500 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Real-time qualification sidecar */}
      <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl h-[620px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h4 className="font-display font-semibold text-slate-100 text-sm md:text-base">Real-time Qualification Engine</h4>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium tracking-wide uppercase">Lead Quality Score</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                (liveLead.score || 0) >= 80 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                  : (liveLead.score || 0) >= 40
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {liveLead.score || 0} / 100
              </span>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${liveLead.score || 0}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <section className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Name:</span>
                <span className={liveLead.name ? "text-slate-200 font-semibold text-right" : "text-slate-600 italic text-right"}>
                  {liveLead.name || "Awaiting reply..."}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Contact Email:</span>
                <span className={liveLead.email ? "text-slate-200 font-semibold text-right" : "text-slate-600 italic text-right"}>
                  {liveLead.email || "Awaiting reply..."}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Company Name:</span>
                <span className={liveLead.company ? "text-slate-200 font-semibold text-right" : "text-slate-600 italic text-right"}>
                  {liveLead.company || "Awaiting reply..."}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Business Need:</span>
                <span className={liveLead.interest ? "text-slate-200 font-semibold text-right max-w-[60%] truncate" : "text-slate-600 italic text-right"}>
                  {liveLead.interest || "Awaiting reply..."}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium font-sans">Budget estimate:</span>
                <span className={liveLead.budget ? "text-slate-200 font-semibold text-right" : "text-slate-600 italic text-right"}>
                  {liveLead.budget || "Pending..."}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Timeline:</span>
                <span className={liveLead.timeline ? "text-slate-200 font-semibold text-right" : "text-slate-600 italic text-right"}>
                  {liveLead.timeline || "Pending..."}
                </span>
              </div>
            </section>
          </div>

          {liveLead.conversationSummary && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/60 leading-relaxed text-slate-300 text-xs">
              <strong className="text-slate-400 block mb-1">Conversation Analysis Summary:</strong>
              {liveLead.conversationSummary}
            </div>
          )}
        </div>

        {/* Sync/Status notification tray */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          {syncStatus.status === 'idle' ? (
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <Database className="w-4 h-4" />
              <span>Awaiting complete lead qualification data parameters.</span>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-3 rounded-xl border flex gap-2.5 text-xs text-left ${
                syncStatus.status === 'syncing'
                  ? 'bg-slate-900 border-slate-800 text-slate-400 animate-pulse'
                  : syncStatus.status === 'synced'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {syncStatus.status === 'synced' ? (
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <Database className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
              )}
              <div>
                <p className="font-semibold block">{syncStatus.status === 'synced' ? 'Sync Successful' : syncStatus.status === 'syncing' ? 'Syncing...' : 'Sync Error'}</p>
                <p className="opacity-80 mt-1 leading-snug">{syncStatus.message}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
