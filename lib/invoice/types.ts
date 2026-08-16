/**
 * RFC Store — Invoice Data Types
 * 
 * InvoiceData is the complete snapshot stored in invoices.invoice_data (JSONB).
 * Once stored, it is immutable — historical accuracy preserved.
 */
export interface InvoiceItem {
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string;       // ISO string
  orderDate: string;         // ISO string
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  // Address (same for shipping+billing)
  address: InvoiceAddress;
  // Items (snapshot)
  items: InvoiceItem[];
  // Financials
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  taxRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountAmount: number;
  codFee: number;
  totalAmount: number;
  currency: string;
  // Payment
  paymentMethod: string;         // 'cod' | 'razorpay'
  paymentStatus: string;         // 'pending' | 'paid'
  razorpayPaymentId: string | null;
  // Business (from env/config)
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
}
