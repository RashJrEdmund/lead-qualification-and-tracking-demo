/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, WebLead } from '../types';

export function hasLeadData(lead: Partial<Lead>): boolean {
  return !!(lead.name?.trim() || lead.email?.trim() || lead.company?.trim() || lead.interest?.trim());
}

const STORAGE_KEY = 'auden_leads';
const SEEDED_KEY = 'auden_leads_seeded';

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
    if (!raw) {
      if (!sessionStorage.getItem(SEEDED_KEY)) {
        sessionStorage.setItem(SEEDED_KEY, '1');
        writeLeads([...SEED_LEADS]);
        return [...SEED_LEADS];
      }
      return [];
    }
    const parsed = JSON.parse(raw) as WebLead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLeads(leads: WebLead[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function getAllLeads(): WebLead[] {
  return readLeads();
}

/** Upserts the active chat session lead so the dashboard stays in sync while qualifying. */
export function upsertSessionLead(id: string, partial: Partial<Lead>): WebLead | null {
  if (!hasLeadData(partial)) return null;

  return saveLead({
    id,
    name: partial.name?.trim() || 'In progress',
    email: partial.email?.trim() || 'pending@demo.local',
    company: partial.company?.trim() || '—',
    interest: partial.interest?.trim() || 'Qualifying...',
    budget: partial.budget || 'Pending',
    timeline: partial.timeline || 'Pending',
    score: partial.score ?? 0,
    conversationSummary: partial.conversationSummary || '',
    synced: false,
  });
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
