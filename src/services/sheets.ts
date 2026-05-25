/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { google } from 'googleapis';
import { WebLead } from '../types';

export interface SheetConfigInfo {
  isConfigured: boolean;
  clientEmail: boolean;
  privateKey: boolean;
  sheetId: boolean;
}

/**
 * Checks if all required environment variables are set up for Google Sheets integration.
 */
export function getSheetsConfigInfo(): SheetConfigInfo {
  return {
    isConfigured: !!(
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
    ),
    clientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    sheetId: !!process.env.GOOGLE_SHEET_ID,
  };
}

/**
 * Appends a lead row to the configured Google Sheet using a service account.
 * Drops in simulated persistence if configurations are missing.
 */
export async function saveLeadToSheets(lead: WebLead): Promise<{ success: boolean; message: string }> {
  const config = getSheetsConfigInfo();

  if (!config.isConfigured) {
    const missing: string[] = [];
    if (!config.clientEmail) missing.push('GOOGLE_CLIENT_EMAIL');
    if (!config.privateKey) missing.push('GOOGLE_PRIVATE_KEY');
    if (!config.sheetId) missing.push('GOOGLE_SHEET_ID');

    const warningMsg = `Google Sheets is not fully configured. Missing environment variables: ${missing.join(', ')}. The lead was saved to local database memory only.`;
    console.warn(warningMsg);
    return {
      success: false,
      message: warningMsg
    };
  }

  try {
    // Standardize private key formatting (fixing common newline escaped issues in env vars)
    const formattedPrivateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: formattedPrivateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Validate spreadsheet access, and write to Sheet1 (or create fallback)
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    const rowValue = [
      lead.createdAt || new Date().toISOString(),
      lead.name,
      lead.email,
      lead.company,
      lead.interest,
      lead.budget || 'N/A',
      lead.timeline || 'N/A',
      lead.conversationSummary || '',
      lead.score || 0
    ];

    // Attempt append to Sheet1!A:I. Range A:I matching the columns sequence
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValue]
      }
    });

    return {
      success: true,
      message: 'Successfully exported lead credentials directly to Google Sheets.'
    };
  } catch (error: any) {
    console.error('Failed to append lead details to Google Sheets:', error);
    
    // Provide a neat, friendly parsing of common API error states
    let userFriendlyError = 'Google Sheet Sync error: ' + (error.message || error);
    if (error.code === 403) {
      userFriendlyError = 'Permission denied. Ensure the service account email is shared (Editor access) on your Google Spreadsheet.';
    } else if (error.code === 404) {
      userFriendlyError = 'Spreadsheet not found. Please double check that your GOOGLE_SHEET_ID is correctly structured.';
    } else if (error.message && error.message.includes('private key')) {
      userFriendlyError = 'Invalid service account Private Key format. Correct in Settings > Secrets.';
    }

    return {
      success: false,
      message: userFriendlyError
    };
  }
}
