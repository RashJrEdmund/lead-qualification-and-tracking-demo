/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates lead data on the server side before persisting it.
 */
export function validateLead(lead: Partial<Lead>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!lead.name || lead.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters.' });
  }

  if (!lead.email) {
    errors.push({ field: 'email', message: 'Email is required.' });
  } else {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }
  }

  if (!lead.company || lead.company.trim().length < 1) {
    errors.push({ field: 'company', message: 'Company name is required.' });
  }

  if (!lead.interest || lead.interest.trim().length < 3) {
    errors.push({ field: 'interest', message: 'Business need / Interest is required.' });
  }

  return errors;
}
