/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Key, FileSpreadsheet, Lock, HelpCircle, CheckCircle2 } from 'lucide-react';

interface SetupStepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

function SetupStep({ number, title, children }: SetupStepProps) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-sm font-semibold shrink-0">
        0{number}
      </div>
      <div>
        <h4 className="font-display font-medium text-slate-100 text-sm md:text-base mb-1.5">{title}</h4>
        <div className="text-slate-400 text-xs md:text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function SetupInstructions() {
  return (
    <main className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <h2 className="font-display text-lg font-semibold text-slate-100">Official Google Sheets Setup Guide</h2>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed">
          This demo runs entirely in the browser and stores leads in session storage. The steps below describe how you would connect Google Sheets from a server using <span className="font-mono text-xs text-slate-300">src/services/sheets.ts</span>:
        </p>

        <section className="space-y-3.5">
          <SetupStep number={1} title="Create or Open a Google Sheet">
            Create an empty Google Spreadsheet. Note down the spreadsheet ID from the URL. It is the long characters list between <span className="font-mono text-emerald-300">/d/</span> and <span className="font-mono text-emerald-300">/edit</span> (e.g. <span className="font-mono text-xs text-slate-300 bg-slate-900 px-1 py-0.5 rounded">1x8v...5q6y</span>). Save this value as <span className="font-mono text-slate-300 bg-slate-950 px-1 rounded text-xs">GOOGLE_SHEET_ID</span>.
          </SetupStep>

          <SetupStep number={2} title="Generate a Service Account">
            Visit the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Google Cloud Console</a>, create a project, enable the <strong>Google Sheets API</strong>, and create a Service Account. 
            Download the credentials as a <span className="text-emerald-400 font-medium">JSON key file</span>. Extract:
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400 text-xs text-left">
              <li><span className="font-mono text-xs text-emerald-300">client_email</span>: Save as <span className="font-mono text-slate-300 bg-slate-950 px-1 rounded text-xs">GOOGLE_CLIENT_EMAIL</span></li>
              <li><span className="font-mono text-xs text-emerald-300">private_key</span>: Copy everything inside quotation marks, then save as <span className="font-mono text-slate-300 bg-slate-950 px-1 rounded text-xs">GOOGLE_PRIVATE_KEY</span></li>
            </ul>
          </SetupStep>

          <SetupStep number={3} title="Share the Sheet with the Service Account">
            Ensure you click <strong>Share</strong> inside your spreadsheet, paste your Service Account <span className="font-mono text-emerald-300">client_email</span>, and grant it <strong>Editor</strong> permissions. Without this critical link, Google Sheets will deny access.
          </SetupStep>
        </section>

        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-300 text-xs flex gap-2.5 items-start">
          <Lock className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
          <p>
            <strong>Secrets Panel Security:</strong> Do NOT commit service account JSON keys into your code! Open **Settings &gt; Secrets** in the chatbot sidebar context, and declare your keys securely.
          </p>
        </div>
      </div>
    </main>
  );
}
