/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WebLead } from '../types';

// Let's seed with some premium mock qualified leads to populate the analytics dashboard immediately on build!
let leads: WebLead[] = [
  {
    id: 'lead_1',
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.io',
    company: 'SkyNet Solutions',
    interest: 'Production flow predictive AI model integration',
    budget: '$15k - $30k',
    timeline: 'Immediate (Next 2 weeks)',
    score: 92,
    conversationSummary: 'Sarah is planning to deploy real-time model integration on factory assembly lines. Strong business orientation, high score.',
    synced: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'lead_2',
    name: 'Bruce Wayne',
    email: 'bruce@wayneenterprise.com',
    company: 'Wayne Enterprises',
    interest: 'Autonomous computer vision system and mapping pipeline',
    budget: '$100k+',
    timeline: '2 months',
    score: 95,
    conversationSummary: 'Bruce requires specialized machine learning systems with military-grade mapping security. Needs custom consulting.',
    synced: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  }
];

export function getAllLeads(): WebLead[] {
  return [...leads];
}

export function saveLead(lead: Omit<WebLead, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): WebLead {
  const existingIndex = lead.id ? leads.findIndex(l => l.id === lead.id) : -1;
  
  if (existingIndex > -1) {
    const updatedLead = {
      ...leads[existingIndex],
      ...lead,
      id: lead.id!
    } as WebLead;
    leads[existingIndex] = updatedLead;
    return updatedLead;
  } else {
    const newLead: WebLead = {
      ...lead,
      id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: lead.createdAt || new Date().toISOString(),
    } as WebLead;
    leads.push(newLead);
    return newLead;
  }
}

export function updateLeadSyncStatus(id: string, synced: boolean, syncError?: string): WebLead | null {
  const index = leads.findIndex(l => l.id === id);
  if (index > -1) {
    leads[index] = {
      ...leads[index],
      synced,
      syncError,
    };
    return leads[index];
  }
  return null;
}

export function deleteLead(id: string): boolean {
  const initialLength = leads.length;
  leads = leads.filter(l => l.id !== id);
  return leads.length < initialLength;
}
