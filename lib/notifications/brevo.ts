/**
 * RFC Store — Brevo (formerly Sendinblue) Email Client
 *
 * Server-only module. Never import in client components.
 *
 * Setup:
 *   1. Create free account at https://app.brevo.com
 *   2. Go to SMTP & API → API Keys → Generate a new API key
 *   3. Add to .env.local: BREVO_API_KEY=your_key_here
 *   4. Verify your sender email (revivefightclub@gmail.com) in Brevo
 */
import * as SibApiV3Sdk from '@getbrevo/brevo';

let _client: SibApiV3Sdk.TransactionalEmailsApi | null = null;

export function getBrevoClient(): SibApiV3Sdk.TransactionalEmailsApi {
  if (!_client) {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY ?? '');
    _client = apiInstance;
  }
  return _client;
}

export const BREVO_SENDER = {
  name: 'Revive Fight Club',
  email: process.env.BREVO_FROM_EMAIL ?? 'revivefightclub@gmail.com',
};
