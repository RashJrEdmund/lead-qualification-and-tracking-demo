/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WebLead } from '../types';

const STORAGE_KEY = 'auden_leads';

const SEED_LEADS: WebLead[] = [
  {
    id: 'lead_1',
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.io',
    company: 'SkyNet Solutions',
    interest: 'Production flow predictive AI model integration',
    budget: '$15k - $30k',
    timeline: 'Immediate (Next 2 weeks)',
    score: 92,
    conversationSummary:
      'Sarah is planning to deploy real-time model integration on factory assembly lines. Strong business orientation, high score.',
    synced: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
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
    conversationSummary:
      'Bruce requires specialized machine learning systems with military-grade mapping security. Needs custom consulting.',
    synced: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

function readLeads(): WebLead[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [...SEED_LEADS];
    const parsed = JSON.parse(raw) as WebLead[];
    return Array.isArray(parsed) ? parsed : [...SEED_LEADS];
  } catch {
    return [...SEED_LEADS];
  }
}

function writeLeads(leads: WebLead[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function getAllLeads(): WebLead[] {
  return readLeads();
}

export function saveLead(
  lead: Omit<WebLead, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): WebLead {
  const leads = readLeads();
  const existingIndex = lead.id ? leads.findIndex((l) => l.id === lead.id) : -1;

  if (existingIndex > -1) {
    const updatedLead = { ...leads[existingIndex], ...lead, id: lead.id! } as WebLead;
    leads[existingIndex] = updatedLead;
    writeLeads(leads);
    return updatedLead;
  }

  const newLead: WebLead = {
    ...lead,
    id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: lead.createdAt || new Date().toISOString(),
    synced: lead.synced ?? false,
  } as WebLead;

  leads.unshift(newLead);
  writeLeads(leads);
  return newLead;
}

export function deleteLead(id: string): boolean {
  const leads = readLeads();
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  writeLeads(next);
  return true;
}
