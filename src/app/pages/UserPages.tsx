import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Bell, Settings, Clock, CreditCard, ChevronRight, Mail } from 'lucide-react';

type Page = string;

export function CustomerDashboardPage({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Welcome back, Kasun!</h1>
        <p className="text-muted-foreground text-sm">Manage your orders, warranties, and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-muted-foreground mb-1">Store Credit</div>
            <div className="text-2xl font-black font-mono text-foreground">LKR 12,500</div>
          </div>
          <div className="w-12 h-12 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between">
           <div>
            <div className="text-sm font-semibold text-muted-foreground mb-1">Loyalty Tier</div>
            <div className="text-2xl font-black text-amber-500" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Gold Member</div>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-foreground/30 transition-all" onClick={() => onNav('orders')}>
           <div>
            <div className="text-sm font-semibold text-muted-foreground mb-1">Active Orders</div>
            <div className="text-2xl font-black font-mono text-foreground">2 Processing</div>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6">
         <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Recent Activity</h3>
            <button className="text-sm font-bold text-[#8B5CF6]">View All</button>
         </div>
         <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary border border-border">
               <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-black shrink-0">
                 <Check className="w-5 h-5" />
               </div>
               <div className="flex-1">
                  <div className="font-bold text-sm">Order Delivered</div>
                  <div className="text-xs text-muted-foreground">Your order #CLN-2024-07148 has been delivered successfully.</div>
               </div>
               <div className="text-xs text-muted-foreground">2h ago</div>
            </div>
         </div>
      </div>
    </div>
  );
}

export function InvoicesPage({ orders }: { orders: any[] }) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fmt = (n: number) => `LKR ${n.toLocaleString("en-US")}`;

  const invoices = orders.map(o => ({
    id: `INV-${o.id.slice(4)}`,
    date: o.date,
    amount: o.amount,
    orderId: o.id,
    order: o
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative">
      <h1 className="text-3xl font-black text-foreground mb-8 animate-fade-in" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>My Invoices</h1>
      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map(inv => (
            <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border rounded-3xl hover:border-[#8B5CF6]/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{inv.id}</div>
                  <div className="text-xs text-muted-foreground">Order: {inv.orderId} • {inv.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono font-black text-foreground">{fmt(inv.amount)}</div>
                <button
                  onClick={() => setSelectedOrder(inv.order)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-border text-foreground rounded-xl text-sm font-bold transition-colors"
                >
                  <Download className="w-4 h-4 text-[#8B5CF6]" /> Invoice
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground font-semibold bg-card border border-border rounded-3xl">
            No invoices generated yet. Place an order first!
          </div>
        )}
      </div>

      {/* Invoice Detail Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:relative print:z-0">
          <div className="bg-card w-full max-w-2xl rounded-3xl overflow-hidden border border-border flex flex-col max-h-[90vh] shadow-2xl print:border-0 print:shadow-none print:max-h-full print:rounded-none">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between print:hidden">
              <h2 className="text-lg font-bold text-foreground">Tax Invoice</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const invoiceId = `INV-${selectedOrder.id.slice(4)}`;
                    const itemsText = selectedOrder.items && selectedOrder.items.length > 0 
                      ? selectedOrder.items.map((i: any) => `- ${i.product.name} x${i.quantity} (${fmt(i.product.price * i.quantity)})`).join("%0A")
                      : `- ${selectedOrder.product} (LKR ${selectedOrder.amount})`;
                    const mailto = `mailto:${selectedOrder.customerEmail || "customer@email.com"}?subject=Invoice ${invoiceId} - Universe Hub&body=Hi ${selectedOrder.customer},%0A%0AThank you for your purchase at Universe Hub! Here is your invoice details:%0A%0AInvoice ID: ${invoiceId}%0AOrder ID: ${selectedOrder.id}%0ADate: ${selectedOrder.date}%0A%0A*Items Purchased:*%0A${itemsText}%0A%0A*Total Amount:* LKR ${selectedOrder.amount.toLocaleString()}%0A%0APayment Method: Cash on Delivery / Card Payment%0A%0AIf you have any questions, feel free to reply to this email.%0A%0ABest regards,%0AUniverse Hub Support`;
                    window.open(mailto, '_blank');
                  }}
                  className="px-4 py-2 bg-secondary hover:bg-border text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8B5CF6]" /> Email Invoice
                </button>
                <button onClick={handlePrint} className="px-4 py-2 bg-[#8B5CF6] text-black rounded-xl text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5">
                  Print / Save PDF
                </button>
                <button onClick={() => setSelectedOrder(null)} className="px-3 py-2 bg-secondary hover:bg-border text-muted-foreground rounded-xl text-xs font-bold transition-all">
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body / Invoice Sheet */}
            <div className="p-8 overflow-y-auto flex-1 print:p-0" id="printable-invoice">
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body * { visibility: hidden !important; }
                  #printable-invoice, #printable-invoice * { visibility: visible !important; }
                  #printable-invoice { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; background: white !important; color: black !important; }
                }
              `}} />
              {/* Branding Section */}
              <div className="flex justify-between items-start gap-4 mb-8">
                <div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-black text-2xl tracking-tighter text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>UNIVERSE</span>
                    <span className="font-black text-lg tracking-tight text-foreground/90 pb-0.5" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>HUB</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Premium Accessories & Smartphone Store<br />No. 45, Galle Road, Colombo 03, Sri Lanka</p>
                  <p className="text-xs text-muted-foreground mt-1">support@universehub.lk | +94 77 123 4567</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-black text-foreground mb-1">INVOICE</h3>
                  <div className="text-xs text-foreground font-semibold">INV-{selectedOrder.id.slice(4)}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Date: {selectedOrder.date}</div>
                </div>
              </div>

              <hr className="border-border mb-6" />

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Billed To:</div>
                  <div className="text-sm font-bold text-foreground">{selectedOrder.customer}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Colombo District, Sri Lanka
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Payment Details:</div>
                  <div className="text-xs font-bold text-foreground">Cash on Delivery / Card Payment</div>
                  <div className="text-xs text-muted-foreground mt-1">Status: {selectedOrder.status}</div>
                </div>
              </div>

              {/* Items List Table */}
              <div className="border border-border rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary text-foreground text-xs font-bold border-b border-border">
                      <th className="p-3">Product Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-border last:border-0 text-sm text-foreground">
                          <td className="p-3 font-semibold">{item.product.name}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right font-mono text-xs">{fmt(item.product.price)}</td>
                          <td className="p-3 text-right font-mono text-xs font-bold">{fmt(item.product.price * item.quantity)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="text-sm text-foreground">
                        <td className="p-3 font-semibold">{selectedOrder.product}</td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right font-mono text-xs">{fmt(selectedOrder.amount)}</td>
                        <td className="p-3 text-right font-mono text-xs font-bold">{fmt(selectedOrder.amount)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary calculations */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">{fmt(selectedOrder.amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="font-mono">LKR 0</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>VAT (0%)</span>
                    <span className="font-mono">LKR 0</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-sm font-black text-foreground">
                    <span>Total Amount</span>
                    <span className="font-mono text-base">{fmt(selectedOrder.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer notes */}
              <div className="text-center text-[10px] text-muted-foreground mt-12">
                Thank you for shopping at Universe Hub!<br />This is a system-generated invoice.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationCenter({ notifications, onMarkAllRead }: { notifications: any[]; onMarkAllRead: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Notifications</h1>
         {notifications.some(n => n.unread) && (
           <button onClick={onMarkAllRead} className="text-sm font-bold text-[#8B5CF6] hover:underline">
             Mark all as read
           </button>
         )}
      </div>
      
      <div className="space-y-4">
         {notifications.length > 0 ? (
           notifications.map(n => (
             <div key={n.id} className={`p-5 rounded-3xl border transition-all hover:scale-[1.01] duration-300 ${n.unread ? 'bg-card border-[#8B5CF6]/30 shadow-md' : 'bg-secondary/40 border-border opacity-75'}`}>
                <div className="flex items-start justify-between gap-4">
                   <div className="flex gap-4">
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${n.unread ? 'bg-[#8B5CF6]' : 'bg-transparent'}`}></div>
                      <div>
                         <div className={`text-sm font-bold mb-1 ${n.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</div>
                         <div className="text-sm text-muted-foreground leading-relaxed">{n.message}</div>
                      </div>
                   </div>
                   <div className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</div>
                </div>
             </div>
           ))
         ) : (
           <div className="text-center py-12 text-muted-foreground font-semibold bg-card border border-border rounded-3xl">
             Your notification inbox is empty.
           </div>
         )}
      </div>
    </div>
  );
}

// Dummy icons to prevent errors since we didn't import all of them at the top
function Check(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> }
function Star(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> }
