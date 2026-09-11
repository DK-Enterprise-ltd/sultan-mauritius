import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Invoice, Order, OrderItem, Product, Customer } from "@prisma/client";
import { formatMur } from "@/lib/format";

type InvoicePdfData = Invoice & {
  order: Order & {
    customer: Customer;
    items: (OrderItem & { product: Product })[];
  };
};

const INK = "#16140e";
const MUTED = "#7d7565";
const RULE = "#e2ded4";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: "Helvetica" },

  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  brandLine: { fontSize: 9, color: MUTED },

  headerRight: { alignItems: "flex-end" },
  invoiceKicker: { fontSize: 9, fontWeight: 700, letterSpacing: 1, color: MUTED, marginBottom: 2 },
  invoiceTitle: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
  balanceDueLabel: { fontSize: 8, color: MUTED, textAlign: "right" },
  balanceDueValue: { fontSize: 13, fontWeight: 700, textAlign: "right", marginBottom: 8 },

  metaTable: { alignItems: "flex-end" },
  metaRow: { flexDirection: "row", marginBottom: 2 },
  metaLabel: { fontSize: 9, color: MUTED, width: 90, textAlign: "right", marginRight: 8 },
  metaValue: { fontSize: 9, fontWeight: 700, width: 100, textAlign: "right" },

  billTo: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: MUTED,
    marginBottom: 4,
  },
  billName: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  billLine: { fontSize: 10, marginBottom: 1 },

  table: { borderWidth: 1, borderColor: RULE, borderRadius: 2, marginBottom: 16 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f7f5f1",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRowLast: { borderBottomWidth: 0 },
  colItem: { flex: 3 },
  colNum: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: MUTED },

  totals: { alignSelf: "flex-end", width: 220, marginTop: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, fontSize: 10 },
  balanceDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: INK,
    fontSize: 11,
    fontWeight: 700,
  },

  notes: { marginTop: 20 },
  footerNote: { marginTop: 28, fontSize: 8, color: MUTED, borderTopWidth: 1, borderTopColor: RULE, paddingTop: 10 },
});

function formatDate(date: Date | null): string {
  return date ? date.toLocaleDateString("en-MU", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
  const { order } = invoice;
  const { customer } = order;

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* wrap=false: this is a fixed-format single-page invoice (one order,
            a bounded item list). A row that doesn't fit renders past the
            bottom margin instead of silently spilling onto a page 2 that
            nothing here expects or paginates. */}
        <View wrap={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brand}>Sultan Mauritius Ltd</Text>
              <Text style={styles.brandLine}>Port Louis, Mauritius</Text>
              <Text style={styles.brandLine}>hello@sultan.mu · +230 5 000 0000</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.invoiceKicker}>INVOICE</Text>
              <Text style={styles.invoiceTitle}>#{invoice.invoiceNumber}</Text>
              <Text style={styles.balanceDueLabel}>Balance due</Text>
              <Text style={styles.balanceDueValue}>{formatMur(invoice.balanceDue)}</Text>
              <View style={styles.metaTable}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Order</Text>
                  <Text style={styles.metaValue}>#{order.orderNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Status</Text>
                  <Text style={styles.metaValue}>{invoice.status}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Issued</Text>
                  <Text style={styles.metaValue}>{formatDate(invoice.issuedAt)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Due</Text>
                  <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.billTo}>
            <Text style={styles.sectionLabel}>Bill to</Text>
            <Text style={styles.billName}>{customer.companyName || customer.name}</Text>
            {customer.companyName && <Text style={styles.billLine}>{customer.name}</Text>}
            <Text style={styles.billLine}>{customer.email}</Text>
            <Text style={styles.billLine}>{customer.phone}</Text>
            {order.deliveryAddress && <Text style={styles.billLine}>{order.deliveryAddress}</Text>}
            {order.deliveryZone && <Text style={styles.billLine}>{order.deliveryZone}</Text>}
            {customer.vatNumber && <Text style={styles.billLine}>VAT: {customer.vatNumber}</Text>}
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.colItem]}>Description</Text>
              <Text style={[styles.headerCell, styles.colNum]}>Qty</Text>
              <Text style={[styles.headerCell, styles.colNum]}>Rate</Text>
              <Text style={[styles.headerCell, styles.colNum]}>Amount</Text>
            </View>
            {order.items.map((item, i) => (
              <View
                key={item.id}
                style={i === order.items.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}
              >
                <Text style={styles.colItem}>{item.product.name}</Text>
                <Text style={styles.colNum}>{item.quantity}</Text>
                <Text style={styles.colNum}>{formatMur(item.unitPriceAtOrder)}</Text>
                <Text style={styles.colNum}>{formatMur(item.lineTotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{formatMur(order.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Order total</Text>
              <Text>{formatMur(order.total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Amount paid</Text>
              <Text>{formatMur(invoice.amountPaid)}</Text>
            </View>
            <View style={styles.balanceDueRow}>
              <Text>Balance due</Text>
              <Text>{formatMur(invoice.balanceDue)}</Text>
            </View>
          </View>

          {order.notes && (
            <View style={styles.notes}>
              <Text style={styles.sectionLabel}>Order notes</Text>
              <Text style={styles.billLine}>{order.notes}</Text>
            </View>
          )}

          <Text style={styles.footerNote}>
            Payment by MCB Juice or bank transfer (Sultan Mauritius Ltd · MCB · Account 000123456789),
            reference order #{order.orderNumber}. Thank you for choosing Sultan.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
