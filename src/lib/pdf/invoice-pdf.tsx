import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Invoice, Order, OrderItem, Product, Customer } from "@prisma/client";
import { formatMur } from "@/lib/format";

type InvoicePdfData = Invoice & {
  order: Order & {
    customer: Customer;
    items: (OrderItem & { product: Product })[];
  };
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#16140e", fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  brandLine: { fontSize: 9, color: "#5a5346" },
  headerRight: { alignItems: "flex-end" },
  invoiceTitle: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  metaLine: { fontSize: 9, color: "#5a5346", marginTop: 2 },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#7d7565",
    marginBottom: 4,
  },
  billTo: { marginBottom: 20 },
  billName: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  billLine: { fontSize: 10, marginBottom: 1 },
  table: { marginBottom: 16 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e2ded4",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: { flexDirection: "row", borderBottom: "1pt solid #efece5", paddingVertical: 5 },
  colItem: { flex: 3 },
  colNum: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: "#7d7565" },
  totals: { alignSelf: "flex-end", width: 220, marginTop: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, fontSize: 10 },
  balanceDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTop: "1pt solid #16140e",
    fontSize: 11,
    fontWeight: 700,
  },
  notes: { marginTop: 20 },
  footerNote: { marginTop: 28, fontSize: 8, color: "#7d7565" },
});

export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
  const { order } = invoice;
  const { customer } = order;

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>Sultan Mauritius Ltd</Text>
            <Text style={styles.brandLine}>Port Louis, Mauritius</Text>
            <Text style={styles.brandLine}>hello@sultan.mu · +230 5 000 0000</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>Invoice #{invoice.invoiceNumber}</Text>
            <Text style={styles.metaLine}>Status: {invoice.status}</Text>
            <Text style={styles.metaLine}>Order #{order.orderNumber}</Text>
            <Text style={styles.metaLine}>
              Issued: {invoice.issuedAt ? invoice.issuedAt.toLocaleDateString("en-MU") : "Not yet issued"}
            </Text>
            <Text style={styles.metaLine}>
              Due: {invoice.dueDate ? invoice.dueDate.toLocaleDateString("en-MU") : "—"}
            </Text>
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
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, styles.colItem]}>Item</Text>
            <Text style={[styles.headerCell, styles.colNum]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colNum]}>Unit price</Text>
            <Text style={[styles.headerCell, styles.colNum]}>Line total</Text>
          </View>
          {order.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
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
          reference order #{order.orderNumber}.
        </Text>
      </Page>
    </Document>
  );
}
