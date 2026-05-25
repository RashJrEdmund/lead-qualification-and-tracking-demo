/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Lead {
  id?: string;
  name: string;
  email: string;
  company: string;
  interest: string;
  budget?: string;
  timeline?: string;
  createdAt?: string;
  score?: number; // Lead scoring (0-100)
  conversationSummary?: string;
}

export interface WebLead extends Lead {
  id: string;
  createdAt: string;
  score: number;
  conversationSummary: string;
  synced: boolean;
  syncError?: string;
}

export interface LeadSyncResponse {
  success: boolean;
  message: string;
  lead: WebLead;
}

export interface ChatRequest {
  messages: Omit<Message, 'id' | 'timestamp'>[];
  aiProvider?: 'gemini' | 'openai';
}

export interface ChatResponse {
  message: string;
  extractedLead?: Lead;
  isComplete: boolean;
}
