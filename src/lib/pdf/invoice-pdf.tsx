import path from "path";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Invoice, Order, OrderItem, Product, Customer } from "@prisma/client";

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
  page: { padding: 36, fontSize: 9, color: INK, fontFamily: "Helvetica", backgroundColor: "#ffffff" },

  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },

  brandCol: { flex: 1 },
  logo: { width: 54, height: 54, marginBottom: 8 },
  brandTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  brandSub: { fontSize: 8, color: MUTED, marginBottom: 1 },

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
  const logoPath = path.join(process.cwd(), "public/Assets/Logo/grignoti-logo.png");

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View wrap={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.brandCol}>
              <Image style={styles.logo} src={logoPath} />
              <Text style={styles.brandTitle}>Grignoti ltd</Text>
              <Text style={styles.brandSub}>BRN: C25226789</Text>
              <Text style={styles.brandSub}>VAT: 28451792</Text>
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
              <Text style={styles.companyName}>Sultan Mauritius Ltd</Text>
              <Text style={styles.addressLine}>Port Louis</Text>
              <Text style={styles.addressLine}>Mauritius</Text>
              <Text style={styles.addressLine}>+230 5 792 4340</Text>
              <Text style={styles.addressLine}>contact@sultanmauritius.mu</Text>
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
              {order.notes || "Thanks for your business. Payment via Bank Transfer or MCB Juice."}
            </Text>
          </View>

          {/* Legal Disclaimer */}
          <Text style={styles.disclaimer}>
            We reserve the right if necessary, to recover any unpaid claims or part thereof through our attorney at law. In such case the attorney&apos;s commission of 10% shall be payable by the client.
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Sultan Mauritius Ltd · Premium Natural Mineral Water
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
