/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Message, Lead } from "../types";
import { SYSTEM_PROMPT, EXTRACT_PROMPT } from "../utils/prompts";

let aiInstance: GoogleGenAI | null = null;

function getApiKey(): string {
  return (import.meta.env.VITE_GEMINI_API_KEY ?? '').trim();
}

export function getGeminiClient(): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'Gemini API key missing. Set GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env, then restart the dev server.',
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

/**
 * Chat agent conversation handler
 */
export async function generateChatResponse(messages: Omit<Message, 'id' | 'timestamp'>[]): Promise<string> {
  const ai = getGeminiClient();

  // Convert roles from user/assistant to user/model for Gemini
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: MODEL_VERSION,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    return response.text || "I am here to assist you with your business needs.";
  } catch (error) {
    console.error("Gemini Chat generation error:", error);
    throw error;
  }
}

export interface ExtractedLeadResult {
  name: string | null;
  email: string | null;
  company: string | null;
  interest: string | null;
  budget: string | null;
  timeline: string | null;
  score: number;
  conversationSummary: string;
  isComplete: boolean;
}

const MODEL_VERSION = "gemini-3-flash-preview";

/**
 * Structured information extractor from the current conversation logs
 */
export async function extractStructuredLead(messages: Omit<Message, 'id' | 'timestamp'>[]): Promise<ExtractedLeadResult> {
  const ai = getGeminiClient();

  // Format the conversation log into a simple transcript
  const transcript = messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  try {
    const response = await ai.models.generateContent({
      model: MODEL_VERSION,
      contents: [
        { role: 'user', parts: [{ text: `Transcript:\n\n${transcript}\n\nPerform extraction.` }] }
      ],
      config: {
        systemInstruction: EXTRACT_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Extract full name if provided, otherwise null." },
            email: { type: Type.STRING, description: "Extract email if provided, otherwise null." },
            company: { type: Type.STRING, description: "Extract company name if provided, otherwise null." },
            interest: { type: Type.STRING, description: "What services/business needs are they interested in? e.g. web app, ai chatbot" },
            budget: { type: Type.STRING, description: "Budget estimate if mentioned, otherwise null." },
            timeline: { type: Type.STRING, description: "Timeline if mentioned, otherwise null." },
            score: { type: Type.INTEGER, description: "Lead quality score (0-100) based on specificity and criteria matched." },
            conversationSummary: { type: Type.STRING, description: "A highly concise 1-2 sentence overview of the user's business context and request." },
            isComplete: {
              type: Type.BOOLEAN,
              description: "True ONLY when we have successfully extracted all four core items: name, email, company, and business interest."
            }
          },
          required: ["name", "email", "company", "interest", "score", "conversationSummary", "isComplete"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response content from Gemini lead extractor");
    }

    const data = JSON.parse(response.text.trim());
    return {
      name: data.name || null,
      email: data.email || null,
      company: data.company || null,
      interest: data.interest || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      score: typeof data.score === 'number' ? data.score : 50,
      conversationSummary: data.conversationSummary || '',
      isComplete: !!data.isComplete
    };
  } catch (error) {
    console.error("Gemini Lead extraction error:", error);
    return {
      name: null,
      email: null,
      company: null,
      interest: null,
      budget: null,
      timeline: null,
      score: 30,
      conversationSummary: "Failed to parse conversation transcript securely.",
      isComplete: false
    };
  }
}
