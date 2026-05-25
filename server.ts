/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { generateChatResponse, extractStructuredLead } from './src/services/ai';
import { saveLeadToSheets, getSheetsConfigInfo } from './src/services/sheets';
import { validateLead } from './src/utils/validation';
import { getAllLeads, saveLead, updateLeadSyncStatus, deleteLead } from './src/services/leadStore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse body
  app.use(express.json());

  // === API ROUTES FIRST ===

  // Live status route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Chatbot conversation and real-time extraction pipeline
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid body. Missing messages history array." });
      }

      // Generate professional conversational agent response
      const assistantText = await generateChatResponse(messages);

      // Concurrently extract latest structured values from complete transcript
      const updatedHistory = [...messages, { role: 'assistant' as const, content: assistantText }];
      const extractedLead = await extractStructuredLead(updatedHistory);

      res.json({
        message: assistantText,
        extractedLead,
        isComplete: extractedLead.isComplete
      });
    } catch (err: any) {
      console.error("Express Chat Route failed:", err);
      res.status(500).json({ error: err.message || "Failed to process conversation." });
    }
  });

  // Export lead credentials to Google Sheets and store locally
  app.post('/api/leads', async (req, res) => {
    try {
      const leadData = req.body;
      
      const validationErrors = validateLead(leadData);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: "Validation errors detected.", details: validationErrors });
      }

      // Store lead details locally with synchronized flag marked as false
      const savedLead = saveLead({
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        interest: leadData.interest,
        budget: leadData.budget || 'N/A',
        timeline: leadData.timeline || 'N/A',
        score: leadData.score || 50,
        conversationSummary: leadData.conversationSummary || 'Qualified organically.',
        synced: false
      });

      // Synchronize directly with official Google Sheets Service Account
      const syncResult = await saveLeadToSheets(savedLead);

      if (syncResult.success) {
        updateLeadSyncStatus(savedLead.id, true);
        savedLead.synced = true;
        savedLead.syncError = undefined;
      } else {
        updateLeadSyncStatus(savedLead.id, false, syncResult.message);
        savedLead.synced = false;
        savedLead.syncError = syncResult.message;
      }

      res.json({
        success: syncResult.success,
        message: syncResult.message,
        lead: savedLead
      });
    } catch (err: any) {
      console.error("Express Leads creation failed:", err);
      res.status(500).json({ error: err.message || "Failed to create lead structure." });
    }
  });

  // Retrieve lead dashboard rows
  app.get('/api/leads', (req, res) => {
    res.json(getAllLeads());
  });

  // Delete lead credentials
  app.delete('/api/leads/:id', (req, res) => {
    const success = deleteLead(req.params.id);
    res.json({ success });
  });

  // Get service states
  app.get('/api/sheets-config', (req, res) => {
    res.json(getSheetsConfigInfo());
  });

  // === VITE ASSET MIDDLEWARE CLIENT BINDING ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((error) => {
  console.error("Critical: Failed to bootstrap Express server", error);
  process.exit(1);
});
