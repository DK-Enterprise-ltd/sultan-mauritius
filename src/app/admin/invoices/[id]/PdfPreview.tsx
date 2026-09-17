"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function PdfPreview({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: number;
}) {
  const [requested, setRequested] = useState(false);

  if (!requested) {
    return (
      <button type="button" className={styles.downloadButton} onClick={() => setRequested(true)}>
        Load PDF preview
      </button>
    );
  }

  return (
    <iframe
      src={`/api/admin/invoices/${invoiceId}/pdf`}
      title={`Invoice #${invoiceNumber} PDF`}
      className={styles.pdfFrame}
    />
  );
}
