/**
 * RFC Store — Admin: Mark COD Order as Paid
 * POST /api/admin/orders/[id]/mark-paid
 *
 * Called when admin confirms COD payment collected on delivery.
 * Sets payment_status: 'paid' for the order.
 */
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOrderStatusChanged } from "@/lib/notifications";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify admin session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update payment_status to 'paid' for the COD order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: order, error } = await admin
      .from("orders")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("payment_method", "cod")
      .eq("payment_status", "pending")
      .select("id, order_number, customer_email, customer_name, status")
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found or already paid." },
        { status: 404 }
      );
    }

    // Notify customer (non-blocking)
    void notifyOrderStatusChanged({
      orderNumber: order.order_number,
      orderId: order.id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      previousStatus: "pending",
      newStatus: "payment_received",
    });

    return NextResponse.json({ success: true, orderNumber: order.order_number });
  } catch (err) {
    console.error("[Admin] Mark as paid error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
