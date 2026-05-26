/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, Message } from '../types';

const STORAGE_KEY = 'auden_chat_session';

export const DEFAULT_GREETING: Message = {
  id: 'msg_1',
  role: 'assistant',
  content:
    "Hello! I am Auden, your growth assistant at Apex Digital Solutions. Looking to build custom software or scale your systems? Tell me a bit about your project or business goals, and let's get started!",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

export interface ChatSessionState {
  messages: Message[];
  liveLead: Partial<Lead>;
  leadExtractionComplete: boolean;
  syncStatus: { status: SyncStatus; message: string };
  sessionLeadId?: string;
}

export function getDefaultChatSession(): ChatSessionState {
  return {
    messages: [DEFAULT_GREETING],
    liveLead: {
      name: undefined,
      email: undefined,
      company: undefined,
      interest: undefined,
      budget: undefined,
      timeline: undefined,
      score: 0,
      conversationSummary: '',
    },
    leadExtractionComplete: false,
    syncStatus: { status: 'idle', message: '' },
  };
}

export function loadChatSession(): ChatSessionState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultChatSession();
    const parsed = JSON.parse(raw) as ChatSessionState;
    if (!parsed?.messages?.length) return getDefaultChatSession();
    return {
      messages: parsed.messages,
      liveLead: parsed.liveLead ?? getDefaultChatSession().liveLead,
      leadExtractionComplete: !!parsed.leadExtractionComplete,
      syncStatus: parsed.syncStatus ?? { status: 'idle', message: '' },
      sessionLeadId: parsed.sessionLeadId,
    };
  } catch {
    return getDefaultChatSession();
  }
}

export function saveChatSession(session: ChatSessionState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearChatSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
