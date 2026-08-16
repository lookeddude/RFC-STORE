/**
 * RFC Store — Brevo (formerly Sendinblue) Email Client
 *
 * Server-only module. Never import in client components.
 *
 * Uses @getbrevo/brevo v6+ SDK (BrevoClient API).
 *
 * Setup:
 *   1. Create free account at https://app.brevo.com
 *   2. Go to SMTP & API → API Keys → Generate a new API key
 *   3. Add to .env.local: BREVO_API_KEY=your_key_here
 *   4. Verify your sender email in Brevo Senders & Domains
 */
import { BrevoClient } from '@getbrevo/brevo';

let _client: BrevoClient | null = null;

export function getBrevoClient(): BrevoClient {
  if (!_client) {
    _client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY ?? '',
    });
  }
  return _client;
}

export const BREVO_SENDER = {
  name: process.env.BREVO_FROM_NAME ?? 'Revive Fight Club',
  email: process.env.BREVO_FROM_EMAIL ?? 'orders@revivefightclub.com',
};
