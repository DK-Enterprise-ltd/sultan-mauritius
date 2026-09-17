import { Document, Page, Text, View, Svg, Path, StyleSheet } from "@react-pdf/renderer";
import type { Invoice, Order, OrderItem, Product, Customer } from "@prisma/client";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact-info";

// Sultan wordmark, traced from public/Assets/Logo/logo.svg (viewBox 0 0 142.38 36.18).
// react-pdf's <Image> can't render an .svg file directly, so the path data is
// reproduced here as native react-pdf <Svg>/<Path> primitives instead.
function SultanLogoMark() {
  return (
    <Svg viewBox="0 0 142.38 36.18" style={{ width: 90, height: 22.9 }}>
      <Path
        fill="#000000"
        d="M7.24,10.1c0-2.75,2.01-4.13,6.02-4.13,2.18,0,3.81.42,4.89,1.27.84.66,1.4,1.59,1.7,2.79,0,0,.02,0,.02,0,0,0,.27,1,1.7,1.08.02,0,.47,0,.49,0h4.71c-.07-1.67-.42-3.19-1.07-4.56-.65-1.38-1.56-2.55-2.73-3.52-1.17-.97-2.57-1.72-4.21-2.24-1.63-.53-3.47-.79-5.51-.79s-3.94.27-5.48.79c-1.55.53-2.85,1.24-3.9,2.14-1.05.9-1.83,1.96-2.35,3.19-.51,1.22-.76,2.53-.76,3.93,0,1.84.29,3.35.87,4.54.58,1.19,1.48,2.2,2.7,3.04,1.23.83,2.78,1.53,4.67,2.09,1.89.56,4.12,1.11,6.71,1.66,1.09.24,1.97.5,2.65.79.68.29,1.22.62,1.61,1,.39.37.65.79.79,1.25.13.46.2.96.2,1.5,0,1.4-.58,2.5-1.73,3.32-1.16.82-2.86,1.23-5.1,1.23-2.08,0-3.8-.5-5.18-1.51-.96-.7-1.58-1.59-1.89-2.65h-.02s0-.04-.02-.1c-.02-.06-.04-.12-.05-.18-.14-.42-.58-1.16-1.82-1.17H0c.14,3.74,1.45,6.56,3.93,8.47,2.48,1.9,6.19,2.86,11.12,2.86,1.73,0,3.38-.23,4.95-.69,1.56-.46,2.92-1.12,4.08-1.99,1.16-.87,2.07-1.93,2.75-3.19.68-1.26,1.02-2.7,1.02-4.33,0-1.36-.13-2.52-.41-3.47-.27-.95-.64-1.77-1.1-2.45-.46-.68-1.02-1.25-1.68-1.71-.67-.46-1.37-.84-2.12-1.15-1.32-.58-2.79-1.09-4.39-1.53-1.6-.44-3.48-.92-5.66-1.43-1.84-.44-3.17-.99-4-1.66-.83-.66-1.25-1.49-1.25-2.47"
      />
      <Path
        fill="#000000"
        d="M79.87,22.17v2.94c0,1.62-.33,2.87-.98,3.75-.65.88-1.66,1.32-3.04,1.32s-2.42-.45-3.04-1.34c-.62-.9-.92-2.18-.92-3.83v-10.67h14.32s0-.04,0-.04c0,0,.05-4.3-4.96-4.82h-9.35v-4.06h0C71.48,1.03,66.11.14,65.19,0h-.05v9.46h-.87c-.26.04-.59.2-.55.78v3.34s.11.74.68.74h.75v11.36c0,1.41.19,2.74.58,4.01.39,1.27,1.01,2.38,1.87,3.33.86.95,1.96,1.71,3.3,2.27,1.34.56,2.96.84,4.86.84s3.4-.28,4.73-.84c1.32-.56,2.41-1.33,3.27-2.3.86-.97,1.5-2.08,1.9-3.33.4-1.25.61-2.56.61-3.94v-3.57h-6.39ZM36.32,9.49h-6.86v17.1c0,1.44.22,2.75.66,3.91.44,1.16,1.05,2.17,1.82,3.01.78.84,1.7,1.49,2.77,1.95,1.07.46,2.26.69,3.56.69,3.63,0,6.32-1.44,8.08-4.33v3.39s-.05.95.71.95c.8.05,5.08,0,5.08,0,0,0,.7,0,.69-.84,0-.02.02-25.82.02-25.82h-6.81v14.99c0,1.73-.45,3.14-1.35,4.25-.9,1.11-2.23,1.66-3.99,1.66-2.92,0-4.38-1.62-4.38-4.86V9.49ZM55.59,0v35.3c.01.3.01.78.79.87h6.07V0h-6.86Z"
      />
      <Path
        fill="#000000"
        d="M142.38,36.17v-18.02c0-1.41-.22-2.65-.66-3.72-.44-1.07-1.04-1.98-1.79-2.72-.76-.74-1.66-1.29-2.72-1.66-1.06-.37-2.2-.55-3.43-.55-2.11,0-3.84.38-5.17,1.13-1.34.76-2.41,1.87-3.22,3.35v-2.98s0-.03,0-.05c0-.57-.44-.7-.64-.73h-5.26c-.41.04-.58.31-.64.55v25.4h6.86v-14.91c0-3.98,1.78-5.97,5.33-5.97,1.62,0,2.76.35,3.43,1.06.67.71,1,2.06,1,4.07v15.75h6.92Z"
      />
      <Path
        fill="#000000"
        d="M116.5,36.17V10.71c-.01-.21-.12-.51-.63-.51h-5.57s-.56,0-.63.58v.7c-2.37-1.64-4.99-2.47-7.81-2.47-3.74,0-6.98,1.33-9.61,3.96-2.63,2.63-3.96,5.86-3.96,9.61s1.33,6.98,3.96,9.61c2.63,2.63,5.86,3.96,9.61,3.96,2.86,0,5.48-.83,7.8-2.47v2.49s6.83,0,6.83,0ZM109.67,22.58c0,2.14-.77,4-2.29,5.52-1.52,1.52-3.37,2.29-5.52,2.29s-4-.77-5.52-2.29c-1.52-1.52-2.29-3.38-2.29-5.52s.77-4,2.29-5.52c1.52-1.52,3.38-2.29,5.52-2.29s4,.77,5.52,2.29c1.52,1.52,2.29,3.38,2.29,5.52"
      />
      <Path
        fill="#000000"
        d="M142.38,5.45c0-1.02-.82-1.84-1.83-1.84s-1.84.82-1.84,1.84.83,1.84,1.84,1.84,1.83-.82,1.83-1.84M142.15,5.45c0,.89-.72,1.61-1.61,1.61s-1.61-.72-1.61-1.61.72-1.61,1.61-1.61,1.61.72,1.61,1.61M141.5,6.57l-.61-.93c.31-.08.54-.29.54-.65h0c0-.2-.06-.36-.18-.47-.13-.13-.33-.21-.59-.21h-.77v2.26h.24v-.88h.51l.56.88h.29ZM140.62,5.48h-.49v-.94h.51c.34,0,.54.17.54.46h0c0,.29-.2.48-.57.48"
      />
    </Svg>
  );
}

type InvoicePdfData = Invoice & {
  order: Order & {
    customer: Customer;
    items: (OrderItem & { product: Product })[];
  };
};

const INK = "#1e293b";
const MUTED = "#64748b";
const RULE = "#e2e8f0";
const DARK_BG = "#333333";

const styles = StyleSheet.create({
  // paddingBottom is taller than the top/side padding to reserve room for
  // the fixed footer (~60pt including its border/margin) so normal content
  // flow stops above it instead of running underneath it.
  page: { paddingTop: 36, paddingHorizontal: 36, paddingBottom: 96, fontSize: 9, color: INK, fontFamily: "Helvetica", backgroundColor: "#ffffff" },

  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },

  brandCol: { flex: 1 },

  headerRight: { alignItems: "flex-end" },
  invoiceTitle: { fontSize: 24, fontWeight: 400, color: "#0f172a", marginBottom: 4 },
  invoiceNumber: { fontSize: 9, fontWeight: 700, color: MUTED, marginBottom: 10 },
  balanceBox: { alignItems: "flex-end" },
  balanceLabel: { fontSize: 8, color: MUTED, fontWeight: 700, marginBottom: 2 },
  balanceValue: { fontSize: 14, fontWeight: 700, color: "#0f172a" },

  addressSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  companyCol: { width: "45%" },
  companyName: { fontSize: 10, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  addressLine: { fontSize: 8.5, color: "#334155", marginBottom: 1.5 },

  clientCol: { width: "48%" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  metaLabel: { fontSize: 8.5, color: MUTED },
  metaValue: { fontSize: 8.5, color: "#0f172a", textAlign: "right" },

  table: { marginBottom: 12 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: DARK_BG,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 1,
  },
  headerCell: { fontSize: 8, fontWeight: 700, color: "#ffffff", textTransform: "uppercase" },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  colIndex: { width: "5%", textAlign: "center", fontSize: 8, color: MUTED },
  colDesc: { width: "55%", paddingRight: 8 },
  colQty: { width: "12%", textAlign: "right" },
  colRate: { width: "13%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },

  itemTitle: { fontSize: 9, color: "#0f172a", fontWeight: 500 },
  itemSub: { fontSize: 7.5, color: MUTED, marginTop: 1 },

  totalsSection: { alignItems: "flex-end", marginTop: 8, marginBottom: 24 },
  totalsTable: { width: 240 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 8.5, color: "#334155", textAlign: "right" },
  totalsValue: { fontSize: 8.5, color: "#0f172a", textAlign: "right" },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 4,
    borderRadius: 2,
  },
  grandTotalLabel: { fontSize: 9, fontWeight: 700, color: "#0f172a", textAlign: "right" },
  grandTotalValue: { fontSize: 10, fontWeight: 700, color: "#0f172a", textAlign: "right" },

  notesSection: { marginBottom: 24 },
  notesTitle: { fontSize: 9, fontWeight: 700, color: "#0f172a", marginBottom: 3 },
  notesBody: { fontSize: 8, color: "#475569" },

  disclaimer: { fontSize: 6.5, color: "#94a3b8", lineHeight: 1.3, marginBottom: 24 },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 8,
    alignItems: "center",
  },
  footerText: { fontSize: 8, color: MUTED },
});

function formatNumber(num: number | string | { toNumber?: () => number }): string {
  const val = typeof num === "object" && num !== null && "toNumber" in num && typeof num.toNumber === "function" ? num.toNumber() : Number(num);
  return isNaN(val) ? "0.00" : val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date: Date | null): string {
  return date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
  const { order } = invoice;
  const { customer } = order;

  const subtotalNum = typeof order.subtotal === "object" && "toNumber" in order.subtotal ? order.subtotal.toNumber() : Number(order.subtotal);
  const totalNum = typeof order.total === "object" && "toNumber" in order.total ? order.total.toNumber() : Number(order.total);

  // Assuming 15% VAT included or calculated if tax active
  const vatAmount = totalNum * 0.15;
  const taxableAmount = totalNum - vatAmount;

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.brandCol}>
              <SultanLogoMark />
              <Text style={[styles.addressLine, { marginTop: 8 }]}>Grignoti Ltd</Text>
              <Text style={styles.addressLine}>BRN C25226789</Text>
              <Text style={styles.addressLine}>VAT 28451792</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.invoiceTitle}>VAT Invoice</Text>
              <Text style={styles.invoiceNumber}># INV-{String(invoice.invoiceNumber).padStart(6, "0")}</Text>
              <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>Balance Due</Text>
                <Text style={styles.balanceValue}>MUR {formatNumber(invoice.balanceDue)}</Text>
              </View>
            </View>
          </View>

          {/* Customer / Company & Meta Section */}
          <View style={styles.addressSection}>
            <View style={styles.companyCol}>
              <Text style={styles.companyName}>Grignoti Ltd</Text>
              <Text style={styles.addressLine}>95, La Paix Street</Text>
              <Text style={styles.addressLine}>Port Louis, Mauritius</Text>
              <Text style={styles.addressLine}>{CONTACT_PHONE_DISPLAY}</Text>
              <Text style={styles.addressLine}>{CONTACT_EMAIL}</Text>
            </View>

            <View style={styles.clientCol}>
              <Text style={[styles.metaLabel, { fontWeight: 700, color: "#0f172a", marginBottom: 4 }]}>Client details</Text>
              <Text style={[styles.companyName, { fontSize: 9, marginBottom: 4 }]}>
                {customer.companyName ? `${customer.companyName} ${customer.vatNumber ? `- BRN ${customer.vatNumber}` : ""}` : customer.name}
              </Text>
              {order.deliveryAddress && <Text style={styles.addressLine}>{order.deliveryAddress}</Text>}

              <View style={{ marginTop: 8 }}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Invoice Date :</Text>
                  <Text style={styles.metaValue}>{formatDate(invoice.issuedAt ?? new Date())}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Terms :</Text>
                  <Text style={styles.metaValue}>{customer.creditTermsDays ? `Net ${customer.creditTermsDays}` : "Due on receipt"}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Due Date :</Text>
                  <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.colIndex]}>#</Text>
              <Text style={[styles.headerCell, styles.colDesc]}>Description</Text>
              <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.headerCell, styles.colRate]}>Rate</Text>
              <Text style={[styles.headerCell, styles.colAmount]}>Amount</Text>
            </View>

            {order.items.map((item, idx) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colIndex}>{idx + 1}</Text>
                <View style={styles.colDesc}>
                  <Text style={styles.itemTitle}>{item.product.name}</Text>
                  {item.product.sku && <Text style={styles.itemSub}>SKU: {item.product.sku}</Text>}
                </View>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colRate}>{formatNumber(item.unitPriceAtOrder)}</Text>
                <Text style={styles.colAmount}>{formatNumber(item.lineTotal)}</Text>
              </View>
            ))}
          </View>

          {/* Totals Table */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsTable}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Sub Total</Text>
                <Text style={styles.totalsValue}>{formatNumber(subtotalNum)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Taxable Amount</Text>
                <Text style={styles.totalsValue}>{formatNumber(taxableAmount)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>VAT (15%)</Text>
                <Text style={styles.totalsValue}>{formatNumber(vatAmount)}</Text>
              </View>

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>MUR {formatNumber(totalNum)}</Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesBody}>
              {order.notes || "Thanks for your business. No online payment: payable on delivery/collection, as agreed."}
            </Text>
          </View>

          {/* Legal Disclaimer */}
          <Text style={styles.disclaimer}>
            We reserve the right if necessary, to recover any unpaid claims or part thereof through our attorney at law. In such case the attorney&apos;s commission of 10% shall be payable by the client.
          </Text>
        </View>

        {/* Footer: `fixed` renders this once per page at a position
            independent of content flow, so it can't be pushed into or
            overlapped by the invoice body above. */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Sultan Mauritius (Grignoti Ltd) · Premium Natural Mineral Water
          </Text>
        </View>
      </Page>
    </Document>
  );
}
