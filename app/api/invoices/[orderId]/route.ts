/**
 * RFC Store — Invoice Download Endpoint
 * 
 * GET /api/invoices/[orderId]
 * 
 * Authorization:
 * - Authenticated users: must be order owner (RLS enforced)
 * - Guests: must provide valid ?token= query param (same mechanism as payment verification)
 * - Admins: always allowed (admin client check)
 * 
 * Returns PDF with Content-Disposition: attachment
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildInvoicePdf } from '@/lib/invoice/generate';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    // Validate orderId format before any DB query
    if (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get('token');

    const supabase = await createClient();
    const admin = createAdminClient();

    // Determine auth
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Authenticated: verify order ownership
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .maybeSingle();
      
      // Also check admin role
      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const isAdmin = ['admin', 'super_admin'].includes(profile?.role ?? '');

      if (!isAdmin && !order) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (guestToken) {
      // Guest: validate token
      const submittedHash = crypto
        .createHash('sha256')
        .update(guestToken)
        .digest('hex');

      const { data: tokenRecord } = await admin
        .from('payment_tokens')
        .select('token_hash, order_id')
        .eq('order_id', orderId)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!tokenRecord) {
        return NextResponse.json({ error: 'Token expired or not found' }, { status: 403 });
      }

      const valid = crypto.timingSafeEqual(
        Buffer.from(tokenRecord.token_hash, 'hex'),
        Buffer.from(submittedHash, 'hex')
      );

      if (!valid) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate PDF
    const pdfBuffer = await buildInvoicePdf(orderId);

    // Get invoice number for filename
    const { data: invoice } = await admin
      .from('invoices')
      .select('invoice_number')
      .eq('order_id', orderId)
      .maybeSingle();

    const filename = invoice?.invoice_number
      ? `${invoice.invoice_number}.pdf`
      : `RFC-Invoice-${orderId.slice(0, 8)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Invoice] Generation error:', err);
    return NextResponse.json({ error: 'Failed to generate invoice', detail: message }, { status: 500 });
  }
}
